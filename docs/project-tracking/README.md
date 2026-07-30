# Project Tracking

This folder is the project-management and engineering record for Opera Hero.

## Core documents

- [Architecture](./ARCHITECTURE.md) — system boundaries, technology decisions, and
  deployment design.
- [Roadmap](./ROADMAP.md) — milestone order, test gates, and definitions of done.
- [Development status](./DEVELOPMENT_STATUS.md) — current stage, capability-to-code
  mapping, evidence, decisions, and blockers.
- [Hardware baseline](./hardware-baseline.md) — provisional exhibition hardware and
  display assumptions.
- [Cultural gameplay scope](./cultural-gameplay-scope.md) — confirmed Dan-role focus,
  three movement levels, and cultural approval gates.
- [Practitioner session plan](./practitioner-session-plan.md) — capture and interview
  plan for the proposed 1 August session.
- [M0 verification](./verification/m0-baseline.md) — completed evidence for the system
  baseline milestone.
- [M1 Increment 1 verification](./verification/m1-increment-1.md) — camera contracts,
  navigation boundary, and automated evidence.
- [M1 Increment 2 verification](./verification/m1-increment-2.md) — camera stream
  ownership, concurrency guarantees, and cleanup evidence.
- [M1 Increment 3 verification](./verification/m1-increment-3.md) — device discovery,
  local preferences, and fallback-selection evidence.
- [M1 Increment 4 verification](./verification/m1-increment-4.md) — live preview,
  lifecycle controls, diagnostics, and manual physical-camera checklist.
- [M1 Increment 5 verification](./verification/m1-increment-5.md) — positioning
  guide, aspect-ratio reporting, and bounded camera recovery.
- [M1 Increment 6 verification](./verification/m1-increment-6.md) — lifecycle
  stress coverage, live stability metrics, and the final Target A soak procedure.
- [M2 Increment 1 verification](./verification/m2-increment-1.md) — real Pose Lite
  and Hand Landmarker overlay baseline plus normalized application contracts.
- [M2 Increment 2 verification](./verification/m2-increment-2.md) — typed worker
  protocol, transferable frame ownership, and latest-frame backpressure.
- [M2 Increment 3 verification](./verification/m2-increment-3.md) — worker-owned
  MediaPipe inference, transferable live frames, and verification checklist.
- [M2 Increment 4 verification](./verification/m2-increment-4.md) — bounded live
  latency, throughput, runtime, and backpressure diagnostics.
- [M2 Increment 5 verification](./verification/m2-increment-5.md) — provisional
  visitor presence, framing, and landmark tracking-quality classification.
- [M2 Increment 6A verification](./verification/m2-increment-6a.md) — versioned,
  image-free deterministic landmark replay contract and strict validation.
- [M2 Increment 6B verification](./verification/m2-increment-6b.md) — common
  landmark-source adapter and deterministic fake-clock replay playback.
- [M2 Increment 6C verification](./verification/m2-increment-6c.md) — dedicated
  replay laboratory, shared renderer, controls, and tracking-loss fixture.

The development status ledger is the authoritative answer to “what stage are we at?”
It must be updated alongside implementation and tests.
