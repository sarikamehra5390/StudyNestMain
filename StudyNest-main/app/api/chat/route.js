import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Extracts JSON from Gemini's response string.
 * This ensures that even if Gemini adds extra text, the app doesn't crash.
 */
function safeJSON(text) {
  try {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("No JSON found");
    return JSON.parse(match[0]);
  } catch (error) {
    console.error("JSON Parsing Error:", error, "Raw Text:", text);
    throw new Error("Invalid response format from AI");
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { topic, userAnswer, currentQuestion, mode, difficulty } = body;

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    // 🧠 MODE: Generate Question
    if (mode === "generate" && topic) {
      const prompt = `
        You are an expert technical interviewer.
        Topic: ${topic}
        Difficulty Level: ${difficulty || "Medium"}

        Rules for Difficulty:
        - Easy: Focus on basic definitions, syntax, and fundamental concepts.
        - Medium: Focus on practical application and "how things work."
        - Hard: Focus on deep architecture, edge cases, and performance.

        Task: Ask ONE interview question.
        Return ONLY valid JSON: {"question":"..."}
      `;

      const result = await model.generateContent(prompt);
      const rawText = result.response.text();
      return NextResponse.json(safeJSON(rawText));
    }

    // 🧪 MODE: Analyze Answer
    if (mode === "analyze" && userAnswer && currentQuestion) {
      const prompt = `
        Context: Evaluate a spoken technical interview response.
        Question: ${currentQuestion}
        Transcript: "${userAnswer}"

        Metrics (0-10):
        1. Correctness: Technical accuracy of the answer.
        2. Clarity: Logical structure and communication.
        3. Confidence: Detect filler words (um, uh, like) or stutters in transcript.

        Return ONLY a JSON object:
        {
          "correctness": number,
          "clarity": number,
          "confidence": number,
          "feedback": "A 2-sentence feedback for improvement."
        }
      `;

      const result = await model.generateContent(prompt);
      const rawText = result.response.text();
      return NextResponse.json(safeJSON(rawText));
    }

    return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  } catch (err) {
    console.error("API ERROR:", err);
    return NextResponse.json(
      { error: "Gemini failed", details: err.message },
      { status: 500 }
    );
  }
}