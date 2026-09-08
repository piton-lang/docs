---
title: Installation
description: Build and install the Piton compiler from source.
sidebar:
  order: 1
---

Piton is built from source with a recent stable Rust toolchain, and needs
nothing else.

```sh
git clone git@github.com:piton-lang/piton-rs.git piton
cd piton
cargo xtask install
```

That builds the release binary, copies it into Cargo's binary directory
(`~/.cargo/bin` by default), and runs it to check that it works.

## Verify the install

```sh
piton --version
```

If that fails, the binary is not on your `PATH`.

## Installing elsewhere

`cargo xtask install --dest DIR` puts the binary somewhere else, and
`cargo xtask uninstall` removes it.

:::note
Keep the cloned repository around. The editor integrations in
[Editor Setup](/getting-started/editors/) are installed from `editors/` inside
it, and the language server they all start is the same `piton` binary you just
put on your `PATH`.
:::

## Commands

| Command | What it does |
| --- | --- |
| `piton build` | Build the project described by `piton.config.pi` |
| `piton build check` | Build and report problems without writing |
| `piton check <path>` | Report problems in specific files |
| `piton compile <path>` | Compile to JSON, or YAML with `--format yaml` |
| `piton format <path>` | Apply the canonical style; `--check` to only report |
| `piton lsp` | Run the language server |
| `piton docs` | Print the language reference |
| `piton claude` | Launch Claude Code already fluent in Piton |
