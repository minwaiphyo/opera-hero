# Cultural Gameplay Scope

## Status

Stakeholder-directed scope received on 2026-07-26 following consultation between the
CTRL+HERITAGE organisers and Kong Chow Wui Koon.

Technical implementation does not constitute cultural approval. Gesture names,
meanings, demonstrations, scoring features, narration, and visual presentation remain
subject to practitioner review.

## Character focus

Opera Hero will focus on the female **Dan** role in Cantonese Opera.

This replaces the earlier open-ended assumption of an unspecified character role. The
narrower scope should make the story, movement vocabulary, costume presentation, and
cultural explanations more coherent.

## Gameplay levels

| Level | Working interaction | Cultural status | Technical status |
|---|---|---|---|
| 1 | Orchid Finger | Stakeholder-selected; practitioner explanation pending | Not implemented |
| 2 | Actions to open the door | Stakeholder-selected; exact movement sequence pending | Not implemented |
| 3 | The water sleeves | Stakeholder-selected; costume and movement constraints pending | Not implemented |

“Level” currently means one gesture-based story beat inside the approximately
two-minute experience. It does not imply separate menus, difficulty progression,
failure states, or long standalone levels.

## Practitioner access

The organisers indicated that Kong Chow Wui Koon can arrange a session with
**Master Aw Yeong Peng Mun**, described by the organisers as a well-known teacher and
Singaporean disciple of Cantonese Opera master Hung Sin Nui.

Proposed session:

- Date: Saturday, 1 August 2026
- Time: 9:00–10:30 AM
- Location: clan association; exact address and room pending
- Purpose: practitioner demonstration, cultural explanation, and reference capture

Availability and final logistics must be confirmed by the project team with the
organisers.

## Costume direction

The stakeholders may be able to rent physical opera costumes for visitors to wear at
the exhibition.

This creates two presentation layers:

1. **Physical costume experience** — authentic garments worn by visitors.
2. **Digital effects** — supportive theatrical effects, framing, particles, makeup,
   or instructional overlays.

Digital overlays should complement rather than inaccurately replace or obscure the
physical costume. Water-sleeve detection must be tested both with and without the
rented costume because long fabric may hide wrists and hands from the camera.

## Model and scoring implications

Practitioner footage is the **canonical cultural reference**, not automatically a
sufficient machine-learning training dataset.

For three gestures, the recommended first implementation remains:

1. Detect pose and hand landmarks.
2. Break each movement into practitioner-approved phases.
3. Identify essential versus expressive features.
4. Score broad spatial and temporal relationships.
5. Accept genuine partial effort.
6. Validate with ordinary visitors.
7. Introduce a trained temporal model only if rule-based scoring cannot achieve
   reliable, inclusive behavior.

A single expert demonstrates ideal form but does not represent different heights,
beginners, reduced ranges of motion, mirroring, clothing, skin tones, movement speeds,
camera distances, lighting, or visitors wearing the rented costume.

If training becomes necessary, collect a separate, consented, diverse participant
dataset after the practitioner has defined what counts as culturally meaningful.

## Questions requiring practitioner guidance

For every movement:

- What is the correct Cantonese and English name?
- What does the movement communicate in performance?
- In what dramatic situation is it used?
- What are the start, transition, and finishing positions?
- Which arm, wrist, finger, gaze, posture, and timing details are essential?
- Which details are stylistic and should not affect visitor success?
- May the movement be mirrored?
- What beginner variation remains recognizable and respectful?
- What common imitation would change the meaning or become inappropriate?
- What should the tutorial emphasize?
- What can be explained accurately in a 3–6 second cultural overlay?

Additional water-sleeve questions:

- Is the important signal the arm path, wrist action, fabric path, final pose, or a
  combination?
- Which sleeve action is safe for beginners in a public booth?
- How much clear space is required?
- Does the intended costume fit a wide range of visitors?
- Will fabric conceal landmarks enough to require arm-only scoring?

## Cultural approval gates

Before content freeze, obtain explicit review of:

- role description;
- gesture names and meanings;
- tutorial demonstrations;
- scoring features described in human terms;
- narration and subtitles;
- insight text;
- costume handling and presentation;
- any face, makeup, or costume-related digital effects.
