import prisma from "@/lib/prisma";
import { saveSimulationSchema } from "@/lib/validations";
import { jsonError, parseJson, requireFoyerContext } from "@/lib/api-response";

export async function POST(request: Request) {
  const ctx = await requireFoyerContext();
  if (!ctx.ok) return ctx.response;
  const body = await parseJson<unknown>(request);
  const parsed = saveSimulationSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Payload invalide", 400, "VALIDATION_ERROR");
  }
  const scenario = await prisma.simulationScenario.create({
    data: {
      foyerId: ctx.foyerId,
      userId: ctx.userId,
      label: parsed.data.label,
      payload: parsed.data.scenario as object,
    },
  });
  return Response.json({ scenario }, { status: 201 });
}
