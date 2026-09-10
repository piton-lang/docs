---
title: Expressions
description: Referencing other variables with the {} expression syntax, and how references resolve.
sidebar:
  order: 5
---

A question you might currently have is what happens if a variable references
another variable. We've hinted at this in a previous example where we added `A`
and `B` but now let's be clear about it.

Easy expression using literals:

```piton
myVariable: 1 + 2
```

`myVariable` will be evaluated to `3`. Evaluation will of course follow all the
rules we've previously defined about types as operators; `2 + Hello` will
evaluate to a string `2Hello`.

Let's look at an example that uses other variables:

```piton
a: 1
b: 2
result: a + b
```

`result` will be evaluated to the `string` `a + b`. Not quite what you were
expecting, huh? In order for this to evaluate to `3` you'll need to use the
`{}` expression syntax:

```piton
result: {a + b}
```

This makes the job of the compiler much easier, and lets us avoid the
problematic situation of string fallback in case a symbol isn't recognized.

Forward references are fully resolved. Unresolved references are a compiler
error. Cyclic references are also a compiler error.

We encounter a probably intuitive but perhaps less obvious scenario when we use
complex types like `list`, `dictionary`, and the yet-to-be-discussed `anchor`.

```piton
myList: [1, 2, 3]

myDictionary:
    list: {myList}

newList: {myDictionary.list + [4, 5, 6]}
```

`newList` will evaluate to `[1, 2, 3, 4, 5, 6]`.

In this case, `{myList}` resolves to the value of `myList`, which is then
assigned to `myDictionary.list`. The `newList` expression resolves
`myDictionary.list`, combines that value with `[4, 5, 6]`, and evaluates to
`[1, 2, 3, 4, 5, 6]`.

We haven't discussed anchors yet, but they resolve by reference, and the
original identity is preserved.
