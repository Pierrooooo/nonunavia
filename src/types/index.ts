// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SanityImageSource = any

// ─── Sanity ──────────────────────────────────────────────────────────────────

export interface SanitySlug {
  current: string
}

// ─── Project ─────────────────────────────────────────────────────────────────

export type ProjectCategory = 'music' | 'sound-design' | 'both'

export interface AudioTrack {
  _key: string
  title: string
  audioUrl: string
  duration?: number
}

export interface Project {
  _id: string
  title: string
  slug: SanitySlug
  category: ProjectCategory
  role?: string
  releaseDate?: string
  coverImage?: SanityImageSource
  shortDescription?: string
  // Only on slug page
  description?: unknown[]
  audioTracks?: AudioTrack[]
  videoUrl?: string
  credits?: string
  tags?: string[]
}

// ─── About ───────────────────────────────────────────────────────────────────

export interface Socials {
  linkedin?: string
  soundcloud?: string
  spotify?: string
  bandcamp?: string
  imdb?: string
}

export interface About {
  _id: string
  name?: string
  tagline?: string
  bio?: unknown[]
  photo?: SanityImageSource
  skills?: string[]
  clients?: string[]
  socials?: Socials
}

// ─── Settings ────────────────────────────────────────────────────────────────

export interface Settings {
  siteTitle?: string
  siteDescription?: string
  seo?: {
    ogImage?: SanityImageSource
  }
}
