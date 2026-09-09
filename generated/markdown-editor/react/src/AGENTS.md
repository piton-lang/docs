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

[KeyboardAccess](../.claude/reference/lib/KeyboardAccess.md)


# Toolbar Shape

Layout, spacing, and divider treatment for the toolbar row.

Build the toolbar described in [Toolbar](../.claude/reference/concept/Toolbar.md). Build the buttons themselves with the toolbar button skill.

## Layout

A single row 40px tall, full width, with 8px of padding at each end and 4px between buttons.

## Divider

A 1px vertical rule between the two groups, inset 8px from the top and bottom of the row, with 8px of space on either side.

## Narrow Windows

The row keeps its height and its buttons never wrap to a second line. It clips instead.

## Accessibility

[KeyboardAccess](../.claude/reference/lib/KeyboardAccess.md)


# Editor Shape

Typography and in-place formatting for the editing surface.

Build the editing surface described in [Editor](../.claude/reference/concept/Editor.md).

## Typography

A monospace face at 14px on a 1.6 line height, 16px of padding, and wrapping at the window width rather than a fixed column.

## Formatting

- Headings scale by level; the leading # characters stay visible.
- Bold and italic render in place, with the asterisks still shown.
- Inline code takes a tinted background.
- Links are underlined; the bracket syntax stays visible.

## Behaviour

Tab inserts two spaces. The editor never reflows the document or rewrites the characters the user typed.

## Accessibility

[KeyboardAccess](../.claude/reference/lib/KeyboardAccess.md)


# App Shell

The application window, its layout, and the stack it is built on.

Build the application described in [MarkdownEditor](../.claude/reference/concept/MarkdownEditor.md). Build the toolbar and the editor with their own skills; this instruction owns the window and the column only.

## Stack

Build it with React on TypeScript. The entry point is src/main.tsx. Full stack definition: [React](../.claude/reference/lib/React.md).

## Layout

One window, one column, no chrome beyond the toolbar. The toolbar keeps its height; the editor takes the rest and scrolls on its own.

## Window

Minimum size 480 by 320. The title is the open file's name, or Untitled, followed by a bullet when there are unsaved changes.

Links in this document point at reference files. Read one when the work touches what it describes.
