import connectDB from "@/lib/db";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { message, role } = await req.json();
    const prompt = `
You are an intelligent AI assistant integrated inside a professional web application.

Your responsibilities:
- Provide clear, concise, and professional responses.
- Understand the user's role and question.
- If the query is technical, provide structured explanations.
- If the query is general, provide helpful and accurate information.
- Keep responses concise but informative.

User Role: ${role}

User Message:
"${message}"

Instructions:
- Respond professionally.
- Use simple and clear language.
- If necessary, provide bullet points or short explanations.
- Avoid unnecessary filler text.
`;

    const openaiKey = process.env.OPENAI_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;
    const geminiModel = process.env.GEMINI_MODEL || "gemini-1.5-flash";

    let aiMessage = "";

    if (openaiKey) {
      const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GEMINI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content:
                "You are a concise assistant helping with delivery chat quick replies.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 160,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        console.error("OpenAI API error:", data);

        const apiError: any = (data as any)?.error || {};
        const message = apiError.message || "Failed to get AI suggestion";

        return new Response(
          JSON.stringify({ error: { message, status: response.status } }),
          { status: response.status || 500 },
        );
      }

      aiMessage =
        data.choices?.[0]?.message?.content?.trim() ||
        "Sorry, I couldn't generate a suggestion.";
    } else if (geminiKey) {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${geminiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt,
                  },
                ],
              },
            ],
          }),
        },
      );

      const data = await response.json();
      if (!response.ok) {
        console.error("Gemini API error:", data);

        const apiError: any = (data as any)?.error || {};
        const message = apiError.message || "Failed to get AI suggestion";
        const statusCode =
          apiError.code === 503 || apiError.status === "UNAVAILABLE"
            ? 503
            : 500;

        return new Response(
          JSON.stringify({ error: { message, status: statusCode } }),
          { status: statusCode },
        );
      }

      aiMessage =
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        "Sorry, I couldn't generate a suggestion.";
    } else {
      console.error("No AI provider configured (OPENAI_API_KEY or GEMINI_API_KEY)");
      return new Response(
        JSON.stringify({
          error: {
            message:
              "AI suggestions are not configured. Please set OPENAI_API_KEY or GEMINI_API_KEY.",
            status: 500,
          },
        }),
        { status: 500 },
      );
    }
    return new Response(JSON.stringify({ suggestion: aiMessage }), {
      status: 200,
    });
  } catch (error) {
    console.error("Error generating AI suggestion:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate AI suggestion" }),
      { status: 500 },
    );
  }
}
