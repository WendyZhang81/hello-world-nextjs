"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Generation = {
  id: string;
  user_id: string;
  prompt: string;
  generated_content: string;
  created_at: string;
};

type Vote = {
  id: string;
  user_id: string;
  generation_id: string;
  vote: number;
};

export default function FeedPage() {
  const router = useRouter();

  const [generations, setGenerations] = useState<Generation[]>([]);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [votingId, setVotingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadFeed();
  }, []);

  const loadFeed = async () => {
    const supabase = createClient();

    // Check current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    setCurrentUserId(user?.id ?? null);

    // Load AI generations
    const { data: generationData, error: generationError } =
      await supabase
        .from("generations")
        .select("*")
        .order("created_at", { ascending: false });

    if (generationError) {
      console.error(
        "Error loading generations:",
        generationError.message
      );
    }

    // Load votes
    const { data: voteData, error: voteError } = await supabase
      .from("votes")
      .select("*");

    if (voteError) {
      console.error("Error loading votes:", voteError.message);
    }

    setGenerations(generationData ?? []);
    setVotes(voteData ?? []);
    setLoading(false);
  };

  const handleVote = async (
    generationId: string,
    voteValue: 1 | -1
  ) => {
    const supabase = createClient();

    setMessage("");

    // User must be logged in
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    // Check whether this user already voted
    const existingVote = votes.find(
      (vote) =>
        vote.generation_id === generationId &&
        vote.user_id === user.id
    );

    if (existingVote) {
      setMessage(
        "You have already voted on this caption."
      );
      return;
    }

    setVotingId(generationId);

    const { error } = await supabase
      .from("votes")
      .insert({
        user_id: user.id,
        generation_id: generationId,
        vote: voteValue,
      });

    if (error) {
      console.error("Vote error:", error);

      if (error.code === "23505") {
        setMessage(
          "You have already voted on this caption."
        );
      } else {
        setMessage(`Vote failed: ${error.message}`);
      }

      setVotingId(null);
      return;
    }

    setMessage("Vote submitted!");

    // Reload votes so counts update immediately
    const { data: updatedVotes } = await supabase
      .from("votes")
      .select("*");

    setVotes(updatedVotes ?? []);
    setVotingId(null);
  };

  const getUpvotes = (generationId: string) => {
    return votes.filter(
      (vote) =>
        vote.generation_id === generationId &&
        vote.vote === 1
    ).length;
  };

  const getDownvotes = (generationId: string) => {
    return votes.filter(
      (vote) =>
        vote.generation_id === generationId &&
        vote.vote === -1
    ).length;
  };

  const getMyVote = (generationId: string) => {
    if (!currentUserId) {
      return null;
    }

    return votes.find(
      (vote) =>
        vote.generation_id === generationId &&
        vote.user_id === currentUserId
    );
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">
          Loading community feed...
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
              href="/generate"
              className="hover:underline"
            >
              Generate
            </Link>

            {currentUserId ? (
              <Link
                href="/profile"
                className="hover:underline"
              >
                Profile
              </Link>
            ) : (
              <Link
                href="/login"
                className="hover:underline"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>

        {/* Header */}
        <div className="mb-10">
          <p className="text-sm font-medium text-gray-500 mb-3">
            COMMUNITY HUMOR
          </p>

          <h1 className="text-4xl font-bold mb-4">
            Rate what AI came up with.
          </h1>

          <p className="text-gray-600 leading-relaxed">
            Browse AI-generated captions from the community.
            Sign in to vote for the ones that deserve a laugh.
          </p>
        </div>

        {/* Status Message */}
        {message && (
          <div className="border rounded-lg px-4 py-3 mb-6 text-sm">
            {message}
          </div>
        )}

        {/* Empty State */}
        {generations.length === 0 && (
          <div className="border rounded-2xl p-8 text-center">
            <h2 className="text-xl font-semibold mb-2">
              No captions yet
            </h2>

            <p className="text-gray-600 mb-6">
              Be the first person to generate something funny.
            </p>

            <Link
              href="/generate"
              className="inline-block bg-black text-white rounded-lg px-5 py-3"
            >
              Generate a Caption
            </Link>
          </div>
        )}

        {/* Feed */}
        <div className="space-y-6">
          {generations.map((generation) => {
            const upvotes = getUpvotes(generation.id);
            const downvotes = getDownvotes(generation.id);
            const myVote = getMyVote(generation.id);

            return (
              <article
                key={generation.id}
                className="border rounded-2xl p-7 shadow-sm"
              >
                <p className="text-xs font-medium text-gray-500 uppercase mb-2">
                  Prompt
                </p>

                <p className="text-gray-700 mb-6">
                  {generation.prompt}
                </p>

                <p className="text-xs font-medium text-gray-500 uppercase mb-2">
                  AI Caption
                </p>

                <p className="text-2xl font-semibold leading-relaxed mb-8">
                  “{generation.generated_content}”
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex gap-3">
                    <button
                      onClick={() =>
                        handleVote(generation.id, 1)
                      }
                      disabled={
                        votingId === generation.id ||
                        !!myVote
                      }
                      className={`border rounded-lg px-4 py-2 ${
                        myVote?.vote === 1
                          ? "bg-gray-200"
                          : "hover:bg-gray-100"
                      } disabled:opacity-60`}
                    >
                      👍 Funny {upvotes}
                    </button>

                    <button
                      onClick={() =>
                        handleVote(generation.id, -1)
                      }
                      disabled={
                        votingId === generation.id ||
                        !!myVote
                      }
                      className={`border rounded-lg px-4 py-2 ${
                        myVote?.vote === -1
                          ? "bg-gray-200"
                          : "hover:bg-gray-100"
                      } disabled:opacity-60`}
                    >
                      👎 Not Funny {downvotes}
                    </button>
                  </div>

                  {!currentUserId && (
                    <Link
                      href="/login"
                      className="text-sm text-gray-500 hover:underline"
                    >
                      Sign in to vote
                    </Link>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </main>
  );
}
