import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // 1. Check login status
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "You must be signed in to generate content." },
        { status: 401 }
      );
    }

    // 2. Read prompt
    const body = await request.json();
    const prompt = body.prompt?.trim();

    if (!prompt) {
      return NextResponse.json(
        { error: "Please enter a prompt." },
        { status: 400 }
      );
    }

    // 3. Create Gemini client
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY!,
    });

    const generationPrompt = `
Create one short, funny social-media-style caption based on this situation:

"${prompt}"

Audience:
College students in New York City, especially Columbia students.

Requirements:
- Keep it short.
- Make it funny and relatable.
- Return only the caption.
- Do not explain the joke.
`;

    let response;

    try {
      // Fast model first
      response = await ai.models.generateContent({
        model: "gemini-3.5-flash-lite",
        contents: generationPrompt,
        config: {
          maxOutputTokens: 100,
        },
      });
    } catch (error: any) {
      // If the fast model is temporarily unavailable,
      // fall back to Gemini 3.8 Flash
      if (error?.status === 503) {
        console.log(
          "Gemini 3.5 Flash-Lite is busy. Falling back to Gemini 3.8 Flash..."
        );

        response = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: generationPrompt,
          config: {
            maxOutputTokens: 100,
          },
        });
      } else {
        throw error;
      }
    }

    // 4. Read generated caption
    const generatedContent = response.text?.trim();

    if (!generatedContent) {
      return NextResponse.json(
        { error: "Gemini did not return any content." },
        { status: 500 }
      );
    }

    // 5. Save generation to Supabase
    const { data: generation, error: insertError } = await supabase
      .from("generations")
      .insert({
        user_id: user.id,
        prompt,
        generated_content: generatedContent,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Database insert error:", insertError);

      return NextResponse.json(
        { error: insertError.message },
        { status: 500 }
      );
    }

    // 6. Return the saved generation
    return NextResponse.json({
      generation,
    });
  } catch (error) {
    console.error("Generate API error:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Failed to generate content.";

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}