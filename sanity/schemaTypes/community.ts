import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'community',
  title: 'Community Content',
  type: 'document',
  fields: [
    defineField({ name: 'quote', title: 'Quote', type: 'text', validation: (Rule) => Rule.required() }),
    defineField({ name: 'name', title: 'Name', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({ name: 'title', title: 'Title', type: 'string' }),
    defineField({ name: 'image', title: 'Image', type: 'image', options: { hotspot: true } }),
    defineField({ name: 'order', title: 'Order', type: 'number', initialValue: 0 }),
    defineField({ name: 'active', title: 'Active', type: 'boolean', initialValue: true }),
  ],
});
