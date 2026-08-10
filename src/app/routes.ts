export type AppRoute = "baseline" | "camera-lab" | "landmark-lab" | "game";

export function resolveAppRoute(pathname: string): AppRoute {
  if (pathname === "/lab/camera") {
    return "camera-lab";
  }
  if (pathname === "/lab/landmarks") {
    return "landmark-lab";
  }
  if (pathname === "/baseline") {
    return "baseline";
  }
  // The game is the exhibition's front door: it answers the root, /game, and any
  // path that is not a development surface. The baseline and the laboratories are
  // reached by typing their URLs.
  return "game";
}
