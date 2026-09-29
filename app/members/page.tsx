import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function MembersPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, last_name")
    .eq("id", user.id)
    .maybeSingle();

  async function signOut() {
    "use server";

    const supabase = await createClient();

    await supabase.auth.signOut();

    redirect("/login");
  }

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="border rounded-xl p-8 shadow-sm text-center">
        <h1 className="text-3xl font-bold mb-4">
          Members Area
        </h1>

        <p className="text-gray-600">
          Welcome{" "}
          {profile?.first_name
            ? `${profile.first_name} ${profile.last_name ?? ""}`
            : user.email}
          !
        </p>

        <p className="mt-4 mb-6">
          This page is only visible to signed-in users.
        </p>

        <form action={signOut}>
          <button
            type="submit"
            className="border rounded-lg px-6 py-3 hover:bg-gray-100"
          >
            Sign Out
          </button>
        </form>
      </div>
    </main>
  );
}