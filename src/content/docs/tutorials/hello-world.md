---
title: Hello, World
description: Describe a Hello World application with Belay, compile it to agent instructions, then swap the entire tech stack by changing one line.
sidebar:
  order: 2
---

This walkthrough builds the smallest thing worth building: a specification for a
Hello World application. You will not write any React, and you will not write
any Rust. You will describe an application once, compile that description into
instructions an agent can build from, and then — in the last section — move the
whole thing from React to Rust and egui by changing a single line.

That last part is the point. If the description is the source and the stack is
just one of its properties, then changing stacks is an edit, not a rewrite.

:::caution
You need the `piton` binary on your `PATH` first. See
[Installation](/getting-started/).
:::

## The project

Piton finds a project by looking for `piton.config.pi` in the working
directory. Make a directory for the project and start there.

```sh
mkdir hello-piton
cd hello-piton
```

Everything you write goes under `spec/`, and everything the compiler writes for
your application goes under `src/`. Create `piton.config.pi`:

```piton
use @piton/config
use @piton/belay

from @piton/belay import ClaudeAdapter

export piton-config Config:
    root: ./spec
    entry: ./spec/index.pi

    frameworks:
        - {BelayFrameworkConfig}

belay-config BelayFrameworkConfig:
    codeRoot: ./src/
    shapeRoot: ./spec/shape/

    adapters:
        - {ClaudeAdapter}
```

Four things are being said here.

`root` is where your Piton source lives, and `entry` is the one file the
compiler starts from. Anything not reachable from that entry is never compiled
— which sounds harsh, and is in fact useful, as you will see at the end.

`frameworks` pulls in Belay. Belay is what turns Piton from a language that
compiles to data into one that compiles to agent instructions, and it is what
gives you the `instruction` keyword a few sections from now.

`codeRoot` is where the compiled instructions land, and `shapeRoot` is the
directory whose structure mirrors it. A file at `spec/shape/App.pi` becomes
instructions at `src/`. Nest `shapeRoot` further and the output nests with it.

`adapters` says what to write. `ClaudeAdapter` emits Claude Code's file layout.

Note the `{ }` around `{BelayFrameworkConfig}` and `{ClaudeAdapter}`. A bare
value in Piton is a string; braces are what make it an expression that resolves
a name. Writing `- BelayFrameworkConfig` would have given you the literal text.

## The shape of a stack

Before describing the application, describe what a tech stack *is*. This is an
abstract anchor: a shape with no values, which alone will never compile and
must be implemented by something concrete.

`spec/stack/Stack.pi`:

```piton
export abstract anchor Stack:
    name:: string
    language:: string
    build:: string
    entryPoint:: string
    conventions:: string[]
```

The `::` is a type constraint, and `string[]` is a list of strings. None of
these properties have values — the `:` and a value are simply absent — so any
anchor implementing `Stack` is obliged to supply all five.

That obligation is the whole reason to write this file. It is what makes the
stack swap at the end safe rather than hopeful.

## A concrete stack

Now implement it. `spec/stack/React.pi`:

```piton
from ./Stack import Stack

export anchor React extends Stack:
    name: React
    language: TypeScript
    build: Vite
    entryPoint: src/main.tsx

    conventions:
        - Function components only, never classes.
        - One component per file, named after the file.
```

Strings are unquoted, so `name: React` is the string "React". The `conventions`
list is a plain Markdown-style list, and because `Stack` constrained it to
`string[]`, a stray number in there would be a compile error.

## The application

Here is the actual specification. `spec/shape/App.pi`:

```piton
use @piton/belay

from /stack/React import React Stack

export instruction App:
    description: A Hello World application.

    prompt:
        Build a single screen that displays the text Hello, World! and nothing
        else.

    stack:
        Build it with ${Stack.name} on ${Stack.language}. The full stack
        definition is at @{Stack}.
```

Three things here are worth slowing down for.

**`use` versus `from ... import`.** They are not interchangeable. `use` brings
keywords into scope and nothing else, which is how `instruction` becomes
available. `from ... import` brings symbols and no keywords. A file that needs
both writes both.

**The import alias.** `from /stack/React import React Stack` imports the anchor
`React` under the name `Stack`. The leading `/` is an absolute path relative to
the project `root`, so it means `spec/stack/React.pi`. Aliasing it means the
rest of the file never says "React" — it says "Stack" — which is what reduces
the swap at the end to one line. The name `React` is not in scope afterwards;
only `Stack` is.

