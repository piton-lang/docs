// The documentation pages that are generated from the Piton specification.
//
// The spec is tethered into tethers/piton (see piton.config.pi), and the site's
// own Piton source under spec/ says which spec anchors make up which page:
// every `page` exported from spec/index.pi is one page, with its slug, title,
// description, sidebar order and `content`. The content is references into the
// spec — `@{Types}`, or a dictionary of them — and this module follows those
// references and writes the Markdown that Starlight renders.
//
// Everything is read through `compileFile` from astro-piton, which runs the
// `piton` compiler, so what appears on a page is what the compiler says the
// spec means, not a second reading of it.
//
// Why not the compiler's own Markdown renderer: the pages need three things it
// does not do. A reference has to become a link to wherever on the *site* that
// anchor is rendered, not to a .md file in a reference tree. A reference in a
// structural position (`numbers: @{Numbers}`) has to be expanded in place when
// no page of its own shows that anchor. And the compiler joins paragraphs with
// a single line break, which Markdown reads as one paragraph (see "Where the
// compiler differs from the spec"); here each one gets its own.
//
// Rendering is two passes over the same walk. Every anchor a page claims in its
// `content` is owned by that page. Anything else is expanded where it is first
// met in sidebar order, and recorded there. Links are written as placeholders
// while walking and filled in at the end, once every anchor has a location.
import { existsSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { compileFile } from 'astro-piton';
import { titleCase } from 'vite-plugin-piton/renderers';
import GithubSlugger from 'github-slugger';

/** A compiled reference: `../path/File.json:Anchor.property`. */
const REFERENCE = /^(\.{1,2}\/[^\s:]*\.json):([A-Za-z_][\w-]*(?:\.[A-Za-z_][\w-]*)*)$/;

/** The same, somewhere inside a run of prose. */
const REFERENCE_IN_TEXT =
	/(?<![\w/.])(\.{1,2}\/[^\s:]*\.json):([A-Za-z_][\w-]*(?:\.[A-Za-z_][\w-]*)*)/g;

const FENCE = /^ {0,3}(`{3,}|~{3,})/;

/** Deeper than this is a bold label, as in the compiler's own Markdown. */
const MAX_HEADING = 6;

/** Placeholder for a link, filled in once every anchor has been placed. */
const link = (id, text) => `\u0000${id}\u0001${text}\u0000`;
const LINK = /\u0000([^\u0001]*)\u0001([^\u0000]*)\u0000/g;

/**
 * @typedef {{ id: string, title: string, description: string, order: number, body: string }} SpecPage
 */

/**
 * Compiles the site's page list and renders each page.
 *
 * @param {{ root: string, entry?: string }} options `root` is the project root,
 *   where piton.config.pi lives.
 * @returns {Promise<{ pages: SpecPage[], warnings: string[] }>}
 */
export async function renderSpecPages({ root, entry = 'spec/index.pi' }) {
	const compiled = new Map();
	/** The compiled exports of a file, compiled once. */
	const compile = (file) => {
		if (!compiled.has(file)) compiled.set(file, compileFile(file, { cwd: root }));
		return compiled.get(file);
	};

	/** A reference string, resolved against the file it was compiled from. */
	const parse = (value, from) => {
		const match = typeof value === 'string' && value.match(REFERENCE);
		if (!match) return null;
		return target(match[1], match[2], from);
	};
	const target = (path, dotted, from) => {
		const file = resolve(dirname(from), path.replace(/\.json$/, '.pi'));
		return { id: `${file}#${dotted}`, file, dotted };
	};

	/** The value a reference points at. */
	const dereference = async ({ file, dotted, id }) => {
		if (!existsSync(file)) throw new Error(`Reference to a file that does not exist: ${id}`);
		let value = await compile(file);
		for (const key of dotted.split('.')) {
			if (value === null || typeof value !== 'object' || !(key in value)) {
				throw new Error(`Reference to something the compiler did not emit: ${id}`);
			}
			value = value[key];
		}
		return value;
	};

	const entryFile = resolve(root, entry);
	const exports = await compile(entryFile);
	const definitions = Object.entries(exports)
		.filter(([, value]) => isPage(value))
		.map(([name, value]) => ({ name, ...value }));

	/** Where each anchor or property is shown: `{ page, fragment }`. */
	const locations = new Map();
	/** Anchors a page claims in its content: they are shown there and nowhere else. */
	const owners = new Map();
	for (const page of definitions) {
		for (const ref of claimed(page.content, entryFile, parse)) {
			if (!owners.has(ref.id)) owners.set(ref.id, page.slug);
		}
	}

	const warnings = [];
	const pages = [];

	for (const page of definitions) {
		const slugger = new GithubSlugger();
		const out = [];
		/** The fragment of the heading everything being written sits under. */
		let current = '';

		/** The text of that heading. */
		let currentTitle = '';

		const heading = (level, text) => {
			currentTitle = text;
			if (level > MAX_HEADING) {
				out.push(`**${text}**`);
				return current;
			}
			current = slugger.slug(text);
			out.push(`${'#'.repeat(level)} ${text}`);
			return current;
		};
		const place = (id, fragment) => {
			if (!locations.has(id)) locations.set(id, { page: page.slug, fragment });
		};

		/** Prose: one paragraph per line, except inside code blocks and tables. */
		const prose = (text, from) => {
			out.push(paragraphs(text, (line) => inline(line, from)));
		};
		/**
		 * A line of prose: references become links and `<` is escaped. Code
		 * spans are left alone — a path written in backticks is an example,
		 * not a reference.
		 */
		const inline = (text, from) =>
			text
				.split(/(`+[^`]*`+)/)
				.map((part, i) =>
					i % 2
						? part
						: part
								.replace(/</g, '&lt;')
								.replace(REFERENCE_IN_TEXT, (_, path, dotted) => link(target(path, dotted, from).id, dotted)),
				)
				.join('');

		/**
		 * Writes a value at a heading level.
		 *
		 * @param {unknown} value
		 * @param {number} level The level its own sub-headings are written at.
		 * @param {string} from The file the value was compiled from.
		 * @param {string} path The anchor and properties it was reached by, for links to properties.
		 * @param {Set<string>} expanding Anchors being expanded, to stop at cycles.
		 */
		const write = async (value, level, from, path, expanding) => {
			const ref = parse(value, from);
			if (ref) return expand(ref, level, from, expanding);

			if (typeof value === 'string') return prose(value, from);
			if (value === null || typeof value !== 'object') return out.push(String(value));

			if (Array.isArray(value)) {
				if (value.every((item) => isScalar(item) && !parse(item, from))) {
					return out.push(bullets(value, (text) => inline(text, from)));
				}
				if (isTable(value)) return out.push(table(value, (text) => inline(text, from)));

				// A list of anchors: each is a section, named after itself. What
				// every one of them has in common — usually inherited from the
				// abstract they all implement — is written once, first.
				const expandable = (ref) => ref && !owners.has(ref.id) && !expanding.has(ref.id) && !locations.has(ref.id);
				const sections = value.map((item) => parse(item, from)).filter(expandable);
				const values = new Map();
				for (const ref of sections) values.set(ref.id, await dereference(ref));
				const shared = sharedKeys([...values.values()]);
				for (const key of shared) {
					heading(level, titleCase(key));
					await write(values.get(sections[0].id)[key], level + 1, sections[0].file, '', expanding);
				}
				const omit = (object) =>
					shared.length && object && typeof object === 'object' && !Array.isArray(object)
						? Object.fromEntries(Object.entries(object).filter(([key]) => !shared.includes(key)))
						: object;

				for (const item of value) {
					const itemRef = parse(item, from);
					if (itemRef && values.has(itemRef.id) && !locations.has(itemRef.id)) {
						const fragment = heading(level, titleCase(last(itemRef.dotted)));
						place(itemRef.id, fragment);
						await body(omit(values.get(itemRef.id)), level + 1, itemRef.file, itemRef.dotted, expanding, itemRef.id, currentTitle);
					} else if (Array.isArray(item) && item.every(isScalar)) {
						out.push(bullets(item, (text) => inline(text, from)));
					} else {
						await write(item, level, from, path, expanding);
					}
				}
				return;
			}

			return body(value, level, from, path, expanding);
		};

		/** An anchor or dictionary: `description` leads, every other key is a heading. */
		const body = async (value, level, from, path, expanding, self, title) => {
			if (!value || typeof value !== 'object' || Array.isArray(value)) {
				return write(value, level, from, path, expanding);
			}
			const inner = self ? new Set([...expanding, self]) : expanding;
			// An anchor is always document structure, however small.
			if (!self && isPureDictionary(value, from, parse)) {
				// Data rather than document structure. One level of it reads
				// best as a list of terms; anything deeper keeps its shape in a
				// fence, the way the compiler writes it.
				const flat = Object.values(value).every(isScalar);
				return out.push(
					flat
						? Object.entries(value)
								.map(([key, entry]) => `- \`${key}\`: ${inline(String(entry), from)}`)
								.join('\n')
						: ['```', ...pureLines(value, 0), '```'].join('\n'),
				);
			}
			if (typeof value.description === 'string') prose(value.description, from);
			for (const [key, entry] of Object.entries(value)) {
				if (key === 'description' && typeof entry === 'string') continue;
				// An optional property left at its default says nothing.
				if (entry === null) continue;
				if (titleCase(key) === title) {
					// `overview: @{TypesOverview}`, whose own `overview` would
					// repeat the heading it is already under.
					if (path) place(`${from}#${path}.${key}`, current);
					await write(entry, level, from, path && `${path}.${key}`, inner);
					continue;
				}
				const fragment = heading(level, titleCase(key));
				const ref = parse(entry, from);
				if (ref && !owners.has(ref.id) && !inner.has(ref.id) && !locations.has(ref.id)) {
					// `numbers: @{Numbers}` — the heading is the anchor's own.
					place(ref.id, fragment);
				}
				if (path) place(`${from}#${path}.${key}`, fragment);
				await write(entry, level + 1, from, path && `${path}.${key}`, inner);
			}
		};

		/** A reference in a structural position: expanded if nothing else shows it, linked if something does. */
		const expand = async (ref, level, from, expanding) => {
			const owner = owners.get(ref.id);
			const shownHere = locations.get(ref.id)?.page === page.slug && locations.get(ref.id)?.fragment === current;
			if ((owner && owner !== page.slug) || expanding.has(ref.id) || (locations.has(ref.id) && !shownHere)) {
				return out.push(`See ${link(ref.id, ref.dotted)}.`);
			}
			place(ref.id, current);
			await body(await dereference(ref), level, ref.file, ref.dotted, expanding, ref.id, currentTitle);
		};

		// The page's own content. A single reference is the page; a dictionary
		// is a set of sections.
		const content = page.content;
		const pageRef = parse(content, entryFile);
		if (pageRef) {
			place(pageRef.id, '');
			await body(await dereference(pageRef), 2, pageRef.file, pageRef.dotted, new Set(), pageRef.id);
		} else if (content && typeof content === 'object' && !Array.isArray(content)) {
			for (const [key, entry] of Object.entries(content)) {
				const ref = parse(entry, entryFile);
				const fragment = heading(2, titleCase(key));
				if (ref) {
					place(ref.id, fragment);
					await body(await dereference(ref), 3, ref.file, ref.dotted, new Set(), ref.id, currentTitle);
				} else {
					await write(entry, 3, entryFile, '', new Set());
				}
			}
		} else {
			await write(content, 2, entryFile, '', new Set());
		}

		pages.push({
			id: page.slug,
			title: page.title,
			description: page.description,
			order: page.order,
			body: out.join('\n\n'),
		});
	}

	// Every anchor now has a place; turn the placeholders into links.
	for (const page of pages) {
		page.body = page.body.replace(LINK, (_, id, text) => {
			const at = locations.get(id) ?? locations.get(anchorOf(id)) ?? moduleOf(id, locations);
			if (!at) {
				warnings.push(`${page.id}: ${relative(root, id)} is not shown on any page, so it is not linked`);
				return text;
			}
			return `[${text}](${href(page.id, at)})`;
		});
	}

	return { pages, warnings: [...new Set(warnings)] };
}

