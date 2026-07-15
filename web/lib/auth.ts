// lib/auth.ts
import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";

const failedAttempts: Record<string, { count: number; lockUntil: number }> = {};

class TooManyAttempts extends CredentialsSignin {
  code = "too_many_attempts";
}

function recordFailedAttempt(email: string) {
  if (!failedAttempts[email]) {
    failedAttempts[email] = { count: 1, lockUntil: 0 };
  } else {
    failedAttempts[email].count += 1;
    if (failedAttempts[email].count >= 5) {
      failedAttempts[email].lockUntil = Date.now() + 15 * 60 * 1000; // 15 minutes lock
    }
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email:    { label: "Email",    type: "email"    },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const { getSanityClient } = await import("@/lib/sanity/client");
        const client = getSanityClient();
        const bcrypt = await import("bcryptjs");

        const normalizedEmail = (credentials.email as string).toLowerCase().trim();

        // Check lock
        const now = Date.now();
        const record = failedAttempts[normalizedEmail];
        if (record && record.count >= 5 && record.lockUntil > now) {
          throw new TooManyAttempts();
        }

        try {
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
                recordFailedAttempt(normalizedEmail);
                return null;
              }
            } else {
              recordFailedAttempt(normalizedEmail);
              return null;
            }
          }

          const pass = credentials.password as string;
          const valid = await bcrypt.compare(pass, userDoc.passwordHash);

          if (valid) {
            // Success: clear failed attempts
            if (failedAttempts[normalizedEmail]) {
              delete failedAttempts[normalizedEmail];
            }
            return {
              id: userDoc._id,
              name: userDoc.email.split("@")[0],
              email: userDoc.email,
              role: userDoc.role ?? "ADMIN",
            };
          } else {
            recordFailedAttempt(normalizedEmail);
            return null;
          }
        } catch (err) {
          if (err instanceof TooManyAttempts) {
            throw err;
          }
          console.error("[Auth] authorize error:", err);

          // Local development fallback if offline / network fails
          const defaultEmail = (process.env.ADMIN_DEFAULT_EMAIL || "admin@cftchurch.com").toLowerCase().trim();
          const defaultPassword = process.env.ADMIN_DEFAULT_PASSWORD || "churchwebpage@2026";
          
          if (normalizedEmail === defaultEmail) {
            const pass = credentials.password as string;
            if (pass === defaultPassword) {
              console.log("[Auth] Offline mode: successfully authenticated using local environment credentials.");
              return {
                id: "local-dev-admin",
                name: "dev-admin",
                email: defaultEmail,
                role: "ADMIN",
              };
            }
          }

          return null;
        }
      },
    }),
  ],
});
