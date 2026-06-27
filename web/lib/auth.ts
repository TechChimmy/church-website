// lib/auth.ts
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
  session: { strategy: "jwt" },
  pages: { signIn: "/admin/login" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id   = user.id;
        token.role = (user as { role?: string }).role ?? "ADMIN";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id   = token.id as string;
        (session.user as { role?: string }).role = token.role as string;
      }
      return session;
    },
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email:    { label: "Email",    type: "email"    },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          // Dynamic import to prevent Edge Runtime from importing getSanityClient in middleware.ts
          const { getSanityClient } = await import("@/lib/sanity/client");
          const client = getSanityClient();
          const bcrypt = await import("bcryptjs");

          const normalizedEmail = (credentials.email as string).toLowerCase().trim();

          // Query the admin user from Sanity first
          let userDoc = await client.fetch<any>(
            `*[_type == "adminUser" && email == $email && active == true][0]`,
            { email: normalizedEmail }
          );

          if (!userDoc) {
            // Auto-seed default admin user ONLY if count of admin users is 0
            const adminCount = await client.fetch<number>(`count(*[_type == "adminUser"])`);
            if (adminCount === 0) {
              console.log("[Auth] Seeding default admin user into Sanity...");
              const defaultEmail = process.env.ADMIN_DEFAULT_EMAIL || "admin@cftchurch.com";
              const defaultPassword = process.env.ADMIN_DEFAULT_PASSWORD || "churchwebpage@2026";
              const salt = await bcrypt.genSalt(10);
              const hash = await bcrypt.hash(defaultPassword, salt);
              userDoc = await client.create({
                _type: "adminUser",
                email: defaultEmail,
                passwordHash: hash,
                role: "ADMIN",
                active: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              });

              if (normalizedEmail !== defaultEmail) {
                return null;
              }
            } else {
              return null;
            }
          }

          const pass = credentials.password as string;
          const valid = await bcrypt.compare(pass, userDoc.passwordHash);

          if (valid) {
            return {
              id: userDoc._id,
              name: userDoc.email.split("@")[0],
              email: userDoc.email,
              role: userDoc.role ?? "ADMIN",
            };
          }
        } catch (err) {
          console.error("[Auth] authorize error:", err);
        }

        return null;
      },
    }),
  ],
});

