import { NextRequest, NextResponse } from "next/server";
import { runSecurityScan } from "@/lib/interceptor";

/**
 * POST /api/interceptor/scan
 * Run security vulnerability scan on a session
 *
 * Request body:
 * - sessionId: string (required) - Session ID or "latest"
 * - severity?: string - Minimum severity filter (critical, high, medium, low, info)
 * - category?: string - Comma-separated categories (auth, exposure, api, transport)
 */
export async function POST(request: NextRequest) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  try {
    const { sessionId, severity, category } = body;

    if (!sessionId || typeof sessionId !== "string") {
      return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
    }

    // Validate severity if provided
    const validSeverities = ["critical", "high", "medium", "low", "info"];
    if (severity && !validSeverities.includes(severity.toLowerCase())) {
      return NextResponse.json(
        { error: `Invalid severity. Must be one of: ${validSeverities.join(", ")}` },
        { status: 400 }
      );
    }

    // Validate category if provided
    const validCategories = ["auth", "exposure", "api", "transport"];
    if (category) {
      const categories = category.split(",").map((c: string) => c.trim().toLowerCase());
      const invalidCategories = categories.filter((c: string) => !validCategories.includes(c));
      if (invalidCategories.length > 0) {
        return NextResponse.json(
          {
            error: `Invalid categories: ${invalidCategories.join(", ")}. Must be one of: ${validCategories.join(", ")}`,
          },
          { status: 400 }
        );
      }
    }

    const result = await runSecurityScan(sessionId, {
      severity: severity?.toLowerCase(),
      category: category?.toLowerCase(),
    });

    if (!result.success) {
      // Check for common errors
      if (result.error?.includes("not found")) {
        return NextResponse.json({ error: `Session '${sessionId}' not found` }, { status: 404 });
      }
      if (result.error?.includes("No traffic data")) {
        return NextResponse.json(
          { error: `Session '${sessionId}' has no traffic data` },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: result.error || "Failed to run security scan" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      sessionId,
      scan: result.data,
    });
  } catch (error) {
    console.error("Security scan error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to run security scan" },
      { status: 500 }
    );
  }
}
