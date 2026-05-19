"use client";

import ProjectionView from "@/components/projection/ProjectionView";
import { useFoyerStore } from "@/store/useFoyerStore";

export default function ProjectionPage() {
  const projets = useFoyerStore((s) => s.projets);
  return <ProjectionView projets={projets} />;
}
