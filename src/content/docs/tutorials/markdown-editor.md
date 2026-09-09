---
title: A Markdown Editor
description: Structuring a larger specification into agent, concept, lib, and shape — and writing scoped skills whose useWhen field does the routing.
sidebar:
  order: 3
---

[Hello, World](/tutorials/hello-world/) fit in five files, so it never had to
answer the question this tutorial is about: once a specification is bigger than
one screen, where does everything go?

The application is deliberately dull — a single-window Markdown editor with a
toolbar and a text area. What is worth your attention is the shape of the
`spec/` directory around it, and the four kinds of thing that live in it.

:::caution
You need the `piton` binary on your `PATH`. See
[Installation](/getting-started/), and read
[Hello, World](/tutorials/hello-world/) first — this tutorial assumes the
project config, `instruction`, and the `@{}` sigil.
:::

## What you are building

A window with a toolbar along the top — New File, Open File, Save File, then a
divider, then Cut, Copy, Paste — and a Markdown editing surface filling the
rest. As before, you will not write React or Rust, and as before the stack is
swappable in the last section.

## Four folders

| Folder     | Holds                          | Answers                             |
| ---------- | ------------------------------ | ----------------------------------- |
| `concept/` | Anchors                        | What is this, and what are its parts |
| `shape/`   | Instructions                   | How exactly is each part built       |
| `lib/`     | Anchors, abstracts, keywords   | Anything said more than once        |
| `agent/`   | Skills, agents, commands       | Who does the building, and when      |

The split that earns its keep is **concept** against **shape**.

Concept is the description you would give someone over coffee. It says the
toolbar has New, Open, and Save, then a divider, then Cut, Copy, and Paste. It
does not say how tall the toolbar is. It is the part of the specification that
survives a change of stack, a change of designer, and a rewrite.

Shape is the part that does not survive any of those. It says the row is 40px
tall with 8px of padding, that the divider is a 1px rule inset 8px, that the
disabled state is 40% opacity. Design tweaks, spacing, accessibility details —
the specifics an agent needs and a summary would lose.

Keeping them apart means you can rewrite every measurement in `shape/` without
touching a single sentence about what the application *is*, and you can hand
someone `concept/` alone and they will understand the product.

`lib/` is the ordinary reason: three parts of this application need the same
keyboard-accessibility rules, so those rules are written once.

`agent/` is where the skills live, and it is the folder that makes the whole
structure usable — covered in its own section below.

## The project

```sh
mkdir markdown-editor
cd markdown-editor
```

`piton.config.pi` is the same as the last tutorial:

```piton from=examples/markdown-editor/piton.config.pi
```

Note what `shapeRoot` singles out. Of the four folders, only `shape/` is named
in the config, because only `shape/` mirrors your source tree. `concept/`,
`lib/`, and `agent/` are ordinary directories under `root` and you can name
them whatever you like.

## lib — the pieces used more than once

Two abstracts and two kinds of reusable anchor. `spec/lib/Part.pi`:

```piton from=examples/markdown-editor/spec/lib/Part.pi
```

The `as part` registers a user-defined keyword. `part Toolbar:` will now mean
`anchor Toolbar extends Part:`, which reads better and — because a concrete
anchor may implement only one abstract — quietly enforces that a part is a
part and nothing else.

`spec/lib/Stack.pi`, unchanged from the last tutorial except for its keyword:

```piton from=examples/markdown-editor/spec/lib/Stack.pi
```

`spec/lib/React.pi`:

```piton from=examples/markdown-editor/spec/lib/React.pi
```

`use /lib/Stack` rather than `from /lib/Stack import Stack`, because keywords
and symbols travel separately: `use` brings in keywords only, `from ... import`
brings in symbols only. Here the keyword is all that is needed.

And `spec/lib/Egui.pi`, which nothing uses yet:

```piton from=examples/markdown-editor/spec/lib/Egui.pi
```

Now the piece that shows why `lib/` exists at all. `spec/lib/Keyboard.pi`:

```piton from=examples/markdown-editor/spec/lib/Keyboard.pi
```

Three shape files will reference this. It is written once, compiled once, and
referenced three times — which is the difference between a rule you can change
in one place and three paragraphs that drift apart.

## concept — what the application is

`spec/concept/Toolbar.pi`:

