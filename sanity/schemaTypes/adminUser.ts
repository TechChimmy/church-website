import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'adminUser',
  title: 'Admin Users',
  type: 'document',
  fields: [
    defineField({ name: 'email', title: 'Email', type: 'string', validation: (Rule) => Rule.required().email() }),
    defineField({ name: 'passwordHash', title: 'Password Hash', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({ name: 'role', title: 'Role', type: 'string', initialValue: 'ADMIN' }),
    defineField({ name: 'active', title: 'Active', type: 'boolean', initialValue: true }),
    defineField({ name: 'createdAt', title: 'Created At', type: 'datetime' }),
    defineField({ name: 'updatedAt', title: 'Updated At', type: 'datetime' }),
  ],
});
