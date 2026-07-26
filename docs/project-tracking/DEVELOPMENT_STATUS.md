# Opera Hero — Development Status Ledger

## Purpose

This is the authoritative record of what has actually been built.

- [ROADMAP.md](./ROADMAP.md) explains what we intend to build.
- [ARCHITECTURE.md](./ARCHITECTURE.md) explains how the system should be designed.
- This file records what currently exists and what has been verified.

Do not mark a milestone complete merely because its code was written. A milestone is
complete only when its exit gate in the roadmap passes and the evidence is linked
here.

## Current position

| Field | Current value |
|---|---|
| Active milestone | M1 — Camera laboratory |
| Milestone status | Not started |
| Latest completed milestone | M0 — Decisions and baseline |
| Current vertical slice | None |
| Exhibition readiness | 1 — Development shell runs |
| Last updated | 2026-07-24 |

### Readiness scale

| Level | Meaning |
|---|---|
| 0 | Design and planning only |
| 1 | Development shell runs |
| 2 | Camera and landmarks proven on target hardware |
| 3 | One gesture works in isolation |
| 4 | One complete vertical slice works |
| 5 | Content-complete game works |
| 6 | Kiosk recovery and deployment work |
| 7 | Exhibition release passed soak tests |

## Milestone overview

| ID | Milestone | Status | Progress | Evidence |
|---|---|---|---:|---|
| M0 | Decisions and baseline | Complete | 100% | [`verification/m0-baseline.md`](./verification/m0-baseline.md) |
| M1 | Camera laboratory | Not started | 0% | — |
| M2 | Landmark laboratory | Blocked by M1 | 0% | — |
| M3 | Gesture scoring laboratory | Blocked by M2 | 0% | — |
| M4 | Gameplay state-machine simulator | Blocked by M0 | 0% | — |
| M5 | First vertical slice | Blocked by M2–M4 | 0% | — |
| M6 | Content pipeline | Blocked by M5 | 0% | — |
| M7 | Final gestures | Blocked by M3 and cultural input | 0% | — |
| M8 | Audio and visual experience | Blocked by M5–M7 | 0% | — |
| M9 | Kiosk hardening | Blocked by M8 | 0% | — |
| M10 | Exhibition validation and freeze | Blocked by M9 | 0% | — |

Allowed status values:

- `Not started`
- `In progress`
- `Blocked`
- `Implemented — verification pending`
- `Complete`
- `Reopened`

## Capability registry

Every meaningful capability receives one row. This creates a direct map from a product
feature to its source, tests, and proof.

| Capability ID | Capability | Milestone | Status | Implementation files | Test files | Verification |
|---|---|---|---|---|---|---|
| PLAN-001 | End-to-end architecture proposal | Planning | Complete | [`ARCHITECTURE.md`](./ARCHITECTURE.md) | Review only | Architecture sections 1–16 |
| PLAN-002 | Incremental delivery roadmap | Planning | Complete | [`ROADMAP.md`](./ROADMAP.md) | Review only | Milestones M0–M10 defined |
| PLAN-003 | Development traceability ledger | Planning | Complete | [`DEVELOPMENT_STATUS.md`](./DEVELOPMENT_STATUS.md) | Review only | Ledger structure initialized |
| PLAN-004 | Dan-role cultural gameplay scope | Planning | Complete | [`cultural-gameplay-scope.md`](./cultural-gameplay-scope.md) | Stakeholder scope review | Three interactions recorded; practitioner detail pending |
| PLAN-005 | Practitioner reference-capture plan | Planning | Complete | [`practitioner-session-plan.md`](./practitioner-session-plan.md) | Session checklist review | Proposed 1 August session prepared |
| M0-001 | Strict React/TypeScript application shell | M0 | Complete | [`package.json`](../../package.json), [`src/main.tsx`](../../src/main.tsx), [`vite.config.ts`](../../vite.config.ts) | Build and type checks | EV-M0-001, EV-M0-004 |
| M0-002 | Browser capability collector | M0 | Complete | [`src/platform/capabilities.ts`](../../src/platform/capabilities.ts) | [`src/platform/capabilities.test.ts`](../../src/platform/capabilities.test.ts) | EV-M0-003 |
| M0-003 | Hardware baseline dashboard | M0 | Complete | [`src/app/App.tsx`](../../src/app/App.tsx), [`src/styles.css`](../../src/styles.css) | [`tests/e2e/baseline.spec.ts`](../../tests/e2e/baseline.spec.ts) | EV-M0-005, EV-M0-006 |
| M0-004 | Provisional target profile | M0 | Complete | [`hardware-baseline.md`](./hardware-baseline.md) | Read-only device checks | EV-M0-007–EV-M0-010 |
| M0-005 | Automated quality pipeline | M0 | Complete | [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml), [`eslint.config.js`](../../eslint.config.js), [`playwright.config.ts`](../../playwright.config.ts), [`vitest.config.ts`](../../vitest.config.ts) | Unit, build, and browser suites | EV-M0-001–EV-M0-006 |
| M0-006 | Browser API availability | M0 | Complete | [`src/app/App.tsx`](../../src/app/App.tsx) | Manual target-browser check | EV-M0-011 |
| M0-007 | Camera and audio diagnostic controls | M0 | Complete | [`src/app/HardwareChecks.tsx`](../../src/app/HardwareChecks.tsx), [`src/styles.css`](../../src/styles.css) | [`src/app/HardwareChecks.test.tsx`](../../src/app/HardwareChecks.test.tsx), [`tests/e2e/baseline.spec.ts`](../../tests/e2e/baseline.spec.ts) | EV-M0-012–EV-M0-016 |

