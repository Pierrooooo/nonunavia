import { defineField, defineType } from 'sanity'

export const settingsSchema = defineType({
  name: 'settings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    defineField({ name: 'siteTitle', title: 'Site Title', type: 'string' }),
    defineField({ name: 'siteDescription', title: 'Site Description', type: 'text', rows: 2 }),
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'object',
      fields: [
        defineField({ name: 'ogImage', title: 'OG Image', type: 'image' }),
      ],
    }),
  ],
})
