import { redirect } from "next/navigation";
import React from "react";

interface ProjectPageProps {
  params: Promise<{ slug: string }>;
}

const ProjectPage = async ({ params }: ProjectPageProps) => {
  const { slug } = await params;
  return redirect(`/app/${slug}/events`);
};

export default ProjectPage;
