'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { AnimatePresence, motion } from 'motion/react'
import { urlFor } from '@/sanity/lib/image'
import type { Project } from '@/types'

interface Props {
  projects: Project[]
}

function formatYear(date?: string) {
  if (!date) return null
  const year = new Date(date).getFullYear()
  return Number.isNaN(year) ? null : year
}

export function ProjectGrid({ projects }: Props) {
  const [hovered, setHovered] = useState<Project | null>(null)

  return (
    <>
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {projects.map((project) => (
          <li key={project._id}>
            <Link
              href={`/projects/${project.slug.current}`}
              className="group block border border-white/10 rounded-lg overflow-hidden
                         hover:border-white/30 transition-colors"
              onMouseEnter={() => setHovered(project)}
              onMouseLeave={() =>
                setHovered((current) => (current?._id === project._id ? null : current))
              }
              onFocus={() => setHovered(project)}
              onBlur={() =>
                setHovered((current) => (current?._id === project._id ? null : current))
              }
            >
              {project.coverImage ? (
                <div className="relative aspect-video bg-white/5 flex items-center justify-center text-white/20 text-sm">
                  <Image
                    src={urlFor(project.coverImage).width(1200).height(675).url()}
                    alt={project.title}
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                </div>
              ) : (
                <div className="aspect-video flex items-center">
                  <h2 className="text-6xl text-center m-auto font-semibold">
                    {project.title}
                  </h2>
                </div>
              )}
            </Link>
          </li>
        ))}
      </ul>

      <ProjectHoverBar project={hovered} />
    </>
  )
}

function ProjectHoverBar({ project }: { project: Project | null }) {
  return (
    <div className="pointer-events-none fixed bottom-8 left-0 right-0 z-50 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Ligne 1 : title, category, role, releaseDate */}
        <div className="w-full grid grid-cols-4 gap-8 text-sm text-white/80">
          <span>
            Titre : <AnimatedValue value={project?.title} changeKey={project?._id} />
          </span>
          <span>
            Catégorie : <AnimatedValue value={project?.category} changeKey={project?._id} />
          </span>
          <span>
            Rôle : <AnimatedValue value={project?.role} changeKey={project?._id} />
          </span>
          <span>
            Date : <AnimatedValue value={formatYear(project?.releaseDate)} changeKey={project?._id} />
          </span>
        </div>

        {/* Ligne 2 : shortDescription */}
        <div className="mt-1 text-xs text-white/40">
          Description :{' '}
          <AnimatedValue value={project?.shortDescription} changeKey={project?._id} />
        </div>
      </div>
    </div>
  )
}

const letterContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.02 },
  },
}

const letter = {
  hidden: { opacity: 0, y: 4 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.15 } },
}

/** Anime la valeur lettre par lettre à l'apparition (le label autour reste fixe). */
function AnimatedValue({
  value,
  changeKey,
}: {
  value?: string | number | null
  changeKey?: string
}) {
  const text = value != null && value !== '' ? String(value) : '—'

  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={changeKey ?? 'empty'}
        variants={letterContainer}
        initial="hidden"
        animate="visible"
        exit={{ opacity: 0, transition: { duration: 0.12 } }}
        className="inline-block text-white/50"
      >
        {text.split('').map((char, i) => (
          <motion.span key={i} variants={letter} className="inline-block">
            {char === ' ' ? '\u00A0' : char}
          </motion.span>
        ))}
      </motion.span>
    </AnimatePresence>
  )
}