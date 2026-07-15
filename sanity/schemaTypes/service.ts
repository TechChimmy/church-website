import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'service',
  title: 'Service Times',
  type: 'document',
  fields: [
    defineField({ name: 'name', title: 'Service Name', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({ name: 'nameTa', title: 'Service Name (Tamil)', type: 'string' }),
    defineField({ name: 'day', title: 'Day', type: 'string' }),
    defineField({ name: 'dayTa', title: 'Day (Tamil)', type: 'string' }),
    defineField({ name: 'time', title: 'Time', type: 'string' }),
    defineField({ name: 'timeTa', title: 'Time (Tamil)', type: 'string' }),
    defineField({ name: 'order', title: 'Order', type: 'number', initialValue: 0 }),
    defineField({ name: 'active', title: 'Active', type: 'boolean', initialValue: true }),
  ],
});
