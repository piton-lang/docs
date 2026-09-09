# Toolbar Button Shape

The single button component every toolbar button is built from.

Build one reusable button. Every button in the toolbar is this component with a different icon and action.

## Appearance

32 by 32, icon only, no border and no background at rest.

## States

- rest: icon at full contrast, no background
- hover: a subtle filled background
- pressed: the same background one step darker
- disabled: icon at 40% opacity, no hover or press response

## Tooltip

The action name, shown on hover and on keyboard focus after 500ms.

## Accessibility

[KeyboardAccess](../../.claude/reference/lib/KeyboardAccess.md)


# Toolbar Shape

Layout, spacing, and divider treatment for the toolbar row.

Build the toolbar described in [Toolbar](../../.claude/reference/concept/Toolbar.md). Build the buttons themselves with the toolbar button skill.

## Layout

A single row 40px tall, full width, with 8px of padding at each end and 4px between buttons.

## Divider

A 1px vertical rule between the two groups, inset 8px from the top and bottom of the row, with 8px of space on either side.

## Narrow Windows

The row keeps its height and its buttons never wrap to a second line. It clips instead.

## Accessibility

[KeyboardAccess](../../.claude/reference/lib/KeyboardAccess.md)

Links in this document point at reference files. Read one when the work touches what it describes.
