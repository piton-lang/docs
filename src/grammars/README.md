# Vendored grammars

`piton.tmLanguage.json` is copied verbatim from the Piton compiler repository:

- Source: https://github.com/piton-lang/piton-rs — `editors/shared/piton.tmLanguage.json`
- Vendored at upstream commit `1b49df0`

It is the same grammar the VS Code and JetBrains extensions ship, and it is
self-contained (no includes of other TextMate scopes), so Shiki can load it
directly. It is registered in `astro.config.mjs` under
`markdown.shikiConfig.langs`, which makes ```piton` fences highlight.

To update, re-copy the file from upstream. Do not hand-edit it here.
