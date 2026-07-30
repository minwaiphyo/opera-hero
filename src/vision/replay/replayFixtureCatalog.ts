import emptyZoneJson from "./fixtures/empty-zone.json";
import { SYNTHETIC_TRACKING_RECOVERY_FIXTURE } from "./syntheticReplayFixtures";
import type { VisionReplayFixture } from "./visionReplayTypes";
import { parseVisionReplayFixture } from "./visionReplayValidation";

export const REPLAY_FIXTURES: readonly VisionReplayFixture[] = [
  parseVisionReplayFixture(SYNTHETIC_TRACKING_RECOVERY_FIXTURE),
  parseVisionReplayFixture(emptyZoneJson),
];

export function findReplayFixture(id: string): VisionReplayFixture {
  return REPLAY_FIXTURES.find((fixture) => fixture.id === id) ??
    REPLAY_FIXTURES[0]!;
}
