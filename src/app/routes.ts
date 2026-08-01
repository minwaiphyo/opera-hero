export type AppRoute = "baseline" | "camera-lab" | "landmark-lab";

export function resolveAppRoute(pathname: string): AppRoute {
  if (pathname === "/lab/camera") {
    return "camera-lab";
  }
  if (pathname === "/lab/landmarks") {
    return "landmark-lab";
  }
  return "baseline";
}
