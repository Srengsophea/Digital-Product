"use client";

import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/**
 * Returns `true` once the component has mounted on the client.
 *
 * On the server and during the first client render this is `false`, so
 * components can render output that matches the server HTML exactly and
 * avoid hydration mismatches (e.g. when reading from localStorage).
 */
export function useIsMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}
