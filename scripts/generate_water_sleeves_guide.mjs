import { readFile, writeFile } from "node:fs/promises";

const input = new URL(
  "../local-artifacts/landmark-fixtures/water-sleeves-front-with-sleeves.fixture.json",
  import.meta.url,
);
const output = new URL(
  "../src/domain/gestures/references/waterSleeves.guide.json",
  import.meta.url,
);
const source = JSON.parse(await readFile(input, "utf8"));
const pointCount = 41;
const lastIndex = source.frames.length - 1;
const frames = Array.from({ length: pointCount }, (_, index) => {
  const sourceFrame = source.frames[Math.round((index / (pointCount - 1)) * lastIndex)];
  return {
    offsetMs: Math.round((index / (pointCount - 1)) * 7700),
    pose: sourceFrame.pose
      ? {
          landmarks: sourceFrame.pose.landmarks,
          worldLandmarks: sourceFrame.pose.worldLandmarks,
        }
      : undefined,
    hands: [],
  };
});

const guide = {
  schemaVersion: 1,
  id: "water-sleeves-practitioner-guide",
  description: "Compact pose-only Water Sleeves practitioner guide.",
  source: "practitioner-reference",
  containsRecordedImagery: false,
  frames,
};

await writeFile(output, `${JSON.stringify(guide)}\n`, "utf8");
console.log(`Wrote ${frames.length} pose-only guide frames.`);
