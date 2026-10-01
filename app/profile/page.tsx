"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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

      // Check whether the user is logged in
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setUserId(user.id);
      setEmail(user.email ?? "");

      // Load profile information
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

      // Move to Members Area after saving
      setTimeout(() => {
        router.push("/members");
      }, 1000);
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

    // Upload image to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file);

    if (uploadError) {
      console.error("Avatar upload error:", uploadError);
      setMessage(`Upload error: ${uploadError.message}`);
      setUploading(false);
      return;
    }

    // Get the public image URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(filePath);

    // Save image URL to profiles table
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
        {/* Home */}
        <Link
          href="/"
          className="inline-block mb-6 text-sm hover:underline"
        >
          ← Home
        </Link>

        {/* Header */}
        <h1 className="text-3xl font-bold mb-2">
          Profile
        </h1>

        <p className="text-gray-600 mb-6">
          {email}
        </p>

        {/* Profile Photo */}
        <div className="mb-6">
          <p className="font-medium mb-3">
            Profile Photo
          </p>

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

          {/* Custom English upload button */}
          <label className="inline-block">
            <span className="inline-block border rounded-lg px-4 py-2 cursor-pointer hover:bg-gray-100">
              {uploading
                ? "Uploading..."
                : avatarUrl
                ? "Change Photo"
                : "Choose Photo"}
            </span>

            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>

          <p className="text-xs text-gray-500 mt-2">
            JPG, PNG, or other image formats.
          </p>
        </div>

        {/* Incomplete profile message */}
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

        {/* First Name */}
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

        {/* Last Name */}
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

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full border rounded-lg px-4 py-3 hover:bg-gray-100 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Profile"}
        </button>

        {/* Status */}
        {message && (
          <p className="mt-4 text-sm">
            {message}
          </p>
        )}
      </div>
    </main>
  );
}