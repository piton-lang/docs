---
title: String Serialization and Output
description: How Belay serializes values into Markdown, the @{} reference sigil, anchors, and reachability.
sidebar:
  order: 3
---

Given that the output of Belay is Markdown, ultimately everything will need to
be serialized into a string during compilation.

The first part of serialization is that all anchor properties and sub properties
(dictionaries containing content) up to the allowed depth that Markdown support
will be written as corresponding markdown headers. At the point where we might
exceed the depth of headers supported by Markdown, it will be rendered simply in
bold text.

An `anchor` named `MyAnchor` might look like:

```piton
export anchor MyAnchor:
    first:
        First` Text

        second:
            Second Text

            third:
                Third Text
```

would compile to

```markdown
# My Anchor

## First

First Text

### Second

Second Text

#### Third

Third Text
```

One thing to note is that both anchor names as well as properties will be
title-cased and split into words.

Simple types serialize directly as strings. `false` becomes "false", `42`
becomes "42" etc.

Complex types take a bit more work.

Lists will be formatted as:

```markdown
- List
- of
- Items
```

And can support indentation:

```markdown
- First
  - Second
    - Third
      - Fourth
```

As we've already discussed, dictionaries containing content will be serialized
as headers. What we mean by a dictionary containing content is one where the
value is an implicit list and cannot be represented as a pure dictionary.

For example, this is an example of a pure dictionary:

```piton
first:
    second:
        third: Hello, World
```

And it will compile down into text that follows that exact shape inside a code
block:

````
```
first:
  second:
    third: Hello, World
```
````

Whereas a dictionary with an implicit list might look something like this:

```piton
first:
    This is a string inside an implicit list

    second:
        And this is a string inside of a dictionary inside of an implicit list
```

If you'll remember, an implicit list is a property that holds mixed types
without explicitly defining itself as a list.

One more example, a sort of kitchen sink:

```piton
export anchor MyAnchor:
    first:
        This is the first

        second:
            This is the second

            - List
            - of
            - items

        third:
            This is the third

            with:
                a:
                    nested: dictionary
```

However in the more complex case of an implicit list, it will be serialized as
headers matching hierarchy level, with exceeded depth of six levels simply made
to be **bold**. Property names will be split and expanded into words;
`myProperty` becomes `My Property`.

````
# My Anchor

## First

This is the first

### Second

This is the second

- List
- of
- items

#### Third

This is the third

```
with:
  a:
    nested: dictionary
```
````

As you can see in that example, nested objects inside an implicit list will be
serialized as Markdown indentation-based objects wrapped in a code block.

`${}` string interpolation will take the value of the simple type, while it will
take the compiled name of the complex type.

```piton
a: ${false}
b: ${MyAnchor}
```

becomes

```markdown
false
MyAnchor
```

Note that in this specific case, the exact name of the complex type will be used
with no modification.

## Special Reference Sigil

There's a special reference sigil for string interpolation `@{}` that will
inform the agent to go reference the compiled file of what's being referenced.
It will be rendered as a markdown link to the compiled output. We don't use
Claude's `@` import syntax because that only works with Claude And isn't a lazy
reference.

## Anchors

Any referenced anchors that are reached will be serialized according to the
serialization rules into the `<.agent>/references/` directory mirroring their
original relative directory structure.

## Reachability

Only files that are reachable from the entrypoints will be compiled.
