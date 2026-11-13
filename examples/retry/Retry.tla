---- MODULE Retry ----
EXTENDS Naturals
CONSTANT PreventDuplicate
VARIABLES phase, effects
vars == <<phase, effects>>

Init == phase = "ready" /\ effects = 0
Claim == phase = "ready" /\ phase' = "running" /\ UNCHANGED effects
Apply == /\ phase = "running"
         /\ effects < 2
         /\ (~PreventDuplicate \/ effects = 0)
         /\ effects' = effects + 1
         /\ phase' = "effect-applied"
Record == phase \in {"running", "effect-applied"} /\ effects > 0 /\ phase' = "done" /\ UNCHANGED effects
Interrupt == phase \in {"running", "effect-applied"} /\ phase' = "interrupted" /\ UNCHANGED effects
Retry == phase = "interrupted" /\ phase' = "ready" /\ UNCHANGED effects
Done == phase = "done" /\ UNCHANGED vars
Next == Claim \/ Apply \/ Record \/ Interrupt \/ Retry \/ Done

Spec == Init /\ [][Next]_vars
TypeOK == phase \in {"ready", "running", "effect-applied", "interrupted", "done"} /\ effects \in 0..2
AtMostOnce == effects <= 1
====
