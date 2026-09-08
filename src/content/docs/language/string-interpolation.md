---
title: String Interpolation and Framework Extensibility
description: The ${} syntax, how complex types interpolate, and custom framework sigils.
sidebar:
  order: 6
---

We've mentioned string interpolation already with the `${}` syntax. There's some
nuance to discuss here, as well as some options for extensibility.

Let's look at some examples:

```piton
name: Piton
message: Hello, World from ${name}
```

In this example `message` will compile to "Hello, World from Piton".

```piton
version: 1.0
message: Piton is at version ${version}
```

`message` will compile to "Piton is at version 1.0".

In more general terms, string interpolation will replace `${}`-enclosed
expressions with their evaluated literals so long as those values are simple
types. What's a simple type? `string`, `number`, `boolean`, `null`. In Piton,
those are the only simple types. Complex types include a `list`, `dictionary`,
and `anchor`.

In the case of complex types string interpolation will be handled by a Piton
framework, which is a concept we haven't discussed yet. The short version is
that a framework is a combination of Piton modules as well as a "plugin" for the
compiler that helps compile Piton into an appropriate target.

So let's look at an example:

```piton
metadata:
  name: Piton
  version: 1.0
message: Information about Piton ${metadata}
```

If we were compiling this into JSON using the JSON framework it might look like:

```json
{
  "message": [
    "Information about Piton",
    {
      "name": "Piton",
      "version": "1.0"
    }
  ]
}
```

But if we were compiling into Markdown it might look like:

```markdown
Information about Piton [metadata](#metadata)

# metadata

name: Piton
version: 1.0
```

This may seem a touch convoluted, but the core ability to interlink structures
in a way that's meaningful to the context of the target output is part of the
entire point of Piton. That's why string interpolation for complex types is part
of the framework, not core to the language itself.

## Custom Sigils

Which now brings up an additional feature that's handled by frameworks. `${}` is
the default syntax for string interpolation, and it will always be the fallback
behaviour. However, that `$` sigil can be arbitrary; you could have `@{}` or
`reference{}` or `link-to{}`, all of which are defined and handled by the
framework. In order to maintain cross-framework compatibility, if a sigil is not
recognized, it will be treated as `${}` while throwing a compiler warning.

As an example of why this might be useful, consider a framework that defines
`reference{}` as a custom sigil for instructing an agent to go read a file.
We're jumping ahead and showing some features we haven't really talked about,
but bear with us.

```piton
// This is an externally defined Piton file that describes how to style a
// button component
from ./ButtonDesign import ButtonDesign

export anchor ButtonComponent:
    description:
        The button component should be clickable, should have hover state, etc.

    design:
        For details about the design, reference{ButtonDesign}
```

Would compile to agentic Markdown as:

```markdown
# ButtonComponent

## Description

The button component should be clickable, should have hover state, etc.

## Design

For details about the design, read `../reference/ButtonDesign.md`
```

So rather than massively duplicating text everywhere, we're able to reference the
reused bits even from the compiled output in a way that's appropriate for the
output target.
