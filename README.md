# gstack-public

A collection of skills and tools for thoughtful, practical agent-assisted engineering.

This is a selective extract from gstack, inspired by
[Lauren Tan's pstack](https://github.com/cursor/plugins/tree/main/pstack).
It brings useful capabilities from gstack into a self-contained public collection that you
can use, learn from, and adapt. Current entries cover workflow verification, model-checked
statecharts, and duplication review.

## Start here

Choose a skill from the catalog below and give your coding agent this repository and a task.
For example, to investigate a retry workflow:

```text
Read skills/workflow-verification/SKILL.md. Review our job retry flow:
what survives a restart, what may repeat, and what permits the next attempt?
Choose and run checks for the concrete failure paths.
```

The workflow skill itself needs no runtime or account. For formal state modeling, follow
the [statechart setup guide](docs/statechart.md) and try the [worked example](docs/workflow-example.md).

## Skills

| Skill | Use it for | Guide |
| --- | --- | --- |
| [workflow-verification](skills/workflow-verification/SKILL.md) | Phase contracts, producer/consumer agreement, lifecycle tests, interruptions, recovery, context limits, and provider boundaries. | [Retry example](docs/workflow-example.md) |
| [statechart](skills/statechart/SKILL.md) | Check a bounded TLA+ model, draw a Mermaid statechart, and report paths to broken rules. | [Setup and CLI](docs/statechart.md) |
| [duplication-review](skills/duplication-review/SKILL.md) | Find existing behavior to reuse and assess dupehound findings without forcing unnecessary refactoring. | [Guide and examples](docs/duplication-review.md) |

For workflow verification, statechart is optional. A decisive executable reproduction may be
all a workflow needs. These skills do not grant permission to change a live system or require
a particular model provider.

## Install

Clone to a stable location:

```sh
git clone https://github.com/jgustave/gstack-public.git
cd gstack-public
```

Use your agent's skill installer with the desired directories under `skills/`, or copy complete
skill directories into its supported skill directory. Keep workflow-verification and statechart
together: workflow-verification links to its sibling statechart. Reading the files explicitly, as in
the example prompt above, also works without automatic skill discovery.

For Claude Code, the repository includes a marketplace and plugin manifest:

```text
/plugin marketplace add jgustave/gstack-public
/plugin install gstack-public@gstack-public
```

A Cursor plugin manifest is included in `.cursor-plugin/plugin.json`. Publication in a
marketplace and automatic updates are separate from cloning this repository. There is no
claim that this plugin is already listed in Cursor's marketplace.

## Develop and verify

See [development notes](docs/development.md) for dependencies, test commands, and verification
scope. Statechart's [setup guide](docs/statechart.md) covers its runtime and CLI.

## Credits and license

The statechart skill, implementation, rendering reference, and fixtures come from pstack
and retain [Lauren Tan's MIT notice](skills/statechart/LICENSE). Original extract content
is [MIT licensed](LICENSE). See [third-party notes](THIRD_PARTY_NOTICES.md).

The gstack service, private operational state, and Python statechart port are outside this extract.
