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

/** Session progress as three stage lanterns. */
export function Lanterns({ level }: { level: number | null }) {
  return (
    <ol className="lanterns" aria-label="Progress" data-level={level ?? 0}>
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
