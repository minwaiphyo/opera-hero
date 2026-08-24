/**
 * Everything the visitor reads, in one file.
 *
 * Kept deliberately short: the booth is read at one to two metres by people who did not
 * come here to read. One idea per screen, three steps per gesture, no paragraphs.
 *
 * CULTURAL STATUS: placeholder. Per `docs/project-tracking/cultural-gameplay-scope.md`,
 * gesture names, meanings and explanations are subject to review by the practitioner and
 * Kong Chow Wui Koon. Nothing here is approved cultural content.
 */

import type { GestureId, Level, TrackingPrompt } from "./contract";

export type Motif = "orchid" | "door" | "sleeves";
export type Accent = "peony" | "jade" | "cinnabar";

export interface Gesture {
  readonly id: GestureId;
  readonly level: Level;
  readonly name: string;
  readonly chinese: string;
  readonly act: string;
  /** One line on what the movement is for. */
  readonly meaning: string;
  /** Three things to watch. Short enough to read while standing. */
  readonly steps: readonly string[];
  /** One line shown with the score. */
  readonly note: string;
  readonly motif: Motif;
  readonly accent: Accent;
}

export const GESTURES: readonly Gesture[] = [
  {
    id: "orchid-finger",
    level: 1,
    name: "Orchid Finger",
    chinese: "蘭花指",
    act: "第一幕",
    meaning: "The hand of the Dan speaks before she sings.",
    steps: [
      "Lift the hand, wrist leading",
      "Middle finger meets thumb",
      "Hold the shape still",
    ],
    note: "A small movement of the wrist carries to the back of the hall.",
    motif: "orchid",
    accent: "peony",
  },
  {
    id: "opening-door",
    level: 2,
    name: "Opening Door",
    chinese: "開門",
    act: "第二幕",
    meaning: "There is no door. The audience sees one anyway.",
    steps: [
      "Both hands rise to the latch",
      "Open outward, as if wood has weight",
      "Settle, and step through",
    ],
    note: "On a bare stage, scenery is built by the body.",
    motif: "door",
    accent: "jade",
  },
  {
    id: "water-sleeves",
    level: 3,
    name: "Water Sleeves",
    chinese: "水袖",
    act: "第三幕",
    meaning: "Silk carries feeling further than the arm can reach.",
    steps: [
      "Gather the sleeve in close",
      "Throw the arm out, wrist first",
      "Let the silk fall and settle",
    ],
    note: "Named for the way the silk ripples like water.",
    motif: "sleeves",
    accent: "cinnabar",
  },
];

export const TOTAL_LEVELS = GESTURES.length;

export const TEAM_MEMBERS = [
  {
    name: "Mani Kumar Prateek",
    course: "NUS Year 3 · Computer Science",
    linkedIn: "https://www.linkedin.com/in/prateek-abc12/",
  },
  {
    name: "Min Wai Phyo",
    course: "NUS Year 3 · Computer Science and Business Administration",
    linkedIn: "https://www.linkedin.com/in/min-wai-phyo/",
  },
  {
    name: "Stalin Muthukumar Bill Sujith Kumaar",
    course: "NUS Year 3 · Computer Science",
    linkedIn: "https://www.linkedin.com/in/bill-sujith-kumaar/",
  },
  {
    name: "Kaung Khant Minn",
    course: "NUS Year 3 · Computer Science",
    linkedIn: "https://www.linkedin.com/in/kaung-khant-minn21/",
  },
] as const;

export function gestureFor(id: GestureId): Gesture {
  const found = GESTURES.find((gesture) => gesture.id === id);
  if (!found) {
    throw new Error(`No content for gesture: ${id}`);
  }
  return found;
}

export function gestureForLevel(level: Level): Gesture {
  const found = GESTURES.find((gesture) => gesture.level === level);
  if (!found) {
    throw new Error(`No content for level: ${level}`);
  }
  return found;
}

