import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'siteSetting',
  title: 'Site Settings',
  type: 'document',
  fields: [
    defineField({ name: 'key', title: 'Key', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({ name: 'label', title: 'Label', type: 'string' }),
    defineField({ name: 'group', title: 'Group', type: 'string', initialValue: 'general' }),
    defineField({ name: 'type', title: 'Value Type', type: 'string', initialValue: 'text' }),
    defineField({ name: 'value', title: 'Value', type: 'string' }),
  ],
});

