# Project Tracking

This folder is the project-management and engineering record for Opera Hero.

## Core documents

- [Architecture](./ARCHITECTURE.md) — system boundaries, technology decisions, and
  deployment design.
- [Roadmap](./ROADMAP.md) — milestone order, test gates, and definitions of done.
- [Development status](./DEVELOPMENT_STATUS.md) — current stage, capability-to-code
  mapping, evidence, decisions, and blockers.
- [Scoring data pipeline](./SCORING_DATA_PIPELINE.md) — the step-by-step path from
  practitioner videos to annotated fixtures, scoring envelopes, participant
  validation, and booth-ready gesture evaluators.
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
- [M3 Fixture Extraction Increment 1](./verification/m3-fixture-extraction-1.md) —
  offline practitioner landmark extraction, edge-only stationary trimming, and
  replay provenance validation.
- [M3 Fixture Visualization Increment 2](./verification/m3-fixture-visualization-2.md)
- [M3 Practitioner Fixture Batch Increment 3](./verification/m3-fixture-batch-3.md)
- [M3 Water Sleeves Feature Foundation Increment 4](./verification/m3-water-sleeves-features-4.md)
- [M3 Water Sleeves Feature Observability Increment 5](./verification/m3-water-sleeves-observability-5.md)
- [M3 Water Sleeves Temporal Trajectory Increment 6](./verification/m3-water-sleeves-trajectory-6.md)
- [M3 Water Sleeves Reference Envelope Increment 7](./verification/m3-water-sleeves-envelope-7.md)
- [M3 Water Sleeves Temporal Evaluator Increment 8](./verification/m3-water-sleeves-evaluator-8.md)
- [M3 Water Sleeves Deterministic Regressions Increment 9](./verification/m3-water-sleeves-regressions-9.md)
- [M3 Live Water Sleeves Attempt Buffer Increment 10](./verification/m3-live-attempt-buffer-10.md)
  — local practitioner fixture loading, validation, metadata, and replay rendering.
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
- [M2 Increment 6D verification](./verification/m2-increment-6d.md) — worker
  readiness gating and clean camera-startup state transitions.
- [M2 Increment 7 verification](./verification/m2-increment-7.md) —
  aspect-preserving inference-frame sizing and physical comparison procedure.

The development status ledger is the authoritative answer to “what stage are we at?”
It must be updated alongside implementation and tests.
