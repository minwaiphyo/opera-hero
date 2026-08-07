/**
 * Build the visitor-facing practitioner guide videos.
 *
 * The game shows the visitor the movement they are about to be scored against. That is
 * only true if the clip on screen is the same take, and the same window, the scoring
 * reference was derived from — otherwise the booth teaches one performance and grades
 * another.
 *
 * So nothing here is chosen by eye:
 *
 *   which clip   `scripts/landmark_fixtures/practitioner_fixture_manifest.json` names the
 *                primary fixture per gesture, and `scripts/generate_*_guide.mjs` names
 *                which of those fixtures became the committed reference guide.
 *   which window the fixture extractor trims leading and trailing stillness, so the
 *                retained length is the committed guide's own duration. This script reads
 *                that duration out of the guide JSON rather than restating it, which is
 *                also why the frontend never hard-codes a gesture duration.
 *
 * If the scoring owner regenerates a reference from a different take or a different trim,
 * this script fails loudly instead of quietly serving the old footage.
 *
 * Output is 16:9, uncropped. A tighter crop would show the practitioner larger, but
 * Opening Door and Water Sleeves both reach within a few percent of the frame edge and a
 * clipped sleeve is a clipped movement.
 *
 * ── Usage ─────────────────────────────────────────────────────────────────────
 *   node scripts/build_practitioner_guides.mjs [--force]
 *
 * Needs ffmpeg on PATH and the cleaned practitioner footage under
 * `docs/practitioner-footage/` (both are local development material; neither the
 * footage nor the generated `public/guides/` is committed, exactly as with the
 * MediaPipe runtime files under `public/mediapipe/`).
 * ──────────────────────────────────────────────────────────────────────────────
 */

import { spawnSync } from "node:child_process";
import { mkdir, readFile, access } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const root = new URL("../", import.meta.url);
const force = process.argv.includes("--force");

/**
 * `input` and `fixtureId` come from the fixture manifest. `startMs` is 0 for all three:
 * the practitioner begins moving immediately in every primary take, so the extractor's
 * edge trim only ever removed a tail.
 */
const GUIDES = [
  {
    gestureId: "orchid-finger",
    fixtureId: "orchid-finger-normal-take-1",
    input: "docs/practitioner-footage/cleaned/OrchidFinger/OrchidFlowerNormalPaceTake1.mp4",
    guide: "src/domain/gestures/references/orchidFinger.guide.json",
    startMs: 0,
  },
  {
    gestureId: "opening-door",
    fixtureId: "opening-door-normal-take-1",
    input: "docs/practitioner-footage/cleaned/OpeningDoor/OpeningDoorNormalPaceTake1.mp4",
    guide: "src/domain/gestures/references/openingDoor.guide.json",
    startMs: 0,
  },
  {
    gestureId: "water-sleeves",
    fixtureId: "water-sleeves-front-with-sleeves",
    input: "docs/practitioner-footage/cleaned/WaterSleeves/WaterSleevesZoomedOutNormalPace.mp4",
    guide: "src/domain/gestures/references/waterSleeves.guide.json",
    startMs: 0,
  },
];

const OUTPUT_DIRECTORY = "public/guides";
const OUTPUT_HEIGHT = 720;

async function main() {
  requireFfmpeg();
  await mkdir(path(OUTPUT_DIRECTORY), { recursive: true });

  for (const guide of GUIDES) {
    const durationMs = await referenceDurationMs(guide);
    const video = `${OUTPUT_DIRECTORY}/${guide.gestureId}.mp4`;
    const poster = `${OUTPUT_DIRECTORY}/${guide.gestureId}.jpg`;

    if (!force && (await exists(video)) && (await exists(poster))) {
      console.log(`· ${guide.gestureId}: already built (pass --force to rebuild)`);
      continue;
    }

    await requireInput(guide);
    encodeVideo(guide, durationMs, video);
    encodePoster(guide, poster);
    console.log(
      `✓ ${guide.gestureId}: ${durationMs} ms from ${guide.fixtureId} → ${video}`,
    );
  }

  console.log(
    "\nGuides are generated development output and are not committed. Rebuild them on any\n" +
      "machine that runs the booth, and after any change to the committed reference guides.",
  );
}

/**
 * The length of the movement, taken from the committed reference the evaluator scores
 * against. This is the one number the guide video and the capture policy must agree on.
 */
async function referenceDurationMs(guide) {
  const reference = JSON.parse(await readFile(path(guide.guide), "utf8"));
  const durationMs = reference.frames?.at(-1)?.offsetMs;
  if (!Number.isFinite(durationMs) || durationMs <= 0) {
    throw new Error(`${guide.guide} has no usable frame timeline.`);
  }
  return durationMs;
}

function encodeVideo(guide, durationMs, output) {
  run("ffmpeg", [
    "-v", "error",
    "-y",
    "-ss", seconds(guide.startMs),
    "-i", path(guide.input),
    "-t", seconds(durationMs),
    // No audio: the guide loops silently beside the visitor's own image, and a muted
    // track is the only thing browsers will autoplay anyway.
    "-an",
    "-vf", `scale=-2:${OUTPUT_HEIGHT}:flags=lanczos`,
    "-c:v", "libx264",
    "-profile:v", "high",
    "-preset", "slow",
    "-crf", "22",
    "-pix_fmt", "yuv420p",
    // The booth loads this from disk on a cold start; keep the moov atom first.
    "-movflags", "+faststart",
    path(output),
  ]);
}

/** First frame, so the frame is never empty while the video decodes. */
function encodePoster(guide, output) {
  run("ffmpeg", [
    "-v", "error",
    "-y",
    "-ss", seconds(guide.startMs),
    "-i", path(guide.input),
    "-frames:v", "1",
    "-vf", `scale=-2:${OUTPUT_HEIGHT}:flags=lanczos`,
    "-q:v", "4",
    path(output),
  ]);
}

function requireFfmpeg() {
  const probe = spawnSync("ffmpeg", ["-version"], { stdio: "ignore" });
  if (probe.error) {
    fail(
      "ffmpeg is not on PATH.",
      "Install it (macOS: brew install ffmpeg, Windows: winget install Gyan.FFmpeg) and run this again.",
    );
  }
}

async function requireInput(guide) {
  if (await exists(guide.input)) {
    return;
  }
  fail(
    `Missing practitioner footage for ${guide.gestureId}:`,
    `  ${guide.input}`,
    "",
    "The cleaned footage is restricted local material and is not in the repository.",
    "Copy it from approved storage into docs/practitioner-footage/ and run this again.",
  );
}

function run(command, args) {
  const result = spawnSync(command, args, { stdio: ["ignore", "inherit", "inherit"] });
  if (result.status !== 0) {
    fail(`${command} failed with status ${result.status}.`);
  }
}

function seconds(milliseconds) {
  return (milliseconds / 1000).toFixed(3);
}

function path(relative) {
  return fileURLToPath(new URL(relative, root));
}

async function exists(relative) {
  try {
    await access(path(relative));
    return true;
  } catch {
    return false;
  }
}

function fail(...lines) {
  console.error(`\n${lines.join("\n")}\n`);
  process.exit(1);
}

await main();
