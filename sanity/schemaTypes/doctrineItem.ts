import { defineField, defineType } from "sanity";

export default defineType({
  name: "doctrineItem",
  title: "Doctrine Items",
  type: "document",
  fields: [
    defineField({ name: "title",       title: "Title (English)", type: "string", validation: (r) => r.required() }),
    defineField({ name: "titleTa",     title: "Title (Tamil)",   type: "string" }),
    defineField({ name: "description", title: "Description (English)", type: "text" }),
    defineField({ name: "descriptionTa", title: "Description (Tamil)", type: "text" }),
    defineField({ name: "image",       title: "Image", type: "image", options: { hotspot: true } }),
    defineField({ name: "order",       title: "Display Order", type: "number", initialValue: 0 }),
    defineField({ name: "active",      title: "Active", type: "boolean", initialValue: true }),
  ],
  orderings: [{ title: "Order", name: "orderAsc", by: [{ field: "order", direction: "asc" }] }],
  preview: {
    select: { title: "title", media: "image" },
  },
});
