import { groq } from 'next-sanity'

// ─── Projects ────────────────────────────────────────────────────────────────

export const allProjectsQuery = groq`
  *[_type == "project"] | order(releaseDate desc) {
    _id,
    title,
    slug,
    category,
    role,
    releaseDate,
    coverImage,
    shortDescription,
  }
`

export const projectBySlugQuery = groq`
  *[_type == "project" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    category,
    role,
    releaseDate,
    coverImage,
    shortDescription,
    description,
    audioTracks[] {
      _key,
      title,
      "audioUrl": file.asset->url,
      duration,
    },
    videoUrl,
    credits,
    tags,
  }
`

// ─── About ───────────────────────────────────────────────────────────────────

export const aboutQuery = groq`
  *[_type == "about"][0] {
    _id,
    name,
    tagline,
    bio,
    photo,
    skills,
    clients[],
    socials,
  }
`

// ─── Settings ────────────────────────────────────────────────────────────────

export const settingsQuery = groq`
  *[_type == "settings"][0] {
    siteTitle,
    siteDescription,
    seo,
  }
`
