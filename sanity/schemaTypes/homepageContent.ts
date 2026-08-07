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
    defineField({ name: 'visitUsBtnText', title: 'Visit Us Button Text', type: 'string' }),
    defineField({ name: 'visitUsBtnTextTa', title: 'Visit Us Button Text (Tamil)', type: 'string' }),
    defineField({ name: 'visitUsBtnLink', title: 'Visit Us Button Link', type: 'string' }),
    defineField({ name: 'aboutHeading', title: 'About Section Heading', type: 'string' }),
    defineField({ name: 'aboutHeadingTa', title: 'About Section Heading (Tamil)', type: 'string' }),
    defineField({ name: 'aboutBody', title: 'About Section Body', type: 'text' }),
    defineField({ name: 'aboutBodyTa', title: 'About Section Body (Tamil)', type: 'text' }),
    defineField({ name: 'aboutImage', title: 'About Section Image', type: 'image', options: { hotspot: true } }),
    defineField({ name: 'prayerHeading', title: 'Prayer Heading', type: 'string' }),
    defineField({ name: 'prayerHeadingTa', title: 'Prayer Heading (Tamil)', type: 'string' }),
  ],
});