export const COPY = {
  title: "Opera Hero",
  chineseTitle: "粵劇英雄",
  subtitle: "Interactive Cantonese Opera Game",
  invitation: "Step into the light",
  chineseInvitation: "請入場",
  intro: "Copy three movements of the Dan. Two minutes.",
  start: "Start",
  howToPlay: "How to play",
  about: "About the creators",
  aboutTitle: "Meet the creators",
  aboutAttribution: "Built for the CTRL+ Heritage Youth Symposium and Hackathon 2026",
  teamOrderCaption: "In order from left to right",
  tutorialTitle: "Learn the movements",
  tutorialSteps: [
    "Follow the distance guide, then stand still for calibration.",
    "Watch the practitioner and read the three movement cues.",
    "After the countdown, copy the full movement and hold the final posture for scoring.",
    "Review your score, then continue or try the movement again.",
  ],
  playNow: "Start playing",
  back: "Back",
  mirrorLabel: "You",
  guideLabel: "The movement",
  /** Shown in the guide frame when the local guide videos have not been built. */
  guideUnavailable: "Demonstration unavailable",
  watchLabel: "Watch, then try it",
  ready: "I'm ready",
  countdownCue: "準備",
  countdownHint: "Begin on one",
  recording: "Following your movement",
  stop: "Stop",
  next: "Next movement",
  retry: "Try again",
  finish: "Finish",
  scoreLabel: "Likeness to the guide",
  completenessLabel: "Movement completed",
  coverageLabel: "How clearly we saw you",
  supportive: "This reflects the movement we could see, not your skill.",
  completeTitle: "You took the stage",
  completeChinese: "謝幕",
  completeBody: "Three movements of Cantonese opera, performed by you.",
  privacy: "The camera guides the performance only. Nothing is recorded or stored.",
} as const;

/** Shown instead of a score when tracking was too poor to reflect anything back. */
export const UNSEEN = {
  title: "We couldn't see enough",
  chinese: "看不清楚",
  body: "Step into the light with room on both sides, and give it another go.",
} as const;

export const TRACKING_COPY: Record<TrackingPrompt, { title: string; body: string }> = {
  ready: { title: "You're in frame", body: "Stay where you are." },
  "move-closer": { title: "Come closer", body: "Until your upper body fills the circle." },
  "move-farther": { title: "Step back", body: "We need to see your arms fully out." },
  "step-into-frame": {
    title: "Step into the light",
    body: "Stand facing the screen, with room on both sides.",
  },
  "tracking-limited": { title: "Hold steady", body: "Finding you again." },
};

export const RECOVERY = {
  title: "Let's take a moment",
  chinese: "稍等片刻",
  body: "The stage needs a second to find you.",
  cameraBody: "The camera isn't available. Please ask a member of festival staff.",
  retry: "Try again",
  quit: "Start over",
} as const;

/**
 * Encouragement phrasing, not a pass mark.
 *
 * No visitor acceptance threshold has been approved, so nothing here may read as pass,
 * fail, success or failure. `content.test.ts` enforces that.
 */
export interface ScoreBand {
  readonly min: number;
  readonly label: string;
  readonly chinese: string;
  readonly body: string;
}

export const SCORE_BANDS: readonly ScoreBand[] = [
  {
    min: 0.85,
    label: "Radiant",
    chinese: "風華",
    body: "Your line and timing followed the guide closely.",
  },
  {
    min: 0.7,
    label: "Graceful",
    chinese: "秀雅",
    body: "The shape came through clearly.",
  },
  {
    min: 0.5,
    label: "Taking shape",
    chinese: "初成",
    body: "It's there. Slow down and let each position settle.",
  },
  {
    min: 0.3,
    label: "Finding the line",
    chinese: "尋徑",
    body: "You're on the path. Watch the wrists and try again.",
  },
  {
    min: 0,
    label: "First steps",
    chinese: "起步",
    body: "Every performer starts here.",
  },
];

export function bandFor(score: number): ScoreBand {
  const value = clamp01(score);
  return SCORE_BANDS.find((band) => value >= band.min) ?? SCORE_BANDS[SCORE_BANDS.length - 1]!;
}

export function finaleFor(score: number): { title: string; body: string } {
  const value = clamp01(score);
  if (value >= 0.85) {
    return {
      title: "A radiant performance",
      body: "You brought precision, rhythm and expressive stage presence to all three movements.",
    };
  }
  if (value >= 0.7) {
    return {
      title: "A graceful performance",
      body: "Your movement shapes came through clearly across the full Opera Hero journey.",
    };
  }
  if (value >= 0.5) {
    return {
      title: "Your stage presence is taking shape",
      body: "You completed all three traditions—keep refining the timing and final postures.",
    };
  }
  return {
    title: "Every performer begins with a first step",
    body: "",
  };
}

export function percent(value: number): string {
  return `${Math.round(clamp01(value) * 100)}%`;
}

export function clamp01(value: number): number {
  return Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 0;
}
