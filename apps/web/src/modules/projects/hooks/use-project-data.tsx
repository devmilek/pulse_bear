"use client";

import { Project } from "@/db/schema";
import { createContext, use } from "react";
const ProjectContext = createContext<Project | null>(null);

export function ProjectDataProvider({
  project,
  children,
}: {
  project: Project;
  children: React.ReactNode;
}) {
  return (
    <ProjectContext.Provider value={project}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProjectData() {
  const context = use(ProjectContext);

  if (!context) {
    throw new Error("useProject must be used within a ProjectProvider");
  }

  return context;
}
