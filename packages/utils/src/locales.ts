import { mergeWith } from "es-toolkit";

/** Overlays downloaded translations without losing existing nonempty messages. */
export function mergeLocaleMessages(
  current: Readonly<Record<string, unknown>>,
  incoming: Readonly<Record<string, unknown>>,
): Record<string, unknown> {
  const keepExisting = (existing: unknown, downloaded: unknown) => {
    if (existing && (downloaded === "" || downloaded === " " || downloaded === null)) {
      return existing;
    }
    return undefined;
  };

  const result = mergeWith({}, current, keepExisting);
  return mergeWith(result, incoming, keepExisting);
}
