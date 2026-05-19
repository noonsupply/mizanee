import { z } from "zod";
import {
  ChargeCategorie,
  ChargeType,
  ProjetStatut,
  RevenuType,
} from "@prisma/client";

const revenuType = z.nativeEnum(RevenuType);
const chargeType = z.nativeEnum(ChargeType);
const chargeCategorie = z.nativeEnum(ChargeCategorie);
const projetStatut = z.nativeEnum(ProjetStatut);

export const createFoyerSchema = z.object({
  nom: z.string().min(1).max(200),
  emoji: z.string().max(20).optional().nullable(),
});

export const patchFoyerSchema = z.object({
  nom: z.string().min(1).max(200).optional(),
  emoji: z.string().max(20).optional().nullable(),
});

export const createMembreSchema = z.object({
  prenom: z.string().min(1).max(100),
  couleur: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .optional(),
  emoji: z.string().max(20).optional().nullable(),
  prorata: z.number().min(0).max(100).optional(),
});

export const patchMembreSchema = z.object({
  prenom: z.string().min(1).max(100).optional(),
  couleur: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .optional(),
  emoji: z.string().max(20).optional().nullable(),
  prorata: z.number().min(0).max(100).optional(),
  actif: z.boolean().optional(),
});

export const createRevenuSchema = z.object({
  label: z.string().min(1).max(200),
  montant: z.number().finite().nonnegative(),
  type: revenuType,
  membreId: z.string().min(1),
  actif: z.boolean().optional(),
});

export const patchRevenuSchema = z.object({
  label: z.string().min(1).max(200).optional(),
  montant: z.number().finite().nonnegative().optional(),
  type: revenuType.optional(),
  actif: z.boolean().optional(),
});

export const createChargeSchema = z.object({
  label: z.string().min(1).max(200),
  montant: z.number().finite().nonnegative(),
  categorie: chargeCategorie,
  type: chargeType.optional(),
  membreId: z.string().min(1).optional().nullable(),
  actif: z.boolean().optional(),
});

export const patchChargeSchema = z.object({
  label: z.string().min(1).max(200).optional(),
  montant: z.number().finite().nonnegative().optional(),
  categorie: chargeCategorie.optional(),
  type: chargeType.optional(),
  membreId: z.string().min(1).optional().nullable(),
  actif: z.boolean().optional(),
});

export const createProjetSchema = z.object({
  label: z.string().min(1).max(200),
  montant: z.number().finite().positive(),
  dateCible: z.coerce.date(),
  priorite: z.number().int().min(1).optional(),
  statut: projetStatut.optional(),
  couleur: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .optional(),
  emoji: z.string().max(20).optional().nullable(),
  membreIds: z.array(z.string().min(1)).optional(),
});

export const patchProjetSchema = z.object({
  label: z.string().min(1).max(200).optional(),
  montant: z.number().finite().positive().optional(),
  dateCible: z.coerce.date().optional(),
  priorite: z.number().int().min(1).optional(),
  statut: projetStatut.optional(),
  couleur: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .optional(),
  emoji: z.string().max(20).optional().nullable(),
  membreIds: z.array(z.string().min(1)).optional(),
});

export const reorderProjetsSchema = z.object({
  ids: z.array(z.string().min(1)).min(1),
});

export const scenarioSchema = z.object({
  label: z.string().max(200).optional(),
  modifications: z.array(
    z.object({
      membreId: z.string().min(1),
      type: z.enum(["SALAIRE", "CHARGE_NOUVELLE", "CHARGE_SUPPRIMEE", "CONGE"]),
      valeur: z.number().finite(),
      debut: z.coerce.date(),
      fin: z.coerce.date(),
    }),
  ),
});

export const saveSimulationSchema = z.object({
  label: z.string().min(1).max(200),
  scenario: scenarioSchema,
});

export type ScenarioInput = z.infer<typeof scenarioSchema>;
