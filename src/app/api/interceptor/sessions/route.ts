import { NextRequest, NextResponse } from "next/server";
import { runInterceptorCommand } from "@/lib/interceptor";

/**
 * GET /api/interceptor/sessions
 * List all capture sessions
 */
export async function GET() {
  try {
    const result = await runInterceptorCommand(["sessions", "list", "--json"]);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to list sessions" },
        { status: 500 }
      );
    }

    return NextResponse.json({ sessions: result.data });
  } catch (error) {
    console.error("Sessions list error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to list sessions" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/interceptor/sessions
 * Delete a session by ID (passed in request body)
 */
export async function DELETE(request: NextRequest) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  try {
    const { sessionId } = body;

    if (!sessionId || typeof sessionId !== "string") {
      return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
    }

    // Use --force to skip interactive confirmation
    const result = await runInterceptorCommand([
      "sessions",
      "delete",
      sessionId,
      "--force",
      "--json",
    ]);

    if (!result.success) {
      // Check if session not found
      if (result.error?.includes("not found")) {
        return NextResponse.json({ error: `Session '${sessionId}' not found` }, { status: 404 });
      }
      return NextResponse.json(
        { error: result.error || "Failed to delete session" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Session '${sessionId}' deleted`,
    });
  } catch (error) {
    console.error("Session delete error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete session" },
      { status: 500 }
    );
  }
}
