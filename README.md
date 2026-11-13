# gstack-public

Agent skills for checking that a workflow actually finishes its job—across handoffs,
retries, interruptions, and recovery.

This is a selective extract from gstack, inspired by
[Lauren Tan's pstack](https://github.com/cursor/plugins/tree/main/pstack).
Start with a concrete contract, test the real sequence, and use a small state model when
ordering is hard to reason about. A successful tool call alone doesn't mean the work is done.

## Start here

Give your coding agent this repository and a task:

```text
Read skills/workflow-verification/SKILL.md. Review our job retry flow:
what survives a restart, what may repeat, and what permits the next attempt?
Choose and run checks for the concrete failure paths.
```

The workflow skill itself needs no runtime or account. For formal state modeling, install
the statechart prerequisites below and try the [worked example](docs/workflow-example.md).

## Skills

| Skill | Use it for |
| --- | --- |
| [workflow-verification](skills/workflow-verification/SKILL.md) | Phase contracts, producer/consumer agreement, lifecycle tests, interruptions, recovery, context limits, and provider boundaries. |
| [statechart](skills/statechart/SKILL.md) | Check a bounded TLA+ model, draw a Mermaid statechart, and report paths to broken rules. |

Statechart is optional. A decisive executable reproduction may be all a workflow needs.
Neither skill grants permission to change a live system or requires a particular model provider.

## Install

Clone to a stable location:

```sh
git clone https://github.com/jgustave/gstack-public.git
cd gstack-public
```

Use your agent's skill installer with `skills/workflow-verification` and `skills/statechart`,
or copy those complete directories into its supported skill directory. Keep them together:
workflow-verification links to its sibling statechart. Reading the files explicitly, as in
the example prompt above, also works without automatic skill discovery.

For Claude Code, the repository includes a marketplace and plugin manifest:

```text
/plugin marketplace add jgustave/gstack-public
/plugin install gstack-public@gstack-public
```

A Cursor plugin manifest is included in `.cursor-plugin/plugin.json`. Publication in a
marketplace and automatic updates are separate from cloning this repository. There is no
claim that this plugin is already listed in Cursor's marketplace.

### Statechart prerequisites

Use macOS or Linux with a POSIX shell and one of:

- Node 22.18–22.x or Node 23.6+, including Node 24 (recommended).
- Bun 1.1.5+.
- Deno 2+.

You also need Java 11+ and the TLA+ tools JAR. The explicit setup is:

```sh
mkdir -p "$HOME/.cache/gstack-public"
curl --fail --location \
  https://github.com/tlaplus/tlaplus/releases/download/v1.7.4/tla2tools.jar \
  --output "$HOME/.cache/gstack-public/tla2tools-1.7.4.jar"
export TLA2TOOLS="$HOME/.cache/gstack-public/tla2tools-1.7.4.jar"
# Optional: export JAVA=/path/to/java
```

Alternatively, install `mise` and let the statechart command obtain its pinned Java/TLC
versions on first use; this requires network access. View modules execute trusted local
JavaScript. Select a view and JAR as you would other code you run locally.

```sh
skills/statechart/scripts/statechart path/to/Model.tla \
  --config path/to/Model.cfg --view path/to/view.mjs --out /tmp/new-model-output
```

Read `report.md`, including unchecked rules and bounds. Exit 0 means the original TLC run
passed, 1 means a rule broke, and 2 means execution failed. Output must be a new or empty
directory. Mermaid text needs no renderer; SVG rendering uses the optional
[Pele instructions](skills/statechart/references/render.md).

## Develop and verify

Use Node 24 and npm for the upstream test suite, even if you run the CLI with another runtime:

```sh
npm install --prefix skills/statechart/scripts --package-lock=false --no-audit --no-fund
npm test --prefix skills/statechart/scripts
```

Set `TLA2TOOLS` (and optionally `JAVA`) first to enable live TLC corpus, configuration-oracle,
and differential checks. Otherwise those checks skip; replay tests still run. The rendering
tests install pinned Pele, Mermaid, and jsdom packages into the user cache and need network
access. See [development notes](docs/development.md) for scope and local adaptations.

## Credits and license

The statechart skill, implementation, rendering reference, and fixtures come from pstack
and retain [Lauren Tan's MIT notice](skills/statechart/LICENSE). Original extract content
is [MIT licensed](LICENSE). See [third-party notes](THIRD_PARTY_NOTICES.md).

The gstack service, private operational state, and Python statechart port are outside this extract.
