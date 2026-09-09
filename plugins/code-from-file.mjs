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

export function codeFromFile() {
	return {
		name: 'code-from-file',
		code(node, ctx) {
			const match = node.meta?.match(/(?:^|\s)from=(\S+)/);
			if (!match) return;

			const rel = normalize(match[1]);
			if (rel.startsWith('..')) {
				throw new Error(`code-from-file: from= must stay inside the repository: ${match[1]}`);
			}

			let value;
			try {
				// Trailing newlines are the file ending properly, not blank lines
				// the reader should see at the bottom of the block.
				value = readFileSync(join(root, rel), 'utf8').replace(/\s+$/, '');
			} catch (cause) {
				// A bad path fails the build. Sourcing these from disk is only
				// worth anything if a stale path cannot render as an empty block.
				throw new Error(`code-from-file: cannot read ${rel}`, { cause });
			}

			ctx.replaceNode(node, {
				type: 'code',
				lang: node.lang,
				meta: match.input.replace(match[0], '').trim() || null,
				value,
			});
		},
	};
}
