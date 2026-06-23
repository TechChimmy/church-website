import { auth } from "@/lib/auth";

/** Shared admin check used by Sanity-mutation API routes.
 *  Returns Sanity-friendly boolean.
 */
export async function requireAdminUser(): Promise<boolean> {
  return Boolean((await auth())?.user);
}

