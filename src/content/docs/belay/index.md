---
title: Introduction
description: The bundled framework that turns Piton into agentic skills, commands, instructions, and agents.
sidebar:
  order: 1
---

The Belay framework is bundled with Piton, and is the specific framework that
enhances the language in such a way that it can build agentic skills, commands,
instructions, and agents. And it exports exactly those four new anchors and
exposes them as keywords.

| Anchor      | Keyword       |
| ----------- | ------------- |
| Agent       | `agent`       |
| Instruction | `instruction` |
| Skill       | `skill`       |
| Command     | `command`     |

## Project Configuration

In order to use the Belay framework you must include it in the project config.
We already showed this in the project config example, but now we'll highlight
the Belay-specific items and fill it out with more detail.

```piton
use @piton/belay

export piton-config Config:
    // Resolve the anchor that implements belay-config
    frameworks:
        - {BelayFrameworkConfig}

// Implement belay-config with required configuration
belay-config BelayFrameworkConfig:
    // Where the source code of your application lives
    codeRoot: ./src/
    shapeRoot: ./spec/shape/

    // Adapters are how the compiler knows what to output and where. In this
    // case, we're outputting agentic coding files.
    adapters:
        - {AgentAdapter}

// The agent adapter knows how to output Markdown for all of Belay's constructs
// that will work with agentic coding tools like OpenCode, Claude Code, etc.
belay-agent-adapter AgentAdapter:
    claude: true
```
