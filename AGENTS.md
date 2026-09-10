## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Example output

The tutorials do not contain the Markdown that Piton compiles to. They read it
from `generated/`, which `scripts/build-examples.mjs` fills by running the
compiler against the projects under `examples/`:

```
npm run examples
```

It needs `piton` on `PATH`, and is deliberately not part of `dev` or `build` —
`generated/` is committed so that building the site never needs the compiler.
Run it when an example changes, or when a compiler change moves the output, and
commit the diff.

A tutorial then cites a file with a `from=` fence, the same way it cites source
under `examples/`:

````
```markdown from=generated/hello-piton/react/src/AGENTS.md
```
````

Both attributes are documented in `plugins/code-from-file.mjs`, including
`section=` for taking one part of a long file.

## The single-file export

`/spec.md` is the documentation flattened into one linear Markdown document,
prerendered to `dist/spec.md` by `src/pages/spec.md.ts`.

What goes in it, and in what order, is `src/config/spec.mjs`:

```js
sections: ['Introduction', 'Reference', 'Belay Framework'],
```

Those labels name sections in `src/config/sections.mjs` — the documentation's
structure, which `astro.config.mjs` also builds the sidebar from, so the export
and the site cannot drift. Naming a section that does not exist fails the
build. Adding a section to the export needs no change to the endpoint.

The file is hard-wrapped to `columns` (80). A block is only reflowed if a line
in it is too long, so the hand-wrapped pages keep their own line breaks; code
blocks and tables are never wrapped, since a line break inside either one
breaks it. See `plugins/wrap-markdown.mjs`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
