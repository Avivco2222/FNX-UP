import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

// ----------------------------------------------------------------
// Auth helper (server-side) — uses @supabase/ssr for cookie compat
// ----------------------------------------------------------------

async function getUser() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) return null;

  const cookieStore = cookies();

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...options });
        } catch {
          // set() can fail in Server Components — safe to ignore
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value: '', ...options });
        } catch {
          // remove() can fail in Server Components — safe to ignore
        }
      },
    },
  });

  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) return null;

  // Fetch the user's profile row
  const { data: profile } = await supabase
    .from('users')
    .select('display_name, email, avatar_url, current_xp, coins_balance, current_level')
    .eq('id', authUser.id)
    .single();

  return profile
    ? {
        displayName: (profile.display_name as string) ?? authUser.email ?? 'User',
        email: (profile.email as string) ?? authUser.email ?? '',
        avatarUrl: profile.avatar_url as string | null,
        currentXp: (profile.current_xp as number) ?? 0,
        coinsBalance: (profile.coins_balance as number) ?? 0,
      }
    : {
        displayName: authUser.email ?? 'User',
        email: authUser.email ?? '',
        avatarUrl: null,
        currentXp: 0,
        coinsBalance: 0,
      };
}

// ----------------------------------------------------------------
// Layout
// ----------------------------------------------------------------

/**
 * User-facing layout (Route Group: (user)).
 *
 * During development / demo mode we bypass the auth redirect and show
 * mock data so the UI can be previewed without Supabase running.
 * Set NEXT_PUBLIC_DEMO_MODE=true in .env.local to enable this.
 */
export default async function UserLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

  let userData;

  if (isDemoMode) {
    // Mock user for demo / development
    userData = {
      displayName: 'Noa Levinson',
      email: 'noa@fnx.co.il',
      avatarUrl: null,
      currentXp: 2850,
      coinsBalance: 1420,
    };
  } else {
    userData = await getUser();

    if (!userData) {
      redirect('/login');
    }
  }

  return (
    <>
      {children}
    </>
  );
}
