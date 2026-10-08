"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Generation = {
  id: string;
  prompt: string;
  generated_content: string;
  created_at: string;
};

type Vote = {
  generation_id: string;
  vote: number;
};

type RankedGeneration = Generation & {
  upvotes: number;
  downvotes: number;
  score: number;
  totalVotes: number;
  funnyRate: number;
};

export default function RankingPage() {
  const [rankings, setRankings] = useState<RankedGeneration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRankings = async () => {
      const supabase = createClient();

      // Load all AI generations
      const { data: generations, error: generationError } =
        await supabase
          .from("generations")
          .select("id, prompt, generated_content, created_at");

      if (generationError) {
        console.error(
          "Error loading generations:",
          generationError.message
        );

        setLoading(false);
        return;
      }

      // Load all votes
      const { data: votes, error: voteError } = await supabase
        .from("votes")
        .select("generation_id, vote");

      if (voteError) {
        console.error(
          "Error loading votes:",
          voteError.message
        );

        setLoading(false);
        return;
      }

      const ranked = (generations ?? []).map((generation) => {
        const generationVotes = (votes ?? []).filter(
          (vote) => vote.generation_id === generation.id
        );

        const upvotes = generationVotes.filter(
          (vote) => vote.vote === 1
        ).length;

        const downvotes = generationVotes.filter(
          (vote) => vote.vote === -1
        ).length;

        const totalVotes = upvotes + downvotes;

        const score = upvotes - downvotes;

        const funnyRate =
          totalVotes > 0
            ? Math.round((upvotes / totalVotes) * 100)
            : 0;

        return {
          ...generation,
          upvotes,
          downvotes,
          totalVotes,
          score,
          funnyRate,
        };
      });

      // Rank by:
      // 1. Highest score
      // 2. Highest funny rate
      // 3. Most votes
      // 4. Newest
      ranked.sort((a, b) => {
        if (b.score !== a.score) {
          return b.score - a.score;
        }

        if (b.funnyRate !== a.funnyRate) {
          return b.funnyRate - a.funnyRate;
        }

        if (b.totalVotes !== a.totalVotes) {
          return b.totalVotes - a.totalVotes;
        }

        return (
          new Date(b.created_at).getTime() -
          new Date(a.created_at).getTime()
        );
      });

      setRankings(ranked.slice(0, 10));
      setLoading(false);
    };

    loadRankings();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">
          Loading rankings...
        </p>
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

          <div className="flex gap-6 text-sm">
            <Link
              href="/feed"
              className="hover:underline"
            >
              Community
            </Link>

            <Link
              href="/generate"
              className="hover:underline"
            >
              Generate
            </Link>
          </div>
        </div>

        {/* Header */}
        <div className="mb-10">
          <p className="text-sm font-medium text-gray-500 mb-3">
            COMMUNITY RANKING
          </p>

          <h1 className="text-4xl font-bold mb-4">
            🏆 Funniest Captions
          </h1>

          <p className="text-gray-600">
            The community decides which AI-generated captions
            deserve the top spot.
          </p>
        </div>

        {rankings.length === 0 ? (
          <div className="border rounded-2xl p-8 text-center">
            <p className="text-gray-600">
              No captions have been generated yet.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {rankings.map((generation, index) => (
              <article
                key={generation.id}
                className="border rounded-2xl p-7 shadow-sm"
              >
                <div className="flex items-start justify-between gap-6">

                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-500 mb-4">
                      #{index + 1}
                    </p>

                    <p className="text-xs font-medium text-gray-500 uppercase mb-2">
                      Prompt
                    </p>

                    <p className="text-gray-600 mb-5">
                      {generation.prompt}
                    </p>

                    <p className="text-xs font-medium text-gray-500 uppercase mb-2">
                      AI Caption
                    </p>

                    <p className="text-2xl font-semibold leading-relaxed">
                      “{generation.generated_content}”
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-5 mt-7 pt-5 border-t text-sm">
                  <span>
                    👍 {generation.upvotes}
                  </span>

                  <span>
                    👎 {generation.downvotes}
                  </span>

                  <span className="font-medium">
                    Score: {generation.score}
                  </span>

                  {generation.totalVotes > 0 && (
                    <span className="text-gray-500">
                      {generation.funnyRate}% Funny
                    </span>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}