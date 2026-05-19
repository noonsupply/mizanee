import prisma from "@/lib/prisma";
import { patchRevenuSchema } from "@/lib/validations";
import { jsonError, parseJson, requireFoyerContext } from "@/lib/api-response";

type Params = Promise<{ id: string }>;

async function revenuInFoyer(id: string, foyerId: string) {
  return prisma.revenu.findFirst({
    where: { id, membre: { foyerId } },
  });
}

export async function PATCH(request: Request, segment: { params: Params }) {
  const ctx = await requireFoyerContext();
  if (!ctx.ok) return ctx.response;
  const { id } = await segment.params;
  const existing = await revenuInFoyer(id, ctx.foyerId);
  if (!existing) return jsonError("Revenu introuvable", 404, "NOT_FOUND");
  const body = await parseJson<unknown>(request);
  const parsed = patchRevenuSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Payload invalide", 400, "VALIDATION_ERROR");
  }
  const revenu = await prisma.revenu.update({
    where: { id },
    data: {
      ...(parsed.data.label !== undefined && { label: parsed.data.label }),
      ...(parsed.data.montant !== undefined && { montant: parsed.data.montant }),
      ...(parsed.data.type !== undefined && { type: parsed.data.type }),
      ...(parsed.data.actif !== undefined && { actif: parsed.data.actif }),
    },
  });
  return Response.json({ revenu });
}

export async function DELETE(_request: Request, segment: { params: Params }) {
  const ctx = await requireFoyerContext();
  if (!ctx.ok) return ctx.response;
  const { id } = await segment.params;
  const existing = await revenuInFoyer(id, ctx.foyerId);
  if (!existing) return jsonError("Revenu introuvable", 404, "NOT_FOUND");
  await prisma.revenu.delete({ where: { id } });
  return new Response(null, { status: 204 });
}
