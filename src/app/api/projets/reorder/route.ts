import prisma from "@/lib/prisma";
import { reorderProjetsSchema } from "@/lib/validations";
import { jsonError, parseJson, requireFoyerContext } from "@/lib/api-response";

export async function PATCH(request: Request) {
  const ctx = await requireFoyerContext();
  if (!ctx.ok) return ctx.response;
  const body = await parseJson<unknown>(request);
  const parsed = reorderProjetsSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Payload invalide", 400, "VALIDATION_ERROR");
  }
  const { ids } = parsed.data;
  const projets = await prisma.projet.findMany({
    where: { foyerId: ctx.foyerId, id: { in: ids } },
    select: { id: true },
  });
  if (projets.length !== ids.length) {
    return jsonError("Liste de projets invalide pour ce foyer", 400, "INVALID_IDS");
  }
  await prisma.$transaction(
    ids.map((projetId, index) =>
      prisma.projet.update({
        where: { id: projetId },
        data: { priorite: index + 1 },
      }),
    ),
  );
  const updated = await prisma.projet.findMany({
    where: { foyerId: ctx.foyerId },
    orderBy: [{ priorite: "asc" }, { createdAt: "asc" }],
    select: { id: true, priorite: true, label: true },
  });
  return Response.json({ projets: updated });
}
