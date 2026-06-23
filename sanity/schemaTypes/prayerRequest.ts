import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'prayerRequest',
  title: 'Prayer Requests',
  type: 'document',
  fields: [
    defineField({ name: 'name', title: 'Name', type: 'string' }),
    defineField({ name: 'email', title: 'Email', type: 'string' }),
    defineField({ name: 'prayerRequest', title: 'Prayer Request', type: 'text', validation: (Rule) => Rule.required() }),
    defineField({ name: 'anonymous', title: 'Anonymous', type: 'boolean', initialValue: false }),
    defineField({ name: 'approved', title: 'Approved', type: 'boolean', initialValue: false }),
    defineField({ name: 'archived', title: 'Archived', type: 'boolean', initialValue: false }),
    defineField({ name: 'createdAt', title: 'Created At', type: 'datetime' }),
  ],
});

