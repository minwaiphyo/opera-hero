# Opera Hero

An immersive Cantonese Opera rhythm-action experience for CTRL+HERITAGE 2026.

This repository is currently in the system-design phase. The proposed proof-of-concept
architecture, exhibition operating model, gesture scoring strategy, and delivery plan
are documented in [ARCHITECTURE.md](./docs/project-tracking/ARCHITECTURE.md).

## Try the game

```bash
npm install
npm run dev
```

Open the printed `http://127.0.0.1:5173` URL in **Google Chrome** and allow camera
access when prompted. The root URL is the game itself — no extra route or flag needed.
The pose/hand models and the three practitioner guide clips are committed to this repo,
so a fresh checkout has everything it needs; nothing downloads at runtime.

Chrome is recommended because MediaPipe's GPU-accelerated inference path is most
reliable there. Other browsers, or a laptop with only integrated graphics, may silently
fall back to a much slower CPU path — the game still works, but tracking will lag. To
check which path a given machine landed on, open the browser devtools console: on
startup the vision worker logs `delegate=GPU` or `delegate=CPU`. You can also visit
`/baseline` for a plain capability report (WebGL2, WebGPU, Web Worker, etc.) on that
machine.

Implementation is deliberately incremental. See [ROADMAP.md](./docs/project-tracking/ROADMAP.md) for the
module boundaries, build order, test gates, and definition of done for each milestone.

Current implementation progress is tracked in [DEVELOPMENT_STATUS.md](./docs/project-tracking/DEVELOPMENT_STATUS.md).
This ledger maps every completed capability to its source files, tests, verification
evidence, and relevant decisions.

## Product constraints

- One approximately two-minute story level
- One visitor at a time
- Two or three intentionally lenient upper-body/hand gestures
- Fully offline, unmanned exhibition operation
- No accounts, cloud services, database, or leaderboard
- Participation and cultural engagement over strict motion accuracy

## Recommended implementation

The proposed implementation is an offline TypeScript web application running in a
managed Chromium kiosk. MediaPipe Tasks performs pose and hand landmark inference in
a Web Worker; an explicit gameplay state machine drives narration, tutorials,
gesture windows, cultural insights, recovery, and automatic reset.

See [ARCHITECTURE.md](./docs/project-tracking/ARCHITECTURE.md) for the reasoning and trade-offs.
