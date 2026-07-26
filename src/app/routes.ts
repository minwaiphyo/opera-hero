export type AppRoute = "baseline" | "camera-lab";

export function resolveAppRoute(pathname: string): AppRoute {
  return pathname === "/lab/camera" ? "camera-lab" : "baseline";
}
