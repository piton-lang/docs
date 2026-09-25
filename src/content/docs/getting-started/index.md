---
title: Installation
description: Install the Piton compiler with the install script, from a prebuilt binary, or from source.
sidebar:
  order: 1
---

Piton is a single binary, `piton`: the compiler, the language server, and the
build tool. Every push to `main` is published as a release with a build for
each platform, so there are three ways to get it.

## Install Script

On macOS or Linux (or Git Bash on Windows):

```sh
curl -fsSL https://github.com/piton-lang/piton-rs/releases/latest/download/install.sh | sh
```

On Windows, in PowerShell:

```powershell
irm https://github.com/piton-lang/piton-rs/releases/latest/download/install.ps1 | iex
```

Both install the latest build from `main`, check it against its checksum, and
put `piton` in `~/.local/bin` (`%LOCALAPPDATA%\piton\bin` on Windows). If that
directory isn't on your `PATH`, the script says so and prints the line to add
to your shell's profile. On a Mac the script also clears the quarantine flag,
since the builds aren't signed yet.

Set `PITON_VERSION=0.1.41` to install a particular build, or
`PITON_INSTALL_DIR` to put it somewhere else:

```sh
curl -fsSL https://github.com/piton-lang/piton-rs/releases/latest/download/install.sh | PITON_VERSION=0.1.41 sh
```

Running the script again updates `piton` to the latest build.

## Prebuilt Binaries

The script only downloads and unpacks what is on the
[releases page](https://github.com/piton-lang/piton-rs/releases/latest), so you
can do that yourself. Each release carries one archive per platform, holding a
binary called `piton` (`piton.exe` on Windows), and a `.sha256` checksum next
to each:

| Platform | Archive |
| --- | --- |
| Linux, x86_64 | `piton-edge-linux-x86_64-<version>.tar.gz` |
| macOS, Apple Silicon | `piton-edge-macos-aarch64-<version>.zip` |
| macOS, Intel | `piton-edge-macos-x86_64-<version>.zip` |
| Windows, x86_64 | `piton-edge-windows-x86_64-<version>.zip` |

Put the binary anywhere on your `PATH`. On a Mac, clear the quarantine flag
first, or Gatekeeper refuses to run it:

```sh
xattr -d com.apple.quarantine piton
```

Versions count up with every build: `0.1.N` is the Nth commit on `main`, and
`piton --version` prints the version it was released as. For any other
platform, build from source.

## From Source

Building needs Rust 1.75 or newer:

```sh
git clone https://github.com/piton-lang/piton-rs.git piton
cd piton
cargo xtask install
```

That builds the release binary and copies it into Cargo's bin directory,
saying where it went and whether that directory is on your `PATH`.
Reinstalling over a `piton` that is currently running works. Pass
`--root <dir>` to install into `<dir>/bin` instead, or `--dry-run` to see what
would happen. `cargo xtask` on its own lists the tasks.

## Verify the Install

```sh
piton --version
```

If that fails, the directory `piton` went into isn't on your `PATH`.

The package commands, `piton tether` and `piton update`, also need `git` on
your `PATH`. Nothing else does.

:::note
The editor integrations in [Editor Setup](/getting-started/editors/) are
installed from `editors/` in the compiler repository, except the VS Code
extension, which comes with every release. You need a clone of the repository
for the others, however you installed `piton`.
:::
