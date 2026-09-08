---
title: CLI
description: Compiling, checking, building, and formatting Piton from the command line.
sidebar:
  order: 1
---

The CLI compiler is a command-line tool that allows you to compile Piton files
into output. It also includes helper commands like `format`.

| Command                | Description                                                            | Inputs       |
| ---------------------- | ---------------------------------------------------------------------- | ------------ |
| `piton compile <path>` | Compiles Piton to JSON, or YAML with `--format yaml`                   | file or glob |
| `piton check <path>`   | Checks specific files or the project and reports errors                | file or glob |
| `piton build`          | Builds the project as configured by `piton.config.pi`                  | none         |
| `piton build check`    | Builds and reports problems without writing output                     | none         |
| `piton format <path>`  | Applies canonical formatting; use `--check` to only report differences | file or glob |
| `piton lsp`            | Runs the Piton language server                                         | none         |
| `piton docs`           | Prints the Piton language reference                                    | none         |
| `piton claude`         | Launches Claude Code already fluent in Piton                           | none         |
| `piton reach`          | Reports which files are reached and which are stranded                 | none         |
