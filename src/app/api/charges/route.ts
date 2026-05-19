import { ChargeType } from "@prisma/client";
import prisma from "@/lib/prisma";
import { createChargeSchema } from "@/lib/validations";
import { jsonError, parseJson, requireFoyerContext } from "@/lib/api-response";

export async function GET() {
  const ctx = await requireFoyerContext();
  if (!ctx.ok) return ctx.response;
  const charges = await prisma.charge.findMany({
    where: { foyerId: ctx.foyerId },
    orderBy: { createdAt: "desc" },
    include: { membre: { select: { id: true, prenom: true } } },
  });
  return Response.json({ charges });
}

export async function POST(request: Request) {
  const ctx = await requireFoyerContext();
  if (!ctx.ok) return ctx.response;
  const body = await parseJson<unknown>(request);
  const parsed = createChargeSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Payload invalide", 400, "VALIDATION_ERROR");
  }
  const type = parsed.data.type ?? ChargeType.COMMUNE;
  if (type === ChargeType.PERSONNELLE) {
    if (!parsed.data.membreId) {
      return jsonError("membreId requis pour une charge personnelle", 400, "VALIDATION_ERROR");
    }
    const membre = await prisma.membre.findFirst({
      where: { id: parsed.data.membreId, foyerId: ctx.foyerId },
    });
    if (!membre) {
      return jsonError("Membre invalide pour ce foyer", 400, "INVALID_MEMBRE");
    }
  }
  const charge = await prisma.charge.create({
    data: {
      foyerId: ctx.foyerId,
      label: parsed.data.label,
      montant: parsed.data.montant,
      categorie: parsed.data.categorie,
      type,
      membreId: type === ChargeType.PERSONNELLE ? parsed.data.membreId! : null,
      actif: parsed.data.actif ?? true,
    },
  });
  return Response.json({ charge }, { status: 201 });
}
