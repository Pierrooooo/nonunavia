import { client } from '@/sanity/lib/client'
import { urlFor } from '@/sanity/lib/image'
import { projectBySlugQuery, allProjectsQuery } from '@/sanity/lib/queries'
import type { Project } from '@/types'
import { notFound } from 'next/navigation'
import { TrackList } from './TrackList'
import Image from 'next/image'
import { AudioBackground } from '@/components/three/AudioBackground'

export const revalidate = 60

// Génère les routes statiques à build time
export async function generateStaticParams() {
  const projects = await client.fetch<Project[]>(allProjectsQuery)
  return projects.map((p) => ({ slug: p.slug.current }))
}

interface Props {
  params: Promise<{ slug: string }>
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params
  const project = await client.fetch<Project | null>(projectBySlugQuery, { slug })

  if (!project) notFound()

  return (
    <article className="px-6 py-24 max-w-4xl mx-auto">

      {/* <AudioBackground color="#fff" /> */}
      {/* Header */}
      <span className="text-xs text-white/40 uppercase tracking-widest">{project.category}</span>
      <h1 className="text-5xl font-bold mt-2 mb-4">{project.title}</h1>
      {project.role && <p className="text-white/50 mb-12">{project.role}</p>}

      {/* Cover image */}
      {project.coverImage && (
        <div className="relative aspect-video bg-white/5 rounded-lg mb-12 flex items-center justify-center text-white/20">
          <Image src={urlFor(project.coverImage).url()} alt={project.title} fill style={{ objectFit: 'cover' }} />
        </div>
      )}

      {/* Audio tracks — composant client pour interagir avec le store */}
      {project.audioTracks && project.audioTracks.length > 0 && (
        <TrackList tracks={project.audioTracks} projectId={project._id} />
      )}

      {/* Description (Portable Text) */}
      {project.description && (
        <div className="prose prose-invert max-w-none mt-12">
          {/* TODO: <PortableText value={project.description} /> */}
          <p className="text-white/60">Description à rendre avec @portabletext/react</p>
        </div>
      )}

      {/* Video embed */}
      {project.videoUrl && (
        <div className="mt-12">
          <h2 className="text-lg font-semibold mb-4">Trailer / Gameplay</h2>
          <a href={project.videoUrl} target="_blank" rel="noopener noreferrer" className="text-white/60 underline">
            {project.videoUrl}
          </a>
        </div>
      )}
    </article>
  )
}
