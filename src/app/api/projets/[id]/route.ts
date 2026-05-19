import prisma from "@/lib/prisma";
import { calculerEpargneMensuelleStockee } from "@/lib/domain";
import { patchProjetSchema } from "@/lib/validations";
import { jsonError, parseJson, requireFoyerContext } from "@/lib/api-response";

type Params = Promise<{ id: string }>;

async function projetInFoyer(id: string, foyerId: string) {
  return prisma.projet.findFirst({
    where: { id, foyerId },
  });
}

export async function GET(_request: Request, segment: { params: Params }) {
  const ctx = await requireFoyerContext();
  if (!ctx.ok) return ctx.response;
  const { id } = await segment.params;
  const projet = await prisma.projet.findFirst({
    where: { id, foyerId: ctx.foyerId },
    include: { membres: { select: { id: true, prenom: true, couleur: true } } },
  });
  if (!projet) return jsonError("Projet introuvable", 404, "NOT_FOUND");
  return Response.json({ projet });
}

export async function PATCH(request: Request, segment: { params: Params }) {
  const ctx = await requireFoyerContext();
  if (!ctx.ok) return ctx.response;
  const { id } = await segment.params;
  const existing = await projetInFoyer(id, ctx.foyerId);
  if (!existing) return jsonError("Projet introuvable", 404, "NOT_FOUND");
  const body = await parseJson<unknown>(request);
  const parsed = patchProjetSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Payload invalide", 400, "VALIDATION_ERROR");
  }
  const nextMontant = parsed.data.montant ?? existing.montant;
  const nextDate = parsed.data.dateCible ?? existing.dateCible;
  let epargneMensuelle = existing.epargneMensuelle;
  if (parsed.data.montant !== undefined || parsed.data.dateCible !== undefined) {
    epargneMensuelle = calculerEpargneMensuelleStockee(nextMontant, nextDate);
  }
  if (parsed.data.membreIds) {
    const count = await prisma.membre.count({
      where: { foyerId: ctx.foyerId, id: { in: parsed.data.membreIds } },
    });
    if (count !== parsed.data.membreIds.length) {
      return jsonError("Un ou plusieurs membres sont invalides", 400, "INVALID_MEMBRE");
    }
  }
  const projet = await prisma.projet.update({
    where: { id },
    data: {
      ...(parsed.data.label !== undefined && { label: parsed.data.label }),
      ...(parsed.data.montant !== undefined && { montant: parsed.data.montant }),
      ...(parsed.data.dateCible !== undefined && { dateCible: parsed.data.dateCible }),
      ...(parsed.data.priorite !== undefined && { priorite: parsed.data.priorite }),
      ...(parsed.data.statut !== undefined && { statut: parsed.data.statut }),
      ...(parsed.data.couleur !== undefined && { couleur: parsed.data.couleur }),
      ...(parsed.data.emoji !== undefined && { emoji: parsed.data.emoji }),
      epargneMensuelle,
      ...(parsed.data.membreIds !== undefined && {
        membres: { set: parsed.data.membreIds.map((mid) => ({ id: mid })) },
      }),
    },
    include: { membres: { select: { id: true, prenom: true } } },
  });
  return Response.json({ projet });
}

export async function DELETE(_request: Request, segment: { params: Params }) {
  const ctx = await requireFoyerContext();
  if (!ctx.ok) return ctx.response;
  const { id } = await segment.params;
  const existing = await projetInFoyer(id, ctx.foyerId);
  if (!existing) return jsonError("Projet introuvable", 404, "NOT_FOUND");
  await prisma.projet.delete({ where: { id } });
  return new Response(null, { status: 204 });
}
