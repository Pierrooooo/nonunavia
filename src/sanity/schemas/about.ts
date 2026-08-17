import { defineField, defineType } from 'sanity'

export const aboutSchema = defineType({
  name: 'about',
  title: 'About',
  type: 'document',
  // singleton — on n'en crée qu'un seul
  fields: [
    defineField({ name: 'name', title: 'Full Name', type: 'string' }),
    defineField({ name: 'tagline', title: 'Tagline', type: 'string' }),
    defineField({
      name: 'bio',
      title: 'Bio',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'photo',
      title: 'Photo',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'skills',
      title: 'Skills / Tools',
      type: 'array',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
    }),
    defineField({
      name: 'clients',
      title: 'Notable Clients / Studios',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'socials',
      title: 'Social Links',
      type: 'object',
      fields: [
        defineField({ name: 'linkedin', type: 'url', title: 'LinkedIn' }),
        defineField({ name: 'soundcloud', type: 'url', title: 'SoundCloud' }),
        defineField({ name: 'spotify', type: 'url', title: 'Spotify' }),
        defineField({ name: 'bandcamp', type: 'url', title: 'Bandcamp' }),
        defineField({ name: 'imdb', type: 'url', title: 'IMDb' }),
      ],
    }),
  ],
})
