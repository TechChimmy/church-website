import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'weStayActive',
  title: 'We Stay Active',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({ name: 'titleTa', title: 'Title (Tamil)', type: 'string' }),
    defineField({ name: 'description', title: 'Description', type: 'text' }),
    defineField({ name: 'descriptionTa', title: 'Description (Tamil)', type: 'text' }),
    defineField({ name: 'image', title: 'Image', type: 'image', options: { hotspot: true } }),
    defineField({ name: 'order', title: 'Order', type: 'number', initialValue: 0 }),
    defineField({ name: 'active', title: 'Active', type: 'boolean', initialValue: true }),
  ],
  preview: {
    select: {
      title: 'title',
      media: 'image',
    },
  },
});
