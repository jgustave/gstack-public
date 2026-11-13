# Development

The maintained public source lives here. The private gstack service and user-level installed
skills are not runtime dependencies. Changes in those locations are not synchronized automatically.

## Extraction boundary

- `skills/workflow-verification/`: workflow guidance and existing agent metadata.
- `skills/statechart/`: upstream CLI, compiler passes, parsers, reports, rendering guide,
  tests, and all captured corpus files.
- `examples/retry/`: a public teaching model with a broken and corrected retry transition.

Runtime code uses Node built-ins. `fast-check` is a test dependency. Rendering tests also
install Pele 1.9.0, Mermaid 11.16.0, and jsdom 26.1.0 into the user cache. They are not needed
to produce `chart.mmd` and `report.md`.

## Adaptations from the installed skills

Workflow verification links directly to the bundled statechart. Its final reporting section
states the needed optimization checks directly, rather than relying on two unbundled personal
optimization skills. Those specialized skills are outside this initial extract.

Statechart's `mise` TLC tool declaration retains its release URL and version and omits the
upstream download-digest option. Other runtime logic and the captured test corpus are preserved.
The test Java adapter is executable so the CLI and live corpus tests can invoke it directly.
The symlink-launcher test resolves its temporary directory before constructing relative links,
so macOS's `/var` to `/private/var` alias does not create a broken test link.
The renderer's dependency chain is documented rather than installed by repository setup.

## Checks

From the repository root, with Node 24 and npm on PATH:

```sh
npm install --prefix skills/statechart/scripts --package-lock=false --no-audit --no-fund
npm test --prefix skills/statechart/scripts
```

The suite includes fixture replay, CLI supervision/cancellation/output protection, graph
projection, parser and rendering checks. With `TLA2TOOLS` set, it additionally runs the real
TLC corpus, a 4,000-case configuration oracle, and generated-model differential comparisons.
These checks test the bundled statechart implementation; they do not prove that a modeled
application matches its model. Replay reported bug paths against the real implementation.

The [worked example](workflow-example.md) exercises the public launcher with both a broken
and corrected contract. Keep generated results in a new scratch directory, outside source.
Do not regenerate the upstream expected fixtures just to make a failing test pass.

Plugin manifests are included for distribution, but host installation needs a separate smoke
test in each host. Direct CLI tests do not establish plugin discovery or model compliance.

The generic Codex skill validator accepts workflow-verification. The original statechart
frontmatter includes Claude's `disable-model-invocation` field, which that validator does not
recognize. The common frontmatter subset validates with that field omitted in a disposable
copy; the distributed skill preserves the upstream invocation policy.

## Local verification, 2026-11-13

Verified with Node 24.22.1, Java 17, and TLA+ tools release 1.7.4:

- Full upstream suite with live TLC enabled: 367 tests, 366 passed, one symlink test
  failed, and none skipped. After correcting the macOS temporary-path issue above,
  the affected CLI suite reran with 126 passed, zero failed, and none skipped. No
  observed test failures remain. The full run included the 33-model live corpus,
  configuration oracle, differential comparisons, replay, and rendering checks.
- Worked example: broken model exited 1 and reported the intended six-step duplicate-effect
  path (13 states, 19 steps); corrected model exited 0 (8 states, 11 steps), with TypeOK,
  AtMostOnce, and NoDeadlock holding within its stated bounds.
- Claude CLI validation passed for both the plugin and marketplace manifests. Actual host
  installation, Cursor discovery, alternate runtimes, and automatic mise setup were not tested.
- Local Markdown targets and JSON syntax checked; copied sources and fixtures compared
  with the installed originals; public files scanned for private paths and credentials.
- Independent adversarial review, including the test portability corrections, found no
  actionable findings. Review was read-only and did not repeat runtime tests.

The source repository and installed skills were left unchanged. No worktrees were created.
