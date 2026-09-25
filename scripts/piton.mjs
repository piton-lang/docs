// Makes sure there is a `piton` compiler for the build. Run by `predev` and
// `prebuild`.
//
// The Introduction, Reference and Belay pages are compiled out of the spec in
// tethers/piton at build time (see plugins/spec-pages.mjs), so a build without
// the compiler has no pages to build. On a machine that has one on PATH this
// does nothing. Anywhere else — a CI or Cloudflare build — it installs the
// release named by `piton.version` in package.json, using the same install
// script the Installation page tells readers to use, into node_modules/.bin,
// which npm puts on PATH for every script it runs.
//
// The version is pinned rather than "latest" so that a deploy renders the spec
// with the compiler it was checked against. Bump it alongside `piton update`.
import { execFileSync, spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const { version } = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')).piton;
const installDir = `${root}node_modules/.bin`;

function installed() {
	try {
		return execFileSync('piton', ['--version'], { encoding: 'utf8' }).trim();
	} catch {
		return null;
	}
}

const found = installed();
if (found) {
	if (!found.endsWith(` ${version}`)) {
		console.log(`piton: using ${found} from PATH (the site pins ${version})`);
	}
	process.exit(0);
}

if (process.platform === 'win32') {
	console.error(
		'piton: the compiler is not on PATH. Install it in PowerShell with\n\n' +
			`    $env:PITON_VERSION="${version}"; irm https://github.com/piton-lang/piton-rs/releases/download/v${version}/install.ps1 | iex\n`,
	);
	process.exit(1);
}

const url = `https://github.com/piton-lang/piton-rs/releases/download/v${version}/install.sh`;
const response = await fetch(url);
if (!response.ok) {
	console.error(`piton: couldn't download ${url} (${response.status})`);
	process.exit(1);
}

const result = spawnSync('sh', [], {
	input: await response.text(),
	stdio: ['pipe', 'inherit', 'inherit'],
	env: { ...process.env, PITON_VERSION: version, PITON_INSTALL_DIR: installDir },
});
process.exit(result.status ?? 1);
