---
title: CLI Compiler
description: Compiling, checking, building, and formatting Piton from the command line.
sidebar:
  order: 1
---

The CLI compiler is a command-line tool that allows you to compile Piton files
into output. It also includes helper commands like `format`.

| Command             | Description                                                            | Inputs             |
| ------------------- | ---------------------------------------------------------------------- | ------------------ |
| `piton compile`     | Compiles a Piton file into output                                      | Piton file or glob |
| `piton check`       | Checks a Piton file for errors                                         | Piton file or glob |
| `piton build`       | Builds a Piton project as configured by the piton.config.pi            | none               |
| `piton build check` | Builds and checks a Piton project as configured by the piton.config.pi | none               |
| `piton format`      | Formats a Piton file                                                   | Piton file or glob |
