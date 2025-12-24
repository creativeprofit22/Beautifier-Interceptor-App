import { NextRequest, NextResponse } from "next/server";
import { runInterceptorCommand } from "@/lib/interceptor";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/interceptor/sessions/[id]
 * Get session details and traffic data
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: sessionId } = await params;

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
    }

    // Get session details with --json flag
    const result = await runInterceptorCommand(["sessions", "show", sessionId, "--json"]);

    if (!result.success) {
      // Check if session not found
      if (result.error?.includes("not found")) {
        return NextResponse.json({ error: `Session '${sessionId}' not found` }, { status: 404 });
      }
      return NextResponse.json({ error: result.error || "Failed to get session" }, { status: 500 });
    }

    return NextResponse.json({ session: result.data });
  } catch (error) {
    console.error("Session show error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to get session" },
      { status: 500 }
    );
  }
}