/** Whether an export of the entry is a page. */
function isPage(value) {
	return value && typeof value === 'object' && typeof value.slug === 'string' && 'content' in value;
}

/** The references a page's content names directly. */
function claimed(content, from, parse) {
	const values = content && typeof content === 'object' && !Array.isArray(content) ? Object.values(content) : [content];
	return values.map((value) => parse(value, from)).filter(Boolean);
}

/** For a property that was never given a heading, the anchor it belongs to. */
function anchorOf(id) {
	const [file, dotted] = id.split('#');
	return `${file}#${dotted.split('.')[0]}`;
}

/**
 * For an anchor that is only ever embedded as a copy — an operator in its
 * group's list, say — the section showing the module it belongs to: the
 * nearest index.pi, walking up, whose anchor is on a page.
 */
function moduleOf(id, locations) {
	let dir = dirname(id.split('#')[0]);
	for (;;) {
		const index = `${join(dir, 'index.pi')}#`;
		for (const [key, at] of locations) {
			if (key.startsWith(index) && !key.slice(index.length).includes('.')) return at;
		}
		const up = dirname(dir);
		if (up === dir || !up.includes('tethers')) return undefined;
		dir = up;
	}
}

/** A site URL from one page to a location on another. */
function href(from, { page, fragment }) {
	const base = page === from ? '' : `/${page}/`;
	return fragment ? `${base}#${fragment}` : base || '#';
}

