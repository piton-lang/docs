/*
 * The shape of the documentation: sections, the groups inside them, and the
 * content directory each group is built from.
 *
 * This is the single source of truth for that structure. Two things read it,
 * and they must not drift:
 *
 *   - astro.config.mjs turns it into Starlight's `sidebar`. The top level is
 *     the vertical tab strip (src/components/Sidebar.astro), and the groups
 *     inside a section are what Starlight renders as collapsible <details>.
 *   - src/pages/spec.md.ts concatenates some of these sections, in an order of
 *     its own, into the single-file export. See src/config/spec.mjs.
 *
 * Order here is sidebar order. The spec picks its own, by label.
 */

/**
 * @typedef {{ label: string, groups: { label: string, directory: string }[] }} Section
 */

/** @type {Section[]} */
export const sections = [
	{
		label: 'Introduction',
		groups: [{ label: 'Founding Thesis', directory: 'thesis' }],
	},
	{
		label: 'Getting Started',
		groups: [{ label: 'Setup', directory: 'getting-started' }],
	},
	{
		label: 'Belay Framework',
		groups: [{ label: 'Belay', directory: 'belay' }],
	},
	{
		label: 'Reference',
		groups: [
			{ label: 'The Language', directory: 'language' },
			{ label: 'Tooling', directory: 'tooling' },
		],
	},
	{
		label: 'Tutorials',
		groups: [{ label: 'Guides', directory: 'tutorials' }],
	},
];

/**
 * The sections named by `labels`, in the order given.
 *
 * An unknown label throws rather than being skipped: a section quietly missing
 * from the spec export is exactly the kind of thing nobody notices, and the
 * only place left to catch a renamed section is the build.
 *
 * @param {string[]} labels
 * @returns {Section[]}
 */
export function sectionsNamed(labels) {
	return labels.map((label) => {
		const section = sections.find((candidate) => candidate.label === label);
		if (!section) {
			const known = sections.map((s) => JSON.stringify(s.label)).join(', ');
			throw new Error(`No documentation section named ${JSON.stringify(label)}. Known sections: ${known}`);
		}
		return section;
	});
}
