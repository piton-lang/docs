---
description: Build the whole application from the specification, in dependency order.
---

Build the application described in [MarkdownEditor](../reference/concept/MarkdownEditor.md). Read the whole concept before writing any code, then work through the parts in the order below, using the skill that owns each one.

# Order

- The shell, with the build-app-shell skill, so the other parts have somewhere to live.
- The toolbar button, with the build-toolbar-button skill.
- The toolbar, with the build-toolbar skill, using the button you just built.
- The editing surface, with the build-markdown-editor skill.

# Rules

- Every part has a skill. Use it rather than working from this prompt.
- Anything the concept lists as out of scope stays unbuilt. Do not add tabs, a preview pane, or settings.
- Where the shape and your own judgement disagree, the shape wins. Say so rather than quietly improving it.
- Do not invent a measurement. If the shape does not give one, ask.

# After Each Part

Re-read the shape file for the part you just built and check your work against it property by property before moving on.

# When Done

Report which parts you built, and list anything in the shape you could not satisfy.

Links in this document point at reference files. Read one when the work touches what it describes.
