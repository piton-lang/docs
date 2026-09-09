# App Shell

The application window, its layout, and the stack it is built on.

Build the application described in [MarkdownEditor](../concept/MarkdownEditor.md). Build the toolbar and the editor with their own skills; this instruction owns the window and the column only.

## Stack

Build it with React on TypeScript. The entry point is src/main.tsx. Full stack definition: [React](../lib/React.md).

## Layout

One window, one column, no chrome beyond the toolbar. The toolbar keeps its height; the editor takes the rest and scrolls on its own.

## Window

Minimum size 480 by 320. The title is the open file's name, or Untitled, followed by a bullet when there are unsaved changes.

Links in this document point at reference files. Read one when the work touches what it describes.
