import prisma from "@/lib/prisma";
import { patchMembreSchema } from "@/lib/validations";
import { jsonError, parseJson, requireFoyerContext } from "@/lib/api-response";

type Params = Promise<{ id: string }>;

async function membreInFoyer(id: string, foyerId: string) {
  return prisma.membre.findFirst({
    where: { id, foyerId },
  });
}

export async function GET(_request: Request, segment: { params: Params }) {
  const ctx = await requireFoyerContext();
  if (!ctx.ok) return ctx.response;
  const { id } = await segment.params;
  const membre = await membreInFoyer(id, ctx.foyerId);
  if (!membre) return jsonError("Membre introuvable", 404, "NOT_FOUND");
  const full = await prisma.membre.findUnique({
    where: { id },
    include: {
      revenus: true,
      charges: true,
      projets: true,
    },
  });
  return Response.json({ membre: full });
}

export async function PATCH(request: Request, segment: { params: Params }) {
  const ctx = await requireFoyerContext();
  if (!ctx.ok) return ctx.response;
  const { id } = await segment.params;
  const existing = await membreInFoyer(id, ctx.foyerId);
  if (!existing) return jsonError("Membre introuvable", 404, "NOT_FOUND");
  const body = await parseJson<unknown>(request);
  const parsed = patchMembreSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Payload invalide", 400, "VALIDATION_ERROR");
  }
  const membre = await prisma.membre.update({
    where: { id },
    data: {
      ...(parsed.data.prenom !== undefined && { prenom: parsed.data.prenom }),
      ...(parsed.data.couleur !== undefined && { couleur: parsed.data.couleur }),
      ...(parsed.data.emoji !== undefined && { emoji: parsed.data.emoji }),
      ...(parsed.data.prorata !== undefined && { prorata: parsed.data.prorata }),
      ...(parsed.data.actif !== undefined && { actif: parsed.data.actif }),
    },
  });
  return Response.json({ membre });
}

export async function DELETE(request: Request, segment: { params: Params }) {
  const ctx = await requireFoyerContext();
  if (!ctx.ok) return ctx.response;
  const { id } = await segment.params;
  const existing = await membreInFoyer(id, ctx.foyerId);
  if (!existing) return jsonError("Membre introuvable", 404, "NOT_FOUND");
  const url = new URL(request.url);
  const hard = url.searchParams.get("hard") === "1" || url.searchParams.get("hard") === "true";
  if (!hard) {
    const membre = await prisma.membre.update({
      where: { id },
      data: { actif: false },
    });
    return Response.json({ membre, mode: "soft" });
  }
  await prisma.membre.update({
    where: { id },
    data: { projets: { set: [] } },
  });
  await prisma.membre.delete({ where: { id } });
  return new Response(null, { status: 204 });
}
