'use client'

import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from './src/sanity/schemas'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET!

export default defineConfig({
  name: 'portfolio-sounddesign',
  title: 'Portfolio Sound Design',
  projectId,
  dataset,
  basePath: '/studio', 
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            S.listItem()
              .title('Projects')
              .child(S.documentTypeList('project')),
            // Singletons
            S.listItem()
              .title('About')
              .child(S.document().schemaType('about').documentId('about')),
            S.listItem()
              .title('Settings')
              .child(S.document().schemaType('settings').documentId('settings')),
          ]),
    }),
    visionTool(),
  ],
  schema: { types: schemaTypes },
})
