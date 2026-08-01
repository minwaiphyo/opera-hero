# Scoring Data Pipeline and Path to Exhibition

## Purpose

This document is the concise execution order from the current landmark laboratory to
the locally deployed public festival booth. It separates reference material,
synthetic tests, informal team checks, and operational release evidence so progress
cannot be overstated. The festival is approximately 14 days away; formal participant
calibration is not part of the pre-festival plan.

## Current position

- M0 is complete.
- M1 is implemented; the one-hour camera soak remains an exit-gate check.
- M2 is 97% complete: live worker inference, normalized pose and hand landmarks,
  bounded capture, diagnostics, tracking quality, and deterministic replay exist.
- Cleaned positive demonstrations exist for Orchid Finger/Flower, Opening Door, and
  Water Sleeves, performed by one practitioner.
- The footage is sufficient to begin annotation and provisional scoring. It is not
  sufficient by itself for threshold validation or a robust supervised ML model.
- Confirm whether “Lotus Finger” and “Orchid Finger/Flower” refer to the same intended
  level and record the practitioner-approved public name.

## Stage sequence

| Stage | Build | Verification and commit gate | Result |
|---|---|---|---|
| M2 closeout | Finish pending replay/startup review and camera/vision soak checks on representative hardware | Existing M2 automated suite passes; live/replay cleanup, responsiveness, latency, and memory are recorded | Stable landmark boundary |
| M3.1 annotation contract | JSON schemas and folder conventions for video metadata, attempt bounds, phases, key moments, exclusions, view, occlusion, and notes | Invalid annotations fail clearly; an Opening Door file validates | Versioned ground-truth format |
| M3.2 Opening Door annotation pilot | Human-label all usable Opening Door takes; separate factual timestamps from cultural rules | Slow and normal front takes are cross-checked; practitioner guidance is recorded where available | First phase-labelled movement |
| M3.3 landmark fixture generator | Reproducible Python extraction using pinned pose/hand models; normalized, timestamped output with source checksum and model provenance | Same input produces the same output; overlays align with video; browser replay loads fixture | Expert landmark fixtures |
| M3.4 reference alignment and feature spec | Align repeated takes within each labelled phase; define essential, important, expressive, ignored, and unreliable features | Feature plots and phase boundaries are reviewed; no raw-pixel or body-size dependency remains | Interpretable movement definition |
| M3.5 conservative augmentation | Seeded timing, coordinate-noise, constrained geometry, and tracking-dropout variants | Anatomy, phase order, essential-feature, determinism, and provenance tests pass | Stress fixtures around the reference |
| M3.6 scoring envelope | Soft per-feature membership, phase progress, temporal alignment, smoothing, hysteresis, hold, and tracking-loss policy | Expert takes score consistently; small valid perturbations degrade smoothly; unrelated and incomplete synthetic fixtures do not falsely score highly | Provisional evaluator |
| M3.7 gesture laboratory | Replay/live comparison, phase and feature evidence, progress, diagnostics, and technician tuning | A developer can explain every score from displayed evidence; replay is deterministic | Tunable scoring lab |
| M3.8 deterministic scorer verification | Test held-out practitioner takes, conservative variants, partial attempts, wrong phase order, missing phases, unrelated movement, jitter, dropout, and tracking loss | Expected outcomes are explicit; parameter changes are documented; the full suite is rerun after every change | Regression-tested provisional thresholds |
| M3.9 informal team tuning | Teammates try genuine, partial, deliberately altered, unrelated, and idle attempts at roughly 1 m and 2 m | Tune conservatively with most testers; reserve at least one teammate for a final unseen check; record limitations | Provisional festival thresholds |
| M4 | Gameplay state-machine simulator with attract, presence, calibration, tutorial, attempt, celebration, insight, completion, abandonment, and reset | Accelerated deterministic sessions cover every transition and recovery branch | Complete flow without hardware coupling |
| M5 | First vertical slice using Opening Door, live camera, evaluator, basic audiovisual feedback, and automatic reset | First-time users complete it without developer help; replay and live paths emit equivalent semantic events | End-to-end proof |
| M6 | Versioned story/content schema, scripts, subtitles, narration mapping, assets, validation, and cultural review workflow | Invalid or missing content fails the build; application remains offline-capable | Replaceable content package |
| M7 | Repeat the annotation-to-provisional-scoring pipeline for Orchid Finger/Flower and Water Sleeves; tune costume-aware fallbacks | Each movement passes deterministic and informal team checks; Water Sleeves tolerates expected hand occlusion; cultural reviewer signs off features | All three provisional evaluators |
| M8 | Final art, costume/face effects if approved, tutorials, narration, music, subtitles, transitions, and performance profiles | Full experience remains responsive and understandable at exhibition distance | Content-complete experience |
| M9 | Kiosk startup, camera presence trigger, watchdog, bounded recovery, technician diagnostics, local telemetry, offline packaging, and rollback | Reboot, browser kill, camera unplug, audio loss, walk-away, and corrupt-asset drills recover according to runbook | Unattended booth system |
| M10 | Final-hardware checks, cultural/product/privacy sign-off, content freeze, festival failure drills, and exhibition-length soak | Assisted completion prevents visitor dead ends; release candidate survives repeated sessions and 8–12 hour soak; non-developer follows recovery runbook | Festival-ready public booth |

