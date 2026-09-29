"use client";

import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const handleGoogleLogin = async () => {
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      console.error("Google login error:", error.message);
      alert("Login failed. Please try again.");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="border rounded-xl p-8 shadow-sm text-center">
        <h1 className="text-3xl font-bold mb-3">
          Sign In
        </h1>

        <p className="text-gray-600 mb-6">
          Sign in to continue to the Humor App.
        </p>

        <button
          onClick={handleGoogleLogin}
          className="border rounded-lg px-6 py-3 hover:bg-gray-100"
        >
          Continue with Google
        </button>
      </div>
    </main>
  );
}