---
title: Specifying an Existing Codebase
description: Two ways to get a specification out of code you already have — put the guidelines in the prompt, or build them into the project first and let fluency work inside them.
sidebar:
  order: 4
---

The first two tutorials go one way: write a specification, compile it, let an
agent build from it. Most code was not written that way. This one goes the
other direction — you have a codebase, and you want the description that
should have come first.

There are two ways in, and they differ in one thing: **where the guidelines
live.**

**Put them in the prompt.** Give the agent the language, point it at the
codebase, and tell it in the same breath what a good specification looks like.
Nothing to set up, and you have a draft in an afternoon.

**Put them in the project.** Spend an hour first building the basis of a
specification — the folders, a seed file for each kind of thing, and a skill
that says where each kind goes — then let fluency work inside it. Slower to
start, and the guidelines are still there tomorrow.

Both end with a specification. The second is not a later stage of the first;
they are different opening moves, and which one is right depends on how long
the job is and how many people are on it.

:::caution
You need the `piton` binary on your `PATH` (see
[Installation](/getting-started/)), and Claude Code on your `PATH` too. Both
approaches use the four-folder structure from
[A Markdown Editor](/tutorials/markdown-editor/).
:::

## Both ways need fluency

Claude does not know Piton. It is a small language with unusual rules — `+` on
lists deduplicates, `this` and `self` differ, a bare value is a string while
`{a + b}` is an expression — and an agent guessing at those writes something
plausible that does not compile.

`piton claude` attaches the language to the session:

```sh
piton claude
```

That runs `claude --append-system-prompt <brief>`, passing your arguments
through. The brief is generated from the compiler, so it describes the
language the binary on your `PATH` actually implements rather than
documentation someone forgot to update. Read it with
`piton claude --print-prompt`; it is about 140 lines of syntax, types,
framework constructs, and the rules that are easy to get wrong:

```markdown from=generated/piton-brief/.claude/skills/piton/SKILL.md section="## Rules worth memorising"
```

A system prompt lasts one session. If this job will not, install the fluency
into the project instead:

```sh
piton claude --install
```

```
.claude/skills/piton/SKILL.md
```

Same brief, written as a Claude Code skill in the repository rather than in
your shell history:

```markdown from=generated/piton-brief/.claude/skills/piton/SKILL.md section=frontmatter
```

That `description` is the same trick the Markdown Editor tutorial spends a
section on — it names the extensions, the config filename, and every keyword,
because those are the words that will be on screen when the fluency is needed.
Commit it and every session in the repository can write Piton, including your
colleagues'. Use plain `claude` from then on.

:::note
If `claude` is not on your `PATH`, `piton claude` says so and points you at
`--print-prompt`. The brief is just text; pasting it into any agent works, and
nothing here depends on Claude Code specifically.
:::

## Approach one: guidelines in the prompt

### The setup

A project config, and nothing else:

```piton from=examples/spec-intake/piton.config.pi
```

The entry point exists but is empty:

```piton from=examples/spec-intake/spec/index.pi
```

```sh
piton build
```

```
wrote 0 files
```

Which is correct — nothing is described yet.

### The prompt

Everything you would have built into the project goes here instead:

```
Read src/ and write a Piton specification for it under spec/, using Belay.

Structure it in four folders:

- concept/  what the application is and what its parts are, in the words a
            person would use out loud. Stack-agnostic: no file names, no
            framework names, no measurements.
- shape/    how each part is built — states, error handling, edge cases. One
            file per part, in a directory mirroring src/. Point at the concept
            with @{} rather than restating it.
- lib/      anything said more than once, including the stack. Reference it
            with @{} instead of repeating it.
- agent/    one skill per part, scoped the way a source directory is scoped,
            with useWhen written in the words a person would use when asking
            for that part.

Rules:

- Describe what the code does, not how it is written. A specification that
  lists functions is a summary, not a description.
- Where the code does something for no discernible reason, say so and ask,
  rather than writing the accident into the spec.
- Export everything from spec/index.pi so it is reachable.
- Run `piton check spec` as you go, and `piton reach` before you stop.
```

Two clauses in there are load-bearing and easy to leave out. **Export
everything from `spec/index.pi`**, because only what is reachable from the
entry point is compiled — an agent that writes twenty files and exports six
leaves you wondering why fourteen of them do nothing. **Run `piton check spec`
as you go**, because it is the difference between an agent that notices its
mistakes and one that hands you a pile of files that have never been parsed.

### What this gets you

A specification, in an afternoon, with no setup. For a codebase one person is
describing once, that is the whole job and you should stop reading here.

Where it runs out is repetition. The guidelines are in your scrollback, so the
next session does not have them, and neither does your colleague. You will
find yourself pasting that prompt again, editing it slightly each time, and
the specification will drift in the direction of whichever version you happened
to paste. Nothing catches that, because every individual file compiles.

## Approach two: guidelines in the project

Same guidelines. Instead of a prompt, they are files — which means they are
reviewed, corrected once, and loaded automatically.

### The setup

The config now also declares `shapeRoot`:

```piton from=examples/spec-skeleton/piton.config.pi
```

`shapeRoot` mirrors `codeRoot` directory for directory, and this is where an
existing codebase is easier than a new one. In the Markdown Editor tutorial
`src/` started empty, so every instruction piled into one `AGENTS.md` until
real directories appeared. Here the directories already exist — so a shape
file at `spec/shape/checkout/` compiles into `src/checkout/AGENTS.md`, next to
the code it describes, from the first build.

