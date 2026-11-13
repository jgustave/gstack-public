---
name: duplication-review
description: Review code changes for avoidable duplication with dupehound and source inspection. Use before adding similar logic, alongside linting, or when reviewing duplicate-function findings; distinguish reusable contracts from intentional similarity without expanding into unrelated cleanup.
---

# Duplication review

Use dupehound as feedback for a scoped code review. Similarity suggests where to look;
it does not establish that two functions should share an implementation. This skill grants
no permission to change unrelated code, install tools, or alter CI or global hooks.

## Establish the change and search for reuse

Identify the owning repository, the task's starting revision or review base, and any
pre-existing user changes. Before adding logic, search relevant code and callers for an
existing implementation of the same behavior or rule. Reuse a suitable implementation;
do not create another copy just because there are fewer than three callers.

Inspect staged and unstaged diffs and relevant untracked files. If the task already has
commits, include them by comparing with its starting revision; `HEAD` alone is insufficient.
Use the actual new function bodies and changed ranges, including nested functions, rather
than treating every finding in a modified file as introduced by this task.

## Scan the owning repository

Check `dupehound --version` and `dupehound scan --help`. If unavailable, report that limit
and continue manual reuse review and other checks. Do not silently install it.

Run a whole-repository `scan` alongside the owner's lint checks when practical. Scan the
eligible codebase, not just edited files: new functions must be able to match old helpers
and other functions introduced together. Select the language scope from the adopting
repository's requirements. Our internal default is Python-only; it is not a restriction
of this public skill. Read [the Python scan reference](references/python.md) when choosing
that scope. For other languages or a mixed-language review, omit that exclusion or replace
it with exclusions appropriate to the selected scope and installed dupehound version.

Keep the full JSON report in disposable output outside the source being scanned. For a
repository whose supported languages are all in scope, run from its root:

```sh
report_dir=$(mktemp -d)
dupehound scan . --json > "$report_dir/dupehound.json"
```

Inspect the exit status, stderr, JSON shape, eligible-file/function counts, and exclusions.
A command failure, invalid report, or empty eligible scope is not a clean duplication result.
Ignored/generated code and functions below the configured minimum may be absent. Manual
review still covers changed contracts that the scan cannot see.

Scan one owning repository by default. For a shared package and its consumers, scan each
affected repository and inspect the relevant shared API; unrelated projects do not justify
new dependencies. Do not use a repository-wide duplication score as an acceptance gate.

## Review matches that touch the change

Bring only relevant clusters into model context: matching paths, function names and ranges,
and similarity. Inspect every member needed to understand a cluster. Compare actual contracts,
callers, validation, errors, side effects, and ordering. Differently written implementations
of the same rule can be duplication even when dupehound does not match them.

Decide with evidence:

- **Reuse or consolidate** when the change introduces another implementation of the same
  contract and an existing function is suitable. Preserve necessary boundary validation.
- **Retain with a concrete reason** when apparent copies protect independent test expectations,
  implement distinct contracts, or are an enclosing function overlapping its own nested function.
  Read the bodies: test location alone is not an exemption.
- **Leave historical-only matches out of scope** unless the task explicitly includes cleanup.
  If a change extends or worsens an old duplicate, assess that new contribution instead.

Prefer direct reuse over speculative generic helpers. The rule-of-three preference discourages
premature abstractions; it does not authorize copying an existing suitable implementation.
Do not weaken checks, broaden exclusions, or raise thresholds just to hide relevant findings.

## Verify and report

After consolidating, run the affected behavior tests and owner's lint/type checks, then rerun
the scan when code changes could affect its findings. Stop when actionable in-scope copies
are resolved and material retained duplication has a concrete explanation.

Report the tool version, scanned scope and omissions, relevant matches, decisions, checks
actually run, and remaining limits. A passing scan cannot prove that a semantic rule exists
only once. Follow the owner's independent-review requirement for nontrivial code changes.

## Version-specific limits

For dupehound 0.1.2, do not substitute `check` for the full `scan`: `check` misses copies
introduced together and ignores custom exclusions in the tested cases. Its default mode
also chooses staged changes when present, rather than reviewing the entire working tree.
For another version, verify these behaviors before relying on them. `check --diff REV`
uses committed branch history; it is not a replacement for inspecting local edits.
