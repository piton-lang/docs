// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// Piton's own TextMate grammar, vendored from the compiler repo.
// See src/grammars/README.md for provenance and how to update it.
import pitonGrammar from './src/grammars/piton.tmLanguage.json' with { type: 'json' };


// https://astro.build/config
export default defineConfig({
	markdown: {
		shikiConfig: {
			langs: [
				// @ts-expect-error - Shiki's LanguageRegistration type is narrower
				// than the raw tmLanguage JSON, which it nonetheless accepts.
				{ ...pitonGrammar, name: 'piton', aliases: ['pi'] },
			],
		},
	},
	integrations: [
		starlight({
			title: 'Piton',
			logo: {
				// The source logo is a single black path, which would vanish on the
				// dark header, so a light-ink variant is used for the dark scheme.
				light: './logo.svg',
				dark: './logo-dark.svg',
				// The mark is a wordmark, so the text title would be a duplicate.
				// Starlight keeps it as screen-reader text.
				replacesTitle: true,
			},
			expressiveCode: {
				// Bundled Shiki themes. Houston is dark-only, so a bundled light
				// theme partners it for the light scheme.
				themes: ['houston', 'github-light'],
			},
			head: [
				{
					// Adds tail distribution and click intent to the on-this-page
					// tracker; see the comment at the top of the file.
					tag: 'script',
					attrs: { src: '/toc-tail.js', defer: true },
				},
			],
			customCss: [
				// Barlow Semi Condensed, self-hosted via Fontsource (no external
				// request at runtime). Weights match those used in theme.css.
				'@fontsource/barlow-semi-condensed/400.css',
				'@fontsource/barlow-semi-condensed/400-italic.css',
				'@fontsource/barlow-semi-condensed/500.css',
				'@fontsource/barlow-semi-condensed/600.css',
				'@fontsource/barlow-semi-condensed/700.css',
				// Barlow Condensed — narrower still, used only for the page title.
				'@fontsource/barlow-condensed/600.css',
				'@fontsource/barlow-condensed/700.css',
				// IBM Plex Mono for code and technical data. Self-hosted so code
				// renders identically everywhere, rather than falling to whatever
				// monospace each OS happens to ship.
				'@fontsource/ibm-plex-mono/400.css',
				'@fontsource/ibm-plex-mono/500.css',
				'@fontsource/ibm-plex-mono/600.css',
				'./src/styles/theme.css',
			],
			social: [
				{ icon: 'github', label: 'GitHub', href: 'https://github.com/piton-lang/piton-rs' },
			],
			sidebar: [
				{
					label: 'Introduction',
					items: [{ autogenerate: { directory: 'introduction' } }],
				},
				{
					label: 'Getting Started',
					items: [{ autogenerate: { directory: 'getting-started' } }],
				},
				{
					label: 'The Language',
					items: [{ autogenerate: { directory: 'language' } }],
				},
				{
					label: 'CLI Compiler',
					items: [{ autogenerate: { directory: 'cli' } }],
				},
				{
					label: 'Frameworks',
					items: [
						{ label: 'Frameworks', slug: 'frameworks' },
						{ label: 'The Belay Framework', slug: 'belay' },
						{ label: 'Belay Constructs', slug: 'belay/constructs' },
						{ label: 'String Serialization and Output', slug: 'belay/serialization' },
					],
				},
			],
		}),
	],
});
