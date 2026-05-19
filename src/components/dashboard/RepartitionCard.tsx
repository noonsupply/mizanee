import { formatEur } from "@/lib/calculs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface RepartitionRow {
  label: string;
  montant: number;
  hint?: string;
}

export interface RepartitionCardProps {
  title: string;
  rows: RepartitionRow[];
  accentClassName?: string;
}

export function RepartitionCard({ title, rows, accentClassName = "bg-indigo-50 border-indigo-200" }: RepartitionCardProps) {
  return (
    <Card className={`overflow-hidden border ${accentClassName}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base text-indigo-900">{title}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        {rows.map((row) => (
          <div key={row.label}>
            <p className="text-xs font-medium uppercase tracking-wide text-indigo-600">{row.label}</p>
            <p className="text-xl font-bold text-indigo-900">{formatEur(row.montant)}</p>
            {row.hint && <p className="mt-0.5 text-xs text-indigo-600">{row.hint}</p>}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
