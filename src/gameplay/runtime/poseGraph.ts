/**
 * Drawing topology for the visitor overlay.
 *
 * Index pairs follow the MediaPipe pose (33 point) and hand (21 point) layouts. Rendering
 * constants only — no scoring, no feature extraction.
 */

export type Connection = readonly [number, number];

/** Torso and legs: the calm, structural part of the figure. */
export const BODY: readonly Connection[] = [
  [11, 12],
  [11, 23],
  [12, 24],
  [23, 24],
  [23, 25],
  [25, 27],
  [24, 26],
  [26, 28],
];

/** Arms: the expressive part, drawn brighter. */
export const ARMS: readonly Connection[] = [
  [11, 13],
  [13, 15],
  [12, 14],
  [14, 16],
];

export const HAND: readonly Connection[] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [0, 5],
  [5, 6],
  [6, 7],
  [7, 8],
  [5, 9],
  [9, 10],
  [10, 11],
  [11, 12],
  [9, 13],
  [13, 14],
  [14, 15],
  [15, 16],
  [13, 17],
  [17, 18],
  [18, 19],
  [19, 20],
  [0, 17],
];

/** Landmarks drawn as joints, so the visitor can see the tracker following them. */
export const JOINTS = [11, 12, 13, 14, 15, 16] as const;

/** Thumb and fingertips. Marked so the orchid shape is readable at two metres. */
export const FINGERTIPS = [4, 8, 12, 16, 20] as const;
