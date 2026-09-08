---
title: Structural Inheritance
description: extends, multiple bases, super, and how collisions resolve left to right.
sidebar:
  order: 8
---

Piton uses structural inheritance, not polymorphism. Support for inheritance
including multiple bases is accessed via the `extends` keyword.

```piton
anchor FirstBaseAnchor:
    firstBaseAnchorProperty: Hello from the First Base Anchor
    description: Description from FirstBaseAnchor

anchor SecondBaseAnchor:
    secondBaseAnchorProperty: Hello from the Second Base Anchor
    description: Description from SecondBaseAnchor

anchor ChildAnchor extends FirstBaseAnchor, SecondBaseAnchor:
    childAnchorProperty: Hello from Child Anchor
```

And as JSON:

```json
{
  "firstBaseAnchorProperty": "Hello from the First Base Anchor",
  "secondBaseAnchorProperty": "Hello from the Second Base Anchor",
  "description": "Description from SecondBaseAnchor",
  "childAnchorProperty": "Hello from Child Anchor"
}
```

One particular thing to note here is that both `FirstBaseAnchor` and
`SecondBaseAnchor` include a `description` property, and the way that got
inherited by `ChildAnchor` is a simple left to right where the last in line
wins.

Type constraints participate in the same left-to-right collision resolution as
property values; the right-most inherited definition wins.

## super

This brings up the question of what happens when a child anchor declares a
property that is inherited from the base anchor, and how do we retrieve values
from the base?

```piton
anchor BaseAnchor:
    description: Description from BaseAnchor

anchor ChildAnchor extends BaseAnchor:
    description: Description from ChildAnchor
```

This of course will simply use the child anchor's value.

```json
{
  "description": "Description from ChildAnchor"
}
```

But if we wanted to specifically pull from the parent, that is possible using
the `super` keyword.

```piton
anchor ChildAnchor extends BaseAnchor:
    description:
        ${super.description} and Description from ChildAnchor
```

As with the previous example of multiple inheritance, the `anchor` could be
inheriting from multiple bases, in which case what does `super` point to? It
follows the same authority as property inheritance in that left to right, last
in line wins.

It's worth noting the small detail here that we borrow the `${}` syntax from
other languages for string interpolation.

So the resulting JSON would be:

```json
{
  "description": "Description from BaseAnchor and Description from ChildAnchor"
}
```

## super on Lists

`super` on lists gets some extra attention that's worth noting.

```piton
anchor BaseAnchor:
    items:
        - A
        - B
        - C

anchor ChildAnchor extends BaseAnchor:
    items:
        + {super.items}
        - D
        - E
        - F
```

This example will yield a final `items` of `["A", "B", "C", "D", "E", "F"]`.
We're applying the `+` concatenation operator here to indicate spreading the
`super.items` list into the current list. Without that we'd end up with
`[["A", "B", "C"], "D", "E", "F"]`.

But let's modify that example slightly to see a specific feature of the `+`
concatenation operator.

```piton
anchor BaseAnchor:
    items:
        - A
        - B
        - C

anchor ChildAnchor extends BaseAnchor:
    items:
        - A
        - B
        - C
        - D
        + {super.items}
```

The change is that `ChildAnchor` now also contains `A`, `B`, `C`, and `D`, and
we're also bringing `super.items` in at the end of the list. If you remember from
when we discussed the `+` concatenation operator, it performs deduplication and
concatenates in the order of the operands. So `ChildAnchor` ends up with
`["D", "A", "B", "C"]`.

One last example uses the `++` operator.

```piton
anchor BaseAnchor:
    items:
        - A
        - B
        - C

anchor ChildAnchor extends BaseAnchor:
    items:
        - A
        - B
        - C
        - D
        ++ {super.items}
```

Exactly the same as the `+` operator but no deduplication. So we end up with
`["A", "B", "C", "D", "A", "B", "C"]`.

## Self-reference

Piton supports self-reference within anchors via both the `self` and `this`
keywords, and there's an important distinction between the two. Consider the
following example:

```piton
anchor Base:
    name: Base Anchor
    baseDescription: This is ${self.name}

anchor Child extends Base:
    name: Child Anchor
    childDescription: This is ${self.name}
```

As JSON this would compile to:

```json
{
  "name": "Child Anchor",
  "baseDescription": "This is Child Anchor",
  "childDescription": "This is Child Anchor"
}
```

This is reasonable and expected behaviour, but I've often found when building
inheritance hierarchies that I want a bit more control. That's where `this`
comes in. Where `self` will reference the most descendant anchor, `this` will
reference the exact anchor. So in the above example, imagine we change `self`
to `this`:

```piton
anchor Base:
    name: Base Anchor
    baseDescription: This is ${this.name}
```

While the rest of the example remains the same. The JSON output will now be:

```json
{
  "name": "Child Anchor",
  "baseDescription": "This is Base Anchor",
  "childDescription": "This is Child Anchor"
}
```

And just for absolute clarity, let's take this example one step further:

```piton
anchor Base:
    name: Base Anchor
    baseDescription: This is ${this.name}

anchor MidChild extends Base:
    name: MidChild Anchor
    baseDescription: Override on baseDescription ${this.name}
    childDescription: This is ${self.name}

anchor FinalChild extends MidChild:
    name: FinalChild Anchor
```

Will output:

```json
{
  "name": "FinalChild Anchor",
  "baseDescription": "Override on baseDescription MidChild Anchor",
  "childDescription": "This is FinalChild Anchor"
}
```

As you can see, `this` gets pinned to wherever it's used, while `self` travels
through the hierarchy.
