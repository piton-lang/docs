# spec-skeleton

The approach-two starting point from the Piton tutorial "Specifying an
Existing Codebase": a `shapeRoot` that mirrors your source tree, the four
folders with a seed file each, and a `write-spec` skill carrying the
guidelines so they do not have to live in every prompt.

1. Copy `piton.config.pi` and `spec/` into your project.
2. Point `codeRoot` at your existing source directory.
3. `piton claude --install`
4. Ask the agent to describe one part of the codebase, following the
   `write-spec` skill.

The seed files under `spec/` are placeholders. Replace them.

For the lighter approach — no setup, guidelines in the prompt — see
`spec-intake.zip`.

Needs the `piton` binary on your PATH:
https://github.com/piton-lang/piton-rs