**Two sigils.** `${Stack.name}` interpolates a value into the prose. `@{Stack}`
is Belay's reference sigil, and it does something different: rather than
inlining the anchor, it tells the agent to go read the compiled file for it.
Belay writes that file out and points at it.

`description` and `prompt` are required — they are the shape of Belay's
`Instruction` abstract. `stack` is not; it is a property you added, and it gets
serialized along with everything else.

## The entry point

The compiler starts at one file. `spec/index.pi`:

```piton
from ./shape/App export App
```

That is the concise form of importing `App` and immediately re-exporting it.
One line, and `App` is now reachable.

## Compile it

```sh
piton build
```

```
.claude/reference/shape/App.md
src/AGENTS.md
src/CLAUDE.md
.claude/reference/stack/React.md
wrote 4 files
```

`src/CLAUDE.md` is a single line, `@AGENTS.md`, which imports the file beside
it. `src/AGENTS.md` is your specification, serialized:

```markdown
# App

A Hello World application.

Build a single screen that displays the text Hello, World! and nothing else.

## Stack

Build it with React on TypeScript. The full stack definition is at @../.claude/reference/stack/React.md.
```

The property name `stack` became the heading `## Stack` — Belay serializes
anchor properties as headers by depth, and splits names into words, so
`myProperty` would have become `My Property`.

And `@{Stack}` became a path. The `React` anchor was reached, so Belay wrote it
out to `.claude/reference/stack/React.md` — mirroring its source directory —
and rewrote the reference to point there:

```markdown
# React

## Name

React

## Language

TypeScript

## Build

Vite

## Entry Point

src/main.tsx

## Conventions

- Function components only, never classes.
- One component per file, named after the file.
```

That file is written once and referenced from anywhere. The reference is
resolved per output location, so the copy of `App.md` under
`.claude/reference/shape/` points at `@../stack/React.md` instead — same
target, correct relative path.

## Switch the stack

Now the part that matters. Describe egui the same way you described React.
`spec/stack/Egui.pi`:

```piton
from ./Stack import Stack

export anchor Egui extends Stack:
    name: egui
    language: Rust
    build: Cargo
    entryPoint: src/main.rs

    conventions:
        - One `eframe::App` implementation, kept in the entry point.
        - Lay the UI out immediately in `update`; hold no widget objects.
```

Then change one line in `spec/shape/App.pi`:

```piton
from /stack/Egui import Egui Stack
```

That is the entire edit. `description`, `prompt`, and `stack` are untouched —
the application is still a single screen that says Hello, World, because that
was never a fact about React.

```sh
piton build
```

```markdown
# App

A Hello World application.

Build a single screen that displays the text Hello, World! and nothing else.

## Stack

Build it with egui on Rust. The full stack definition is at @../.claude/reference/stack/Egui.md.
```

Because both stacks implement `Stack`, the swap is checked rather than hoped
for. Delete `entryPoint` from `Egui.pi` and run `piton check spec`:

```
error[unimplemented]: `Egui` must define `entryPoint`, required by abstract
anchor `Stack`
  --> spec/stack/Egui.pi:3:15
   | export anchor Egui extends Stack:
   |               ^^^^
```

The description cannot silently lose a property on the way across.

## What is still compiled

`React.pi` is now unreachable — nothing imports it any more. Ask the compiler:

```sh
piton reach
```

```
entry point: index.pi
reached (4)
  index.pi
    shape/App.pi
      stack/Egui.pi
        stack/Stack.pi

unreached (1)
  stack/React.pi

4 of 5 file(s) reached from the entry point
an unreached file is never compiled, so its errors are never reported
```

`React.pi` stays on disk and costs nothing. Switch the import back and it
returns to the build.

:::note
`piton build` writes files but does not remove them, so
`.claude/reference/stack/React.md` is still sitting there from the earlier
build. It is stale output, not a live reference — nothing points at it. Delete
it by hand if it bothers you.
:::

## Where to go next

The specification you wrote is one `instruction`. Belay has three more
constructs — `agent`, `skill`, and `command` — described in
[Belay Constructs](/belay/constructs/), and they compose the same way.
