/*
 * The tutorial downloads, built from examples/ at build time.
 *
 * One source of truth: the projects under examples/ are what the tutorials
 * render their code blocks from (plugins/code-from-file.mjs), what these
 * archives are packed from, and what `piton build` is run against. Nothing is
 * copied, so nothing can drift, and no binary is committed.
 *
 * The site is fully static, so Astro prerenders this route to
 * dist/downloads/<project>.zip at build time.
 */
import type { APIRoute, GetStaticPaths } from 'astro';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { zip } from '../../../plugins/zip.mjs';
import { exampleFiles } from '../../../plugins/examples-digest.mjs';

const EXAMPLES = join(process.cwd(), 'examples');

export const getStaticPaths: GetStaticPaths = () =>
	readdirSync(EXAMPLES)
		.filter((name) => statSync(join(EXAMPLES, name)).isDirectory())
		.sort()
		.map((project) => ({ params: { project } }));

export const GET: APIRoute = ({ params }) => {
	const project = params.project!;
	const dir = join(EXAMPLES, project);

	/*
	 * Entry names carry the project directory, so the archive unpacks into a
	 * folder rather than spilling into the reader's working directory. ZIP
	 * separates with '/' on every platform.
	 *
	 * `exampleFiles` decides the contents, and it already skips what `piton
	 * build` writes into an example — the point of the download is the
	 * specification, and whoever unpacks it should get the compiled output by
	 * running the build rather than inheriting a stale one from this machine.
	 */
	const entries = exampleFiles(dir).map((file) => ({
		name: [project, ...relative(dir, file).split(sep)].join('/'),
		data: readFileSync(file),
	}));

	return new Response(zip(entries), {
		headers: {
			'Content-Type': 'application/zip',
			'Content-Disposition': `attachment; filename="${project}.zip"`,
		},
	});
};
