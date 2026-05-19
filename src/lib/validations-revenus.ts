import { z } from "zod";
import { MOIS_CLES } from "@/lib/calculs-revenus";
import { COMMUN_MEMBRE_ID, toFormMembreId } from "@/lib/commun-membre";

const membreIdSchema = z.string().min(1);
const typeRevenuSchema = z.enum(["fixe", "variable", "ponctuel", "locatif"]);
const variationFixeSchema = z.enum(["stable", "prime_annuelle", "13e"]);
const certitudeSchema = z.enum(["certain", "probable", "incertain"]);

const moisCleSchema = z.enum(MOIS_CLES as unknown as [string, ...string[]]);

const variableMoisSchema = z.record(z.string(), z.coerce.number()).optional();

export const revenuFormSchema = z
  .object({
    membreId: membreIdSchema,
    type: typeRevenuSchema,
    label: z.string().min(1, "Libellé requis").max(200),

    montantFixe: z.coerce.number().optional(),
    verseLeFixe: z.string().optional(),
    variationFixe: variationFixeSchema.optional(),

    variableMois: variableMoisSchema,

    montantPonctuel: z.coerce.number().optional(),
    moisArriveePonctuel: moisCleSchema.optional(),
    certitude: certitudeSchema.optional(),

    loyerNet: z.coerce.number().optional(),
    verseLeLocatif: z.string().optional(),
    chargesDeduites: z.coerce.number().optional(),
    moisAbsenceLocatif: z.array(z.string()).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type === "fixe") {
      const m = data.montantFixe ?? 0;
      if (m <= 0) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Montant positif requis", path: ["montantFixe"] });
      }
    }
    if (data.type === "variable") {
      const grid = data.variableMois ?? {};
      const sum = Object.values(grid).reduce((a, b) => a + b, 0);
      if (sum <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Saisissez au moins un montant sur la grille",
          path: ["variableMois"],
        });
      }
    }
    if (data.type === "ponctuel") {
      const m = data.montantPonctuel ?? 0;
      if (m <= 0) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Montant positif requis", path: ["montantPonctuel"] });
      }
      if (!data.moisArriveePonctuel) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Mois d’arrivée requis", path: ["moisArriveePonctuel"] });
      }
    }
    if (data.type === "locatif") {
      const net = data.loyerNet ?? 0;
      if (net <= 0) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Loyer net requis", path: ["loyerNet"] });
      }
      if (data.chargesDeduites != null && data.chargesDeduites < 0) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Montant invalide", path: ["chargesDeduites"] });
      }
    }
  });

export type RevenuFormValues = z.infer<typeof revenuFormSchema>;

export function defaultVariableMois(): Record<string, number> {
  return Object.fromEntries(MOIS_CLES.map((k) => [k, 0])) as Record<string, number>;
}

export function defaultRevenuFormValues(membreId?: string | null): RevenuFormValues {
  return {
    membreId: membreId !== undefined ? toFormMembreId(membreId) : COMMUN_MEMBRE_ID,
    type: "fixe",
    label: "",
    montantFixe: 0,
    verseLeFixe: "",
    variationFixe: "stable",
    variableMois: defaultVariableMois(),
    montantPonctuel: 0,
    moisArriveePonctuel: "01",
    certitude: "probable",
    loyerNet: 0,
    verseLeLocatif: "",
    chargesDeduites: 0,
    moisAbsenceLocatif: [],
  };
}
