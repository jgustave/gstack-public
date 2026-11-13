# Statechart

Statechart checks a bounded TLA+ model, produces a Mermaid chart, and reports paths to
broken rules. Use it when ordering, retries, recovery, or concurrency is hard to reason about.
The [skill instructions](../skills/statechart/SKILL.md) explain how an agent should build and
interpret the model; this guide covers the local runtime and command.

## Prerequisites

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

Run from the repository root:

```sh
skills/statechart/scripts/statechart path/to/Model.tla \
  --config path/to/Model.cfg --view path/to/view.mjs --out /tmp/new-model-output
```

Read `report.md`, including unchecked rules and bounds. Exit 0 means the original TLC run
passed, 1 means a rule broke, and 2 means execution failed. Output must be a new or empty
directory. Mermaid text needs no renderer; SVG rendering uses the optional
[Pele instructions](../skills/statechart/references/render.md).

## Try it

Follow the [retry example](workflow-example.md) to compare a broken model with its correction.
A passing model covers only the behavior and bounds it declares. Replay predicted failures
against the real implementation before treating them as application bugs.

For the test suite and contributor checks, see [development notes](development.md).
