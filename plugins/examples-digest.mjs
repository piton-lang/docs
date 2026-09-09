// One hash over every file a `from=` code block can read, and the list of
// those files.
//
// Both exist for cache invalidation. A `from=` code block (see
// plugins/code-from-file.mjs) makes a docs page depend on a file Astro has no
// idea it read: the content layer digests the .md and nothing else, so editing
// an example leaves the cached page in place and the site rebuilds stale. The
// digest is mixed into the docs collection's entry digests in
// src/content.config.ts, and the file list is handed to `addWatchFile` in
// astro.config.mjs so the dev server reloads too.
//
// Two trees are read, and they are not interchangeable. examples/ is the
// handwritten specifications, and is also what the .zip downloads are packed
// from. generated/ is what `npm run examples` compiled out of them, and must
// stay out of the downloads — whoever unpacks a project should get its output
// by running the build, not inherit a copy of someone else's.
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const EXAMPLES = join(root, 'examples');
const GENERATED = join(root, 'generated');

/** Every file under `dir`, sorted, as absolute paths. */
function walk(dir, skip) {
	if (!existsSync(dir)) return [];
	const out = [];
	for (const name of readdirSync(dir).sort()) {
		if (skip(name)) continue;
		const full = join(dir, name);
		if (statSync(full).isDirectory()) out.push(...walk(full, skip));
		else out.push(full);
	}
	return out;
}

// What `piton build` leaves behind in an example is not part of it.
const isBuildOutput = (name) => name === '.claude' || name === 'src' || name === 'node_modules';

/** Every file under examples/ — the specifications, without their output. */
export function exampleFiles(dir = EXAMPLES) {
	return walk(dir, isBuildOutput);
}

/**
 * Every file under generated/ — which is nothing but compiler output, so
 * unlike the above it keeps the `.claude` and `src` directories. That is the
 * whole of it.
 */
export function generatedFiles(dir = GENERATED) {
	return walk(dir, () => false);
}

/** Both trees: everything a page can include, and so everything to watch. */
export function includableFiles() {
	return [...exampleFiles(), ...generatedFiles()];
}

/**
 * A digest of all of them. Deliberately one hash for both directories rather
 * than per file: it means any edit invalidates every docs entry, which is
 * coarse, but this site is small and a rebuild is a second. Tracking which
 * page included which file would be precise and wrong the first time someone
 * adds an include without updating the map.
 */
export function examplesDigest() {
	const hash = createHash('sha256');
	for (const file of includableFiles()) {
		hash.update(file.slice(root.length));
		hash.update(readFileSync(file));
	}
	return hash.digest('hex').slice(0, 16);
}