Then a seed file for each kind of thing. Not to be kept — to be replaced. They
exist so the project compiles from the first minute, and so the agent has a
worked example of each kind of file rather than a description of one.

`spec/concept/App.pi`, deliberately bare, because its content is entirely
yours:

```piton from=examples/spec-skeleton/spec/concept/App.pi
```

The stack in `lib/`, behind an abstract, so nothing else in the specification
has to name it:

```piton from=examples/spec-skeleton/spec/lib/Stack.pi
```

```piton from=examples/spec-skeleton/spec/lib/CurrentStack.pi
```

And one shape instruction tying the three together — concept for what, lib for
the stack, shape for the rest:

```piton from=examples/spec-skeleton/spec/shape/AppShell.pi
```

### The guidelines, as a skill

Here is the difference between the two approaches, in one file. Everything
that was prose in the approach-one prompt is a property of a skill whose job
is writing more of this specification:

```piton from=examples/spec-skeleton/spec/agent/WriteSpec.pi
```

```piton from=examples/spec-skeleton/spec/agent/index.pi
```

```piton from=examples/spec-skeleton/spec/index.pi
```

It compiles to `.claude/skills/write-spec/SKILL.md`, and its `useWhen` is
written so the agent reaches for it exactly when the question comes up:

```markdown from=generated/spec-skeleton/.claude/skills/write-spec/SKILL.md
```

### The prompt

Which leaves this:

```
Describe src/checkout/ following the write-spec skill.
```

That is the return on the setup. The conventions are not in the prompt because
they are in the repository; the agent loads them when the work matches, every
session, for everyone. Correcting a guideline means editing `WriteSpec.pi` and
committing it, and the correction applies to work that has not happened yet.

Work one part at a time regardless. An agent asked to describe everything at
once produces something uniformly shallow, and you will not notice which
decisions it got wrong.

```sh
piton reach
```

```
entry point: index.pi
reached (7)
  index.pi
    agent/index.pi
      agent/WriteSpec.pi
    shape/AppShell.pi
      concept/App.pi
      lib/CurrentStack.pi
        lib/Stack.pi
unreached (0)

7 of 7 file(s) reached from the entry point
```

## Which one

Approach one when the codebase is small, you are the only one describing it,
and you want to know by this evening whether the exercise is worth doing at
all. It is also the honest way to find out what your guidelines should be —
you will discover the fourth and fifth ones by watching the first draft get
them wrong.

Approach two when the specification will outlive the session: more than one
person, more than a few days, or a codebase big enough that you will describe
it in pieces over weeks. The setup is an hour and it buys you consistency you
cannot get by pasting.

You can start with the first and move to the second — the draft is material,
and reorganising it into the four folders is exactly the kind of work an agent
is good at. What you cannot do is get approach two's consistency out of
approach one by being disciplined about your prompts. That is the trade.

## What both get wrong

An agent asked to specify a codebase writes a **summary** of it. You get a
faithful account of the modules, their exports, and what each function does.
It is worthless, because rebuilding from it would reproduce every accident in
the current implementation, including the ones you were hoping to lose.

The distinction to hold on to: **a specification is what you would have
written first, not what you would write about what exists.**

The test is whether a sentence survives changing the stack. "The retry helper
in `net/retry.ts` wraps fetch with exponential backoff" does not; "a failed
request is retried twice before the user is told" does. The first describes
your code, the second describes your product.

This is why both the prompt and the skill carry the same two rules: do not
transcribe the implementation, and where the code does something for no
discernible reason, say so and ask rather than writing the accident down as a
requirement. The answer is often "I cannot tell", which is a useful thing to
learn about your own codebase.

## Let the compiler check the work

An agent writing prose about your codebase can say anything. An agent writing
Piton cannot, and that is the practical reason to describe a codebase in a
language with a compiler rather than in a folder of Markdown.

`piton check spec` turns a concept anchor that forgot a property required by
its abstract, or a reference to an anchor that does not exist, into an error
with a line number.

`piton reach` catches the quieter failure. A shape file no skill imports is
unreachable, so it is never compiled and its mistakes are never reported. When
an agent has been writing files for an hour, `unreached` is the first thing to
look at.

`piton build check` builds without writing. Worth running before you commit
and worth putting in CI — a specification that stops compiling is as broken as
code that stops compiling, and it fails silently otherwise.

## The test that matters

The specification is good when someone can build the application from it. So
try it: `piton build`, then in a scratch directory with only the compiled
instructions, ask an agent to build the application, and compare.

You are not looking for a character-for-character match. You will never get
one, and a specification detailed enough to produce one would be the source
code with extra steps. You are looking for the differences that surprise you.
Each one is either something the specification failed to say, or something in
your codebase that nothing required.

Both are worth knowing. The second is the one that pays for the exercise.

## The two starting points

<a href="/downloads/spec-intake.zip" download>Download spec-intake.zip</a> —
approach one: the config and an empty entry point, and nothing else.

<a href="/downloads/spec-skeleton.zip" download>Download spec-skeleton.zip</a>
— approach two: `shapeRoot`, the four folders with a seed file each, and the
`write-spec` skill.

Copy either into your project, point `codeRoot` at your source, and run
`piton claude --install`.

## Where to go next

If you have not built anything from a specification yet, the other direction
is worth doing first — [Hello, World](/tutorials/hello-world/) takes about ten
minutes, and [A Markdown Editor](/tutorials/markdown-editor/) covers the
four-folder structure both approaches here assume.
