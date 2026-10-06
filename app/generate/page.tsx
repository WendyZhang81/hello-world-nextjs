"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Generation = {
  id: string;
  prompt: string;
  generated_content: string;
  created_at: string;
};

export default function GeneratePage() {
  const router = useRouter();

  const [prompt, setPrompt] = useState("");
  const [generation, setGeneration] = useState<Generation | null>(null);

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setCheckingAuth(false);
    };

    checkUser();
  }, [router]);

  const handleGenerate = async (event: FormEvent) => {
    event.preventDefault();

    if (!prompt.trim()) {
      setMessage("Please describe a situation first.");
      return;
    }

    setGenerating(true);
    setMessage("");
    setGeneration(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
        }),
      });

      const data = await response.json();

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (!response.ok) {
        setMessage(data.error ?? "Something went wrong.");
        return;
      }

      setGeneration(data.generation);
      setMessage("Caption generated and saved successfully!");
    } catch (error) {
      console.error("Generate request error:", error);
      setMessage("Failed to generate a caption. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  if (checkingAuth) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Checking your account...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-12">
          <Link
            href="/"
            className="text-sm hover:underline"
          >
            ← Home
          </Link>

          <Link
            href="/members"
            className="text-sm hover:underline"
          >
            Members Area
          </Link>
        </div>

        {/* Header */}
        <div className="mb-10">
          <p className="text-sm font-medium text-gray-500 mb-3">
            AI HUMOR GENERATOR
          </p>

          <h1 className="text-4xl font-bold mb-4">
            Turn a situation into a joke.
          </h1>

          <p className="text-gray-600 leading-relaxed">
            Describe a relatable college or New York City moment and let AI
            create a short humorous caption.
          </p>
        </div>

        {/* Generator Form */}
        <form
          onSubmit={handleGenerate}
          className="border rounded-2xl p-6 shadow-sm"
        >
          <label
            htmlFor="prompt"
            className="block font-medium mb-3"
          >
            Describe a situation
          </label>

          <textarea
            id="prompt"
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            placeholder="Example: A Columbia student studying at Butler Library at 3 AM"
            rows={5}
            disabled={generating}
            className="w-full border rounded-xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-gray-300"
          />

          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-gray-500">
              Try campus life, dorms, the subway, finals, dating, or NYC.
            </p>

            <button
              type="submit"
              disabled={generating || !prompt.trim()}
              className="bg-black text-white rounded-lg px-6 py-3 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {generating ? "Generating..." : "Generate Caption"}
            </button>
          </div>
        </form>

        {/* Status Message */}
        {message && (
          <p className="mt-5 text-sm text-gray-600">
            {message}
          </p>
        )}

        {/* Generated Result */}
        {generation && (
          <section className="mt-10">
            <p className="text-sm font-medium text-gray-500 mb-3">
              AI GENERATED CAPTION
            </p>

            <div className="border rounded-2xl p-7 bg-gray-50">
              <p className="text-sm text-gray-500 mb-3">
                Prompt
              </p>

              <p className="mb-6">
                {generation.prompt}
              </p>

              <p className="text-sm text-gray-500 mb-3">
                Caption
              </p>

              <p className="text-2xl font-semibold leading-relaxed">
                “{generation.generated_content}”
              </p>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}