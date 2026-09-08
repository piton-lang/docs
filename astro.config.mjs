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
			social: [
				{ icon: 'github', label: 'GitHub', href: 'https://github.com/piton-lang/piton-rs' },
			],
			sidebar: [
				{
					label: 'Introduction',
					items: [{ autogenerate: { directory: 'introduction' } }],
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
