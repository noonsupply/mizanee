"use client";

export type TabId = "synthese" | "charges" | "epargne" | "projection";

interface Tab {
  id: TabId;
  label: string;
}

const TABS: Tab[] = [
  { id: "synthese", label: "Synthese" },
  { id: "charges", label: "Charges" },
  { id: "epargne", label: "Epargne" },
  { id: "projection", label: "Projection" },
];

interface NavTabsProps {
  active: TabId;
  onChange: (tab: TabId) => void;
}

export default function NavTabs({ active, onChange }: NavTabsProps) {
  return (
    <nav className="flex bg-white border-b border-slate-200">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`px-6 py-4 text-sm font-semibold tracking-wide border-b-2 transition-colors ${
            active === tab.id
              ? "border-indigo-600 text-indigo-600 bg-indigo-50/50"
              : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
