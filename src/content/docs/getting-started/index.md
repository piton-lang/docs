---
title: Installation
description: Build and install the Piton compiler from source.
sidebar:
  order: 1
---

## Clone and Install

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

## Installing Elsewhere

`cargo xtask install --dest DIR` puts the binary somewhere else, and
`cargo xtask uninstall` removes it.

:::note
Keep the cloned repository around. The editor integrations in
[Editor Setup](/getting-started/editors/) are installed from `editors/` inside
it, and the language server they all start is the same `piton` binary you just
put on your `PATH`.
:::