function last(dotted) {
	return dotted.split('.').at(-1);
}

/** Keys, other than `description`, that every one of several anchors has with the same value. */
function sharedKeys(objects) {
	if (objects.length < 2 || !objects.every((o) => o && typeof o === 'object' && !Array.isArray(o))) return [];
	return Object.keys(objects[0]).filter(
		(key) =>
			key !== 'description' &&
			objects[0][key] !== null &&
			objects.every((o) => key in o && JSON.stringify(o[key]) === JSON.stringify(objects[0][key])),
	);
}

function isScalar(value) {
	return value === null || typeof value !== 'object';
}

/** A dictionary holding only short scalars: data, written as it is, in a fence. */
function isPureDictionary(value, from, parse) {
	return (
		Object.keys(value).length > 0 &&
		Object.values(value).every((entry) =>
			entry && typeof entry === 'object' && !Array.isArray(entry)
				? isPureDictionary(entry, from, parse)
				: isScalar(entry) && !parse(entry, from) && !(typeof entry === 'string' && (entry.includes('\n') || entry.length > 60)),
		)
	);
}

function pureLines(value, depth) {
	const pad = '    '.repeat(depth);
	return Object.entries(value).flatMap(([key, entry]) =>
		entry && typeof entry === 'object' ? [`${pad}${key}:`, ...pureLines(entry, depth + 1)] : [`${pad}${key}: ${entry}`],
	);
}

