# spec-intake

The approach-one starting point from the Piton tutorial "Specifying an
Existing Codebase": a project config and an empty entry point, and nothing
else. The guidelines go in your prompt.

1. Copy `piton.config.pi` and `spec/` into your project.
2. Point `codeRoot` at your existing source directory.
3. `piton claude --install`
4. Ask the agent to write the specification, telling it in the same prompt
   what a good one looks like.

For the other approach — the guidelines built into the project instead of the
prompt — see `spec-skeleton.zip`.

Needs the `piton` binary on your PATH:
https://github.com/piton-lang/piton-rs
