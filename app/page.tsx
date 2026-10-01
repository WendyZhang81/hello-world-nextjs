import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      {/* Navigation */}
      <nav className="border-b">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold">
            Humor App
          </Link>

          <div className="flex items-center gap-6 text-sm">
            <Link href="/jokes" className="hover:text-gray-500">
              Jokes
            </Link>

            <Link href="/profile" className="hover:text-gray-500">
              Profile
            </Link>

            <Link href="/members" className="hover:text-gray-500">
              Members
            </Link>

            <Link
              href="/login"
              className="border rounded-lg px-4 py-2 hover:bg-gray-100"
            >
              Sign In
            </Link>
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

            <Link
              href="/login"
              className="border rounded-lg px-6 py-3 hover:bg-gray-100"
            >
              Sign In with Google
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 border-y">
        <div className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-3 gap-8">
          <div className="bg-white border rounded-2xl p-7">
            <h2 className="text-2xl font-semibold mb-3">
              Joke Library
            </h2>

            <p className="text-gray-600 mb-6">
              Explore jokes loaded directly from our Supabase database.
            </p>

            <Link href="/jokes" className="font-medium hover:underline">
              Browse jokes →
            </Link>
          </div>

          <div className="bg-white border rounded-2xl p-7">
            <h2 className="text-2xl font-semibold mb-3">
              Your Profile
            </h2>

            <p className="text-gray-600 mb-6">
              Sign in with Google, update your name, and personalize
              your account with a profile photo.
            </p>

            <Link href="/profile" className="font-medium hover:underline">
              View profile →
            </Link>
          </div>

          <div className="bg-white border rounded-2xl p-7">
            <h2 className="text-2xl font-semibold mb-3">
              Members Area
            </h2>

            <p className="text-gray-600 mb-6">
              Access a private section available only to authenticated
              members.
            </p>

            <Link href="/members" className="font-medium hover:underline">
              Enter members area →
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