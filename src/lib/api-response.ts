import { auth } from "@/lib/next-auth";
import prisma from "@/lib/prisma";

export function jsonError(message: string, status: number, code?: string) {
  return Response.json(
    { error: { message, ...(code ? { code } : {}) } },
    { status },
  );
}

export async function parseJson<T>(request: Request): Promise<T | null> {
  try {
    return (await request.json()) as T;
  } catch {
    return null;
  }
}

export type FoyerContext =
  | { ok: true; userId: string; foyerId: string }
  | { ok: false; response: Response };

export async function requireFoyerContext(): Promise<FoyerContext> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, response: jsonError("Non authentifié", 401, "UNAUTHORIZED") };
  }
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, foyerId: true },
  });
  if (!user) {
    return { ok: false, response: jsonError("Utilisateur introuvable", 401, "USER_NOT_FOUND") };
  }
  if (!user.foyerId) {
    return { ok: false, response: jsonError("Aucun foyer associé", 404, "NO_FOYER") };
  }
  return { ok: true, userId: user.id, foyerId: user.foyerId };
}

export async function getSessionUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}
