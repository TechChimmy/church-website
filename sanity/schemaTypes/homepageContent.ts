import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'homepageContent',
  title: 'Homepage Content',
  type: 'document',
  fields: [
    defineField({ name: 'joinText', title: 'Join Text', type: 'text' }),
    defineField({ name: 'joinTextTa', title: 'Join Text (Tamil)', type: 'text' }),
    defineField({ name: 'visitText', title: 'Visit Text', type: 'text' }),
    defineField({ name: 'visitTextTa', title: 'Visit Text (Tamil)', type: 'text' }),
    defineField({ name: 'prayerHeading', title: 'Prayer Heading', type: 'string' }),
    defineField({ name: 'prayerHeadingTa', title: 'Prayer Heading (Tamil)', type: 'string' }),
  ],
});

