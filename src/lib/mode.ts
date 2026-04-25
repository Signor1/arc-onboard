export type Mode = "local" | "hosted";

export function getMode(): Mode {
  // server-side env check for Next.js (read at build/runtime)
  const env = process.env.NEXT_PUBLIC_ARC_ONBOARD_MODE;
  return env === "hosted" ? "hosted" : "local";
}

export const MODE: Mode =
  (process.env.NEXT_PUBLIC_ARC_ONBOARD_MODE as Mode) === "hosted"
    ? "hosted"
    : "local";
