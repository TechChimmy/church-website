import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'footer',
  title: 'Footer Content',
  type: 'document',
  fields: [
    defineField({ name: 'address', title: 'Address', type: 'text' }),
    defineField({ name: 'addressTa', title: 'Address (Tamil)', type: 'text' }),
    defineField({ name: 'phone', title: 'Phone', type: 'string' }),
    defineField({ name: 'email', title: 'Email', type: 'string' }),
    defineField({ name: 'mapEmbed', title: 'Map Embed HTML', type: 'text' }),
  ],
});
