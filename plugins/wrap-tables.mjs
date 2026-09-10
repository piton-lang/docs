// Puts a scroll container around every table, so the table can be a table.
//
// Starlight ships this (style/markdown.css):
//
//     .sl-markdown-content table:not(:where(.not-content *)) {
//         display: block;
//         overflow: auto;
//     }
//
// which makes the TABLE ITSELF the thing that scrolls. That is what stops a
// wide table from blowing out the page on a narrow screen, and it works — but
// `display: block` stops the element being a table box. Its rows then belong
// to an ANONYMOUS table box, and an anonymous table shrink-wraps its contents,
// so nothing inside can be stretched: `width: 100%` in src/styles/theme.css
// reached the block (the raised panel painted the full column) while the rows,
// the cells and the hairlines under them stopped wherever the text happened to
// end. On the two-column table in belay/index.md that left the rules running a
// third of the way across a full-width panel.
//
// There is no CSS fix from inside, because there is no selector for an
// anonymous box. The scrolling has to move OUT, onto an element of its own —
// which is all this does. theme.css then restores `display: table` and the
// table lays out at the full width of the wrapper, wrapping its text as any
// table does, and scrolling only when its columns genuinely cannot fit.
//
// A hast plugin rather than an mdast one: `table` is an HTML element, and the
// wrapper is HTML. Sätteri takes both (see the note in
// plugins/code-from-file.mjs about which tree runs when).
export function wrapTables() {
	return {
		name: 'wrap-tables',
		element: {
			filter: ['table'],
			visit(node, ctx) {
				// A wrapped table is still a `table`, and re-wrapping one would
				// nest a scroll container inside a scroll container.
				const parent = ctx.parent(node);
				if (parent?.type === 'element' && parent.tagName === 'div') {
					const className = parent.properties?.className;
					const names = Array.isArray(className) ? className : [className];
					if (names.includes('pi-table')) return;
				}

				ctx.wrapNode(node, {
					type: 'element',
					tagName: 'div',
					properties: { className: ['pi-table'] },
					children: [],
				});
			},
		},
	};
}
