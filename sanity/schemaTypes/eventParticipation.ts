import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'eventParticipation',
  title: 'Event Participations',
  type: 'document',
  fields: [
    defineField({ name: 'eventId', title: 'Event ID', type: 'string' }),
    defineField({ name: 'eventTitle', title: 'Event Title', type: 'string' }),
    defineField({ name: 'name', title: 'Name', type: 'string' }),
    defineField({ name: 'email', title: 'Email', type: 'string' }),
    defineField({ name: 'phone', title: 'Phone', type: 'string' }),
    defineField({ name: 'createdAt', title: 'Created At', type: 'datetime' }),
  ],
});
