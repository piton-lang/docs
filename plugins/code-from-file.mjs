// Fills a fenced code block from a file on disk, so a tutorial and the archive
// it links can never disagree.
//
// A block written as
//
//     ```piton from=examples/hello-piton/spec/index.pi
//     ```
//
// renders that file's contents. The page holds the path; the project under
// examples/ holds the code. It is the same code the download is packed from
// (src/pages/downloads/[project].zip.ts) and the same code `piton build` runs
// against, so there is one copy and no way for them to drift.
//
// The same applies to what the compiler writes: generated/ holds the output of
// `npm run examples` (scripts/build-examples.mjs), so a block showing Markdown
// Piton produced is showing Markdown Piton produced.
//
// A block may take part of a file instead of all of it, when the file is a
// long one and the page is making a point about one part:
//
//     ```markdown from=generated/piton-brief/.claude/skills/piton/SKILL.md section=frontmatter
//     ```
//     ```markdown from=generated/piton-brief/.claude/skills/piton/SKILL.md section="## Rules worth memorising"
//     ```
//
// `section=` addresses by content — the frontmatter block, or a heading and
// everything under it — never by line number, which would go stale silently
// the first time the compiler added a paragraph above it.
//
// This is a Sätteri mdast plugin, not a remark one. Astro 7 uses Sätteri as
// its Markdown processor, and `markdown.remarkPlugins` now requires installing
// `@astrojs/markdown-remark`, which swaps the whole pipeline — far too much to
// change for a file include. Sätteri takes plugins directly, and mdast is the
// Markdown tree, so this runs on the same node shape remark would have given.
//
// Ordering against Expressive Code is what makes it work: Expressive Code
// registers a *hast* plugin (see `isSatteriProcessor` in astro-expressive-code),
// which runs after the whole Markdown tree is built. By then the block already
// holds the file's text and the `from=` meta is gone — which it must be, since
// Expressive Code reads an unknown meta attribute as a frame title, and this
// theme never renders one.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, normalize } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const FROM = /(?:^|\s)from=(\S+)/;
const SECTION = /(?:^|\s)section=(?:"([^"]*)"|(\S+))/;

/**
 * The part of `text` that `section` names: `frontmatter` for the delimited
 * block at the top of the file, or an ATX heading — written out in full, hashes
 * and all — for that heading and everything beneath it, down to the next
 * heading at the same level or shallower.
 *
 * Not finding it throws, for the same reason a bad path does. A section that
 * has been renamed is a page describing output that no longer exists, and the
 * build is the only place left to catch that.
 */
function section(text, wanted, rel) {
	if (wanted === 'frontmatter') {
		const match = text.match(/^---\n[\s\S]*?\n---(?=\n|$)/);
		if (!match) throw new Error(`code-from-file: ${rel} has no frontmatter`);
		return match[0];
	}

	const depth = wanted.match(/^(#{1,6}) \S/)?.[1]?.length;
	if (!depth) {
		throw new Error(`code-from-file: section= takes \`frontmatter\` or a heading, not ${JSON.stringify(wanted)}`);
	}

	const lines = text.split('\n');
	const start = lines.findIndex((line) => line.trimEnd() === wanted);
	if (start === -1) throw new Error(`code-from-file: ${rel} has no section ${JSON.stringify(wanted)}`);

	let end = lines.length;
	for (let i = start + 1; i < lines.length; i++) {
		const heading = lines[i].match(/^(#{1,6}) /);
		if (heading && heading[1].length <= depth) {
			end = i;
			break;
		}
	}
	return lines.slice(start, end).join('\n');
}

export function codeFromFile() {
	return {
		name: 'code-from-file',
		code(node, ctx) {
			const match = node.meta?.match(FROM);
			if (!match) return;

			const rel = normalize(match[1]);
			if (rel.startsWith('..')) {
				throw new Error(`code-from-file: from= must stay inside the repository: ${match[1]}`);
			}

			let value;
			try {
				value = readFileSync(join(root, rel), 'utf8');
			} catch (cause) {
				// A bad path fails the build. Sourcing these from disk is only
				// worth anything if a stale path cannot render as an empty block.
				throw new Error(`code-from-file: cannot read ${rel}`, { cause });
			}

			const wanted = node.meta.match(SECTION);
			if (wanted) value = section(value, wanted[1] ?? wanted[2], rel);

			ctx.replaceNode(node, {
				type: 'code',
				lang: node.lang,
				// Both attributes come off, so Expressive Code never sees an
				// unknown one — it reads those as a frame title, and this theme
				// never renders one.
				meta: node.meta.replace(match[0], '').replace(wanted?.[0] ?? '', '').trim() || null,
				// Trailing newlines are the file ending properly, not blank
				// lines the reader should see at the bottom of the block.
				value: value.replace(/\s+$/, ''),
			});
		},
	};
}
