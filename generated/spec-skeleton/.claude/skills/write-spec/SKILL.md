---
name: write-spec
description: Writes and extends the Piton specification for this codebase. Use when the specification is being written or extended, a part of the codebase needs describing, or you are deciding whether something belongs in concept, shape, lib, or agent
---

Extend the specification under spec/, following the split below. Read the code before writing, and describe what it does rather than how it is written.

# Concept

What the application is and what its parts are, in the words a person would use out loud. Stack-agnostic: no file names, no framework names, no measurements. Start from [App](../../reference/concept/App.md).

# Shape

How each part is built: layout, spacing, states, accessibility, error handling. One file per part, in a directory mirroring the source tree, so instructions compile next to the code they describe.

# Lib

Anything said more than once — the stack, shared conventions, shared requirements. Reference it with @{} rather than repeating it.

# Agent

One skill per part, scoped the way a source directory is scoped. Write useWhen in the words a person would use when asking for that part.

# Rules

- Do not transcribe the implementation. A specification that lists functions is a summary, not a description.
- Where the code does something for no discernible reason, say so and ask, rather than writing the accident into the spec.
- Run `piton check spec` after each file, and `piton reach` before stopping.

Links in this document point at reference files. Read one when the work touches what it describes.
