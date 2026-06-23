import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'answerFromTheWord',
  title: 'Answers From The Word',
  type: 'document',
  fields: [
    defineField({ name: 'question', title: 'Question', type: 'text' }),
    defineField({ name: 'answer', title: 'Answer', type: 'text' }),
    defineField({ name: 'active', title: 'Active', type: 'boolean', initialValue: true }),
  ],
});

