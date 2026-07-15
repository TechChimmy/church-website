import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'answerFromTheWord',
  title: 'Answers From The Word',
  type: 'document',
  fields: [
    defineField({ name: 'question', title: 'Question / Topic', type: 'text', validation: (Rule) => Rule.required() }),
    defineField({ name: 'questionTa', title: 'Question / Topic (Tamil)', type: 'text' }),
    defineField({ name: 'title', title: 'Title', type: 'string' }),
    defineField({ name: 'titleTa', title: 'Title (Tamil)', type: 'string' }),
    defineField({ name: 'featuredImage', title: 'Featured Image', type: 'image', options: { hotspot: true } }),
    defineField({ name: 'publishDate', title: 'Publish Date', type: 'date' }),
    defineField({ name: 'category', title: 'Category', type: 'string' }),
    defineField({ name: 'categoryTa', title: 'Category (Tamil)', type: 'string' }),
    defineField({ name: 'excerpt', title: 'Short Preview / Excerpt', type: 'text' }),
    defineField({ name: 'excerptTa', title: 'Short Preview / Excerpt (Tamil)', type: 'text' }),
    defineField({ name: 'answer', title: 'Answer / Content', type: 'text', validation: (Rule) => Rule.required() }),
    defineField({ name: 'answerTa', title: 'Answer / Content (Tamil)', type: 'text' }),
    defineField({ name: 'active', title: 'Active', type: 'boolean', initialValue: true }),
    defineField({ name: 'order', title: 'Display Order', type: 'number', initialValue: 0 }),
  ],
});

