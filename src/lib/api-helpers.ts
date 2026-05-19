/** Extrait un tableau nommé du payload déjà déballé par `api.get` (`data.xxx`). */
export function pickPayloadArray<T>(payload: unknown, key: string): T[] {
  if (!payload || typeof payload !== "object") return [];
  const value = (payload as Record<string, unknown>)[key];
  return Array.isArray(value) ? (value as T[]) : [];
}

export const isApiDebug =
  process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_DEBUG_API === "true";