### Registry rules

1. Assign a stable capability ID before or when implementation begins.
2. Link exact source and test files; do not link only a broad folder when narrower
   ownership is known.
3. One file may support multiple capabilities.
4. Generated build output and dependencies are not implementation files.
5. A capability cannot be `Complete` without a verification result.
6. If later work breaks a completed capability, mark it `Reopened`.
7. Remove neither failed evidence nor superseded decisions; preserve the audit trail.

## Active milestone detail

### M0 — Decisions and baseline

**Objective:** establish a reproducible project shell and measure the intended
exhibition environment.

**Status:** Complete

**Dependencies:** target hardware information

#### Work checklist

- [x] Confirm target or representative computer.
- [x] Confirm camera model.
- [x] Confirm screen resolution and orientation.
- [x] Select and pin the provisional exhibition browser.
- [x] Decide visitor start method.
- [x] Initialize strict TypeScript and Vite application.
- [x] Add linting and formatting.
- [x] Add unit-test runner.
- [x] Add Playwright smoke test.
- [x] Add CI checks.
- [x] Add build version identifier.
- [x] Build browser/hardware capability report.
- [x] Verify the production bundle makes no external requests.
- [x] Confirm required capability checks visually on Target A.
- [x] Confirm audio playback after visitor interaction.
- [x] Confirm localhost camera permission persists after Chrome restart.

#### Files

- [`package.json`](../../package.json) — pinned runtime dependencies and verification commands.
- [`src/main.tsx`](../../src/main.tsx) — React application bootstrap.
- [`src/app/App.tsx`](../../src/app/App.tsx) — M0 target profile and capability dashboard.
- [`src/platform/capabilities.ts`](../../src/platform/capabilities.ts) — browser capability collection.
- [`src/app/HardwareChecks.tsx`](../../src/app/HardwareChecks.tsx) — local camera and audio verification controls.
- [`hardware-baseline.md`](./hardware-baseline.md) — provisional hardware decisions and assumptions.

#### Tests

- [`src/platform/capabilities.test.ts`](../../src/platform/capabilities.test.ts)
- [`src/app/HardwareChecks.test.tsx`](../../src/app/HardwareChecks.test.tsx)
- [`tests/e2e/baseline.spec.ts`](../../tests/e2e/baseline.spec.ts)

#### Verification evidence

- [`verification/m0-baseline.md`](./verification/m0-baseline.md)

#### Open inputs

| Input | Owner | Status | Effect |
|---|---|---|---|
| Exhibition computer specification | Project owner | Provisional baseline recorded | Must be revisited if hardware changes |
| Camera model | Project owner | Integrated camera selected | Field of view requires M1 validation |
| Display dimensions/orientation | Project owner | Landscape laptop profile recorded | Final booth display remains provisional |
| Visitor start method | Project owner | Camera presence selected | Dwell/cooldown tuning waits for M2–M5 |
| Chrome permission persistence | Project owner + developer | Passed | EV-M0-015 |
| Audio interaction check | Project owner + developer | Passed | EV-M0-016 |
| Final booth television | Project owner | Deferred | Create Target B profile when model and dimensions are known |

