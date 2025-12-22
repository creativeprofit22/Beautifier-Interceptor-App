import { NextRequest, NextResponse } from "next/server";
import { EXPLANATION_PROMPT } from "@/lib/prompts";
import { runClaudeCommand, MAX_CODE_SIZE, TIMEOUT_MS } from "@/lib/claude";

export async function POST(request: NextRequest) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  try {
    const { code } = body;

    if (!code || typeof code !== "string") {
      return NextResponse.json({ error: "Code is required" }, { status: 400 });
    }

    if (code.length > MAX_CODE_SIZE) {
      return NextResponse.json(
        { error: `Code exceeds maximum size of ${MAX_CODE_SIZE / 1024}KB` },
        { status: 400 }
      );
    }

    const explanation = await runClaudeCommand(EXPLANATION_PROMPT, code, TIMEOUT_MS);

    return NextResponse.json({ explanation });
  } catch (error) {
    console.error("Explain error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to explain code" },
      { status: 500 }
    );
  }
}
