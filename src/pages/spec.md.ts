/*
 * THE SINGLE-FILE EXPORT — the documentation as one linear Markdown document.
 *
 * /spec.md is the whole specification in reading order: for keeping offline,
 * diffing between releases, or handing to an agent in one piece rather than
 * asking it to crawl a site.
 *
 * Two configuration files decide what is in it, and neither is here:
 *
 *   - src/config/sections.mjs is the documentation's structure, shared with
 *     the sidebar in astro.config.mjs. One list, so the export cannot fall out
 *     of step with the site.
 *   - src/config/spec.mjs names the sections to include, in the order they
 *     appear in the file.
 *
 * The content is the pages' own Markdown source, straight off the content
 * layer — not their rendered HTML turned back into Markdown. That keeps the
 * export faithful to what the author wrote, and costs the two things Starlight
 * would otherwise have done to it, which `flatten` below does instead: filling
 * `from=` code blocks, and rewriting Starlight's `:::note` asides into
 * blockquotes, which mean something everywhere Markdown is read.
 *
 * The whole document is then hard-wrapped, once, at the end — after assembly,
 * so that the preamble and the quoting the asides picked up are wrapped along
 * with everything else. plugins/wrap-markdown.mjs has the rules.
 *
 * The site is fully static, so Astro prerenders this to dist/spec.md at build
 * time.
 */
import type { APIRoute } from 'astro';
import { getCollection, type CollectionEntry } from 'astro:content';
import { fillFromFile } from '../../plugins/code-from-file.mjs';
import { wrapMarkdown } from '../../plugins/wrap-markdown.mjs';
import { sectionsNamed } from '../config/sections.mjs';
import { spec } from '../config/spec.mjs';

const CONTENT_ROOT = 'src/content/docs/';

/** ATX headings only; Setext underlines are not used anywhere in these docs. */
const HEADING = /^(#{1,6})(\s.*)$/;

/** A code fence, so that a `#` inside a code block is left alone. */
const FENCE = /^ {0,3}(`{3,}|~{3,})/;

/** `:::note`, `:::tip[With a title]` — Starlight's aside directives. */
const ASIDE = /^:::(note|tip|caution|danger)(?:\[(.+)\])?\s*$/;
const ASIDE_END = /^:::\s*$/;

const ASIDE_TITLES: Record<string, string> = {
	note: 'Note',
	tip: 'Tip',
	caution: 'Caution',
	danger: 'Danger',
};

/**
 * A page's Markdown, ready to sit under a heading `shift` levels deeper than
 * it was written for.
 *
 * Everything here is line-oriented and fence-aware. A regex over the whole
 * document would be shorter and wrong: three of these pages show Markdown that
 * Piton compiles to, inside code blocks, headings and all — shifting those
 * would corrupt the very output the page is documenting.
 */
function flatten(markdown: string, shift: number): string {
	const lines = fillFromFile(markdown).split('\n');
	const out: string[] = [];

	/** The marker that opened the code block being scanned, if any. */
	let fence: string | null = null;
	/** Whether the lines being scanned are inside an aside. */
	let aside = false;

	for (const line of lines) {
		const marker = line.match(FENCE)?.[1];
		if (fence) {
			if (marker && marker[0] === fence[0] && marker.length >= fence.length) fence = null;
			out.push(aside ? `> ${line}` : line);
			continue;
		}
		if (marker) {
			fence = marker;
			out.push(aside ? `> ${line}` : line);
			continue;
		}

		const opens = line.match(ASIDE);
		if (opens && !aside) {
			aside = true;
			out.push(`> **${opens[2] ?? ASIDE_TITLES[opens[1]]}**`, '>');
			continue;
		}
		if (aside && ASIDE_END.test(line)) {
			aside = false;
			continue;
		}

		const heading = line.match(HEADING);
		// Six is Markdown's floor, not a preference. Nothing in these pages
		// goes deeper than `###`, which lands at `######` from the deepest a
		// page can be nested — but a seventh `#` is not a heading at all, and
		// silently becoming body text is worse than losing one level of depth.
		const shifted = heading ? `${'#'.repeat(Math.min(6, heading[1].length + shift))}${heading[2]}` : line;
		out.push(aside ? (shifted ? `> ${shifted}` : '>') : shifted);
	}

	return out.join('\n').trim();
}

/**
 * The pages of one content directory, in the order Starlight's `autogenerate`
 * puts them in the sidebar: by `sidebar.order`, then by file name, with the
 * directory's own index first.
 */
function pagesOf(docs: CollectionEntry<'docs'>[], directory: string) {
	const prefix = `${CONTENT_ROOT}${directory}/`;
	return docs
		.filter((entry) => entry.filePath?.startsWith(prefix) && !entry.data.draft)
		.sort((a, b) => {
			const order = (entry: CollectionEntry<'docs'>) =>
				entry.data.sidebar?.order ?? Number.MAX_SAFE_INTEGER;
			if (order(a) !== order(b)) return order(a) - order(b);
			const name = (entry: CollectionEntry<'docs'>) =>
				entry.filePath!.slice(prefix.length).replace(/\.mdx?$/, '');
			if (name(a) === 'index') return -1;
			if (name(b) === 'index') return 1;
			return name(a).localeCompare(name(b));
		});
}

export const GET: APIRoute = async () => {
	const docs = await getCollection('docs');
	const out: string[] = [`# ${spec.title}`, spec.description];

	for (const section of sectionsNamed(spec.sections)) {
		out.push(`## ${section.label}`);

		/*
		 * A group heading of its own only when the section has more than one
		 * group to tell apart. "Reference" divides into the language and the
		 * tooling and the reader needs to see the seam; "Belay Framework"
		 * holds one group called "Belay", and a heading for it would say
		 * nothing while pushing every page beneath it one level deeper.
		 */
		const named = section.groups.length > 1;

		for (const group of section.groups) {
			if (named) out.push(`### ${group.label}`);
			const depth = named ? 4 : 3;

			for (const page of pagesOf(docs, group.directory)) {
				out.push(`${'#'.repeat(depth)} ${page.data.sidebar?.label ?? page.data.title}`);
				// Page bodies start at `##`, and belong one level under their
				// page's own heading.
				const body = flatten(page.body ?? '', depth - 1);
				if (body) out.push(body);
			}
		}
	}

	return new Response(`${wrapMarkdown(out.join('\n\n'), spec.columns)}\n`, {
		headers: {
			'Content-Type': 'text/markdown; charset=utf-8',
			'Content-Disposition': 'inline; filename="spec.md"',
		},
	});
};
