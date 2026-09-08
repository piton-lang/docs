---
title: Variables and Type Constraints
description: Declaring variables, constraining their types, coercion rules, mutability, and scope.
sidebar:
  order: 3
---

Variables are declared simply by naming them at the top level of a Piton file.
You use `:` to assign a value to a variable.

```piton
myVariable: 42
```

## Type Constraints

You can add type constraints to variables using `::`

```piton
myVariable:: number: 42
```

:::note
Note that the whitespace after both `::` and `:` is important.
`myVariable::number:42` would cause a compiler error. Why? Because including
the space makes it more readable.
:::

It's also possible to add multiple type constraints to a variable using an
additional `::`:

```piton
myVariable:: number:: string: 42
```

This will allow `myVariable` to be either a `number` or a `string`, and the
order of preference is constraint fulfillment left to right. In the above
example, `myVariable` will be a `number` since 42 can be evaluated as a number.

However, if you flip it around:

```piton
myVariable:: string:: number: 42
```

`myVariable` will be a `string` since 42 can also be a string and string is
evaluated first and wins. One final example:

```piton
myVariable:: boolean:: number:: string: "false"
```

Since `"false"` is explicitly quoted, it fails the `boolean` constraint, and it
also fails the `number` constraint, so `myVariable` is a `string`.

## List Type Constraints

List type constraints are possible with the `[]` syntax.

```piton
myVariable:: string[]: ["foo", "bar", "baz"]
```

`myVariable` must contain a list of strings.

## Nested Type Constraints

It is possible to constrain nested keys inside a dictionary.

```piton
myVariable:: dictionary:
    a:: number: 1
    b:: string: "foo"
```

## Special Type Constraints

There are three additional type annotations that we can use when we want to deal
with slightly more fuzzy conditions. These are `any`, `simple`, and `complex`.

The `any` constraint will allow any type, simple, complex, number, string,
boolean, etc.

The `simple` type will allow any simple type, which we've previously defined,
but includes string, number, boolean, and null. It specifically avoids lists,
dictionaries, and anchors.

The `complex` type allows for any complex type, in other words, list,
dictionary, and anchor.

```piton
a:: complex: [1, 2, 3]
b:: complex:
    a:: number: 1
    b:: number: 2
c:: simple: 1
d:: simple: Hello, World
e:: simple: false
g:: any: 1
h:: any: Hello, World
i:: any:
    - String
    - NestedObject:
        a:: number: 1
        b:: number: 2
```

## Type Coercion

Type coercion in Piton is intentionally limited. When a value is constrained to
multiple types, Piton evaluates the constraints from left to right and uses the
first type the source value can validly represent.

Unquoted literals may be coerced when their syntax is compatible with the target
type. For example:

```piton
value:: string:: number: 42
```

This evaluates to the string "42" because string is the first compatible
constraint.

Quoted values are explicitly strings and are never coerced to another type:

```piton
value:: boolean:: string: "false"
```

This evaluates to the string "false", not the boolean `false`.

Likewise, values that are already structurally typed, such as lists,
dictionaries, anchors, booleans, and null, are not coerced into unrelated types.

If none of the declared constraints can accept the value it is a compiler error.

## Mutability

Given that there is no runtime for Piton, all variables are immutable. If we
introduce compile-time mutability then I think we're just asking for chaos.

## Scope

Since variables are defined at the top level of the file in which they're
defined, that file is their scope; they are a "global" within that file. You can
`export` a variable or anchor to make it available to other files and modules,
and we'll cover modules in just a few sections.
