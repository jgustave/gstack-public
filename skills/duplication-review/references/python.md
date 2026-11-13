# Python-only scanning

This is our internal default, offered as an optional recipe. The public skill can review
other supported languages. For a mixed-language scan, use the general command in
[SKILL.md](../SKILL.md) without this non-Python exclusion; for another subset, adjust the
exclusion to match the adopting repository's requirements.

From the owning repository root, run this scan alongside its Python lint checks:

```sh
report_dir=$(mktemp -d)
dupehound scan . --json --exclude '*.{ts,mts,cts,tsx,js,mjs,cjs,jsx,rs,go,java,rb,swift,c,h,cc,cpp,cxx,c++,hpp,hh,hxx,php,cs}' \
  > "$report_dir/dupehound.json"
```

This exclusion covers the non-Python extensions used in our dupehound 0.1.2 workflow.
Keep `.py` and `.pyi` eligible. Recheck the tool's supported extensions when changing versions;
extend the non-Python exclusions if needed to preserve Python-only scope. Retaining an
extension does not establish parser support: inspect actual coverage and state omissions.

The default scan includes test functions in clusters but excludes them from its score.
Do not add `--exclude-tests`: new production helpers may duplicate helpers in tests, and
test copies still need judgment. Inspect nested-function overlap and intentionally independent
expectations rather than treating every test match as actionable.

Use `scan`, not only `check`, to see pairs introduced together and honor these exclusions.
Keep the full report in disposable output; examine clusters involving added or modified
functions against the task's complete changes. Historical-only pairs are not cleanup authority.
