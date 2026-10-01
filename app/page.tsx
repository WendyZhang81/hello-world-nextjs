import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();

  // Check current login status
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile = null;

  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("first_name, last_name, avatar_url")
      .eq("id", user.id)
      .maybeSingle();

    profile = data;
  }

  const displayName = profile?.first_name
    ? `${profile.first_name} ${profile.last_name ?? ""}`.trim()
    : user?.email ?? "";

  const initial = profile?.first_name
    ? profile.first_name.charAt(0).toUpperCase()
    : user?.email?.charAt(0).toUpperCase() ?? "?";

  async function signOut() {
    "use server";

    const supabase = await createClient();
    await supabase.auth.signOut();

    redirect("/");
  }

  return (
    <main className="min-h-screen bg-white text-gray-900">
      {/* Navigation */}
      <nav className="border-b">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold">
            Humor App
          </Link>

          <div className="flex items-center gap-6 text-sm">
            <Link
              href="/jokes"
              className="hover:text-gray-500"
            >
              Jokes
            </Link>

            {user ? (
              <>
                <Link
                  href="/members"
                  className="hover:text-gray-500"
                >
                  Members
                </Link>

                {/* Logged-in account */}
                <Link
                  href="/profile"
                  className="flex items-center gap-2 hover:opacity-70"
                >
                  {profile?.avatar_url ? (
                    <div
                      className="w-9 h-9 rounded-full bg-cover bg-center border"
                      style={{
                        backgroundImage: `url(${profile.avatar_url})`,
                      }}
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full border flex items-center justify-center font-medium">
                      {initial}
                    </div>
                  )}

                  <span className="font-medium">
                    {displayName}
                  </span>
                </Link>

                <form action={signOut}>
                  <button
                    type="submit"
                    className="text-gray-500 hover:text-black"
                  >
                    Sign Out
                  </button>
                </form>
              </>
            ) : (
              <Link
                href="/login"
                className="border rounded-lg px-4 py-2 hover:bg-gray-100"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="max-w-3xl">
          <p className="text-sm font-medium text-gray-500 mb-4">
            HUMOR, PROFILES & COMMUNITY
          </p>

          <h1 className="text-6xl font-bold tracking-tight mb-6">
            Discover a little humor.
          </h1>

          <p className="text-xl text-gray-600 leading-relaxed mb-10">
            Browse jokes, create your profile, and join a simple
            community experience powered by Next.js and Supabase.
          </p>

          <div className="flex gap-4">
            <Link
              href="/jokes"
              className="bg-black text-white rounded-lg px-6 py-3 hover:bg-gray-800"
            >
              Explore Jokes
            </Link>

            {user ? (
              <Link
                href="/profile"
                className="border rounded-lg px-6 py-3 hover:bg-gray-100"
              >
                View My Profile
              </Link>
            ) : (
              <Link
                href="/login"
                className="border rounded-lg px-6 py-3 hover:bg-gray-100"
              >
                Sign In with Google
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 border-y">
        <div className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-3 gap-8">
          {/* Jokes */}
          <div className="bg-white border rounded-2xl p-7">
            <h2 className="text-2xl font-semibold mb-3">
              Joke Library
            </h2>

            <p className="text-gray-600 mb-6">
              Explore jokes loaded directly from our Supabase database.
            </p>

            <Link
              href="/jokes"
              className="font-medium hover:underline"
            >
              Browse jokes →
            </Link>
          </div>

          {/* Profile */}
          <div className="bg-white border rounded-2xl p-7">
            <h2 className="text-2xl font-semibold mb-3">
              Your Profile
            </h2>

            <p className="text-gray-600 mb-6">
              Personalize your account with your name and profile photo.
            </p>

            <Link
              href={user ? "/profile" : "/login"}
              className="font-medium hover:underline"
            >
              {user ? "View profile →" : "Sign in to create profile →"}
            </Link>
          </div>

          {/* Members */}
          <div className="bg-white border rounded-2xl p-7">
            <h2 className="text-2xl font-semibold mb-3">
              Members Area
            </h2>

            <p className="text-gray-600 mb-6">
              Access a private section available only to authenticated
              members.
            </p>

            <Link
              href={user ? "/members" : "/login"}
              className="font-medium hover:underline"
            >
              {user ? "Enter members area →" : "Sign in to access →"}
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-6 py-10 flex justify-between text-sm text-gray-500">
        <p>Humor App</p>
        <p>Built with Next.js and Supabase</p>
      </footer>
    </main>
  );
}