"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { StepIndicator } from "@/components/onboarding/StepIndicator";
import { StepFoyer } from "@/components/onboarding/StepFoyer";
import { StepMembres, type MembreDraft } from "@/components/onboarding/StepMembres";
import { StepRevenus, type RevenuDraft } from "@/components/onboarding/StepRevenus";
import { StepCharges, type ChargeDraft } from "@/components/onboarding/StepCharges";
import { StepProjets, type ProjetDraft } from "@/components/onboarding/StepProjets";
import { useFoyerStore } from "@/store/useFoyerStore";

const STEP_LABELS = ["Foyer", "Membres", "Revenus", "Charges", "Projets"];

export default function OnboardingPage() {
  const router = useRouter();
  const setNomFoyer = useFoyerStore((s) => s.setNomFoyer);

  const [step, setStep] = useState(1);
  const [nom, setNom] = useState("Mon foyer");
  const [membres, setMembres] = useState<MembreDraft[]>([
    { prenom: "Membre 1", couleur: "#6366f1", emoji: "🙂" },
    { prenom: "Membre 2", couleur: "#f43f5e", emoji: "🌿" },
  ]);
  const [revenus, setRevenus] = useState<RevenuDraft[]>([
    { membreId: "m1", label: "Salaire", montant: 2500, type: "SALAIRE" },
  ]);
  const [charges, setCharges] = useState<ChargeDraft[]>([
    { label: "Loyer", montant: 1000, categorie: "LOGEMENT", type: "COMMUNE" },
  ]);
  const [projets, setProjets] = useState<ProjetDraft[]>([
    { label: "Vacances", montant: 2000, dateCible: "2027-06-01" },
  ]);

  const membreOptions = membres.map((m, i) => ({ id: `m${i + 1}`, label: m.prenom || `Membre ${i + 1}` }));

  function patchMembre(i: number, patch: Partial<MembreDraft>) {
    setMembres((list) => list.map((m, j) => (j === i ? { ...m, ...patch } : m)));
  }

  function finish() {
    setNomFoyer(nom.trim() || "Mon foyer");
    router.push("/dashboard");
  }

  return (
    <div className="w-full max-w-2xl space-y-6">
      <StepIndicator current={step} labels={STEP_LABELS} />
      {step === 1 && (
        <StepFoyer
          nom={nom}
          onNomChange={setNom}
          onNext={() => setStep(2)}
          onSkip={() => router.push("/dashboard")}
        />
      )}
      {step === 2 && (
        <StepMembres
          membres={membres}
          onChange={patchMembre}
          onAdd={() => setMembres((m) => [...m, { prenom: "", couleur: "#10b981", emoji: "" }])}
          onRemove={(i) => setMembres((m) => m.filter((_, j) => j !== i))}
          onBack={() => setStep(1)}
          onNext={() => setStep(3)}
        />
      )}
      {step === 3 && (
        <StepRevenus
          revenus={revenus}
          membreOptions={membreOptions.length ? membreOptions : [{ id: "m1", label: "Membre 1" }]}
          onChange={(i, patch) => setRevenus((r) => r.map((x, j) => (j === i ? { ...x, ...patch } : x)))}
          onAdd={() =>
            setRevenus((r) => [
              ...r,
              {
                membreId: membreOptions[0]?.id ?? "m1",
                label: "Nouveau",
                montant: 0,
                type: "AUTRE",
              },
            ])
          }
          onRemove={(i) => setRevenus((r) => r.filter((_, j) => j !== i))}
          onBack={() => setStep(2)}
          onNext={() => setStep(4)}
        />
      )}
      {step === 4 && (
        <StepCharges
          charges={charges}
          membreOptions={membreOptions.length ? membreOptions : [{ id: "m1", label: "Membre 1" }]}
          onChange={(i, patch) => setCharges((c) => c.map((x, j) => (j === i ? { ...x, ...patch } : x)))}
          onAdd={() =>
            setCharges((c) => [
              ...c,
              { label: "", montant: 0, categorie: "AUTRE", type: "COMMUNE" },
            ])
          }
          onRemove={(i) => setCharges((c) => c.filter((_, j) => j !== i))}
          onBack={() => setStep(3)}
          onNext={() => setStep(5)}
        />
      )}
      {step === 5 && (
        <StepProjets
          projets={projets}
          onChange={(i, patch) => setProjets((p) => p.map((x, j) => (j === i ? { ...x, ...patch } : x)))}
          onAdd={() => setProjets((p) => [...p, { label: "", montant: 500, dateCible: "2027-01-01" }])}
          onRemove={(i) => setProjets((p) => p.filter((_, j) => j !== i))}
          onBack={() => setStep(4)}
          onFinish={finish}
          onSkip={() => router.push("/dashboard")}
        />
      )}
    </div>
  );
}
