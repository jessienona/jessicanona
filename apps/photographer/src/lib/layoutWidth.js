import { layout } from "@tether/shared";

/** True for screens that want the wide, grid-friendly column (feed). */
export function isWideRoute(pathname) {
  return pathname === "/feed";
}

/** Centers content at a capped width — the same column on phone and iPad,
 * just wider when there's room. Spread into a style object. */
export function capWidth(wide) {
  return { width: "100%", maxWidth: wide ? layout.wide : layout.narrow, marginLeft: "auto", marginRight: "auto" };
}
