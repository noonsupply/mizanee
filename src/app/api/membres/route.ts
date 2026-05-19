import prisma from "@/lib/prisma";
import { createMembreSchema } from "@/lib/validations";
import { jsonError, parseJson, requireFoyerContext } from "@/lib/api-response";

export async function GET() {
  const ctx = await requireFoyerContext();
  if (!ctx.ok) return ctx.response;
  const membres = await prisma.membre.findMany({
    where: { foyerId: ctx.foyerId },
    orderBy: { createdAt: "asc" },
    include: {
      revenus: { where: { actif: true } },
      charges: { where: { actif: true } },
      projets: true,
    },
  });
  return Response.json({ membres });
}

export async function POST(request: Request) {
  const ctx = await requireFoyerContext();
  if (!ctx.ok) return ctx.response;
  const body = await parseJson<unknown>(request);
  const parsed = createMembreSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Payload invalide", 400, "VALIDATION_ERROR");
  }
  const membre = await prisma.membre.create({
    data: {
      foyerId: ctx.foyerId,
      prenom: parsed.data.prenom,
      couleur: parsed.data.couleur ?? "#378ADD",
      emoji: parsed.data.emoji ?? null,
      prorata: parsed.data.prorata ?? 0,
    },
  });
  return Response.json({ membre }, { status: 201 });
}
