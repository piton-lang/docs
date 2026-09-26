---
title: Installation
description: Getting the Piton compiler onto your machine – by script, by hand, or by building it yourself.
sidebar:
  order: 1
---

Piton is a single binary called `piton` and that's the compiler, the language
server, and the build tool all in one. There are three ways to get it onto your
machine.

## Install Script

The easy way. On macOS or Linux (or Git Bash on Windows):

```sh
curl -fsSL https://github.com/piton-lang/piton-rs/releases/latest/download/install.sh | sh
```

On Windows, in PowerShell:

```powershell
irm https://github.com/piton-lang/piton-rs/releases/latest/download/install.ps1 | iex
```

Both fetch the latest build, checks it against its checksum and puts `piton` in
`~/.local/bin` (`%LOCALAPPDATA%\piton\bin` on Windows). If that directory isn't
on your `PATH`, the script will tell you and give you the line to add to your
shell's profile. On a Mac it also clears the quarantine flag, since the builds
aren't signed yet and Gatekeeper is suspicious of strangers.

If you'd rather have a particular build, set `PITON_VERSION`. If you'd rather
it lived somewhere else, set `PITON_INSTALL_DIR`:

```sh
curl -fsSL https://github.com/piton-lang/piton-rs/releases/latest/download/install.sh | PITON_VERSION=0.1.41 sh
```

To update, run the script again. That's it.

## Prebuilt Binaries

The script isn't doing anything crazy; it's just downloading an archive from the
[releases page](https://github.com/piton-lang/piton-rs/releases/latest) and
unpacks it, and you're entirely welcome to do that yourself. Every release
provides a package per platform, each holding a binary called `piton`
(`piton.exe` on Windows) and a `.sha256` checksum sitting next to it:

| Platform             | Archive                                    |
| -------------------- | ------------------------------------------ |
| Linux, x86_64        | `piton-edge-linux-x86_64-<version>.tar.gz` |
| macOS, Apple Silicon | `piton-edge-macos-aarch64-<version>.zip`   |
| macOS, Intel         | `piton-edge-macos-x86_64-<version>.zip`    |
| Windows, x86_64      | `piton-edge-windows-x86_64-<version>.zip`  |

Put the binary anywhere on your `PATH`. On a Mac, clear the quarantine flag
first, or Gatekeeper will politely refuse to run it:

```sh
xattr -d com.apple.quarantine piton
```

## From Source

You'll need Rust 1.75 or newer:

```sh
git clone https://github.com/piton-lang/piton-rs.git
cd piton-rs
cargo xtask install
```

That builds the release binary and copies it into Cargo's bin directory.
Reinstalling over a `piton` that's currently running works just fine. Pass
`--root <dir>` to install into `<dir>/bin` instead, or `--dry-run` to see what
would happen without it actually happening. `cargo xtask` on its own lists
everything else it can do.

## Verify the Install

```sh
piton --version
```

If that prints a version, congratulations -- you have a compiler. If it
doesn't, the directory `piton` went into isn't on your `PATH`.

One more thing: the package commands, `piton tether` and `piton update`, also
need `git` on your `PATH`. Nothing else does.

:::note
The editor integrations in [Editor Setup](/getting-started/editors/) live in
`editors/` in the compiler repository -- all except the VS Code extension, which
comes with every release. For the others you'll want a clone of the repository,
however you installed `piton`.
:::
