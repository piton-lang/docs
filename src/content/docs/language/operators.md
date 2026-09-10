---
title: Operators
description: Arithmetic, comparison, logical, assignment, annotation, and the concatenation operators.
sidebar:
  order: 4
---

## Control Flow and Functions

There are no conditionals or loops in Piton with the exception of the ternary
operator.

There are also no functions.

## Standard Operators

Piton supports a pretty standard if not small set of operators, plus a few
slightly more unique ones. Let's start with the standard ones.

- Arithmetic operators: `+`, `-`, `*`, `/`, `%`
  They do math things.
- Comparison operators: `==`, `!=`, `>`, `<`, `>=`, `<=`
  Introduces FOMO and jealousy.
- Logical operators: `&&` and `||`
  Nerds.
- Ternary operator: `?` `:`
  Ternary is just a fun word to say, kind of like "Guido" is fun to say. But my
  name isn't Guido, so I have to include the ternary operators in the language.
- Property Access operator: `.`
  If only buying land were as cheap as accessing a value from a dictionary.

Some immediate details to clarify:

- Arithmetic operator precedence follows standard mathematical precedence: `*`,
  `/`, and `%` are evaluated before `+` and `-`. Operators with the same
  precedence are evaluated from left to right. Parentheses may be used to alter
  the order of operations.
- Comparison operators have higher precedence than logical operators.
- Logical operator precedence is `&&` before `||`.
- The ternary operator has lower precedence than `||` and associates from right
  to left.
- We've already detailed how the property access operator `.` works. I'm just
  mentioning it to clarify that yes, it's technically an operator.

## Assignment and Type Annotation Operators

Now let's tackle the weirder ones. The first one isn't too bad.

- Assignment - `:`

So this is just thing equals thing. Like in most languages `var thing =
"thing"`, but since Piton is this sort of Python/YAML/JSON hybrid thing, it just
makes sense to stick with `:`.

And now another weird one:

- Type Annotation - `::`

While not mandatory or even very relevant unless defining generic anchors
(anchors being an entire topic we'll cover later), `::` is used for type
annotation. The reason it's not very relevant within the current scope of what
you've learned about the language is that Piton has no runtime, and variables
are immutable. One could argue that defining an explicit type for a variable is
a form of self-documenting code. Sure, that's not wrong, but Piton is so
forgiving about types that that argument is kind of like saying "don't use a
parrot to eat a forklift"; yeah, got it. Wasn't going to.

And this one will take you for a rollercoaster, because it starts off normal,
then gets really weird.

## Concatenation Operators

- Concatenation operators: `+`, `++`

The little secret here to keep in mind is that the "normal" doesn't even last
very long.

```piton
myVariable: "This is a" + "string"
```

Yeah, cool. That makes sense, right? The one thing worth noting is that we're
quoting the strings so that `+` is not treated as just a string. It is now a
distinct operator operating on strings.

```piton
myVariable: "The number is" + 5
```

Per our previous rules about mixing types, the `5` turns into a string, so the
final string is "The number is 5". Making sense so far, right?

Now let's get a little weird.

```piton
myVariable: "Hello, World" + [1, 2, 3]
```

Yeah... this turns `myVariable` into a list. The first item of which is a string
"Hello, World" and the second item is a list `[1, 2, 3]`. In JSON that would be:

```json
["Hello, World", [1, 2, 3]]
```

Or even as Markdown (which I know we haven't really talked about much yet) but
this would compile to:

```markdown
Hello World

- 1
- 2
- 3
```

If you're pissed off now, just wait. I'm going to make you a lot more angry. And
let's just dive into it.

```piton
myVariable: [1, 2, 3] + [1, 2, 3]
```

What do you expect? `[1, 2, 3, 1, 2, 3]`? Sorry... It's actually `[1, 2, 3]`.
When it's list to list, it's concatenation plus deduplication. The deduplication
is carried out in the order of the operands. So for example:

```piton
myVariable: [1, 2, 3, 4] + [1, 2, 3]
```

Uh... so, that sadly would become `[4, 1, 2, 3]`. And I mean it makes logical
sense given that Piton is a left-to-right, right winning language which we'll
talk a lot more about in the anchors and inheritance section. But still, it's
just generally like **ugh**. I get it, trust me I do.

So you good? You need a second to prepare for what's next? The `++` operator.
I'm sorry Ken Thompson and like, the rest of all literal programming history. I
think that `+=` is a perfectly efficient way to increment. And yeah, "C plus
equals" is a horrible name for a language.

Alright, the `++` operator:

```piton
myVariable: [1, 2, 3] ++ [1, 2, 3]
```

That results in `[1, 2, 3, 1, 2, 3]`. It functions the same as the `+`
concatenation operator but without the deduplication. In my defense, is not the
inherent duplication of the `+` operator to create the `++` operator a very
ergonomic way to signify what would otherwise be distinguished as a set vs. a
list?

### Notes on Concatenation

`+` and `++` both perform list concatenation and dictionary merging.

For lists, `+` performs deduplication while `++` does not. Concatenation
is performed left to right, with the right-hand operand taking precedence over
the left-hand operand. When deduplication is performed, left-side operand items
will be removed and right-side operand items will be added in the order of
concatenation. Deduplication on lists is shallow.

Merging on dictionaries is shallow with `+` and deep with `++`.

### Concatenation Table

| Left Type    | Operator | Right Type   | Result                                                              |
| ------------ | -------- | ------------ | ------------------------------------------------------------------- |
| `number`     | `+`      | `number`     | Arithmetic addition                                                 |
| `string`     | `+`      | `string`     | String concatenation                                                |
| `string`     | `+`      | `number`     | Number is cast to string, then concatenated                         |
| `simple`     | `+`      | `complex`    | Mixed list containing both operands                                 |
| `complex`    | `+`      | `simple`     | Mixed list containing both operands                                 |
| `list`       | `+`      | `list`       | Concatenated list with shallow deduplication; right-hand values win |
| `list`       | `++`     | `list`       | Concatenated list preserving duplicates                             |
| `dictionary` | `+`      | `dictionary` | Shallow merge; right-hand values win                                |
| `dictionary` | `++`     | `dictionary` | Deep merge; right-hand values win                                   |

## Additional Notes on Operator Behaviour

- Concatenation operators `+` and `++` have the same precedence and associate
  from left to right.

- `true` is truthy and `false` is falsy. Obviously.
- All non-zero numbers are considered truthy. Zero is falsy.
- An empty string is falsy.
- `null` is considered falsy.
- `null == null` evaluates to `true`, and `null != null` evaluates to `false`.

- Using `+` with a `string` and a `number` will automatically cast the
  `number` to a `string` and the results will be concatenated. With anything
  else, the containing variable will become a mixed list.
- Using `+` with two or more lists will concatenate the lists into a single
  list, deduplicating any items left to right, latest winning.
- Using `++` on lists will concatenate the lists into a single list and will
  keep duplicates.
- Comparison operators on mismatched types are a compiler error.
- Division by zero is a compiler error.

- Logical operators short-circuit. The right-hand operand of `&&` is only
  evaluated if the left-hand operand is truthy, and the right-hand operand of
  `||` is only evaluated if the left-hand operand is falsy.
- Modulo follows floor-division semantics. The result has the same sign as the
  divisor, or is zero.
