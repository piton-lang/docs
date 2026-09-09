---
name: piton
description: Write, read, and compile Piton (.pi) source. Use when working with .pi files, piton.config.pi, anchors, or Piton frameworks. Also use for the `agent`, `belay-adapter`, `belay-agent-adapter`, `belay-config`, `command`, `instruction`, `skill` keywords.
---

# Piton fluency

Piton is a declarative, whitespace-structured language for describing agentic
skills, agents, commands, and reference documents. It has no runtime: it
compiles to data (JSON, YAML) or, through a framework, to Markdown. Source
files use the `.pi` extension.

## Syntax

```piton
// A comment. Comments are line-only.
myVariable: 42                       // a number
myString: Strings are unquoted       // a string
myQuoted: "false"                    // quoting forces a string
myTyped:: string:: number: 42        // constraints, first match wins

myList:
    - one
    - two
myInlineList: [one, two, three]

myDictionary:
    nested:
        deep: value

computed: {1 + 2}                    // `{ }` evaluates; bare text does not
interpolated: Hello, ${myString}

anchor Base:
    name: Base
    summary: This is ${this.name}  // `this` pins to Base

anchor Child extends Base:
    name: Child
    detail: This is ${self.name}   // `self` follows the child
    summary: ${super.summary} and more

abstract anchor Shape as shape:      // `as` registers a keyword
    description:: string

shape Concrete:                      // same as `extends Shape`
    description: Implemented

from ./other import Thing, Other Alias
from ./other export *
use ./keywords
export anchor Published:
    value: 1
```

## Reserved words

`anchor`, `abstract`, `extends`, `as`, `export`, `from`, `import`, `use`, `this`, `self`, `super`, `true`, `false`, `null`

## Types

`string`, `number`, `boolean`, `null`, `list`, `dictionary`, `anchor`, `any`, `simple`, `complex`

Literals: `true`, `false`, `null`

## Rules worth memorising

- A value is an expression only when the *whole* value parses as one over
  literal atoms. `1 + 2` is `3`; `a + b` is the string `a + b`; use `{a + b}`
  to reference names.
- `+` on lists concatenates and deduplicates, right operand winning:
  `[1,2,3,4] + [1,2,3]` is `[4,1,2,3]`. `++` keeps duplicates.
- `+` merges dictionaries shallowly; `++` merges them deeply.
- Mixing unrelated types with `+` produces a mixed list, not an error.
- A block that mixes prose, `- ` items, and `key:` pairs becomes an implicit
  list; the keys written directly in it stay addressable.
- Inheritance is left to right with the right-most base winning; a child always
  wins over its bases; a declaring keyword is the left-most base.
- A concrete anchor may implement at most one abstract anchor, and must supply
  every abstract property left without a value.
- Strings never coerce to `boolean` or `number`; simple values do coerce to
  `string`.
- Modulo uses floor semantics; division by zero and comparing mismatched types
  are compile errors.
- Indentation must be consistent within a file; the canonical style is four
  spaces.

## Frameworks

### `@piton/belay` (framework `belay`)

`use @piton/belay` for its keywords, `from @piton/belay import ...` for its anchors.

Interpolation sigils: `@{}`

- **Agent** (abstract anchor) — keyword `agent`
  - `description:: string`
  - `role:: string`
  - `prompt:: string`
- **Skill** (abstract anchor) — keyword `skill`
  - `description:: string`
  - `prompt:: string`
  - `useWhen:: string`
- **Command** (abstract anchor) — keyword `command`
  - `description:: string`
  - `prompt:: string`
- **Instruction** (abstract anchor) — keyword `instruction`
  - `description:: string`
  - `prompt:: string`
- **BelayConfig** (abstract anchor) — keyword `belay-config`
  - `codeRoot:: string`
- **Adapter** (abstract anchor) — keyword `belay-adapter`
  - `description:: string`
- **AgentAdapter** (abstract anchor) — keyword `belay-agent-adapter`
  - `description:: string`
- **ClaudeAdapter** (anchor)
  - `description`
  - `claude`
- **OpenCodeAdapter** (anchor)
  - `description`
  - `opencode`
- **__BELAY_SHAPE__** (variable)

## Working with a Piton project

- `piton check <glob>` reports errors without writing anything.
- `piton compile <glob>` writes JSON or YAML next to each input.
- `piton build` builds the project described by `piton.config.pi`.
- `piton build check` builds and reports without writing.
- `piton format <glob>` applies the canonical style: four spaces, one space
  after `//`, sorted and wrapped import lists.
- `piton lsp` runs the language server.

## Writing Piton well

- Prefer an abstract anchor exported `as` a keyword for anything that will be
  implemented repeatedly; it documents intent and prevents a concrete anchor
  from implementing two abstracts.
- Reach for `+ {super.x}` rather than repeating a base's list.
- Use `this` when a base wants its own value and `self` when it wants the
  most-derived one.
- Keep prose as prose. Only reach for `{ }` when a value genuinely needs to be
  computed or referenced.
