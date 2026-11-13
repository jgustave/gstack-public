export const title = "Retry after an interrupted effect";
export const state = (v) => `${v.phase}: ${v.effects} effect(s)`;
export const step = (action) => ({
  Claim: "claim the job",
  Apply: "apply the effect",
  Record: "record completion",
  Interrupt: "worker is interrupted",
  Retry: "retry the same job",
  Done: "remain complete",
}[action] ?? action);
