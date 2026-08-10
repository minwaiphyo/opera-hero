import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  GAME_SCREENS,
  INITIAL_VIEW,
  type GameActions,
  type GameScore,
  type GameView,
} from "../contract";
import { GameShell } from "./GameShell";

afterEach(cleanup);

function view(overrides: Partial<GameView> = {}): GameView {
  return { ...INITIAL_VIEW, ...overrides };
}

function stubActions(): GameActions {
  return {
    tutorial: vi.fn(),
    start: vi.fn(),
    next: vi.fn(),
    retry: vi.fn(),
    quit: vi.fn(),
  };
}

function renderShell(current: GameView, actions: GameActions = stubActions()) {
  render(
    <GameShell
      actions={actions}
      cameraStage={<div data-testid="camera-stage" />}
      view={current}
    />,
  );
  return actions;
}

const level1 = { level: 1 as const, gestureId: "orchid-finger" as const };

const goodScore: GameScore = {
  overallScore: 0.82,
  movementCompleteness: 0.9,
  trackingCoverage: 0.95,
  trackingStatus: "good",
};

describe("GameShell", () => {
  it("renders every screen in the contract", () => {
    for (const gameScreen of GAME_SCREENS) {
      renderShell(
        view({
          ...level1,
          screen: gameScreen,
          countdownSeconds: gameScreen === "countdown" ? 3 : null,
          score: gameScreen === "result" ? goodScore : null,
        }),
      );
      expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
      cleanup();
    }
  });

  /**
   * The stage advertises nothing but the game. The dashboard and the laboratories are
   * development surfaces, reachable by URL only — no link on any screen leads to them.
   */
  it("offers no links away from the game on any screen", () => {
    for (const gameScreen of GAME_SCREENS) {
      renderShell(
        view({
          ...level1,
          screen: gameScreen,
          countdownSeconds: gameScreen === "countdown" ? 3 : null,
          score: gameScreen === "result" ? goodScore : null,
        }),
      );
      expect(screen.queryAllByRole("link")).toHaveLength(0);
      cleanup();
    }
  });

  /**
   * The mirror is what tells somebody the stage is awake and where to stand. It stops
   * earning its place where performing is not happening: on the tutorial the visitor
   * watches the guides, and on the score and the curtain call watching yourself competes
   * with what the screen is actually for.
   */
  it("shows the visitor their own image while there is still performing to do", () => {
    const withoutMirror = new Set(["tutorial", "result", "complete"]);

    for (const gameScreen of GAME_SCREENS) {
      renderShell(view({ ...level1, screen: gameScreen, score: goodScore }));
      if (withoutMirror.has(gameScreen)) {
        expect(screen.queryByTestId("camera-stage")).toBeNull();
      } else {
        expect(screen.getByTestId("camera-stage")).toBeInTheDocument();
      }
      cleanup();
    }
  });

  it("keeps the mirror when it could not see the visitor, who needs their framing", () => {
    renderShell(view({ ...level1, screen: "result", score: null }));

    expect(screen.getByText(/We couldn't see enough/)).toBeInTheDocument();
    expect(screen.getByTestId("camera-stage")).toBeInTheDocument();
  });

  it("starts a session from the attract screen", () => {
    const actions = renderShell(view({ screen: "attract" }));
    fireEvent.click(screen.getByRole("button", { name: "Start" }));
    expect(actions.start).toHaveBeenCalledOnce();
  });

  it("offers the tutorial from the attract screen", () => {
    const actions = renderShell(view({ screen: "attract" }));
    fireEvent.click(screen.getByRole("button", { name: "How to play" }));
    expect(actions.tutorial).toHaveBeenCalledOnce();
  });

  it("previews all three movements on the tutorial screen", () => {
    renderShell(view({ screen: "tutorial" }));

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Learn the movements",
    );
    for (const name of ["Orchid Finger", "Opening Door", "Water Sleeves"]) {
      // The heading's accessible name pairs the English name with the Chinese.
      expect(
        screen.getByRole("heading", { level: 2, name: new RegExp(name) }),
      ).toBeInTheDocument();
      expect(screen.getByLabelText(`${name} demonstration`)).toBeInTheDocument();
    }
  });

  it("begins the game or returns to the menu from the tutorial", () => {
    const actions = renderShell(view({ screen: "tutorial" }));

    fireEvent.click(screen.getByRole("button", { name: "Start playing" }));
    expect(actions.next).toHaveBeenCalledOnce();

    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    expect(actions.quit).toHaveBeenCalledOnce();
  });

  it("shows the movement, its steps and the guide while learning", () => {
    const actions = renderShell(view({ ...level1, screen: "learn" }));

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Orchid Finger");
    expect(screen.getByText("Middle finger meets thumb")).toBeInTheDocument();
    expect(screen.getByLabelText("Orchid Finger demonstration")).toHaveAttribute(
      "src",
      "/guides/orchid-finger.mp4",
    );

    fireEvent.click(screen.getByRole("button", { name: /I'm ready/ }));
    expect(actions.next).toHaveBeenCalledOnce();
  });

  it("shows guide, mirror and countdown together before an attempt", () => {
    renderShell(view({ ...level1, screen: "countdown", countdownSeconds: 3 }));

    expect(screen.getByTestId("camera-stage")).toBeInTheDocument();
    expect(within(screen.getByTestId("countdown")).getByText("3")).toBeInTheDocument();
    expect(screen.getByLabelText("Orchid Finger demonstration")).toBeInTheDocument();
  });

  it("marks the attempt as being followed", () => {
    const actions = renderShell(view({ ...level1, screen: "attempt" }));

    expect(screen.getByText(/Following your movement/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Stop" }));
    expect(actions.quit).toHaveBeenCalledOnce();
  });

  it("presents a score as supportive feedback, with no pass mark", () => {
    const actions = renderShell(view({ ...level1, screen: "result", score: goodScore }));

    expect(screen.getByText("82%")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Graceful");
    expect(screen.getByRole("meter", { name: /Movement completed/ })).toHaveAttribute(
      "aria-valuenow",
      "90",
    );
    expect(screen.queryByText(/pass|fail/i)).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: /Try again/ }));
    expect(actions.retry).toHaveBeenCalledOnce();
  });

  it("never shows a score when tracking was insufficient", () => {
    const actions = renderShell(
      view({
        ...level1,
        screen: "result",
        score: {
          overallScore: 0.11,
          movementCompleteness: 0.2,
          trackingCoverage: 0.15,
          trackingStatus: "insufficient",
        },
      }),
    );

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "We couldn't see enough",
    );
    expect(screen.queryByText("11%")).toBeNull();
    expect(screen.queryByRole("meter")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: /Try again/ }));
    expect(actions.retry).toHaveBeenCalledOnce();
  });

  it("treats a missing score as an attempt we could not see", () => {
    renderShell(view({ ...level1, screen: "result", score: null }));
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "We couldn't see enough",
    );
  });

  it("offers a finish rather than a next movement on the last level", () => {
    renderShell(view({ level: 3, gestureId: "water-sleeves", screen: "result", score: goodScore }));
    expect(screen.getByRole("button", { name: "Finish" })).toBeInTheDocument();
  });

  it("surfaces tracking guidance during an attempt", () => {
    renderShell(view({ ...level1, screen: "attempt", trackingPrompt: "move-closer" }));
    expect(screen.getByRole("status")).toHaveAttribute("data-prompt", "move-closer");
  });

  it("shows recovery guidance without leaking a raw error", () => {
    const actions = renderShell(
      view({ screen: "recovery", message: "The camera isn't available." }),
    );

    expect(screen.getByText("The camera isn't available.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Start over/ }));
    expect(actions.quit).toHaveBeenCalledOnce();
  });

  it("falls back to recovery when a gesture screen has no gesture", () => {
    renderShell(view({ screen: "attempt", level: null, gestureId: null }));
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Let's take a moment",
    );
  });

  it("shows the dwell indicator only while a screen is advancing itself", () => {
    renderShell(view({ ...level1, screen: "learn", autoAdvance: 0.5 }));
    expect(screen.getByTestId("dwell")).toBeInTheDocument();
    cleanup();

    renderShell(view({ ...level1, screen: "attempt", autoAdvance: null }));
    expect(screen.queryByTestId("dwell")).toBeNull();
  });

  it("lights one lantern per movement reached", () => {
    renderShell(view({ ...level1, level: 2, screen: "learn" }));
    expect(screen.getByTestId("lantern-1")).toHaveClass("lantern--done");
    expect(screen.getByTestId("lantern-2")).toHaveClass("lantern--now");
    expect(screen.getByTestId("lantern-3")).toHaveClass("lantern--waiting");
  });
});
