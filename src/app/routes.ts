export type AppRoute = "baseline" | "camera-lab" | "landmark-lab" | "game";

export function resolveAppRoute(pathname: string): AppRoute {
  if (pathname === "/lab/camera") {
    return "camera-lab";
  }
  if (pathname === "/lab/landmarks") {
    return "landmark-lab";
  }
  if (pathname === "/game") {
    return "game";
  }
  return "baseline";
}
