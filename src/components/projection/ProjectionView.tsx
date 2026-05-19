"use client";

import { simulationSolde, totalEpargneMensuelle, formatEur } from "@/lib/calculs";
import type { ProjetEpargne } from "@/data/foyer";
import { SoldeLineChart } from "@/components/projection/SoldeLineChart";
import { ProjectionTable } from "@/components/projection/ProjectionTable";
import { CumulEpargneChart } from "@/components/projection/CumulEpargneChart";

interface Props {
  projets: ProjetEpargne[];
}

export default function ProjectionView({ projets }: Props) {
  const points = simulationSolde(projets);
  const epargne = totalEpargneMensuelle(projets);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-800">Projection 12 mois</h2>
        <p className="text-sm text-slate-500">Épargne projets: {formatEur(epargne)}/mois</p>
      </div>

      <SoldeLineChart points={points} />
      <CumulEpargneChart points={points} />
      <ProjectionTable points={points} />
    </div>
  );
}
