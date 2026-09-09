// Runs `piton` against the projects under examples/ and commits what it wrote
// into generated/, where the tutorials read it with `from=` code blocks.
//
// The tutorials used to hold their Markdown output as literal text, and it had
// already drifted: every reference in them was written `@path/to/file.md`, and
// the compiler emits `[Name](path/to/file.md)`. A page that shows compiler
// output nobody re-checked is worse than one that shows none, because a reader
// has no way to tell which half is stale. So the output is compiled, not
// typed — same argument as plugins/code-from-file.mjs makes for the source.
//
// Not run by predev or prebuild. Building the docs must not require the
// compiler on PATH, and generated/ is committed precisely so that it does not:
// `npm run examples` is an explicit step, run when a compiler change moves the
// output, and the diff it produces is the record of what moved.
//
// Each build is a variant: a pristine copy of an example, optionally edited
// the way the tutorial tells the reader to edit it, then compiled in a scratch
// directory. The edits are how a page can show both sides of the stack swap it
// is about — the example on disk can only be wired one way at a time.
import { spawnSync } from 'node:child_process';
import { cpSync, mkdirSync, mkdtempSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, relative } from 'node:path';
import { tmpdir } from 'node:os';
import { exampleFiles, generatedFiles } from '../plugins/examples-digest.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const EXAMPLES = join(root, 'examples');
const GENERATED = join(root, 'generated');

/*
 * What to compile, and where each result lands under generated/.
 *
 * `id` is the path a tutorial writes in its `from=`, so it is chosen to read
 * well there: a project with one state is just its name, and a project a
 * tutorial shows in two states names the states.
 *
 * `edit` asserts before it substitutes. If an example is rewritten and the
 * line a variant patches is gone, this script fails rather than quietly
 * emitting the unedited build under a name that promises otherwise.
 */
const BUILDS = [
	// Hello, World — the same specification on two stacks. The swap is one
	// import, which is the entire point of the last section of that tutorial.
	{ id: 'hello-piton/react', from: 'hello-piton' },
	{
		id: 'hello-piton/egui',
		from: 'hello-piton',
		edits: [['spec/shape/App.pi', 'from /stack/React import React Stack', 'from /stack/Egui import Egui Stack']],
	},

	// The Markdown editor. The egui variant also creates the two source
	// directories, because by the point that tutorial swaps the stack the
	// reader has already made them, and their presence changes where the
	// instructions land: with src/toolbar and src/editor in place the shell
	// instruction gets src/AGENTS.md to itself.
	{ id: 'markdown-editor/react', from: 'markdown-editor' },
	{
		id: 'markdown-editor/egui',
		from: 'markdown-editor',
		mkdirs: ['src/toolbar', 'src/editor'],
		edits: [['spec/shape/AppShell.pi', 'from /lib/React import React Stack', 'from /lib/Egui import Egui Stack']],
	},

	// The skeleton an existing codebase gets described into.
	{ id: 'spec-skeleton', from: 'spec-skeleton' },

	/*
	 * The language brief, which is not an example project at all: `piton
	 * claude --install` writes it into an empty directory. The tutorial quotes
	 * two parts of it — the frontmatter and one section — and both come from
	 * this one file, so both track the compiler that generated it.
	 *
	 * spec-intake has no entry here on purpose. It compiles to nothing (`wrote
	 * 0 files`), which is the point the tutorial makes about it.
	 */
	{ id: 'piton-brief', run: ['claude', '--install'] },
];

/** Runs piton in `cwd`, and fails the script if it does. */
function piton(args, cwd) {
	const { status, error, stdout, stderr } = spawnSync('piton', args, { cwd, encoding: 'utf8' });
	if (error?.code === 'ENOENT') {
		throw new Error('piton is not on PATH. See https://docs.piton.dev/getting-started/');
	}
	if (status !== 0) {
		throw new Error(`piton ${args.join(' ')} failed (${status}):\n${stderr || stdout}`);
	}
	return stdout;
}

function applyEdits(dir, edits = []) {
	for (const [file, find, replace] of edits) {
		const path = join(dir, file);
		const before = readFileSync(path, 'utf8');
		// Exactly once: zero means the example moved out from under the
		// variant, more than one means the variant is patching more than it
		// says it is. Both are bugs in this manifest, not in the example.
		const count = before.split(find).length - 1;
		if (count !== 1) {
			throw new Error(`${file}: expected 1 occurrence of ${JSON.stringify(find)}, found ${count}`);
		}
		writeFileSync(path, before.replace(find, replace));
	}
}

function build(stage, { id, from, edits, mkdirs = [], run = ['build'] }) {
	const work = mkdtempSync(join(tmpdir(), 'piton-docs-'));
	try {
		if (from) {
			/*
			 * Copied file by file through exampleFiles rather than with a
			 * directory copy, because that walker already skips what a
			 * previous `piton build` left inside the example. Compiling on top
			 * of someone's stale local output would make this script's result
			 * depend on the machine it ran on.
			 */
			const src = join(EXAMPLES, from);
			for (const file of exampleFiles(src)) {
				const dest = join(work, relative(src, file));
				mkdirSync(dirname(dest), { recursive: true });
				cpSync(file, dest);
			}
		}
		applyEdits(work, edits);
		for (const dir of mkdirs) mkdirSync(join(work, dir), { recursive: true });

		piton(run, work);

		/*
		 * Everything the compiler wrote, and nothing that went in. The two
		 * output roots are what piton.config.pi calls codeRoot and the
		 * adapter's own directory; a tutorial cites files from both.
		 */
		const out = join(stage, id);
		let files = 0;
		for (const dir of ['.claude', 'src']) {
			const source = join(work, dir);
			for (const file of generatedFiles(source)) {
				const dest = join(out, dir, relative(source, file));
				mkdirSync(dirname(dest), { recursive: true });
				cpSync(file, dest);
				files++;
			}
		}
		if (files === 0) throw new Error(`${id}: piton wrote nothing`);
		console.log(`${id}: ${files} file${files === 1 ? '' : 's'}`);
	} finally {
		rmSync(work, { recursive: true, force: true });
	}
}

/*
 * Everything is compiled into a staging directory and moved into place at the
 * end, all of it or none. Writing straight into generated/ would mean a
 * compiler error halfway through left the committed tree half replaced — the
 * one state in which the site builds happily and shows output from two
 * different runs.
 *
 * Staged beside the destination rather than in the system temp directory, so
 * the move is a rename rather than a copy across filesystems.
 *
 * The swap replaces rather than merges, so output the compiler has stopped
 * emitting stops being served. Recompiling in place would leave an orphan
 * behind, which is the failure this whole file exists to prevent.
 */
const stage = mkdtempSync(join(root, 'generated.staging-'));
try {
	for (const entry of BUILDS) build(stage, entry);

	writeFileSync(
		join(stage, 'README.md'),
		[
			'# Generated',
			'',
			'Compiler output, written by `npm run examples` (scripts/build-examples.mjs)',
			'and read by the tutorials through `from=` code blocks.',
			'',
			'Do not edit anything here. Edit the project under `examples/`, or the',
			'compiler, and run the script again.',
			'',
			`Written with \`${piton(['--version'], root).trim()}\`.`,
			'',
		].join('\n'),
	);

	rmSync(GENERATED, { recursive: true, force: true });
	renameSync(stage, GENERATED);
} finally {
	rmSync(stage, { recursive: true, force: true });
}
