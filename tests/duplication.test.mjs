import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const fixtures = path.join(root, "examples/duplication");
const python = process.env.DUPLICATION_PYTHON ?? "python3";
const pythonExclusions = "*.{ts,mts,cts,tsx,js,mjs,cjs,jsx,rs,go,java,rb,swift,c,h,cc,cpp,cxx,c++,hpp,hh,hxx,php,cs}";

function run(executable, args, cwd, statuses = [0]) {
  const result = spawnSync(executable, args, {
    cwd,
    encoding: "utf8",
    env: { ...process.env, GIT_CONFIG_GLOBAL: os.devNull, GIT_CONFIG_NOSYSTEM: "1" },
    timeout: 30_000,
  });
  assert.ifError(result.error);
  assert.ok(statuses.includes(result.status), `${executable}: exit ${result.status}\n${result.stderr}\n${result.stdout}`);
  return result;
}

function scan(directory, ...options) {
  const report = JSON.parse(run("dupehound", ["scan", ".", "--json", ...options], directory).stdout);
  assert.equal(report.schema_version, 1);
  assert.ok(report.stats.files > 0 && report.stats.functions > 0, "empty eligible scope");
  assert.ok(Array.isArray(report.clusters));
  return report;
}

function hasPair(report, first, second) {
  return report.clusters.some(({ members }) => {
    const names = members.map(({ name }) => name);
    return names.includes(first) && names.includes(second);
  });
}

function inRepository(baseline, action) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "gstack-public-duplication-"));
  const git = (...args) => run("git", args, directory);
  try {
    git("init", "-q");
    fs.writeFileSync(path.join(directory, "README.md"), "Disposable fixture repository\n");
    for (const [name, contents] of Object.entries(baseline))
      fs.writeFileSync(path.join(directory, name), contents);
    git("add", ".");
    git("-c", "user.name=Fixture Tests", "-c", "user.email=fixture@example.invalid", "-c", "commit.gpgsign=false", "commit", "-qm", "Fixture baseline");
    action(directory, git);
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
}

const read = (relative) => fs.readFileSync(path.join(fixtures, relative), "utf8");
const version = run("dupehound", ["--version"], root).stdout.trim();
const versionSkip = version !== "dupehound 0.1.2" && `0.1.2 compatibility case; installed ${version}`;

test("scan finds the three teaching pairs, including independent tests", () => {
  const report = scan(fixtures);
  assert.ok(hasPair(report, "normalized_tags", "cleaned_labels"));
  assert.ok(hasPair(report, "invoice_total", "order_total"));
  assert.ok(hasPair(report, "test_fifo_queue", "test_lifo_stack"));
});

test("the examples preserve their stated contracts", () => {
  run(python, ["-I", "-c", `
import runpy
import sys
from pathlib import Path
base = Path(sys.argv[1])
existing = runpy.run_path(str(base / "reuse/existing.py"))["normalized_tags"]
proposed = runpy.run_path(str(base / "reuse/proposed.py"))["cleaned_labels"]
for normalize in (existing, proposed):
    assert normalize([" B ", "#A", "a", "", "#", "B"]) == ["a", "b"]
    assert normalize([]) == []
totals = runpy.run_path(str(base / "introduced-together/new_functions.py"))
for name in ("invoice_total", "order_total"):
    total = totals[name]
    assert total([100, 200], 50) == 250
    assert total([100], 200) == 0
    assert total([], 0) == 0
    for amounts, discount in (([-1], 0), ([1], -1)):
        try:
            total(amounts, discount)
        except ValueError:
            pass
        else:
            raise AssertionError("negative input accepted")
ordering = runpy.run_path(str(base / "intentional/test_ordering.py"))
ordering["test_fifo_queue"]()
ordering["test_lifo_stack"]()
`, fixtures], root);
});

for (const state of ["untracked", "staged", "unstaged"]) {
  test(`scan finds copies in ${state} source`, () => {
    const baseline = state === "unstaged" ? { "new_functions.py": '"""Pending implementation."""\n' } : {};
    inRepository(baseline, (directory, git) => {
      fs.writeFileSync(path.join(directory, "new_functions.py"), read("introduced-together/new_functions.py"));
      if (state === "staged") git("add", "new_functions.py");
      const status = git("status", "--short").stdout;
      assert.ok(status.startsWith({ untracked: "??", staged: "A ", unstaged: " M" }[state]));
      assert.ok(hasPair(scan(directory), "invoice_total", "order_total"));
    });
  });
}

test("a Python-only scan excludes a TypeScript sentinel while retaining Python matches", () => {
  inRepository({}, (directory) => {
    fs.writeFileSync(path.join(directory, "new_functions.py"), read("introduced-together/new_functions.py"));
    fs.writeFileSync(path.join(directory, "sentinel.ts"), `
export function sentinel(values: number[], discount: number): number {
  if (discount < 0) throw new Error("negative discount");
  let total = 0;
  for (const value of values) {
    if (value < 0) throw new Error("negative amount");
    total += value;
  }
  return total - Math.min(total, discount);
}
`);
    assert.equal(scan(directory).stats.files, 2);
    const report = scan(directory, "--exclude", pythonExclusions);
    assert.equal(report.stats.files, 1);
    assert.ok(hasPair(report, "invoice_total", "order_total"));
  });
});

test("0.1.2 check misses two copies introduced together", { skip: versionSkip }, () => {
  inRepository({}, (directory, git) => {
    fs.writeFileSync(path.join(directory, "new_functions.py"), read("introduced-together/new_functions.py"));
    git("add", "new_functions.py");
    const checked = JSON.parse(run("dupehound", ["check", ".", "--json"], directory).stdout);
    assert.deepEqual(checked.findings, []);
    assert.ok(hasPair(scan(directory), "invoice_total", "order_total"));
  });
});

test("0.1.2 check ignores an exclusion honored by scan", { skip: versionSkip }, () => {
  inRepository({ "existing.py": read("reuse/existing.py") }, (directory, git) => {
    fs.writeFileSync(path.join(directory, "proposed.py"), read("reuse/proposed.py"));
    git("add", "proposed.py");
    const checked = JSON.parse(run("dupehound", ["check", ".", "--json", "--exclude", "proposed.py"], directory, [1]).stdout);
    assert.ok(checked.findings.some(({ name }) => name === "cleaned_labels"));
    assert.ok(hasPair(scan(directory), "normalized_tags", "cleaned_labels"));
    assert.equal(scan(directory, "--exclude", "proposed.py").clusters.length, 0);
  });
});
