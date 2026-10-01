import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default async function JokesPage() {
  const { data: jokes, error } = await supabase
    .from("jokes")
    .select("*")
    .order("id", { ascending: true });

  if (error) {
    return (
      <main className="max-w-3xl mx-auto p-8">
        <Link
          href="/"
          className="inline-block mb-6 border rounded-lg px-4 py-2 hover:bg-gray-100"
        >
          ← Back to Home
        </Link>

        <h1 className="text-3xl font-bold mb-4">
          Joke List
        </h1>

        <p className="text-red-500">
          Error loading jokes: {error.message}
        </p>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto p-8">
      <Link
        href="/"
        className="inline-block mb-6 border rounded-lg px-4 py-2 hover:bg-gray-100"
      >
        ← Back to Home
      </Link>

      <h1 className="text-3xl font-bold mb-2">
        Joke List
      </h1>

      <p className="text-gray-600 mb-8">
        Jokes loaded from Supabase
      </p>

      <div className="space-y-4">
        {jokes?.map((joke) => (
          <div
            key={joke.id}
            className="border rounded-lg p-5 shadow-sm"
          >
            <h2 className="text-xl font-semibold">
              {joke.title}
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              {joke.category}
            </p>

            <p className="mt-3">
              {joke.content}
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}