## Festival delivery scope: agreed steps 1–9

1. Human-annotate the practitioner footage.
2. Generate normalized pose and hand landmarks.
3. Generate conservative landmark augmentations.
4. Derive practitioner reference trajectories.
5. Define phase-aware scoring envelopes.
6. Implement rule-based scoring for all three movements.
7. Test held-out practitioner takes, acceptable synthetic variants, partial and
   malformed sequences, unrelated motion, jitter, dropout, and tracking loss.
8. Run informal live team trials and conservatively adjust documented scoring
   parameters while protecting the full regression suite.
9. Integrate the provisional evaluators into the complete game flow and booth build.

Completion of these steps supports the locally deployed festival booth. Scoring
remains a provisional interaction mechanic, not a validated assessment of Cantonese
Opera proficiency. Visitor-facing design must therefore be encouraging, must not
display authoritative correctness claims, and must always provide a bounded assisted
completion path.

## Annotation ownership

Technical team members may label timestamps, visible phase boundaries, exclusions,
occlusion, and tracking quality. A practitioner or cultural reviewer must confirm
movement names, phase meaning, essential features, acceptable variation, mirroring,
and meaning-changing mistakes.

Begin with Opening Door. Do not annotate all movements until the schema and review
process work end to end on this pilot.

## Data roles

| Data | Permitted role | Must not be treated as |
|---|---|---|
| Practitioner videos | Canonical cultural reference and source for expert landmark templates | A diverse training or validation set |
| Human annotations | Phase supervision, exclusions, key moments, and movement specification | Proof that thresholds suit visitors |
| Augmented landmarks | Tolerance exploration, boundary tests, jitter/dropout tests, and optional model prototyping | Independent people or trustworthy negative examples |
| Informal teammate attempts | Pre-festival usability checks and conservative provisional tuning | Formal validation or representative population evidence |
| Future participant attempts | Optional post-festival calibration, false-accept/false-reject analysis, accessibility review, and regression fixtures | Cultural authority or a prerequisite for this festival build |
| Exhibition tests | Final hardware, costume, lighting, crowd, recovery, and soak evidence | A substitute for deterministic tests |

## Scoring envelope derivation

1. Normalize coordinates by a stable body reference such as torso length and shoulder
   width; retain confidence and view metadata.
2. Align corresponding expert phases by normalized phase progress or constrained
   temporal alignment.
3. Calculate reference trajectories for selected relative positions, joint angles,
   directions, hand shapes, and holds.
4. Use variation among real expert takes as the narrow ideal region.
5. Expand only culturally non-essential dimensions with conservative, documented
   tolerances and seeded augmentation.
6. Convert distance from the reference into smooth feature scores rather than hard
   coordinate thresholds.
7. Combine scores using phase-specific weights and essential-feature gates. Pause
   judgment during insufficient tracking.
8. Tune provisional acceptance and assisted-completion thresholds conservatively
   using deterministic tests and informal team trials; record every parameter change
   and rerun the full suite.
9. For the festival release, freeze the conservatively tuned thresholds and rely on
   positive partial-attempt and assisted-completion paths to prevent visitor failure.
   If time permits after the festival, calibrate future versions using diverse,
   consented attempts split by person.

## Model decision gate

The default is an interpretable phase-aware evaluator. Consider a landmark-sequence
ML model only in a future iteration after enough participant data exists to split
evaluation by person and only if it measurably improves real held-out outcomes
without weakening explanation, latency, offline operation, or recovery. Pixel-based
training is out of scope unless a later experiment demonstrates a necessary benefit
and receives a separate privacy review.

## Repository and privacy boundary

Do not commit practitioner or participant videos to the public repository unless
publication permission is explicit. Store originals in approved restricted storage.
Commit only approved documentation, schemas, small anonymized landmark fixtures, and
synthetic fixtures. Every derived fixture must retain a non-identifying source ID,
source checksum, extractor/model version, annotation version, and generation seed
where applicable.
