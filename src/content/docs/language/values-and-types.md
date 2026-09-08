---
title: Values and Types
description: Numbers, strings, booleans, null, collections, and how Piton infers types.
sidebar:
  order: 2
---

Piton is loosely typed with optional type constraints.

All the usual suspects are present:

- `string` - A unicode string
- `number` - All-encompassing numeric type; int or float.
- `boolean` - `true` or `false`
- `null` - The absence of a value
- `list` - A list of values. Value types can be mixed as long as it's not
  constrained by a type annotation.
- `dictionary` - A dictionary of key-value pairs. Key types must be strings, and
  value types can be mixed as long as it's not constrained by a type annotation.
- `anchor` - The core structural building block of Piton. Don't worry, there's a
  whole section on this.

## Numbers

Numbers are written as literal numbers. Leading 0 is mandatory for decimals, and
you can use underscores to separate large numbers for readability.

```piton
myInt: 123
myFloat: 3.14
mySmallFloat: 0.14
myBigNumber: 1_200_000.00
```

There is a single number type in all of Piton; type-wise there's no difference
between an int, a float, double, etc.

## Strings

Strings are not quoted. They can appear on the same line as what they're
assigned to, or indented on the next line:

```piton
sameLine: Hello, World!
nextLine:
    Hello, World!
```

The leading whitespace on a string block is discarded, as that's part of the
syntax of the language, not the string. In other words, the string in both
examples is "Hello, World!".

Within a string block, you can add line breaks without affecting the structure
of the string. To create an explicit line break, you must include a blank line.

```piton
myString:
    This broken string is not considered
    a line break.

    While this *is* on a new line because there was a blank line above.
```

When compiled, we'll get two lines:

```
This broken string is not considered a line break.
While this *is* on a new line because there was a blank line above.
```

### Escaping

There are two ways to escape strings, both of which are slightly different. The
first is the common backslash `\` character. For example, if you wanted a string
that starts with `//` and don't want it to be treated as a comment, you can
escape the `//` with `\//`.

The second way to escape strings is with quotes. So for example, you can also
escape a comment and treat it as a string with `"// This is a comment"`. The
quote escape only acts as an escape mechanism if it's applied to the entire
string, or if it's actually escaping something. So in the following example:

```piton
stringA: "This is a string"
stringB: "// This looks like a comment but is a string"
stringC: "false"
```

`stringA` becomes a string value of, dropping the quotes, `This is a string`.
There's no inherent value in doing this, but it demonstrates behaviour.

`stringB` becomes a string value of `// This looks like a comment but is a
string`.

`stringC` becomes a string value of `false`.

You can also escape quotes with `\"`, however that should rarely be necessary.
Note, you can escape literal values like `false` with `\` as in `\false` in
which case it's treated as a string. Personally, I find that far less ergonomic
than `"false"`.

## Booleans

Booleans are represented with lowercase `true` and `false`.

## Null

Null is represented with lowercase `null`. Null is a value that means "nothing."
So yes, `null == null`. Piton doesn't have the concept of `undefined` or any
other "nothing" value.

## Collections

Piton has two core collection types: lists and dictionaries -- or arrays and
objects depending on what language you're coming from.

### Lists

Lists can be defined two ways:

```piton
markdownStyle:
    - One
    - List
    - Item
    - Per
    - Line

inlineStyle: [This, is, a, list, of, strings]
```

It's possible to do nested lists:

```piton
nestedMarkdownList:
    - Level 1
        - Level 2
            - Level 3
```

Which is equivalent to:

```piton
inlineMultiList: [Level 1, [Level 2, [Level 3]]]
```

Piton intentionally does not provide a way to access items within a list.
Because this is not a runtime-based general purpose language but rather a
language designed for description, a list is a construct intended for merging
via inheritance; `myList[0]` is not very descriptive, is it?

### Dictionaries

Dictionaries are nested keys and values, and there is only a single way to
define them:

```piton
firstLevel:
    secondLevel:
        thirdLevel: This is a string
```

You can use dot syntax to access keys in a dictionary.
`firstLevel.secondLevel.thirdLevel` would yield "This is a string".

Object keys can include hyphens and underscores as well as valid Unicode letter
characters and Unicode numeric characters. They cannot include spaces.

### Combining Collection Types

You _can_ combine lists and dictionaries (and other types for that matter):

```piton
combined:
    This is a string

    - This
    - Is
    - A
    - List

    nestedDictionary:
        deeplyNestedDictionary: This is a string
```

And this scenario is where Piton takes a little liberty in syntax strictness for
the sake of human writability and readability. Because we're mixing types, what
happens here is that `combined` becomes an implicit list that has a `string`,
a `list`, and a `dictionary` inside of it. As JSON that would be:

```json
{
  "combined": [
    "This is a string",
    ["This", "Is", "A", "List"],
    {
      "nestedDictionary": {
        "deeplyNestedDictionary": "This is a string"
      }
    }
  ]
}
```

We're sacrificing the otherwise simple rules of syntax here only because this is
an inherently intuitive form for a human. We'll let the compiler do a bit of
heavy lifting to make the human's job nicer.

One additional gotcha with Piton is that, with an implicit list, dictionary
properties declared directly within the mixed block remain addressable; we're
still able to directly reference
`combined.nestedDictionary.deeplyNestedDictionary` and get back "This is a
string". As I said previously, Piton does not allow for list accessors, so
trying to access either the string or the list is not possible.

Similarly:

```piton
combined:
  - dictionaryInsideAList:
      nested: value
```

Since the `dictionaryInsideAList` is inside an explicit list, you cannot
access that dictionary anymore. I'm just pointing this out because it is
syntactically possible, though arguably not a very wise choice in structuring
your data.

## User-Defined Types

There is exactly one user-defined type, and it's called an `anchor`. This is
something that can be shaped by other types via properties and promotes
inheritance. However, it's a larger and more advanced topic than belongs in this
introductory part of the guide, so instead we've devoted an entire section to it
later on.

## Type Inference

Unless specifically constrained to a type, a variable or property can hold any
type. The type is inferred from the value.

| Expression            | Inferred As                                                                        |
| --------------------- | ---------------------------------------------------------------------------------- |
| `true`                | `boolean`                                                                          |
| `true story`          | `string`                                                                           |
| `42`                  | `number`                                                                           |
| `42 things`           | `string`                                                                           |
| `A + B`               | If A and B are the same type, inferred is also that type. Otherwise it's a string. |
| `This costs $5 + tax` | `string`                                                                           |
| `null`                | `null`                                                                             |
| `\// Just Text`       | `string`                                                                           |
| `"// Also Just Text"` | `string`                                                                           |
| `${}`                 | `string`                                                                           |
