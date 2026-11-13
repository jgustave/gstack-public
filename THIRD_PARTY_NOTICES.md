# Third-party notices

`skills/statechart/` is extracted from the locally installed pstack statechart skill,
corresponding to the pstack 0.15.36 implementation previously inspected by gstack.
Its original source is <https://github.com/cursor/plugins/tree/main/pstack/skills/statechart>.
Copyright (c) 2026 Lauren Tan; MIT license. The complete notice is in
[`skills/statechart/LICENSE`](skills/statechart/LICENSE).

The extract preserves the original implementation, tests, and captured model fixtures.
Local adaptations are listed in [development notes](docs/development.md).

TLA+ tools, Java, mise, runtime engines, and optional rendering/test packages are obtained
separately and retain their own licenses. No runtime binaries or dependencies are vendored.
