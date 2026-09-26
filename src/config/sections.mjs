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
 * A group can end with `links`: sidebar entries that point at a page in
 * another group rather than holding one of their own. The export skips them;
 * the page they point at is already in it, or deliberately not.
 *
 * @typedef {{ label: string, link: string }} Link
 * @typedef {{ label: string, groups: { label: string, directory: string, links?: Link[] }[] }} Section
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
		label: 'Tutorials',
		groups: [{ label: 'Guides', directory: 'tutorials' }],
	},
	{
		label: 'Reference',
		groups: [
			{ label: 'The Language', directory: 'language' },
			{
				label: 'Tooling',
				directory: 'tooling',
				// How editors behave is set up, not looked up: the one page
				// for it is in Getting Started.
				links: [{ label: 'Editor Setup', link: '/getting-started/editors/' }],
			},
		],
	},
	{
		label: 'Belay Framework',
		groups: [{ label: 'Belay', directory: 'belay' }],
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
