---
title: Editor Setup
description: Install the Piton language server and syntax highlighting in VS Code, Zed, Neovim, Vim, Emacs, JetBrains, Sublime Text, Helix, and Kate.
sidebar:
  order: 2
---

Every editor integration lives in `editors/` in the compiler repository and is
generated from the compiler itself. They all start the same language server,
`piton lsp`, which gives you diagnostics, completion, hover, go to definition,
find references, rename, formatting, and inlay hints.

:::caution
The `piton` binary must be on your `PATH` first — see
[Installation](/getting-started/). Run the commands below from the repository
you cloned.
:::

## VS Code

Also works in Cursor and Windsurf.

```sh
cd editors/vscode
npm install
npx vsce package
code --install-extension piton-0.1.0.vsix
```

## Zed

Zed compiles the extension itself, so add the WebAssembly target first:

```sh
rustup target add wasm32-wasip1
```

Then Command palette → `zed: install dev extension` → choose `editors/zed`.

Highlighting needs the Tree-sitter grammar, which Zed fetches over git. Everything
the language server provides works without it.

## Neovim

Add `editors/vim` to your `runtimepath`, then:

```lua
require('piton').setup()
```

## Vim

Copy the syntax files in, or point a plugin manager at `editors/vim`:

```sh
cp -r editors/vim/{syntax,ftdetect,ftplugin} ~/.vim/
```

## Emacs

```elisp
(add-to-list 'load-path "/path/to/piton/editors/emacs")
(require 'piton-mode)
```

`piton-mode` registers itself with both `eglot` and `lsp-mode`.

## JetBrains IDEs

For highlighting in any of them, free or paid: Settings → Editor → TextMate
Bundles → `+` → select `editors/jetbrains/bundles/piton`.

For the language server as well, build the plugin:

```sh
cd editors/jetbrains && ./gradlew buildPlugin
```

The JetBrains LSP API is only in the paid IDEs.

## Sublime Text

```sh
cp -r editors/sublime "$HOME/.config/sublime-text/Packages/Piton"
```

Install the `LSP` package and the bundled settings start the server.

## Helix

Merge `editors/helix/languages.toml` into `~/.config/helix/languages.toml`,
then:

```sh
hx --grammar fetch && hx --grammar build
```

## Kate

```sh
mkdir -p ~/.local/share/org.kde.syntax-highlighting/syntax
cp editors/kate/piton.xml ~/.local/share/org.kde.syntax-highlighting/syntax/
```

Enable Kate's LSP Client plugin and point it at `piton lsp`.

## More detail

Further detail, including what to do when the binary is not on your `PATH`, is
in [editor setup](https://github.com/piton-lang/piton-rs/blob/main/docs/editors.md)
in the compiler repository.
