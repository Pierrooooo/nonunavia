import { client } from '@/sanity/lib/client'
import { aboutQuery } from '@/sanity/lib/queries'
import type { About } from '@/types'

export const revalidate = 60

export default async function AboutPage() {
  const about = await client.fetch<About | null>(aboutQuery)

  if (!about) return <p className="px-6 py-24 text-white/50">No about content yet.</p>

  return (
    <section className="px-6 py-24 max-w-3xl mx-auto">
      {/* Photo */}
      {about.photo && (
        <div className="w-32 h-32 rounded-full bg-white/10 mb-8 overflow-hidden">
          {/* TODO: <Image src={urlFor(about.photo).url()} alt={about.name ?? ''} fill /> */}
        </div>
      )}

      <h1 className="text-4xl font-bold">{about.name}</h1>
      {about.tagline && <p className="text-xl text-white/50 mt-2 mb-10">{about.tagline}</p>}

      {/* Bio (Portable Text) */}
      <div className="prose prose-invert max-w-none mb-12">
        {/* TODO: <PortableText value={about.bio} /> */}
        <p className="text-white/60">Bio à rendre avec @portabletext/react</p>
      </div>

      {/* Skills */}
      {about.skills && about.skills.length > 0 && (
        <div className="mb-10">
          <h2 className="text-sm uppercase tracking-widest text-white/40 mb-3">Skills & Tools</h2>
          <ul className="flex flex-wrap gap-2">
            {about.skills.map((skill) => (
              <li key={skill} className="px-3 py-1 text-sm border border-white/20 rounded-full text-white/70">
                {skill}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Clients */}
      {about.clients && about.clients.length > 0 && (
        <div className="mb-10">
          <h2 className="text-sm uppercase tracking-widest text-white/40 mb-3">Studios & Clients</h2>
          <ul className="flex flex-wrap gap-3">
            {about.clients.map((client) => (
              <li key={client} className="text-sm text-white/60">{client}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Socials */}
      {about.socials && (
        <div>
          <h2 className="text-sm uppercase tracking-widest text-white/40 mb-3">Links</h2>
          <ul className="flex flex-col gap-2">
            {Object.entries(about.socials).map(([key, url]) =>
              url ? (
                <li key={key}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-white/60 hover:text-white transition-colors capitalize"
                  >
                    {key} ↗
                  </a>
                </li>
              ) : null
            )}
          </ul>
        </div>
      )}
    </section>
  )
}
