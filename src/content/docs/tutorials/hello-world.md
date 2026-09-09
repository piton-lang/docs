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

```piton from=examples/hello-piton/piton.config.pi
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

```piton from=examples/hello-piton/spec/stack/Stack.pi
```

The `::` is a type constraint, and `string[]` is a list of strings. None of
these properties have values — the `:` and a value are simply absent — so any
anchor implementing `Stack` is obliged to supply all five.

That obligation is the whole reason to write this file. It is what makes the
stack swap at the end safe rather than hopeful.

## A concrete stack

Now implement it. `spec/stack/React.pi`:

```piton from=examples/hello-piton/spec/stack/React.pi
```

Strings are unquoted, so `name: React` is the string "React". The `conventions`
list is a plain Markdown-style list, and because `Stack` constrained it to
`string[]`, a stray number in there would be a compile error.

## The application

Here is the actual specification. `spec/shape/App.pi`:

```piton from=examples/hello-piton/spec/shape/App.pi
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

```piton from=examples/hello-piton/spec/index.pi
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

```markdown from=generated/hello-piton/react/src/AGENTS.md
```

The property name `stack` became the heading `## Stack` — Belay serializes
anchor properties as headers by depth, and splits names into words, so
`myProperty` would have become `My Property`.

The last line is Belay's rather than yours. It is appended to any instruction
that came out holding a link, so that an agent reading the file knows the links
are worth following.

And `@{Stack}` became a Markdown link. The `React` anchor was reached, so Belay
wrote it out to `.claude/reference/stack/React.md` — mirroring its source
directory — and rewrote the reference to point there:

```markdown from=generated/hello-piton/react/.claude/reference/stack/React.md
```

That file is written once and referenced from anywhere. The reference is
resolved per output location, so the copy of `App.md` under
`.claude/reference/shape/` points at `../stack/React.md` instead — same target,
correct relative path.

## Switch the stack

Now the part that matters. Describe egui the same way you described React.
`spec/stack/Egui.pi`:

```piton from=examples/hello-piton/spec/stack/Egui.pi
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

```markdown from=generated/hello-piton/egui/src/AGENTS.md
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

## Now build it

Everything so far has produced instructions, not an application. Compile once
more so the output matches whichever stack you settled on:

```sh
piton build
```

Then start Claude Code in the project directory:

```sh
claude
```

And ask for the thing:

```
build it
```

That is the entire prompt. It works because `piton build` put `CLAUDE.md` at
the top of `src/`, which Claude Code reads on its own, and that file imports
the specification you wrote. The agent does not need to be told where the spec
is or what the application does — it is already holding both.

There is also `piton claude`, which starts the same session with a briefing on
the language and Belay preloaded. Nothing here needs it — the compiled output
is ordinary Markdown, and reading it takes no special knowledge. It earns its
keep when you want the agent to *write* Piton rather than build from it.

:::note
The agent will build whatever the spec describes, which at this size is a
single screen saying Hello, World. The interesting part is that swapping the
import in the last section and rerunning these two commands gets you the same
application in Rust, from the same description.
:::

## The finished project

<a href="/downloads/hello-piton.zip" download>Download hello-piton.zip</a>

The complete specification — both stacks, with React wired up so you can do the
swap yourself. Unpack it, `piton build`, and you are at the end of this page.

## Where to go next

[A Markdown Editor](/tutorials/markdown-editor/) takes the same approach to a
specification too big for five files, and covers how to organise one.

The specification you wrote is one `instruction`. Belay has three more
constructs — `agent`, `skill`, and `command` — described in
[Belay Constructs](/belay/constructs/), and they compose the same way.
