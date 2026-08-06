/**
 * Small shared pieces: the action button, the score dial, meters, and the tracking hint.
 */

import { clamp01, percent, TRACKING_COPY } from "../../content";
import type { TrackingPrompt } from "../../contract";

export function Button({
  label,
  onClick,
  variant = "primary",
  autoFocus = false,
}: {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary" | "quiet";
  autoFocus?: boolean;
}) {
  return (
    <button
      autoFocus={autoFocus}
      className={`action action--${variant}`}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}

const RADIUS = 78;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/**
 * The score, shown as an embroidered rosette.
 *
 * Carries no pass mark and no threshold line: no visitor acceptance threshold has been
 * approved, so this is a reflection, never a verdict.
 */
export function ScoreDial({
  score,
  label,
  chinese,
}: {
  score: number;
  label: string;
  chinese: string;
}) {
  const value = clamp01(score);
  return (
    <div className="dial">
      <svg aria-hidden="true" className="dial-svg" viewBox="0 0 200 200">
        <circle className="dial-track" cx="100" cy="100" fill="none" r={RADIUS} strokeWidth="10" />
        <circle
          className="dial-value"
          cx="100"
          cy="100"
          fill="none"
          r={RADIUS}
          strokeDasharray={`${CIRCUMFERENCE * value} ${CIRCUMFERENCE}`}
          strokeLinecap="round"
          strokeWidth="10"
          transform="rotate(-90 100 100)"
        />
        {Array.from({ length: 36 }, (_, index) => {
          const angle = (index / 36) * Math.PI * 2;
          return (
            <line
              className="dial-tick"
              key={index}
              x1={100 + Math.cos(angle) * 90}
              x2={100 + Math.cos(angle) * 96}
              y1={100 + Math.sin(angle) * 90}
              y2={100 + Math.sin(angle) * 96}
            />
          );
        })}
      </svg>
      <div className="dial-centre">
        <strong>{percent(value)}</strong>
        <span className="dial-label">{label}</span>
        <span className="dial-chinese" lang="zh-Hant">
          {chinese}
        </span>
      </div>
    </div>
  );
}

export function Meter({
  label,
  value,
  tone = "gold",
}: {
  label: string;
  value: number;
  tone?: "gold" | "jade" | "cinnabar";
}) {
  const ratio = clamp01(value);
  return (
    <div className={`meter meter--${tone}`}>
      <div className="meter-head">
        <span>{label}</span>
        <strong>{percent(ratio)}</strong>
      </div>
      <div
        aria-label={label}
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={Math.round(ratio * 100)}
        className="meter-track"
        role="meter"
      >
        <span style={{ width: `${ratio * 100}%` }} />
      </div>
    </div>
  );
}

/**
 * Repositioning guidance. Always a stage direction, never a fault: the visitor is being
 * helped into frame, not corrected.
 */
export function TrackingHint({ prompt }: { prompt: TrackingPrompt }) {
  const copy = TRACKING_COPY[prompt];
  return (
    <div
      aria-live="polite"
      className={`hint ${prompt === "ready" ? "hint--ready" : "hint--act"}`}
      data-prompt={prompt}
      role="status"
    >
      <strong>{copy.title}</strong>
      <span>{copy.body}</span>
    </div>
  );
}
