/**
 * Cantonese-opera motifs, drawn as inline SVG so the booth needs no image assets and no
 * network. All decorative and `aria-hidden`.
 */

import type { Motif } from "../../content";

/** Per-gesture pictogram. Doubles as the guide placeholder's artwork. */
export function GestureGlyph({
  motif,
  className,
  playing = false,
}: {
  motif: Motif;
  className?: string;
  playing?: boolean;
}) {
  return (
    <svg
      aria-hidden="true"
      className={`${className ?? ""}${playing ? " glyph--playing" : ""}`}
      fill="none"
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
    >
      {motif === "orchid" ? (
        <>
          <path d="M38 88c0-18 4-30 12-38" stroke="currentColor" strokeLinecap="round" strokeWidth="3" />
          <path
            d="M50 50c-4-12-2-22 6-30 6 8 6 18 0 26"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="3"
          />
          <path
            d="M50 52c-10-6-18-4-24 4 8 6 17 6 24 1M50 52c10-6 19-5 25 3-8 7-18 6-25 1"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="2.6"
          />
          <circle cx="50" cy="52" fill="currentColor" r="3" />
        </>
      ) : motif === "door" ? (
        <>
          <path d="M22 18h56v68H22z" opacity="0.35" stroke="currentColor" strokeWidth="2" />
          <path d="M50 18v68" stroke="currentColor" strokeWidth="2.4" />
          <path
            d="M44 52c-3 0-5 2-5 5s2 5 5 5M56 52c3 0 5 2 5 5s-2 5-5 5"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="2.6"
          />
          <path
            d="M30 32 16 22M70 32l14-10"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="2.2"
          />
        </>
      ) : (
        <>
          <path d="M16 32c14-10 26-10 36 0" stroke="currentColor" strokeLinecap="round" strokeWidth="3" />
          <path
            d="M12 50c16 16 34 8 46-4s26-14 32-2"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="3"
          />
          <path
            d="M14 66c18 14 34 6 46-6s24-12 30-2"
            opacity="0.7"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="2.4"
          />
          <path
            d="M18 80c18 12 33 4 44-8"
            opacity="0.45"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="2"
          />
        </>
      )}
    </svg>
  );
}

/** Cloud-collar rule used to cap panels. */
export function CloudRule({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      preserveAspectRatio="none"
      viewBox="0 0 240 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4 18c22 0 26-14 48-14s26 10 46 10 24-14 46-14 26 12 46 12 22-6 46-6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
      />
    </svg>
  );
}

/** Quiet costume-embroidery motifs used around the edge of the digital stage. */
export function StageMotifs() {
  return (
    <div aria-hidden="true" className="stage-motifs">
      <svg className="stage-peony stage-peony--left" viewBox="0 0 160 160">
        <PeonyPaths />
      </svg>
      <svg className="stage-peony stage-peony--right" viewBox="0 0 160 160">
        <PeonyPaths />
      </svg>
      <svg className="stage-clouds" preserveAspectRatio="none" viewBox="0 0 1000 150">
        <path d="M5 112c55 0 55-44 110-44s55 35 110 35 55-68 110-68 55 53 110 53 55-38 110-38 55 63 110 63 55-45 110-45 55 32 110 32 55-54 110-54 55 38 110 38" />
        <path d="M0 135c70 0 70-25 140-25s70 19 140 19 70-42 140-42 70 34 140 34 70-24 140-24 70 31 140 31 70-22 140-22 70 18 140 18" />
      </svg>
      <svg className="stage-sleeve stage-sleeve--left" viewBox="0 0 180 520">
        <path d="M16 6c112 78 8 151 96 224S43 370 156 510" />
        <path d="M52 4c85 88-12 144 72 230S61 391 174 488" />
      </svg>
      <svg className="stage-sleeve stage-sleeve--right" viewBox="0 0 180 520">
        <path d="M16 6c112 78 8 151 96 224S43 370 156 510" />
        <path d="M52 4c85 88-12 144 72 230S61 391 174 488" />
      </svg>
    </div>
  );
}

function PeonyPaths() {
  return (
    <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="80" cy="80" r="9" />
      <path d="M80 70c-22-34-43-4-25 16-34-9-37 25-8 28-10 29 24 37 34 10 21 27 49 4 31-20 31-13 13-44-15-26 3-31-28-46-37-8Z" />
      <path d="M80 70c-8-31 30-33 28-2 26-15 45 18 17 34 14 25-20 44-38 20-18 23-53 4-39-21-28-16-8-49 18-34-2-29 36-28 28 3Z" opacity=".6" />
      <path d="M52 124c-16 9-25 21-30 34M108 124c18 8 28 19 34 33M37 143c8-2 15 0 21 7M123 142c-8-1-15 2-21 9" opacity=".7" />
    </g>
  );
}

/** Session progress as three stage lanterns. */
export function Lanterns({ level }: { level: number | null }) {
  return (
    <ol className="lanterns" aria-label="Progress">
      {[1, 2, 3].map((step) => {
        const state =
          level === null ? "waiting" : step < level ? "done" : step === level ? "now" : "waiting";
        return (
          <li className={`lantern lantern--${state}`} data-testid={`lantern-${step}`} key={step}>
            <span aria-hidden="true" />
            <em>{step}</em>
          </li>
        );
      })}
    </ol>
  );
}
