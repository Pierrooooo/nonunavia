import { client } from "@/sanity/lib/client";
import { allProjectsQuery } from "@/sanity/lib/queries";
import type { Project } from "@/types";
import { ProjectGrid } from "@/components/ui/ProjectsGrid";

export const revalidate = 60;

export default async function ProjectsPage() {
  const projects = await client.fetch<Project[]>(allProjectsQuery);

  return (
    <section className="w-6xl py-24 max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold mb-12">Projects</h1>
      <ProjectGrid projects={projects} />
    </section>
  );
}