#### Exit gate

See M0 in [ROADMAP.md](./ROADMAP.md). Completion evidence will be recorded here.

## Verification log

Record checks that were actually run. A command existing in `package.json` is not
evidence that it passed.

| Date | Evidence ID | Milestone | Check | Environment | Result | Artifact or notes |
|---|---|---|---|---|---|---|
| 2026-07-24 | EV-M0-001 | M0 | Strict TypeScript check | Target A / Node 24.13.1 | Passed | `npm run typecheck` |
| 2026-07-24 | EV-M0-002 | M0 | ESLint analysis | Target A / Node 24.13.1 | Passed | `npm run lint` |
| 2026-07-24 | EV-M0-003 | M0 | Capability unit suite | jsdom / Vitest 4.1.0 | Passed | 2 tests |
| 2026-07-24 | EV-M0-004 | M0 | Production build | Target A / Vite 8.0.13 | Passed | Compiled bundle in `dist/` |
| 2026-07-24 | EV-M0-005 | M0 | Chrome smoke test | Chrome 150 / Target A | Passed | 1 Playwright test |
| 2026-07-24 | EV-M0-006 | M0 | External-request guard | Chrome 150 / Target A | Passed | No non-loopback request |
| 2026-07-24 | EV-M0-007–010 | M0 | Read-only device baseline | Target A | Passed | See verification report |
| 2026-07-24 | EV-M0-011 | M0 | Visual browser capability review | Chrome 150 / Target A | Passed | Project owner confirmed all 8 capability cards green |
| 2026-07-24 | EV-M0-012 | M0 | Camera diagnostic lifecycle suite | jsdom / Vitest 4.1.0 | Passed | Start, explicit stop, unmount cleanup, and permission denial covered |
| 2026-07-24 | EV-M0-013–016 | M0 | Physical camera, permission, and audio checks | Chrome 150 / Target A | Passed | Project-owner confirmation |
| 2026-07-24 | EV-M0-017 | M0 | Provisional display decision | Target A | Passed | Laptop selected; television deferred |

Recommended evidence ID format: `EV-M2-001`.

Examples of valid evidence:

- test command and summarized result;
- target-device latency report;
- Playwright trace or screenshot;
- fixture names used for gesture regression;
- soak-test duration and observed resource bounds;
- recovery-drill checklist;
- cultural review approval;
- release checksum and version.

## Decision log

Use this table for small decisions. Create a full ADR under `docs/adr/` when the
decision affects multiple modules, changes deployment, is costly to reverse, or needs
substantial trade-off reasoning.

| Date | Decision ID | Milestone | Decision | Reason | Related files |
|---|---|---|---|---|---|
| 2026-07-24 | DEC-001 | Planning | Use incremental, exit-gated delivery | Prevent late integration failure | [`ROADMAP.md`](./ROADMAP.md) |
| 2026-07-24 | DEC-002 | Planning | Maintain one authoritative status ledger | Preserve capability-to-code traceability | [`DEVELOPMENT_STATUS.md`](./DEVELOPMENT_STATUS.md) |
| 2026-07-24 | DEC-003 | M0 | Use Google Chrome as provisional kiosk browser | Already installed, Chromium API support, predictable Windows kiosk mode | [`hardware-baseline.md`](./hardware-baseline.md) |
| 2026-07-24 | DEC-004 | M0 | Use sustained camera presence to enter welcome | Supports unmanned operation while limiting false starts | [`hardware-baseline.md`](./hardware-baseline.md) |
| 2026-07-24 | DEC-005 | M0 | Treat the laptop and integrated camera as Target A | Allows incremental hardware validation now | [`hardware-baseline.md`](./hardware-baseline.md) |
| 2026-07-26 | DEC-006 | Planning | Focus the experience on the female Dan role | Stakeholder direction narrows cultural and technical scope | [`cultural-gameplay-scope.md`](./cultural-gameplay-scope.md) |
| 2026-07-26 | DEC-007 | Planning | Use Lotus Finger, door-opening actions, and water sleeves as the three interactions | Stakeholder-selected movement progression | [`cultural-gameplay-scope.md`](./cultural-gameplay-scope.md) |
| 2026-07-26 | DEC-008 | Planning | Treat practitioner footage as canonical reference, not a sufficient training dataset | One expert reference does not represent visitor variation | [`practitioner-session-plan.md`](./practitioner-session-plan.md) |

