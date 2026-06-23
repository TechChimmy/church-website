import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'askCollins',
  title: 'Ask Collins Messages',
  type: 'document',
  fields: [
    defineField({ name: 'name', title: 'Name', type: 'string' }),
    defineField({ name: 'email', title: 'Email', type: 'string' }),
    defineField({ name: 'question', title: 'Question', type: 'text', validation: (Rule) => Rule.required() }),
    defineField({ name: 'status', title: 'Status', type: 'string', initialValue: 'PENDING' }),
    defineField({ name: 'answer', title: 'Answer', type: 'text' }),
    defineField({ name: 'read', title: 'Read', type: 'boolean', initialValue: false }),
    defineField({ name: 'archived', title: 'Archived', type: 'boolean', initialValue: false }),
    defineField({ name: 'createdAt', title: 'Created At', type: 'datetime' }),
  ],
});
