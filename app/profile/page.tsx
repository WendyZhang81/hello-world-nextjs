"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ProfilePage() {
  const router = useRouter();

  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      const supabase = createClient();

      // 1. Check whether the user is logged in
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setUserId(user.id);
      setEmail(user.email ?? "");

      // 2. Get the user's profile row
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("first_name, last_name, avatar_url")
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error loading profile:", error.message);
      }

      if (profile) {
        setFirstName(profile.first_name ?? "");
        setLastName(profile.last_name ?? "");
        setAvatarUrl(profile.avatar_url ?? "");
      }

      setLoading(false);
    };

    loadProfile();
  }, [router]);

const handleSave = async () => {
  const supabase = createClient();

  setSaving(true);
  setMessage("");

  const { data, error } = await supabase
    .from("profiles")
    .upsert({
      id: userId,
      first_name: firstName,
      last_name: lastName,
    })
    .select("id, first_name, last_name")
    .single();

  console.log("Saved profile:", data);

  if (error) {
    console.error("Profile update error:", error);
    setMessage(`Error: ${error.message}`);
  } else {
    setFirstName(data.first_name ?? "");
    setLastName(data.last_name ?? "");
    setMessage("Profile saved successfully!");
  }

  setSaving(false);
};

  const handleAvatarUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!userId) {
      setMessage("Please sign in first.");
      return;
    }

    const supabase = createClient();

    setUploading(true);
    setMessage("");

    const fileExtension = file.name.split(".").pop();
    const filePath = `${userId}/${Date.now()}.${fileExtension}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file);

    if (uploadError) {
      console.error("Avatar upload error:", uploadError);
      setMessage(`Upload error: ${uploadError.message}`);
      setUploading(false);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        avatar_url: publicUrl,
      })
      .eq("id", userId);

    if (profileError) {
      console.error("Profile avatar update error:", profileError);
      setMessage(`Error: ${profileError.message}`);
    } else {
      setAvatarUrl(publicUrl);
      setMessage("Profile photo uploaded successfully!");
    }

    setUploading(false);
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p>Loading profile...</p>
      </main>
    );
  }

  const profileIncomplete =
    firstName.trim() === "" || lastName.trim() === "";

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md border rounded-xl p-8 shadow-sm">
        <h1 className="text-3xl font-bold mb-2">
          Profile
        </h1>

        <p className="text-gray-600 mb-6">
          {email}
        </p>

        <div className="mb-6">
          <p className="font-medium mb-3">Profile Photo</p>

          {avatarUrl ? (
            <div
              className="w-24 h-24 rounded-full bg-cover bg-center border mb-4"
              style={{
                backgroundImage: `url(${avatarUrl})`,
              }}
            />
          ) : (
            <div className="w-24 h-24 rounded-full border flex items-center justify-center mb-4 text-gray-500">
              No Photo
            </div>
          )}

          <input
            type="file"
            accept="image/*"
            onChange={handleAvatarUpload}
            disabled={uploading}
          />

          {uploading && (
            <p className="text-sm text-gray-600 mt-2">
              Uploading...
            </p>
          )}
        </div>

        {profileIncomplete && (
          <div className="border rounded-lg p-4 mb-6">
            <p className="font-semibold">
              Please complete your profile
            </p>

            <p className="text-sm text-gray-600 mt-1">
              Add your first name and last name to continue.
            </p>
          </div>
        )}

        <div className="mb-4">
          <label className="block font-medium mb-2">
            First Name
          </label>

          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>

        <div className="mb-6">
          <label className="block font-medium mb-2">
            Last Name
          </label>

          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full border rounded-lg px-4 py-3 hover:bg-gray-100"
        >
          {saving ? "Saving..." : "Save Profile"}
        </button>

        {message && (
          <p className="mt-4 text-sm">
            {message}
          </p>
        )}
      </div>
    </main>
  );
}