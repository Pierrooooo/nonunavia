import { defineField, defineType } from "sanity";

export const projectSchema = defineType({
  name: "project",
  title: "Project",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title" },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      options: {
        list: [
          { title: "Video Game Music", value: "music" },
          { title: "Sound Design", value: "sound-design" },
          { title: "Both", value: "both" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "role",
      title: "Role",
      type: "string",
      description: "Ex: Composer, Sound Designer, Audio Lead...",
    }),
    defineField({
      name: "releaseDate",
      title: "Release Date",
      type: "date",
    }),
    defineField({
      name: "coverImage",
      title: "Cover Image",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "shortDescription",
      title: "Short Description",
      type: "text",
      rows: 2,
      description: "Displayed on the projects listing page.",
    }),
    defineField({
      name: "description",
      title: "Full Description",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "audioTracks",
      title: "Audio Tracks",
      type: "array",
      of: [
        {
          type: "object",
          name: "track",
          fields: [
            defineField({
              name: "title",
              title: "Track Title",
              type: "string",
            }),
            defineField({
              name: "file",
              title: "Audio File",
              type: "file",
              options: { accept: "audio/*" },
            }),
            defineField({
              name: "duration",
              title: "Duration (seconds)",
              type: "number",
            }),
          ],
          preview: {
            select: { title: "title" },
            prepare: ({ title }) => ({ title: title ?? "Untitled track" }),
          },
        },
      ],
    }),
    defineField({
      name: "videoUrl",
      title: "Video URL (trailer / gameplay)",
      type: "url",
    }),
    defineField({
      name: "credits",
      title: "Credits",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "tags",
      title: "Tags",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
    }),
  ],
  preview: {
    select: { title: "title", media: "coverImage", category: "category" },
    prepare: ({ title, media, category }) => ({
      title,
      subtitle: category,
      media,
    }),
  },
});
