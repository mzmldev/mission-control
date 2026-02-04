import { ConvexReactClient } from "convex/react";

export const CONVEX_URL =
  process.env.EXPO_PUBLIC_CONVEX_URL || "https://rare-rook-425.convex.cloud";

export const convex = new ConvexReactClient(CONVEX_URL);