```piton from=examples/markdown-editor/spec/concept/Toolbar.pi
```

That is the entire toolbar concept. Which buttons, in which groups, with a
divider between. No pixels anywhere.

`spec/concept/Editor.pi`:

```piton from=examples/markdown-editor/spec/concept/Editor.pi
```

And the piece that says how the parts fit together, `spec/concept/App.pi`:

```piton from=examples/markdown-editor/spec/concept/App.pi
```

`outOfScope` is worth the two lines it costs. An agent handed a vague
specification will invent; a list of things the application deliberately is not
is the cheapest way to stop that.

## shape — how each part is built

Here is the same toolbar, from the other side. `spec/shape/toolbar/Toolbar.pi`:

```piton from=examples/markdown-editor/spec/shape/toolbar/Toolbar.pi
```

Put the two files side by side and the division is clear. Concept named the
groups and said a divider separates them; shape says the rule is 1px and inset
8px. Neither repeats the other, and the shape file does not restate the button
list — it points at the concept with `@{Toolbar}` and lets the agent read it
there.

`accessibility: @{KeyboardAccess}` is the whole property: a reference and
nothing else. That is the `lib/` payoff.

Each button gets its own file, `spec/shape/toolbar/ToolbarButton.pi`:

```piton from=examples/markdown-editor/spec/shape/toolbar/ToolbarButton.pi
```

`spec/shape/editor/MarkdownEditor.pi`:

```piton from=examples/markdown-editor/spec/shape/editor/MarkdownEditor.pi
```

And the shell, `spec/shape/AppShell.pi`, which is the one file that knows about
the stack:

```piton from=examples/markdown-editor/spec/shape/AppShell.pi
```

Nothing in `concept/` mentions React, and neither does any other shape file.
The stack enters the specification at exactly one import.

## agent — scoped skills, and useWhen

Four skills, one per part. `spec/agent/BuildToolbar.pi`:

```piton from=examples/markdown-editor/spec/agent/BuildToolbar.pi
```

`spec/agent/BuildToolbarButton.pi`:

```piton from=examples/markdown-editor/spec/agent/BuildToolbarButton.pi
```

`spec/agent/BuildMarkdownEditor.pi`:

```piton from=examples/markdown-editor/spec/agent/BuildMarkdownEditor.pi
```

`spec/agent/BuildAppShell.pi`:

```piton from=examples/markdown-editor/spec/agent/BuildAppShell.pi
```

### Why four skills and not one

One `BuildTheApplication` skill would work, and would get worse every time the
specification grew, because the agent would load the whole thing to change a
tooltip. Scoping skills to parts means the agent reads the toolbar button
specification when it is building a toolbar button, and nothing else.

Scope them the way you would scope a source file. A part that has its own
directory in the finished application probably deserves its own skill.

### Why useWhen carries the weight

`useWhen` is not documentation. Look at what Belay does with it — this is the
compiled `.claude/skills/build-toolbar/SKILL.md`:

```markdown
---
name: build-toolbar
description: Builds the toolbar row, its two action groups, and the divider. Use when the toolbar, the file actions, the clipboard actions, or the divider between them is being created or changed
---

Build the toolbar to @../../reference/shape/toolbar/ToolbarShape.md, with the actions listed in @../../reference/concept/Toolbar.md. Build the buttons with the toolbar button skill.
```

`description` and `useWhen` are concatenated into the one `description` field
the agent actually scans when deciding which skill applies. `description` says
what the skill does; `useWhen` says what has to be true for it to be the right
one.

This is what lets **"build the application"** work as a prompt. The agent has
no idea what your application is, but it can read four descriptions, see that
one of them matches shell and layout, start there, and follow the references
from `@{AppShell}` into the concept, the stack, and the other three skills.

So write `useWhen` in the user's vocabulary, not yours. Name the things a
person would say — "the toolbar", "the file actions", "a button icon",
"tooltip" — because those are the words that will be in the request. A
`useWhen` reading "when building the toolbar" matches almost nothing; the one
above matches a request to move the divider.

:::note
`piton format` will not fix a bad `useWhen` and the compiler will not warn you
about one. It is the one field in this tutorial whose quality is entirely on
you.
:::

### A command for the whole job

Skills are chosen by the agent. A `command` is chosen by you — it compiles to
a slash command, and it is the right place for the one instruction that spans
every part.