Recommended decision ID format: `DEC-###`.

## Known issues and blockers

| Issue ID | First seen | Milestone | Severity | Status | Description | Related files |
|---|---|---|---|---|---|---|
| — | — | — | — | — | None recorded | — |

Recommended issue ID format: `ISS-M2-001`.

Severity:

- `S1`: prevents exhibition operation or risks privacy/cultural harm;
- `S2`: blocks a milestone or major user path;
- `S3`: degraded behavior with a working recovery;
- `S4`: minor polish or maintainability issue.

## Cultural and content approvals

Technical completion does not imply cultural approval.

| Content ID | Item | Draft source | Reviewer | Status | Approved artifact |
|---|---|---|---|---|---|
| — | Story | Not supplied | Not assigned | Pending | — |
| ROLE-DAN | Female Dan role focus | Organisers / Kong Chow Wui Koon stakeholder consultation | Master Aw Yeong Peng Mun proposed | Under review | [`cultural-gameplay-scope.md`](./cultural-gameplay-scope.md) |
| GESTURE-01 | The Lotus Finger | Stakeholder-selected | Master Aw Yeong Peng Mun proposed | Under review | [`cultural-gameplay-scope.md`](./cultural-gameplay-scope.md) |
| GESTURE-02 | Actions to open the door | Stakeholder-selected | Master Aw Yeong Peng Mun proposed | Under review | [`cultural-gameplay-scope.md`](./cultural-gameplay-scope.md) |
| GESTURE-03 | The water sleeves | Stakeholder-selected | Master Aw Yeong Peng Mun proposed | Under review | [`cultural-gameplay-scope.md`](./cultural-gameplay-scope.md) |
| COSTUME-01 | Physical Dan-role costume and water sleeves | Stakeholder rental offer | Master Aw Yeong Peng Mun proposed | Under review | [`cultural-gameplay-scope.md`](./cultural-gameplay-scope.md) |
| — | Narration and pronunciation | Not supplied | Not assigned | Pending | — |

Allowed approval values:

- `Pending`
- `Draft`
- `Under review`
- `Approved`
- `Changes requested`
- `Superseded`

## Release history

| Version | Date | Commit | Highest completed milestone | Target | Verification | Notes |
|---|---|---|---|---|---|---|
| — | — | — | None | — | — | No release built |

## Update protocol

Whenever implementation work is performed:

1. Set the relevant milestone to `In progress`.
2. Add or update capability-registry rows.
3. Add exact implementation and test-file links.
4. Run the appropriate verification.
5. Add the result to the verification log.
6. Record new decisions, blockers, and cultural dependencies.
7. Mark the capability complete only if its checks pass.
8. Mark the milestone complete only if every exit-gate condition passes.
9. Update `Current position` and `Last updated`.
10. Include the status-ledger changes in the same review/commit as the capability.

When a file is renamed, update its links here in the same change. When a test fails,
record the issue rather than silently leaving the previous verification looking
current.

## Status update template

Copy this section into the active milestone when starting a new capability:

```markdown
### CAPABILITY-ID — Short capability name

**Status:** In progress

**Purpose:** One sentence describing user or engineering value.

**Implementation**

- `path/to/source.ts` — responsibility

**Tests**

- `path/to/source.test.ts` — behavior covered

**Verification**

- Evidence ID:
- Environment:
- Command or procedure:
- Result:

**Known limitations**

- None, or explicit limitations.

**Next dependency**

- The next capability this unblocks.
```

## Git traceability convention

When Git commits begin, use the capability or milestone ID in commit subjects where
practical:

```text
M1: add camera lifecycle service
M1: handle device removal and bounded retry
M3: add raise-hand temporal evaluator
M5: connect one-gesture vertical slice
```

The ledger is the product-level source of truth; Git is the detailed change history.
Neither replaces the other.
