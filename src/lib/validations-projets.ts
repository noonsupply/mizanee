import { z } from "zod";
import { getAujourdhui } from "@/lib/date";

export const projetAjoutSchema = z.object({
  label: z.string().min(1, "Libellé requis").max(200),
  montant: z.coerce.number().positive("Montant > 0"),
  date: z.string().regex(/^\d{4}-\d{2}$/, "Date YYYY-MM"),
  priorite: z.coerce.number().int().min(1).max(99),
});

export type ProjetAjoutValues = z.infer<typeof projetAjoutSchema>;

export function dateProjetEstFuture(dateYm: string, ref: Date = getAujourdhui()): boolean {
  const [y, m] = dateYm.split("-").map(Number);
  if (!y || !m) return false;
  const premierMoisCible = new Date(y, m - 1, 1);
  const premierMoisAutorise = new Date(ref.getFullYear(), ref.getMonth() + 1, 1);
  return premierMoisCible.getTime() >= premierMoisAutorise.getTime();
}

export const projetAjoutSchemaAvecDateFuture = projetAjoutSchema.refine(
  (d) => dateProjetEstFuture(d.date),
  { message: "La date cible doit être dans le futur", path: ["date"] },
);

export function defaultProjetAjoutValues(): ProjetAjoutValues {
  const ref = getAujourdhui();
  const d = new Date(ref.getFullYear(), ref.getMonth() + 2, 1);
  const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  return { label: "", montant: 0, date: ym, priorite: 3 };
}