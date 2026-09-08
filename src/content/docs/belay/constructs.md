---
title: Belay Constructs
description: The agent, skill, command, and instruction anchors and what they compile to.
sidebar:
  order: 2
---

## Agent

Belay exports the `agent` keyword and this is used to define agents.

The shape of an agent is:

```piton
abstract anchor Agent as agent:
    description:: string
    role:: string
    prompt:: string
```

And it will output into the correct agent directory for agents in the shape of:

```markdown
---
name: { anchor name in kebab-case }
description: { description }
tools: if provided in the agent anchor, tools will list here
model: if provided in the agent anchor, the model list here
---

You are a {role}

{prompt}
{string serialized version of the agent}
```

## Skill

```piton
abstract anchor Skill as skill:
    description:: string
    prompt:: string
    useWhen:: string
```

And it will output into the correct agent directory for skills in the shape
of:

```markdown
---
name: { anchor name }
description: { description } Use when { useWhen }
---

{prompt}
{string serialized version of the skill}
```

## Command

```piton
abstract anchor Command as command:
    description:: string
    prompt:: string
```

And it will output into the correct agent directory for commands in the shape
of:

```markdown
---
description: { description }
allowed-tools: If provided, list
model: If provided, list
---

{prompt}
{string serialized version of the command}
```

All commands will be prefixed with `x-`.

## Instruction

Instructions are a special one. They look like:

```piton
abstract anchor Instruction as instruction:
    description:: string
    prompt:: string
```

The purpose of an instruction is primarily to be output into the correct
`codeRoot` directory as a `CLAUDE.md` that `@imports` an `AGENTS.md` file. In
Belay, we have a concept of a `codeRoot` directory, as well as a `shapeRoot`
directory; `shapeRoot` is an approximate mirror of the generated `codeRoot`
structure. So for example, if you have a `codeRoot` that looks like:

```
src/
  components/
    button/
    input/
```

The expectation is that your `shapeRoot` will mirror this structure:

```
spec/
  shape/
    components/
      button/
        Button.pi
      input/
        Input.pi
        InputDesign.pi
```

When compiled, the `Button.pi` file will be transformed into
`src/components/button/CLAUDE.md` while the `Input.pi` and `InputDesign.pi` files
will be transformed into `src/components/input/CLAUDE.md`. The specific note
there is that files at the same scope will be concatenated into the same output
file. Structurally this is fine because it's all just Markdown and prose.

If the `codeRoot` structure does not match the `shapeRoot` structure, the
instructions will be concatenated to the next level up that does match, ending at
a `codeRoot/AGENTS.md` and `codeRoot/CLAUDE.md` file.

In addition to this, all instructions contained under `shapeRoot` will be
compiled into the agent directory (`.claude` for example) under the
`reference/shape` directory maintaining their relative structure.

## Special `__BELAY_SHAPE__` Variable

Belay exports a special `__BELAY_SHAPE__` variable that contains the compiled
shape root directory -- what we previously referenced in an example as
`.claude/reference/shape`.

We can import that to write specific skills:

```piton
use @piton/belay

from @piton/belay import __BELAY_SHAPE__

// Incomplete and very basic example
export skill BuildSpec:
    prompt:
        Build following the structure outlined in {__BELAY_SHAPE__}.
```
