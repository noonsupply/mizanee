import { auth } from "@/lib/next-auth";
import prisma from "@/lib/prisma";
import { createFoyerSchema, patchFoyerSchema } from "@/lib/validations";
import { jsonError, parseJson } from "@/lib/api-response";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return jsonError("Non authentifié", 401, "UNAUTHORIZED");
  }
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { foyerId: true },
  });
  if (!user?.foyerId) {
    return Response.json({ foyer: null });
  }
  const foyer = await prisma.foyer.findUnique({
    where: { id: user.foyerId },
    include: {
      _count: { select: { membres: true, charges: true, projets: true } },
    },
  });
  return Response.json({ foyer });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return jsonError("Non authentifié", 401, "UNAUTHORIZED");
  }
  const body = await parseJson<unknown>(request);
  const parsed = createFoyerSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Payload invalide", 400, "VALIDATION_ERROR");
  }
  const existing = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { foyerId: true },
  });
  if (existing?.foyerId) {
    return jsonError("Un foyer existe déjà pour ce compte", 409, "FOYER_EXISTS");
  }
  const foyer = await prisma.$transaction(async (tx) => {
    const f = await tx.foyer.create({
      data: { nom: parsed.data.nom, emoji: parsed.data.emoji ?? null },
    });
    await tx.user.update({
      where: { id: session.user.id },
      data: { foyerId: f.id },
    });
    return f;
  });
  return Response.json({ foyer }, { status: 201 });
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return jsonError("Non authentifié", 401, "UNAUTHORIZED");
  }
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { foyerId: true },
  });
  if (!user?.foyerId) {
    return jsonError("Aucun foyer associé", 404, "NO_FOYER");
  }
  const body = await parseJson<unknown>(request);
  const parsed = patchFoyerSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Payload invalide", 400, "VALIDATION_ERROR");
  }
  const foyer = await prisma.foyer.update({
    where: { id: user.foyerId },
    data: {
      ...(parsed.data.nom !== undefined && { nom: parsed.data.nom }),
      ...(parsed.data.emoji !== undefined && { emoji: parsed.data.emoji }),
    },
  });
  return Response.json({ foyer });
}
