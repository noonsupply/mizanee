import prisma from "@/lib/prisma";
import { createRevenuSchema } from "@/lib/validations";
import { jsonError, parseJson, requireFoyerContext } from "@/lib/api-response";

export async function GET() {
  const ctx = await requireFoyerContext();
  if (!ctx.ok) return ctx.response;
  const revenus = await prisma.revenu.findMany({
    where: { membre: { foyerId: ctx.foyerId } },
    orderBy: { createdAt: "desc" },
    include: { membre: { select: { id: true, prenom: true } } },
  });
  return Response.json({ revenus });
}

export async function POST(request: Request) {
  const ctx = await requireFoyerContext();
  if (!ctx.ok) return ctx.response;
  const body = await parseJson<unknown>(request);
  const parsed = createRevenuSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Payload invalide", 400, "VALIDATION_ERROR");
  }
  const membre = await prisma.membre.findFirst({
    where: { id: parsed.data.membreId, foyerId: ctx.foyerId },
    select: { id: true },
  });
  if (!membre) {
    return jsonError("Membre invalide pour ce foyer", 400, "INVALID_MEMBRE");
  }
  const revenu = await prisma.revenu.create({
    data: {
      label: parsed.data.label,
      montant: parsed.data.montant,
      type: parsed.data.type,
      membreId: parsed.data.membreId,
      actif: parsed.data.actif ?? true,
    },
  });
  return Response.json({ revenu }, { status: 201 });
}