/** A list of objects holding only scalars: a table. */
function isTable(list) {
	return (
		list.length > 0 &&
		list.every((item) => item && typeof item === 'object' && !Array.isArray(item) && Object.values(item).every(isScalar))
	);
}

/**
 * The columns are every key any row has, `symbol` first. A column every row
 * that has it agrees on — the precedence note each arithmetic operator
 * inherits, say — is written once under the table instead of on every row.
 */
function table(list, cell) {
	const keys = [...new Set(list.flatMap(Object.keys))].sort((a, b) => (b === 'symbol') - (a === 'symbol'));
	const shared = keys.filter((key) => {
		const values = list.filter((item) => key in item).map((item) => item[key]);
		return values.length > 1 && new Set(values).size === 1 && String(values[0]).length > 40;
	});
	const columns = keys.filter((key) => !shared.includes(key));
	const text = (value) => cell(String(value)).replace(/\|/g, '\\|').replace(/\n+/g, ' ');
	const code = (key, value) =>
		value === undefined ? '' : key === 'symbol' ? `\`${String(value).replace(/\|/g, '\\|')}\`` : text(value);
	const rows = [
		`| ${columns.map(titleCase).join(' | ')} |`,
		`| ${columns.map(() => '---').join(' | ')} |`,
		...list.map((item) => `| ${columns.map((key) => code(key, item[key])).join(' | ')} |`),
	].join('\n');
	const notes = shared.map((key) => {
		const value = list.find((item) => key in item)[key];
		return `**${titleCase(key)}.** ${String(value).split('\n').map(cell).join('\n\n')}`;
	});
	return [rows, ...notes].join('\n\n');
}

function bullets(list, text, depth = 0) {
	const pad = '  '.repeat(depth);
	return list
		.map((item) =>
			Array.isArray(item) ? bullets(item, text, depth + 1) : `${pad}- ${text(item === null ? 'null' : String(item))}`,
		)
		.join('\n');
}

/**
 * A compiled string as Markdown paragraphs.
 *
 * The compiler keeps a blank line in a string block as a single `\n`, so every
 * line break outside a code block is a paragraph break. Inside a code block —
 * which in the spec is always an escape block, kept exactly — lines are lines.
 * Consecutive table rows are one table.
 */
function paragraphs(text, line) {
	const blocks = [];
	let fence = null;
	let block = [];
	const flush = () => {
		if (block.length) blocks.push(block.join('\n'));
		block = [];
	};
	for (const raw of text.split('\n')) {
		const marker = raw.match(FENCE)?.[1];
		if (fence) {
			block.push(raw);
			if (marker && marker[0] === fence[0] && marker.length >= fence.length && raw.trim() === marker) {
				fence = null;
				flush();
			}
			continue;
		}
		if (marker) {
			flush();
			fence = marker;
			block.push(raw);
			continue;
		}
		if (raw.trimStart().startsWith('|')) {
			if (block.length && !block[0].trimStart().startsWith('|')) flush();
			block.push(raw);
			continue;
		}
		flush();
		if (raw.trim()) blocks.push(line(raw));
	}
	flush();
	return blocks.join('\n\n');
}
