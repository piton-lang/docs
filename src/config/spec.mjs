/*
 * What /spec.md contains.
 *
 * The single-file export is the documentation flattened into one linear
 * Markdown document — for reading offline, diffing between releases, or
 * handing to an agent whole. src/pages/spec.md.ts builds it.
 *
 * `sections` is the knob: the labels name sections in src/config/sections.mjs,
 * and the order here is the order they appear in the file. It is deliberately
 * not the sidebar's order, and deliberately not all of them — the export is a
 * specification, so it leads with why the language exists, then the reference
 * material, then the framework built on top of it. Installation instructions
 * and step-by-step tutorials are a website's job, not a spec's.
 *
 * Naming a section that does not exist fails the build.
 */
export const spec = {
	/** The document's H1. */
	title: 'Piton',

	/** One line under the title, saying what the reader is holding. */
	description:
		'A semi-natural programming language for writing skills, agents, and reference documents for Agentic Software Development.',

	/** Sections to include, in the order they appear in the file. */
	sections: ['Introduction', 'Reference', 'Belay Framework'],

	/**
	 * The column the file is hard-wrapped to.
	 *
	 * The export is read as a text file — in a terminal, in a diff, in a
	 * context window — and none of those wrap it for you. Code blocks and
	 * tables are exempt, because a line break inside either one breaks it;
	 * see plugins/wrap-markdown.mjs.
	 */
	columns: 80,
};
