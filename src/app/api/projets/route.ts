import { ProjetStatut } from "@prisma/client";
import prisma from "@/lib/prisma";
import { calculerEpargneMensuelleStockee } from "@/lib/domain";
import { createProjetSchema } from "@/lib/validations";
import { jsonError, parseJson, requireFoyerContext } from "@/lib/api-response";

export async function GET() {
  const ctx = await requireFoyerContext();
  if (!ctx.ok) return ctx.response;
  const projets = await prisma.projet.findMany({
    where: { foyerId: ctx.foyerId },
    orderBy: [{ priorite: "asc" }, { createdAt: "asc" }],
    include: { membres: { select: { id: true, prenom: true } } },
  });
  return Response.json({ projets });
}

export async function POST(request: Request) {
  const ctx = await requireFoyerContext();
  if (!ctx.ok) return ctx.response;
  const body = await parseJson<unknown>(request);
  const parsed = createProjetSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Payload invalide", 400, "VALIDATION_ERROR");
  }
  const epargneMensuelle = calculerEpargneMensuelleStockee(
    parsed.data.montant,
    parsed.data.dateCible,
  );
  const maxP = await prisma.projet.aggregate({
    where: { foyerId: ctx.foyerId },
    _max: { priorite: true },
  });
  const priorite = parsed.data.priorite ?? (maxP._max.priorite ?? 0) + 1;
  const membreIds = parsed.data.membreIds ?? [];
  if (membreIds.length > 0) {
    const count = await prisma.membre.count({
      where: { foyerId: ctx.foyerId, id: { in: membreIds } },
    });
    if (count !== membreIds.length) {
      return jsonError("Un ou plusieurs membres sont invalides", 400, "INVALID_MEMBRE");
    }
  }
  const projet = await prisma.projet.create({
    data: {
      foyerId: ctx.foyerId,
      label: parsed.data.label,
      montant: parsed.data.montant,
      dateCible: parsed.data.dateCible,
      epargneMensuelle,
      priorite,
      statut: parsed.data.statut ?? ProjetStatut.EN_COURS,
      couleur: parsed.data.couleur ?? "#378ADD",
      emoji: parsed.data.emoji ?? null,
      membres: membreIds.length
        ? { connect: membreIds.map((id) => ({ id })) }
        : undefined,
    },
    include: { membres: { select: { id: true, prenom: true } } },
  });
  return Response.json({ projet }, { status: 201 });
}
