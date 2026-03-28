import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Server-side client uses SERVICE_ROLE_KEY to bypass RLS.
// Auth is handled by Clerk (not Supabase Auth), so auth.uid() is always null.
// All authorization checks happen in the API route handlers via Clerk's auth().
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing sessions.
          }
        },
      },
    }
  );
}

// Alias — kept for backward compatibility
export const createAdminClient = createClient;
