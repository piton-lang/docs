# Editor Shape

Typography and in-place formatting for the editing surface.

Build the editing surface described in [Editor](../../concept/Editor.md).

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

[KeyboardAccess](../../lib/KeyboardAccess.md)

Links in this document point at reference files. Read one when the work touches what it describes.
