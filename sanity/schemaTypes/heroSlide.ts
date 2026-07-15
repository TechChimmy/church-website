import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'heroSlide',
  title: 'Hero Slides',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({ name: 'titleTa', title: 'Title (Tamil)', type: 'string' }),
    defineField({ name: 'subtitle', title: 'Subtitle', type: 'string' }),
    defineField({ name: 'subtitleTa', title: 'Subtitle (Tamil)', type: 'string' }),
    defineField({ name: 'description', title: 'Description', type: 'text' }),
    defineField({ name: 'descriptionTa', title: 'Description (Tamil)', type: 'text' }),
    defineField({ name: 'image', title: 'Background Image', type: 'image', options: { hotspot: true } }),
    defineField({ name: 'ctaText', title: 'Button Text', type: 'string' }),
    defineField({ name: 'ctaHref', title: 'Button Link', type: 'string' }),
    defineField({ name: 'order', title: 'Order', type: 'number', initialValue: 0 }),
    defineField({ name: 'active', title: 'Active', type: 'boolean', initialValue: true }),
  ],
  preview: { select: { title: 'title', media: 'image' } },
});

