---
title: String Serialization and Output
description: How Belay serializes values into Markdown, the @{} reference sigil, anchors, and reachability.
sidebar:
  order: 3
---

Given that the output of Belay is Markdown, ultimately everything will need to
be serialized into a string during compilation.

Simple types serialize directly as strings. `false` becomes "false", `42`
becomes "42" etc.

Complex types take a bit more work.

Lists will be formatted as:

```
- List
- of
- Items
```

A "pure" dictionary, in that it's a nested series of key/value pairs, will be
serialized with indentation matching structure:

```
firstProperty:
  secondProperty:
    thirdProperty: value
```

Anchor properties will be serialized as headers according to their level of
depth.

However in the more complex case of an implicit list, it will be serialized as
headers matching hierarchy level, with exceeded depth of six levels simply made
to be **bold**. Property names will be split and expanded into words;
`myProperty` becomes `My Property`.

```
# First Property

## Second Property

### Third Property

String item

- List
- of
- items

and:
  even:
    nested: objects
```

As you can see in that example, nested objects inside an implicit list will be
serialized as Markdown indentation-based objects.

`${}` string interpolation will take the value of the simple type, while it will
take the compiled name of the complex type.

## Special Reference Sigil

There's a special reference sigil for string interpolation `@{}` that will
inform the agent to go reference the compiled file of what's being referenced.

## Anchors

Any referenced anchors that are reached will be serialized according to the
serialization rules into the `<.agent>/references/` directory mirroring their
original relative directory structure.

## Reachability

Only files that are reachable from the entrypoints will be compiled.
