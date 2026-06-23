import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'contactMessage',
  title: 'Contact Messages',
  type: 'document',
  fields: [
    defineField({ name: 'name', title: 'Name', type: 'string' }),
    defineField({ name: 'email', title: 'Email', type: 'string' }),
    defineField({ name: 'message', title: 'Message', type: 'text' }),
    defineField({ name: 'read', title: 'Read', type: 'boolean', initialValue: false }),
    defineField({ name: 'archived', title: 'Archived', type: 'boolean', initialValue: false }),
    defineField({ name: 'replied', title: 'Replied', type: 'boolean', initialValue: false }),
    defineField({ name: 'createdAt', title: 'Created At', type: 'datetime' }),
  ],
});
