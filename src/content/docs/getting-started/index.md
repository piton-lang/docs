---
title: Installation
description: Install the Piton compiler with the install script, or build it from source.
sidebar:
  order: 1
---

## Install Script

Piton is a single binary, `piton`. The install script downloads the latest
release, checks it against its checksum, and puts it on your machine.

On macOS or Linux (or Git Bash on Windows):

```sh
curl -fsSL https://github.com/piton-lang/piton-rs/releases/latest/download/install.sh | sh
```

On Windows, in PowerShell:

```powershell
irm https://github.com/piton-lang/piton-rs/releases/latest/download/install.ps1 | iex
```

The binary goes in `~/.local/bin`, or `%LOCALAPPDATA%\piton\bin` on Windows.
If that directory isn't on your `PATH`, the script says so and prints the line
to add to your shell's profile.

Builds exist for Linux on x86_64, macOS on Apple Silicon and Intel, and
Windows on x86_64. Anywhere else, [build it from source](#from-source).

:::note
The macOS builds aren't signed yet, so the script clears the quarantine flag
that would otherwise stop Gatekeeper from running it.
:::

### Options

Two environment variables change what the script does. Both are optional.

| Variable | Default | |
| --- | --- | --- |
| `PITON_VERSION` | the latest release | A release to install, like `0.1.54`. |
| `PITON_INSTALL_DIR` | `~/.local/bin` | Where to put `piton`. |

```sh
curl -fsSL https://github.com/piton-lang/piton-rs/releases/latest/download/install.sh | PITON_VERSION=0.1.54 sh
```

In PowerShell, set them first:

```powershell
$env:PITON_VERSION = "0.1.54"
irm https://github.com/piton-lang/piton-rs/releases/latest/download/install.ps1 | iex
```

## Verify the Install

```sh
piton --version
```

If that fails, the install directory isn't on your `PATH`.

## Updating

Run the install script again. It replaces the binary with the latest release,
or with `PITON_VERSION` if you set it. To uninstall, delete the binary.

## From Source

Building from source needs a recent stable Rust toolchain and nothing else.

```sh
git clone https://github.com/piton-lang/piton-rs.git piton
cd piton
cargo xtask install
```

That builds the release binary, copies it into Cargo's binary directory
(`~/.cargo/bin` by default), and runs it to check that it works.
`cargo xtask install --dest DIR` puts it somewhere else, and
`cargo xtask uninstall` removes it.

:::note
The editor integrations in [Editor Setup](/getting-started/editors/) are
installed from `editors/` in the compiler repository. You need a clone of it
for those, however you installed `piton`.
:::
