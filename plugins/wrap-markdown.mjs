// Hard-wraps Markdown to a column limit, leaving alone everything a line break
// would damage.
//
// The single-file export (src/pages/spec.md.ts) is meant to be read as a text
// file — in a terminal, in a diff between releases, in a context window — and
// none of those do the wrapping for you. The pages are hand-wrapped near 80
// already; this is what closes the gap where they are not, and where the
// export's own assembly widens them.
//
// TWO RULES SHAPE THIS.
//
// The first is that a block is reflowed only if some line in it is too long.
// Reflowing everything would be simpler and would quietly rewrite the author.
// These pages use the line break inside a paragraph deliberately:
//
//     - Arithmetic operators: `+`, `-`, `*`, `/`, `%`
//       They do math things.
//
// That is one paragraph as far as Markdown is concerned, and joining it up
// would render identically and read as a different document. So a block that
// already fits is copied out byte for byte, and only one that overflows is
// taken apart and rebuilt.
//
// The second is that some blocks cannot be wrapped at all, and are copied
// through however wide they are:
//
//   - Code, fenced. Breaking a line changes the program.
//   - Tables. A row is a line; wrapping one destroys the table. These docs
//     have two that no amount of wrapping would fit in 80 anyway — a cell can
//     be wider than the limit on its own.
//   - Headings, and thematic breaks. An ATX heading is a single line by
//     definition; its second line would be a paragraph.
//
// Everything else — paragraphs, list items and their continuations, and the
// contents of a blockquote — is reflowed within its own prefix, so a wrapped
// list item still lines up under its marker and a wrapped aside stays quoted.
import { FENCE } from './code-from-file.mjs';

/** Nothing but whitespace. */
const BLANK = /^\s*$/;

/** `#` through `######`, which are one line each by definition. */
const HEADING = /^ {0,3}#{1,6}(\s|$)/;

/** A table row, or the `|---|---|` rule under its header. */
const TABLE = /^ {0,3}\|/;

/** `---`, `***`, `___`. */
const THEMATIC = /^ {0,3}([-*_])(\s*\1){2,}\s*$/;

/** The `>` markers a line sits behind, however many deep. */
const QUOTE = /^((?: {0,3}>)+ ?)/;

/** A list item's bullet or number, and the space after it. */
const MARKER = /^( {0,3})([-*+]|\d+[.)])(\s+)/;

/**
 * A break must not leave a word at the start of a line that Markdown would
 * then read as the start of a block — a bullet, a number, a heading, a quote.
 * Rare in prose, silent when it happens, and it turns a sentence into a list.
 */
const STARTS_BLOCK = /^(?:(?:[-*+]|\d+[.)]|#{1,6})(?=\s|$)|>)/;

/** A line split into the `>` prefix it sits behind and the rest of it. */
function quoted(line) {
	const quote = line.match(QUOTE)?.[1] ?? '';
	return { quote, rest: line.slice(quote.length) };
}

/**
 * `words` greedily filled into lines of at most `width`, ignoring any prefix —
 * the caller adds those back, and has already taken their width off.
 *
 * A word longer than `width` (a URL, usually) goes on a line of its own and
 * overflows it. There is nowhere to break it that would not change what it
 * means.
 */
function fill(words, width) {
	const lines = [];
	let line = [];
	let length = 0;

	for (const word of words) {
		// The break that would put this word first on the next line, moved one
		// word earlier when the word would read as a block marker there. Only
		// when there is an earlier word to give: first on the line, it has to
		// stay, and a line that begins with its own only word is no worse than
		// the alternative.
		const breaks = length > 0 && length + 1 + word.length > width;
		const wouldStartBlock = breaks && STARTS_BLOCK.test(word) && line.length > 1;
		if (wouldStartBlock) {
			const moved = line.pop();
			lines.push(line.join(' '));
			line = [moved, word];
			length = moved.length + 1 + word.length;
			continue;
		}
		if (breaks) {
			lines.push(line.join(' '));
			line = [word];
			length = word.length;
			continue;
		}
		line.push(word);
		length += (length > 0 ? 1 : 0) + word.length;
	}

	if (line.length > 0) lines.push(line.join(' '));
	return lines;
}

/**
 * One paragraph-like block — its lines share a `quote` prefix and the first may
 * carry a list marker — rebuilt to `columns`.
 *
 * @param {string[]} block  the lines, quote prefix already stripped
 * @param {string} quote    the prefix to put back on every line
 * @param {number} columns
 */
function reflow(block, quote, columns) {
	const marker = block[0].match(MARKER);
	// A list item hangs its continuations under its own text, so the marker's
	// width becomes the indent for every line after the first. A plain
	// paragraph keeps whatever indent it was written with.
	const first = marker ? marker[0] : (block[0].match(/^\s*/)?.[0] ?? '');
	const hanging = ' '.repeat(first.length);

	const words = [block[0].slice(first.length), ...block.slice(1)].join(' ').split(/\s+/).filter(Boolean);
	// One column of headroom is not worth a pathological case: if the prefixes
	// eat the whole limit, wrap to something rather than to nothing.
	const width = Math.max(20, columns - quote.length - hanging.length);

	return fill(words, width).map((line, i) => `${quote}${i === 0 ? first : hanging}${line}`);
}

/**
 * `markdown`, hard-wrapped to `columns`.
 *
 * @param {string} markdown
 * @param {number} columns
 * @returns {string}
 */
export function wrapMarkdown(markdown, columns) {
	const lines = markdown.split('\n');
	const out = [];

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];

		// Code, verbatim to the closing fence — including the fences, and
		// including a fence that never closes.
		const marker = line.match(FENCE)?.[2];
		if (marker) {
			const closes = new RegExp(`^ {0,3}\\${marker[0]}{${marker.length},} *$`);
			out.push(line);
			while (++i < lines.length) {
				out.push(lines[i]);
				if (closes.test(lines[i])) break;
			}
			continue;
		}

		const { quote, rest } = quoted(line);
		if (BLANK.test(rest) || HEADING.test(rest) || TABLE.test(rest) || THEMATIC.test(rest)) {
			out.push(line);
			continue;
		}

		/*
		 * The rest of this block: the lines that Markdown would fold into the
		 * same paragraph. It runs until something ends it — a blank line, a
		 * block of another kind, a change of quote depth, or the marker that
		 * starts the next list item.
		 */
		const block = [rest];
		while (i + 1 < lines.length) {
			const next = quoted(lines[i + 1]);
			if (next.quote !== quote) break;
			if (BLANK.test(next.rest) || HEADING.test(next.rest) || TABLE.test(next.rest)) break;
			if (THEMATIC.test(next.rest) || MARKER.test(next.rest) || FENCE.test(lines[i + 1])) break;
			block.push(next.rest);
			i++;
		}

		// Reflowed only if it overflows. A block that already fits is the
		// author's own line breaks, and they are worth more than uniformity.
		const fits = block.every((text) => quote.length + text.length <= columns);
		out.push(...(fits ? block.map((text) => quote + text) : reflow(block, quote, columns)));
	}

	return out.join('\n');
}
