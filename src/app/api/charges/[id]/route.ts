import { ChargeType } from "@prisma/client";
import prisma from "@/lib/prisma";
import { patchChargeSchema } from "@/lib/validations";
import { jsonError, parseJson, requireFoyerContext } from "@/lib/api-response";

type Params = Promise<{ id: string }>;

async function chargeInFoyer(id: string, foyerId: string) {
  return prisma.charge.findFirst({
    where: { id, foyerId },
  });
}

export async function PATCH(request: Request, segment: { params: Params }) {
  const ctx = await requireFoyerContext();
  if (!ctx.ok) return ctx.response;
  const { id } = await segment.params;
  const existing = await chargeInFoyer(id, ctx.foyerId);
  if (!existing) return jsonError("Charge introuvable", 404, "NOT_FOUND");
  const body = await parseJson<unknown>(request);
  const parsed = patchChargeSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Payload invalide", 400, "VALIDATION_ERROR");
  }
  const nextType = parsed.data.type ?? existing.type;
  let nextMembreId =
    parsed.data.membreId !== undefined ? parsed.data.membreId : existing.membreId;
  if (nextType === ChargeType.COMMUNE) {
    nextMembreId = null;
  }
  if (nextType === ChargeType.PERSONNELLE && !nextMembreId) {
    return jsonError("membreId requis pour une charge personnelle", 400, "VALIDATION_ERROR");
  }
  if (nextType === ChargeType.PERSONNELLE && nextMembreId) {
    const membre = await prisma.membre.findFirst({
      where: { id: nextMembreId, foyerId: ctx.foyerId },
    });
    if (!membre) {
      return jsonError("Membre invalide pour ce foyer", 400, "INVALID_MEMBRE");
    }
  }
  const charge = await prisma.charge.update({
    where: { id },
    data: {
      ...(parsed.data.label !== undefined && { label: parsed.data.label }),
      ...(parsed.data.montant !== undefined && { montant: parsed.data.montant }),
      ...(parsed.data.categorie !== undefined && { categorie: parsed.data.categorie }),
      ...(parsed.data.type !== undefined && { type: parsed.data.type }),
      ...(parsed.data.actif !== undefined && { actif: parsed.data.actif }),
      membreId: nextMembreId,
    },
  });
  return Response.json({ charge });
}

export async function DELETE(_request: Request, segment: { params: Params }) {
  const ctx = await requireFoyerContext();
  if (!ctx.ok) return ctx.response;
  const { id } = await segment.params;
  const existing = await chargeInFoyer(id, ctx.foyerId);
  if (!existing) return jsonError("Charge introuvable", 404, "NOT_FOUND");
  await prisma.charge.delete({ where: { id } });
  return new Response(null, { status: 204 });
}