"build it" is a fine prompt, and for the last tutorial it was the only one
needed. Here there are four parts with an order between them, a list of things
the application deliberately is not, and a shape whose measurements are easy to
round off. A command is where that goes. `spec/agent/Build.pi`:

```piton from=examples/markdown-editor/spec/agent/Build.pi
```

Note what the command does *not* contain: any detail about the toolbar, the
button, or the editor. Those are in the skills, and the skills are in the
shape. The command carries only what no single skill can know — the order, and
the standing rules about scope and invention.

`order` is a plain `string[]`, and it names skills rather than describing work.
`rules` is the part worth stealing for your own specifications: an agent handed
a shape with a gap will fill it, confidently, and "do not invent a measurement,
ask" is a cheaper fix than discovering the invention later.

Add it to `spec/agent/index.pi` alongside the skills:

```piton from=examples/markdown-editor/spec/agent/index.pi
```

## One entry point

Skills import their shape files, shape files import concept and lib, and the
command imports the concept. So reaching `spec/agent/` reaches everything.

The `index.pi` you just wrote makes that directory importable as a module, so
`spec/index.pi` is one line:

```piton from=examples/markdown-editor/spec/index.pi
```

Check that it really does reach everything:

```sh
piton reach
```

```
entry point: index.pi
reached (18)
  index.pi
    agent/index.pi
      agent/Build.pi
        concept/App.pi
          concept/Editor.pi
      agent/BuildAppShell.pi
        shape/AppShell.pi
          lib/React.pi
            lib/Stack.pi
      agent/BuildMarkdownEditor.pi
        shape/editor/MarkdownEditor.pi
          lib/Keyboard.pi
      agent/BuildToolbar.pi
        concept/Toolbar.pi
          lib/Part.pi
        shape/toolbar/Toolbar.pi
      agent/BuildToolbarButton.pi
        shape/toolbar/ToolbarButton.pi

unreached (1)
  lib/Egui.pi

18 of 19 file(s) reached from the entry point
an unreached file is never compiled, so its errors are never reported
```

That tree is the dependency graph of the specification, and it is worth
reading. Agent depends on shape and concept, shape depends on concept and lib,
and nothing points the other way. `lib/Egui.pi` is unreached because nothing
imports it yet.

Each file is listed at the first place it is reached, not everywhere it is
used. `concept/App.pi` appears under `agent/Build.pi` because the command got
there first; `shape/AppShell.pi` imports it too.

:::caution
An unreached file is never compiled, so its errors are never reported. A shape
file that no skill imports will silently produce nothing at all. `piton reach`
is how you catch that.
:::

## Compile it

```sh
piton build
```

Sixteen files:

```
.claude/skills/build-app-shell/SKILL.md
.claude/skills/build-markdown-editor/SKILL.md
.claude/skills/build-toolbar/SKILL.md
.claude/skills/build-toolbar-button/SKILL.md
.claude/commands/x-build.md
.claude/reference/shape/toolbar/ToolbarButtonShape.md
.claude/reference/shape/toolbar/ToolbarShape.md
.claude/reference/shape/editor/EditorShape.md
.claude/reference/shape/AppShell.md
src/AGENTS.md
src/CLAUDE.md
.claude/reference/concept/Toolbar.md
.claude/reference/concept/Editor.md
.claude/reference/concept/MarkdownEditor.md
.claude/reference/lib/React.md
.claude/reference/lib/KeyboardAccess.md
wrote 16 files
```

Your folder names survive into the output — `reference/concept/`,
`reference/lib/`, `reference/shape/` mirror the directories you wrote. And
`KeyboardAccess.md` appears once, referenced from three shape files.

The concept compiles to prose an agent can read directly:

```markdown
# Toolbar

## Purpose

Gives the file and clipboard actions a fixed home along the top of the window.

## File Actions

- New File
- Open File
- Save File

## Clipboard Actions

- Cut
- Copy
- Paste

## Divider

A single vertical divider separates the file actions from the clipboard actions.
```

Property names are split into words, so `fileActions` became `## File Actions`.
Anchor names are split too: `MarkdownEditor` becomes `# Markdown Editor`.

`KeyboardAccess` serializes differently, and the difference is instructive:

```markdown
# Keyboard Access

focusOrder: Every control is reachable with Tab, in the order it appears on screen.
focusVisible: The focused control draws a visible focus ring. It is never removed without a replacement of equal contrast.
labels: Every icon-only control carries an accessible name matching its tooltip text.
```

Headers in one, `key: value` lines in the other. `Toolbar` mixes prose, lists,
and keys, so it is an implicit list and serializes as headers. `KeyboardAccess`
is nothing but string properties — a pure dictionary — and pure dictionaries
serialize as indented pairs.

## Shape follows the code

`src/` is still empty, so all four instructions concatenated into one
`src/AGENTS.md`:

```
# Toolbar Button Shape
# Toolbar Shape
# Editor Shape
# App Shell
```

That is the documented fallback: when `shapeRoot` structure has no counterpart
in `codeRoot`, instructions concatenate up to the nearest level that does
match. Now give them somewhere to go:

```sh
mkdir -p src/toolbar src/editor
piton build
```

```
src/AGENTS.md
src/CLAUDE.md
src/editor/AGENTS.md
src/editor/CLAUDE.md
src/toolbar/AGENTS.md
src/toolbar/CLAUDE.md
```

The instructions distributed themselves. `src/toolbar/AGENTS.md` now holds both
toolbar files — files at the same level are concatenated into one output — and
`src/AGENTS.md` holds only the shell.

This is the practical reason `shape/` mirrors your source tree rather than your
concepts. As the application grows real directories, the instructions walk down
to meet them, and an agent editing a file finds the specification for that file
in the same folder.

## Switch the stack

Exactly as before. One line in `spec/shape/AppShell.pi`:

```piton
from /lib/Egui import Egui Stack
```

```sh
piton build
```

```markdown
# App Shell

The application window, its layout, and the stack it is built on.

Build the application described in @../.claude/reference/concept/MarkdownEditor.md. Build the toolbar and the editor with their own skills; this instruction owns the window and the column only.

## Stack

Build it with egui on Rust. The entry point is src/main.rs. Full stack definition: @../.claude/reference/lib/Egui.md.

## Layout

One window, one column, no chrome beyond the toolbar. The toolbar keeps its height; the editor takes the rest and scrolls on its own.

## Window

Minimum size 480 by 320. The title is the open file's name, or Untitled, followed by a bullet when there are unsaved changes.
```

Seventeen other files did not change. The toolbar still has New, Open, Save, a
divider, Cut, Copy, Paste; the divider is still a 1px rule inset 8px; the
disabled state is still 40% opacity; the keyboard rules are still the keyboard
rules.

That is the return on the four folders. `concept/` never knew the stack.
`lib/` held it behind an abstract so the replacement had to be complete.
`shape/` named it in one import. And `agent/` did not care, because a skill
describes a job, not a technology.

## Now build it

Compile once more so the output matches the stack you settled on:

```sh
piton build
```

Then start Claude Code in the project directory:

```sh
claude
```

You now have two ways to ask, and the difference between them is the point of
this tutorial.

The blunt one still works:

```
build it
```

`src/CLAUDE.md` is read automatically and imports the shape; the agent finds
the shell instruction, follows `@{MarkdownEditor}` into the concept, sees four
skills whose `useWhen` fields describe the parts, and works it out. For a
specification this size that is usually enough.

The command is the better one:

```
/x-build
```

Belay compiles every command with an `x-` prefix, so `command Build` becomes
`/x-build`. This is the same job with the order, the scope rules, the
per-part check, and the closing report attached — the things the agent would
otherwise have to infer, or not.

Use `build it` when you want to see whether the specification stands on its
own. Use `/x-build` when you want the build done properly.

:::note
The agent will write React into `src/`. Once real directories appear there,
rerun `piton build` — as the section above showed, the toolbar and editor
instructions will move down to sit beside the code they describe.
:::

## The finished project

<a href="/downloads/markdown-editor.zip" download>Download markdown-editor.zip</a>

The complete specification: four folders, four skills, one command, and both
stacks with React wired up. Unpack it, `piton build`, and you are at the end of
this page.

## Where to go next

The specification you wrote uses three of Belay's four constructs. The fourth,
`agent`, is described in [Belay Constructs](/belay/constructs/) — for work that
deserves its own context window rather than a skill inside yours.
