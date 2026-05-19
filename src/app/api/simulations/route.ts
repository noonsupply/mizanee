import { ProjetStatut } from "@prisma/client";
import prisma from "@/lib/prisma";
import { appliquerScenarioPropre } from "@/lib/simulationServeur";
import { scenarioSchema } from "@/lib/validations";
import { jsonError, parseJson, requireFoyerContext } from "@/lib/api-response";

async function foyerSnapshot(foyerId: string) {
  const [revenusAgg, chargesAgg, projets] = await Promise.all([
    prisma.revenu.aggregate({
      where: { actif: true, membre: { foyerId } },
      _sum: { montant: true },
    }),
    prisma.charge.aggregate({
      where: { actif: true, foyerId },
      _sum: { montant: true },
    }),
    prisma.projet.findMany({
      where: { foyerId, statut: ProjetStatut.EN_COURS },
      select: { id: true, epargneMensuelle: true, label: true },
    }),
  ]);
  const revenusMensuel = revenusAgg._sum.montant ?? 0;
  const chargesMensuel = chargesAgg._sum.montant ?? 0;
  const epargneProjets = projets.reduce((s, p) => s + p.epargneMensuelle, 0);
  return {
    base: { revenusMensuel, chargesMensuel, epargneProjets },
    projets,
  };
}

export async function GET() {
  const ctx = await requireFoyerContext();
  if (!ctx.ok) return ctx.response;
  const scenarios = await prisma.simulationScenario.findMany({
    where: { foyerId: ctx.foyerId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      label: true,
      payload: true,
      createdAt: true,
      userId: true,
    },
  });
  return Response.json({ scenarios });
}

export async function POST(request: Request) {
  const ctx = await requireFoyerContext();
  if (!ctx.ok) return ctx.response;
  const body = await parseJson<unknown>(request);
  const parsed = scenarioSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Payload invalide", 400, "VALIDATION_ERROR");
  }
  const membres = await prisma.membre.findMany({
    where: { foyerId: ctx.foyerId },
    select: { id: true },
  });
  const membreIds = new Set(membres.map((m) => m.id));
  for (const m of parsed.data.modifications) {
    if (!membreIds.has(m.membreId)) {
      return jsonError(`membreId inconnu: ${m.membreId}`, 400, "INVALID_MEMBRE");
    }
  }
  const { base, projets } = await foyerSnapshot(ctx.foyerId);
  const { simule, deltaSoldeNet } = appliquerScenarioPropre(base, parsed.data);
  const soldeNetBase =
    base.revenusMensuel - base.chargesMensuel - base.epargneProjets;
  const soldeNetSim =
    simule.revenusMensuel - simule.chargesMensuel - simule.epargneProjets;
  const projetsImpact = projets.map((p) => ({
    id: p.id,
    label: p.label,
    epargneMensuelle: p.epargneMensuelle,
    faisableBaseline: soldeNetBase >= 0,
    faisableSimule: soldeNetSim >= 0,
  }));
  return Response.json({
    baseline: { ...base, soldeNet: soldeNetBase },
    simule: { ...simule, soldeNet: soldeNetSim },
    deltaSoldeNet,
    projets: projetsImpact,
  });
}
