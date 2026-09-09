// One hash over every file in examples/, and the list of those files.
//
// Both exist for cache invalidation. A `from=` code block (see
// plugins/code-from-file.mjs) makes a docs page depend on a file Astro has no
// idea it read: the content layer digests the .md and nothing else, so editing
// an example leaves the cached page in place and the site rebuilds stale. The
// digest is mixed into the docs collection's entry digests in
// src/content.config.ts, and the file list is handed to `addWatchFile` in
// astro.config.mjs so the dev server reloads too.
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const EXAMPLES = join(root, 'examples');

/** Every file under examples/, sorted, as absolute paths. */
export function exampleFiles(dir = EXAMPLES) {
	if (!existsSync(dir)) return [];
	const out = [];
	for (const name of readdirSync(dir).sort()) {
		// What `piton build` leaves behind in an example is not part of it.
		if (name === '.claude' || name === 'src' || name === 'node_modules') continue;
		const full = join(dir, name);
		if (statSync(full).isDirectory()) out.push(...exampleFiles(full));
		else out.push(full);
	}
	return out;
}

/**
 * A digest of all of them. Deliberately one hash for the whole directory
 * rather than per file: it means any example edit invalidates every docs
 * entry, which is coarse, but this site is small and a rebuild is a second.
 * Tracking which page included which file would be precise and wrong the first
 * time someone adds an include without updating the map.
 */
export function examplesDigest() {
	const hash = createHash('sha256');
	for (const file of exampleFiles()) {
		hash.update(file.slice(root.length));
		hash.update(readFileSync(file));
	}
	return hash.digest('hex').slice(0, 16);
}
