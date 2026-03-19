import { NextResponse } from "next/server";
import { model } from "@/lib/gemini";

export async function POST(req) {
    try {
        const { topic } = await req.json();

        const prompt = `Generate a catchy, short title (maximum 4 words) for a quiz about: "${topic}". Return ONLY the title text, no quotes or extra characters.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const title = response.text().trim().replace(/^["']|["']$/g, '');

        return NextResponse.json({ title });
    } catch (error) {
        console.error("Error generating title:", error);
        return NextResponse.json(
            { error: "Failed to generate title" },
            { status: 500 }
        );
    }
}
