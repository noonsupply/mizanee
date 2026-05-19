import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { SavedScenario } from "@/types";

export interface ScenarioCardProps {
  scenario: SavedScenario;
  onDelete?: (id: string) => void;
  onSelect?: (id: string) => void;
}

export function ScenarioCard({ scenario, onDelete, onSelect }: ScenarioCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
        <div>
          <CardTitle className="text-base">{scenario.label}</CardTitle>
          <p className="mt-1 text-xs text-slate-500">
            {scenario.createdAt.toLocaleDateString("fr-FR", { dateStyle: "medium" })}
          </p>
        </div>
        <Badge variant="secondary">{scenario.scenario.modifications.length} modif.</Badge>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        {onSelect && (
          <Button type="button" size="sm" variant="outline" onClick={() => onSelect(scenario.id)}>
            Charger
          </Button>
        )}
        {onDelete && (
          <Button type="button" size="sm" variant="destructive" onClick={() => onDelete(scenario.id)}>
            Supprimer
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
