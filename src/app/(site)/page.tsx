import { client } from '@/sanity/lib/client'
import { allProjectsQuery, settingsQuery } from '@/sanity/lib/queries'
import type { Project, Settings } from '@/types'

// ISR — revalide toutes les 60 secondes
export const revalidate = 60

export default async function HomePage() {
  const [projects, settings] = await Promise.all([
    client.fetch<Project[]>(allProjectsQuery),
    client.fetch<Settings>(settingsQuery),
  ])

  return (
    <section className="px-6 py-24 max-w-6xl mx-auto">
      <h1 className="text-6xl font-bold tracking-tight mb-4">
        {settings?.siteTitle ?? 'Sound Design & Game Music'}
      </h1>
      <p className="text-xl text-white/60 mb-16 max-w-xl">
        {settings?.siteDescription ?? 'Compositeur et sound designer pour jeux vidéo.'}
      </p>

      {/* TODO: ajouter tes sections hero, featured projects, etc. */}
      <pre className="text-xs text-white/30">
        {projects.length} project(s) chargés depuis Sanity
      </pre>
    </section>
  )
}
