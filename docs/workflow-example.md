# A retry that forgets completed work

A worker claims a job, performs its effect, and records completion. An interruption can
happen after the effect but before completion is recorded. Retrying from the last phase
can then perform the effect twice.

Start with the observable contract:

| Phase | Required state | Permitted next action |
| --- | --- | --- |
| Ready | Job identity and any saved effect result | Claim the job |
| Running | Current phase and saved effect result | Apply the effect, or record its existing result |
| Effect applied | Saved effect result | Record completion, or survive interruption |
| Interrupted | Saved effect result survives | Return to ready for an authorized retry |
| Done | Completion recorded | Remain done |

The safety rule is **one effect per job**. Completing a worker turn is separate from completing
the job. This example assumes the effect count is durably known, so a corrected retry can
consult it. A real remote effect may require an idempotent API or explicit reconciliation
when its outcome is uncertain.

## Run the broken model

Complete the [statechart setup](../README.md#statechart-prerequisites), then from the repository root:

```sh
example_output=$(mktemp -d)
skills/statechart/scripts/statechart examples/retry/Retry.tla \
  --config examples/retry/broken.cfg --view examples/retry/view.mjs \
  --out "$example_output/broken"
# Expected exit: 1. Read "$example_output/broken/report.md".
```

The config sets `PreventDuplicate = FALSE`. The model admits this failure path:

1. Claim the job.
2. Apply its effect.
3. Interrupt before recording completion.
4. Retry, then claim the same job.
5. Apply the effect again, breaking `AtMostOnce`.

The view preserves the effect count so the chart cannot merge the failure into an apparently
safe state. The counterexample is a hypothesis about any application you map onto this model;
reproduce it through that application's actual effect and persistence boundary.

## Check the correction

```sh
skills/statechart/scripts/statechart examples/retry/Retry.tla \
  --config examples/retry/fixed.cfg --view examples/retry/view.mjs \
  --out "$example_output/fixed"
# Expected exit: 0. Read "$example_output/fixed/report.md".
```

`PreventDuplicate = TRUE` prevents another effect when the saved count is already one.
The completion transition still permits recording that result after a retry. Both configs
check type correctness and the at-most-once rule; the fixed model should satisfy both.

This is a bounded, single-job model: at most two effects are explored. It checks no liveness
property and does not establish eventual completion, concurrency safety, external API behavior,
or atomic storage. In real code, test the interrupt after the effect, reload persisted state,
retry through the public entry point, and assert both one effect and recorded completion.
