import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

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

            <Link
              href="/feed"
              className="hover:text-gray-500"
            >
              Community
            </Link>

            {/* New Ranking Board link */}
            <Link
              href="/ranking"
              className="hover:text-gray-500"
            >
              Rankings
            </Link>

            {user && (
              <Link
                href="/generate"
                className="hover:text-gray-500"
              >
                Generate
              </Link>
            )}

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
                prefetch={false}
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
            AI HUMOR & COMMUNITY
          </p>

          <h1 className="text-6xl font-bold tracking-tight mb-6">
            Discover, generate, and rate humor.
          </h1>

          <p className="text-xl text-gray-600 leading-relaxed mb-10">
            Explore jokes, generate AI-powered captions inspired by
            college life and New York City, vote on the funniest
            creations, and see which captions rise to the top.
          </p>

          <div className="flex flex-wrap gap-4">
            <Link
              href="/feed"
              className="bg-black text-white rounded-lg px-6 py-3 hover:bg-gray-800"
            >
              Explore Community
            </Link>

            <Link
              href="/ranking"
              className="border rounded-lg px-6 py-3 hover:bg-gray-100"
            >
              View Rankings
            </Link>

            {user ? (
              <Link
                href="/generate"
                className="border rounded-lg px-6 py-3 hover:bg-gray-100"
              >
                Generate a Caption
              </Link>
            ) : (
              <Link
                href="/login"
                prefetch={false}
                className="border rounded-lg px-6 py-3 hover:bg-gray-100"
              >
                Sign In to Generate
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 border-y">
        <div className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-2 lg:grid-cols-3 gap-6">

          {/* Community Feed */}
          <div className="bg-white border rounded-2xl p-7">
            <h2 className="text-2xl font-semibold mb-3">
              Community Feed
            </h2>

            <p className="text-gray-600 mb-6">
              Browse AI-generated captions and vote on what the
              community thinks is actually funny.
            </p>

            <Link
              href="/feed"
              className="font-medium hover:underline"
            >
              Explore & vote →
            </Link>
          </div>

          {/* Ranking Board */}
          <div className="bg-white border rounded-2xl p-7">
            <h2 className="text-2xl font-semibold mb-3">
              🏆 Ranking Board
            </h2>

            <p className="text-gray-600 mb-6">
              See which AI-generated captions are ranked the funniest
              by the community.
            </p>

            <Link
              href="/ranking"
              className="font-medium hover:underline"
            >
              View top captions →
            </Link>
          </div>

          {/* AI Generator */}
          <div className="bg-white border rounded-2xl p-7">
            <h2 className="text-2xl font-semibold mb-3">
              AI Generator
            </h2>

            <p className="text-gray-600 mb-6">
              Turn a relatable Columbia or NYC moment into an
              AI-generated humorous caption.
            </p>

            <Link
              href={user ? "/generate" : "/login"}
              className="font-medium hover:underline"
            >
              {user
                ? "Generate caption →"
                : "Sign in to generate →"}
            </Link>
          </div>

          {/* Joke Library */}
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
              {user
                ? "View profile →"
                : "Sign in to create profile →"}
            </Link>
          </div>

          {/* Community Competition */}
          <div className="bg-white border rounded-2xl p-7">
            <h2 className="text-2xl font-semibold mb-3">
              Community Competition
            </h2>

            <p className="text-gray-600 mb-6">
              Generate better captions, earn community votes, and
              compete for a spot on the leaderboard.
            </p>

            <Link
              href="/ranking"
              className="font-medium hover:underline"
            >
              See what's trending →
            </Link>
          </div>
        </div>
      </section>

      {/* Product idea */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="max-w-3xl">
          <p className="text-sm font-medium text-gray-500 mb-3">
            BUILT FOR CAMPUS LIFE
          </p>

          <h2 className="text-3xl font-bold mb-4">
            Humor inspired by the moments students actually live.
          </h2>

          <p className="text-gray-600 leading-relaxed mb-6">
            From waiting for the 1 train to late nights in Butler,
            users can turn everyday Columbia and NYC experiences into
            AI-generated humor and let the community decide what lands.
          </p>

          <p className="text-gray-600 leading-relaxed">
            Community voting powers the ranking board, allowing the
            funniest captions to rise to the top and giving users a
            reason to come back and see what is trending.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="max-w-6xl mx-auto px-6 py-10 flex justify-between text-sm text-gray-500">
          <p>Humor App</p>
          <p>Built with Next.js, Supabase & Gemini</p>
        </div>
      </footer>
    </main>
  );
}