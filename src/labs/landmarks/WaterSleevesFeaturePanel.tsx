import { extractWaterSleevesFrameFeatures } from "../../domain/gestures/features/waterSleevesFeatures";
import type { VisionLandmarkFrame } from "../../vision/visionTypes";

export function WaterSleevesFeaturePanel({
  frame,
}: {
  frame: VisionLandmarkFrame | null;
}) {
  const features = frame ? extractWaterSleevesFrameFeatures(frame) : null;

  return (
    <section
      aria-labelledby="water-sleeves-features-title"
      className="gesture-feature-panel"
    >
      <p className="check-kicker">Scoring observability</p>
      <h2 id="water-sleeves-features-title">Water Sleeves features</h2>
      <p>
        Pose arms are required. Hand Landmarker detections are ignored because
        costume sleeves obscure the hands.
      </p>

      {!frame ? (
        <p className="feature-empty">Start the replay to inspect measurements.</p>
      ) : !features ? (
        <p className="feature-empty">
          Frame unavailable: reliable shoulders are required for body-scale
          normalization.
        </p>
      ) : (
        <>
          <dl className="gesture-feature-summary">
            <FeatureMetric
              label="Usable arms"
              value={`${features.usableArmCount}/2`}
            />
            <FeatureMetric label="Hand influence" value="none" />
            <FeatureMetric
              label="Shoulder scale"
              value={features.shoulderWidth.toFixed(3)}
            />
          </dl>
          <div className="arm-feature-grid">
            <ArmFeatures label="Left arm" arm={features.leftArm} />
            <ArmFeatures label="Right arm" arm={features.rightArm} />
          </div>
        </>
      )}
    </section>
  );
}

function ArmFeatures({
  label,
  arm,
}: {
  label: string;
  arm: NonNullable<
    ReturnType<typeof extractWaterSleevesFrameFeatures>
  >["leftArm"];
}) {
  return (
    <section aria-label={label} className="arm-feature-card">
      <h3>{label}</h3>
      {!arm ? (
        <p>Unavailable: shoulder or elbow visibility is too low.</p>
      ) : (
        <dl>
          <FeatureMetric label="Availability" value="usable" />
          <FeatureMetric
            label="Upper-arm angle"
            value={degrees(arm.upperArmAngleRad)}
          />
          <FeatureMetric
            label="Elbow position"
            value={coordinates(arm.elbowFromShoulder)}
          />
          <FeatureMetric
            label="Elbow angle"
            value={arm.elbowAngleRad === null ? "occluded" : degrees(arm.elbowAngleRad)}
          />
          <FeatureMetric
            label="Wrist position"
            value={
              arm.wristFromShoulder === null
                ? "occluded"
                : coordinates(arm.wristFromShoulder)
            }
          />
          <FeatureMetric
            label="Confidence"
            value={`${(arm.confidence * 100).toFixed(0)}%`}
          />
        </dl>
      )}
    </section>
  );
}

function FeatureMetric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function degrees(radians: number): string {
  return `${((radians * 180) / Math.PI).toFixed(1)}°`;
}

function coordinates(point: { x: number; y: number }): string {
  return `x ${point.x.toFixed(2)} · y ${point.y.toFixed(2)}`;
}
