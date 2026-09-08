---
title: Overview
description: Source files, whitespace, comments, and keywords — the ground rules of Piton.
sidebar:
  order: 1
---

The Piton language, while primarily intended for writing Agentic constructs, is
also at its core a declarative language for defining data. So before we get into
discussing the agentic stuff, let's take a look at the language itself through
the lens of just data.

There's one thing to make very clear upfront: There is no runtime for Piton.
Piton compiles to data -- JSON, YAML, Markdown, etc. -- via adapters. While that
ultimately simplifies the mental model, it's important to keep this in mind as
you're learning how to use the language.

## Source Files and Modules

Piton files carry the `.pi` extension.

Like Python, Node, and others, directories become modules with an `index.pi`
file that `export`s symbols `import`ed from other files. That means that when
doing an `import` you can point at the directory rather than at a specific file.

## Whitespace and Structure

The language is a whitespace-based language. Like Python, you can use tabs or an
arbitrary number of spaces for indentation. However, you must be consistent
throughout the file. And while it's not mandatory, like Python's PEP8, Piton
prefers 4 spaces per indent level, not tabs. That's what `piton format` will
apply to your code, and it's not configurable.

## Comments

Comments are line-only. There are no block comments. Comments are created
with `//`.

```piton
// This is a comment
myVariable: 42 // This is also a comment
```

`piton format` will always put a space between the `//` and the comment text, so
you might as well get used to doing it yourself.

## Keywords

Keywords are reserved words that have special meaning in Piton. `string`,
`false`, `anchor`, `export`, etc. are all examples. A unique aspect of Piton is
that you can define your own keywords that act as a sort of syntactic sugar for
inheritance. But that's a topic we'll discuss later. Keywords must be all
lowercase and can be kebab-case.
