import prisma from "@/lib/prisma";
import { jsonError, requireFoyerContext } from "@/lib/api-response";

type Params = Promise<{ id: string }>;

export async function DELETE(_request: Request, segment: { params: Params }) {
  const ctx = await requireFoyerContext();
  if (!ctx.ok) return ctx.response;
  const { id } = await segment.params;
  const scenario = await prisma.simulationScenario.findFirst({
    where: { id, foyerId: ctx.foyerId },
  });
  if (!scenario) return jsonError("Scénario introuvable", 404, "NOT_FOUND");
  await prisma.simulationScenario.delete({ where: { id } });
  return new Response(null, { status: 204 });
}
