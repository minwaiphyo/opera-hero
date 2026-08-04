import { useMemo, useState } from "react";
import type { WaterSleevesEvaluation } from "../../domain/gestures/scoring/waterSleevesEvaluator";
import {
  analyzeWaterSleevesTuning,
  createWaterSleevesTuningObservation,
  type WaterSleevesAttemptLabel,
  type WaterSleevesTuningObservation,
} from "../../domain/gestures/tuning/waterSleevesTuning";

interface WaterSleevesTuningPanelProps {
  attemptId: string | null;
  evaluation: WaterSleevesEvaluation | null;
}

const labels: readonly WaterSleevesAttemptLabel[] = [
  "correct",
  "partial",
  "incorrect",
];

export function WaterSleevesTuningPanel({
  attemptId,
  evaluation,
}: WaterSleevesTuningPanelProps) {
  const [observations, setObservations] = useState<WaterSleevesTuningObservation[]>([]);
  const summary = useMemo(
    () => analyzeWaterSleevesTuning(observations),
    [observations],
  );
  const currentLabel = observations.find(
    (observation) => observation.attemptId === attemptId,
  )?.label;

  function record(label: WaterSleevesAttemptLabel) {
    if (!attemptId || !evaluation) return;
    const next = createWaterSleevesTuningObservation(attemptId, label, evaluation);
    setObservations((current) => [
      ...current.filter((observation) => observation.attemptId !== attemptId),
      next,
    ]);
  }

  return (
    <section className="lab-panel tuning-panel" aria-labelledby="tuning-title">
      <div className="tuning-heading">
        <div>
          <p className="eyebrow">Physical verification</p>
          <h2 id="tuning-title">Water Sleeves tuning session</h2>
        </div>
        <button
          disabled={observations.length === 0}
          onClick={() => setObservations([])}
          type="button"
        >
          Clear session
        </button>
      </div>

      <p className="tuning-protocol">
        Perform and label at least three correct and three deliberately incorrect
        attempts. Partial attempts are recorded separately. Insufficient-tracking
        attempts never influence the threshold candidate.
      </p>

      <div className="tuning-label-row">
        <span>Label the latest score:</span>
        {labels.map((label) => (
          <button
            aria-pressed={currentLabel === label}
            disabled={!evaluation || !attemptId}
            key={label}
            onClick={() => record(label)}
            type="button"
          >
            {capitalize(label)}
          </button>
        ))}
      </div>

      <div className={`tuning-decision decision-${summary.separation}`}>
        <strong>{decisionTitle(summary.separation)}</strong>
        <span>{decisionDetail(summary)}</span>
      </div>

      <div className="tuning-ranges">
        {labels.map((label) => {
          const range = summary.ranges[label];
          return (
            <div key={label}>
              <span>{capitalize(label)}</span>
              <strong>{range.count} attempts</strong>
              <small>{formatRange(range.minimum, range.maximum)}</small>
            </div>
          );
        })}
      </div>

      {observations.length > 0 && (
        <ol className="tuning-observations" aria-label="Recorded tuning attempts">
          {observations.map((observation) => (
            <li key={observation.attemptId}>
              <span>{capitalize(observation.label)}</span>
              <strong>{percent(observation.score)}</strong>
              <small>
                {percent(observation.trackingCoverage)} tracking · {observation.trackingStatus}
              </small>
            </li>
          ))}
        </ol>
      )}
      <p className="tuning-privacy">Session memory only · no video or landmark sequence retained</p>
    </section>
  );
}

function decisionTitle(separation: ReturnType<typeof analyzeWaterSleevesTuning>["separation"]) {
  if (separation === "separated") return "Observed classes separate";
  if (separation === "overlap") return "Score ranges overlap";
  return "More observations required";
}

function decisionDetail(summary: ReturnType<typeof analyzeWaterSleevesTuning>) {
  if (summary.separation === "overlap") {
    return "Do not set a threshold from this session; inspect per-signal behavior first.";
  }
  if (summary.candidateThreshold === null) {
    return "Record both correct and incorrect attempts with sufficient tracking.";
  }
  const candidate = `Candidate midpoint ${percent(summary.candidateThreshold)}.`;
  return summary.thresholdReady
    ? `${candidate} Minimum sample count reached; review before adoption.`
    : `${candidate} Collect at least three attempts per class before adoption.`;
}

function formatRange(minimum: number | null, maximum: number | null): string {
  return minimum === null || maximum === null
    ? "No usable scores"
    : `${percent(minimum)}–${percent(maximum)}`;
}

function percent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

function capitalize(value: string): string {
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}
