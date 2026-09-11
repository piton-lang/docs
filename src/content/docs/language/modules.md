---
title: Import, Export, Modules, and Use
description: Composing a codebase from smaller focused files with export, from...import, use, and folders-as-modules.
sidebar:
  order: 11
---

Fundamental to Piton is the ability to compose a larger codebase from smaller
focused pieces, so we need a way to reuse code across files.

## Import/Export

To make something defined within a file available to other files, you use
the `export` keyword. For example:

```piton
export pi: 3.14
myVariable: 42
export anchor MyAnchor:
    description: This is my anchor
```

To bring those into another file you use the `from...import` syntax:

```piton
from ./FirstFile import pi, MyAnchor
```

Note that we can't import `myVariable` because it wasn't exported.

Paths for `from...import` are relative to the current file. If the project is
configured with a `piton.config.pi` file, you can also use absolute path imports
relative to the `root` value defined in the project config.

```piton
from /subdir/subdir/file import AnAnchor
```

It's also possible to import under an alias by placing the alias after the
imported symbol:

```piton
from ./FirstFile import pi SliceOf, MyAnchor MyAliasedAnchor
```

Worth clarifying that `pi` will be imported as and only as `SliceOf` (i.e. `pi`
will not be available in scope).

### Circular Imports

Circular imports are supported and will not throw a compiler error. Circular
references are fine as well as long as it does not create something impossible
to resolve.

For example:

```piton
anchor A:
    This anchor talks about ${B}

anchor B:
    This anchor talks about ${A}
```

Is perfectly fine because `${A}` and `${B}` both settle to a string.

However

```piton
A: {B}
B: {A}
```

Is a compile error because it simply cannot resolve.

## Use

When you want to use a user-defined keyword, you'll need to apply the `use`
keyword. It brings into scope of the current file any exported user-defined
keywords.

```piton
use ./CustomKeywords

my-custom-keyword Wow:
    description: amazing
```

`use` only brings in keywords. It does not import anything else that was
exported, just as `from...import` does not import keywords.

## Modules

In a complex project, it's likely that you'll end up with hundreds of files that
all work together, often grouped by domain or structured for reusability. Every
complex layer of a codebase should be as self-contained as possible, requiring
minimal inputs and outputs, and that even extends to imports.

Consider a situation where you're importing twenty anchors from one directory.
That's a lot of boilerplate, and it's something likely to be repeated every time
you want to import that functionality.

To solve for this annoyance Piton supports folders-as-modules with an `index.pi`
file. When an `index.pi` file is present in a directory, you can now import
anything exported from that file simply by pointing to the directory.

```
myCurrentFile.pi

path/
  to/
    directory/
      index.pi
```

And in `myCurrentFile.pi` you could have:

```piton
from ./path/to/directory import MyAnchor
```

There are several ways to build an `index.pi` file.

```piton
from ./MyAnchor import MyAnchor
export MyAnchor
```

That functions, but it's a bit verbose. There is a modification of the
`from...import` syntax that allows you to be a bit more concise:

```piton
from ./MyAnchor export MyAnchor
```

And a slight modification of that that's even more concise:

```piton
from ./MyAnchor export *
```

`from...export` also supports renaming exports:

```piton
from ./MyAnchor export MyAnchor MyAliasedAnchor, MyOtherAnchor MyOtherAliasedAnchor
```

## Linebreaks on Imports/Exports

Linebreaks are allowed on imports/exports:

```piton
from ./file import
    FirstThing,
    SecondThing,
    ThirdThing
```

`piton format` will automatically add linebreaks to imports/exports if there are
more than 2 items or if the line exceeds 80 columns, and it will sort the
imports.
