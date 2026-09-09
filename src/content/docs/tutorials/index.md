---
title: Overview
description: Guided, end-to-end walkthroughs that build something in Piton from nothing.
sidebar:
  order: 1
---

Tutorials are guided walkthroughs. Each one starts from an empty directory and
ends with something that compiles, explaining the reasoning at each step rather
than only the keystrokes.

- [Hello, World](/tutorials/hello-world/) — describe an application with Belay,
  compile it to agent instructions, then move it from React to Rust and egui by
  changing one line.

- [A Markdown Editor](/tutorials/markdown-editor/) — structure a larger
  specification into `agent`, `concept`, `lib`, and `shape`, and write scoped
  skills whose `useWhen` field does the routing.

- [Specifying an Existing Codebase](/tutorials/existing-codebase/) — the other
  direction: use `piton claude` to give Claude the language, then drive it
  through writing a specification for code you already have.

The first two are meant to be read in order; the second assumes the first, and
the third assumes both.

If you do not have the compiler yet, start with
[Installation](/getting-started/).
