import { z } from "zod";
import { MOIS_CLES } from "@/lib/calculs-revenus";
import { COMMUN_MEMBRE_ID, toFormMembreId } from "@/lib/commun-membre";

const membreIdSchema = z.string().min(1);
const typeChargeSchema = z.enum(["recurrente_fixe", "recurrente_variable", "saisonniere", "annuelle"]);
const moisCleSchema = z.enum(MOIS_CLES as unknown as [string, ...string[]]);

const grilleSchema = z.record(z.string(), z.coerce.number()).optional();

export const chargeFoyerFormSchema = z
  .object({
    membreId: membreIdSchema,
    type: typeChargeSchema,
    label: z.string().min(1, "Libellé requis").max(200),

    montantFixe: z.coerce.number().optional(),
    verseLeFixe: z.string().optional(),

    grilleMois: grilleSchema,

    montantAnnuel: z.coerce.number().optional(),
    moisPaiementAnnuel: moisCleSchema.optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type === "recurrente_fixe") {
      const m = data.montantFixe ?? 0;
      if (m <= 0) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Montant requis", path: ["montantFixe"] });
    }
    if (data.type === "recurrente_variable" || data.type === "saisonniere") {
      const g = data.grilleMois ?? {};
      const sum = Object.values(g).reduce((a, b) => a + b, 0);
      if (sum <= 0) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Saisissez au moins un montant", path: ["grilleMois"] });
      }
    }
    if (data.type === "annuelle") {
      const a = data.montantAnnuel ?? 0;
      if (a <= 0) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Montant annuel requis", path: ["montantAnnuel"] });
      if (!data.moisPaiementAnnuel) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Mois de paiement requis", path: ["moisPaiementAnnuel"] });
      }
    }
  });

export type ChargeFoyerFormValues = z.infer<typeof chargeFoyerFormSchema>;

export function defaultGrilleMois(): Record<string, number> {
  return Object.fromEntries(MOIS_CLES.map((k) => [k, 0])) as Record<string, number>;
}

export function defaultChargeFoyerFormValues(membreId?: string | null): ChargeFoyerFormValues {
  return {
    membreId: membreId !== undefined ? toFormMembreId(membreId) : COMMUN_MEMBRE_ID,
    type: "recurrente_fixe",
    label: "",
    montantFixe: 0,
    verseLeFixe: "",
    grilleMois: defaultGrilleMois(),
    montantAnnuel: 0,
    moisPaiementAnnuel: "01",
  };
}
