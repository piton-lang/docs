import { defineCollection } from 'astro:content';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';
import { examplesDigest } from '../plugins/examples-digest.mjs';

/*
 * Starlight's loader, with the examples folded into every entry's digest.
 *
 * Tutorial pages pull their code blocks out of examples/ with `from=` fences
 * (plugins/code-from-file.mjs). The content layer digests the .md file and
 * nothing else, so without this an example edit leaves the cached page
 * untouched and the site rebuilds with the old code in it — the exact drift
 * the includes exist to prevent, just moved into node_modules/.astro.
 *
 * Salting the digest is the whole fix: change any example and every docs entry
 * re-renders.
 */
function docsLoaderWithExamples() {
	const loader = docsLoader();
	const salt = examplesDigest();
	return {
		...loader,
		load: (context: Parameters<typeof loader.load>[0]) =>
			loader.load({
				...context,
				generateDigest: (data: Record<string, unknown> | string) =>
					context.generateDigest({ salt, data }),
			}),
	};
}

export const collections = {
	docs: defineCollection({ loader: docsLoaderWithExamples(), schema: docsSchema() }),
};
