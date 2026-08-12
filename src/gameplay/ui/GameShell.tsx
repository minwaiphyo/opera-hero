/**
 * The game shell: chrome and the screen for the current state.
 *
 * Renders one view model and emits actions. Owns no timers, no camera access and no
 * scoring.
 *
 * The shell carries no links away from the game. The milestone dashboard and the
 * laboratories are development surfaces: they remain reachable by URL for the people
 * building the booth, but nothing on the visitor's stage advertises them.
 */

import type { ReactNode } from "react";
import { COPY, gestureFor, TOTAL_LEVELS } from "../content";
import type { GameActions, GameView } from "../contract";
import { Lanterns } from "./components/Ornaments";
import {
  AttractScreen,
  CompleteScreen,
  LearnScreen,
  PerformScreen,
  RecoveryScreen,
  ResultScreen,
  TutorialScreen,
} from "./screens";

export type GameShellProps = {
  view: GameView;
  actions: GameActions;
  /** The visitor's live image, supplied by the runtime. The UI never reads frames. */
  cameraStage: ReactNode;
  /** Optional status readout, shown next to the navigation. */
  status?: ReactNode;
};

export function GameShell({ view, actions, cameraStage, status }: GameShellProps) {
  const gesture = view.gestureId ? gestureFor(view.gestureId) : null;

  return (
    <div className="opera-game" data-screen={view.screen}>
      <div aria-hidden="true" className="stage-glow" />

      <header className="game-bar">
        <div className="game-bar-right">
          {status}
          {view.level !== null ? <Lanterns level={view.level} /> : null}
          <p className="game-mark">
            <span lang="zh-Hant">粵劇英雄</span>
            <em>{COPY.title}</em>
          </p>
        </div>
      </header>

      <main className="game-main" key={view.screen}>
        {renderScreen(view, actions, gesture, cameraStage)}
        {view.autoAdvance !== null ? (
          <div aria-hidden="true" className="dwell" data-testid="dwell">
            <span style={{ width: `${Math.round(view.autoAdvance * 100)}%` }} />
          </div>
        ) : null}
      </main>
    </div>
  );
}

function renderScreen(
  view: GameView,
  actions: GameActions,
  gesture: ReturnType<typeof gestureFor> | null,
  cameraStage: ReactNode,
) {
  // Screens that need a gesture but have none are a runtime inconsistency: show the calm
  // recovery surface rather than a blank stage.
  const recovery = (
    <RecoveryScreen
      cameraStage={cameraStage}
      message={view.message}
      onQuit={actions.quit}
      onRetry={actions.next}
      prompt={view.trackingPrompt}
    />
  );

  switch (view.screen) {
    case "attract":
      return (
        <AttractScreen
          cameraStage={cameraStage}
          onStart={actions.start}
          onTutorial={actions.tutorial}
        />
      );

    case "tutorial":
      // The tutorial is not a session: `next` begins the game, `quit` returns to the menu.
      return <TutorialScreen onBack={actions.quit} onStart={actions.next} />;

    case "learn":
      return gesture ? (
        <LearnScreen
          attemptKey={view.attemptKey}
          cameraStage={cameraStage}
          gesture={gesture}
          onReady={actions.next}
          prompt={view.trackingPrompt}
        />
      ) : (
        recovery
      );

    case "countdown":
    case "attempt":
      return gesture ? (
        <PerformScreen
          cameraStage={cameraStage}
          gesture={gesture}
          onStop={actions.quit}
          view={view}
        />
      ) : (
        recovery
      );

    case "result":
      return gesture ? (
        <ResultScreen
          cameraStage={cameraStage}
          gesture={gesture}
          lastLevel={view.level === TOTAL_LEVELS}
          onNext={actions.next}
          onRetry={actions.retry}
          score={view.score}
        />
      ) : (
        recovery
      );

    case "complete":
      return <CompleteScreen onFinish={actions.next} />;

    case "recovery":
      return recovery;

    default:
      return recovery;
  }
}
