import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'announcement',
  title: 'Announcements',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({ name: 'titleTa', title: 'Title (Tamil)', type: 'string' }),
    defineField({ name: 'content', title: 'Content', type: 'text' }),
    defineField({ name: 'contentTa', title: 'Content (Tamil)', type: 'text' }),
    defineField({ name: 'date', title: 'Date', type: 'datetime' }),
    defineField({ name: 'active', title: 'Active', type: 'boolean', initialValue: true }),
  ],
});
