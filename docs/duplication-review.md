# Duplication review

The [duplication-review skill](../skills/duplication-review/SKILL.md) combines source inspection
with dupehound findings. Use it before copying logic or alongside linting to catch a change
that reimplements something the repository already provides.

## Setup and use

Install dupehound separately using its [upstream instructions](https://github.com/Rafaelpta/dupehound#install).
These examples were checked with `dupehound 0.1.2`. No dupehound code or executable is bundled.
Confirm the available version and options:

```sh
dupehound --version
dupehound scan --help
```

Give your agent a task such as:

```text
Read skills/duplication-review/SKILL.md. Review this change for duplicated behavior.
Include staged, unstaged, and untracked code, and compare with the task's starting revision.
Run a whole-repository scan, inspect relevant clusters, and explain which copies should
reuse an existing implementation and which similarities should remain.
```

## Choose the language scope

Our internal workflow defaults to Python-only scans. That is a project choice, not a
dupehound limitation or a restriction on this public skill. External users can choose any
supported language or mix of languages to suit their repository.

Use the [Python scan reference](../skills/duplication-review/references/python.md) when choosing
Python-only scope. To include all languages recognized by the installed tool, use the general
scan in the skill without that non-Python exclusion. For another subset, change the exclusions
and inspect coverage before interpreting findings. Do not carry our Python-only exclusions
into a mixed-language review by default.

The skill contains the general review procedure; this guide adds concrete examples rather
than another set of review rules.

## Three teaching cases

From the repository root:

```sh
dupehound scan examples/duplication --json
```

The fixtures are intentionally repetitive teaching material, separate from runtime code.
With 0.1.2's default settings, all three cases appear as clusters:

| Case | Files | Review decision |
| --- | --- | --- |
| Existing helper copied under new names | [existing.py](../examples/duplication/reuse/existing.py), [proposed.py](../examples/duplication/reuse/proposed.py) | Both normalize the same tags. Reuse `normalized_tags`; renaming it to labels does not create a different contract. |
| Similar independent expectations | [test_ordering.py](../examples/duplication/intentional/test_ordering.py) | FIFO removal and LIFO removal are different behaviors. Keep the explicit expectations; sharing them could erase the distinction the tests protect. |
| Copies introduced together | [new_functions.py](../examples/duplication/introduced-together/new_functions.py) | Both compute the same discounted total. Choose one implementation even though neither existed in the baseline. |

The retained fixture copies are needed to demonstrate detection. They are not recommended
implementations for application code. Similarity is a prompt to inspect the contracts,
not a refactoring instruction or a claim that every scored line can be deleted.

For a real change, inspect status, both local diffs, and untracked source files:

```sh
git status --short
git diff --no-ext-diff
git diff --cached --no-ext-diff
git ls-files --others --exclude-standard
```

Also compare tracked source with the actual task starting revision when its work includes
commits. A newly edited file can contain historical functions unrelated to the task. Match
clusters to changed function bodies and ranges, then inspect their callers.

## Why the examples use scan

Our tests reproduce two dupehound 0.1.2 limitations in disposable Git repositories:

- With both new total functions staged against a baseline containing neither, `check`
  reports no findings; `scan` finds their pair.
- With the tag helper committed and its copy staged, `check --exclude proposed.py` still
  reports the excluded copy; `scan --exclude proposed.py` honors the exclusion.

These are version-specific observations. The tests explicitly skip those compatibility
assertions on other versions, while still checking fixture detection and scope. A future
fix in dupehound should change the guidance rather than force these old expectations.
Upstream's [`check` documentation](https://github.com/Rafaelpta/dupehound/blob/main/docs/ci.md)
also distinguishes staged/local mode from `--diff` branch comparison.

## Verify the examples

Use Node 24, Git, dupehound, and Python 3.12+ for these checks. No npm packages are needed.
Set `DUPLICATION_PYTHON` to an appropriate Python executable (otherwise tests use `python3`):

```sh
python3.12 -m venv .venv
DUPLICATION_PYTHON="$PWD/.venv/bin/python" node --test tests/duplication.test.mjs
```

The tests run fixture behavior, inspect actual scan results, exercise staged/unstaged/untracked
files and the two version-specific cases, and check a Python-only exclusion against a
TypeScript sentinel. Temporary Git repositories and reports are discarded after each test;
the checks do not change your Git configuration or install hooks.

Tests fail if a required command is missing or a scan/report is invalid. They test these
examples and tool interactions, not every semantic decision an agent might make. No automated
changed-function filter or replacement detector is provided.
