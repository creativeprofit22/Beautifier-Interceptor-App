import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const VALID_INSIGHT_TYPES = ["scan", "openapi", "patterns"] as const;

/**
 * GET /api/interceptor/insights
 * List all saved insights with optional filtering
 *
 * Query params:
 * - sessionId?: string - Filter by session ID
 * - type?: string - Filter by type (scan, openapi, patterns)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");
    const type = searchParams.get("type");

    // Validate type if provided
    if (type && !VALID_INSIGHT_TYPES.includes(type as (typeof VALID_INSIGHT_TYPES)[number])) {
      return NextResponse.json(
        { error: `Invalid type. Must be one of: ${VALID_INSIGHT_TYPES.join(", ")}` },
        { status: 400 }
      );
    }

    const insights = await prisma.insight.findMany({
      where: {
        ...(sessionId && { sessionId }),
        ...(type && { type }),
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ insights });
  } catch (error) {
    console.error("Error fetching insights:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch insights" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/interceptor/insights
 * Save a new insight
 *
 * Request body:
 * - sessionId: string (required) - Session ID
 * - type: string (required) - Type: "scan" | "openapi" | "patterns"
 * - data: object (required) - Full insight data
 */
export async function POST(request: NextRequest) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  try {
    const { sessionId, type, data } = body;

    // Validate required fields
    if (!sessionId || typeof sessionId !== "string") {
      return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
    }

    if (!type || typeof type !== "string") {
      return NextResponse.json({ error: "type is required" }, { status: 400 });
    }

    if (!VALID_INSIGHT_TYPES.includes(type as (typeof VALID_INSIGHT_TYPES)[number])) {
      return NextResponse.json(
        { error: `Invalid type. Must be one of: ${VALID_INSIGHT_TYPES.join(", ")}` },
        { status: 400 }
      );
    }

    if (!data || typeof data !== "object" || data === null || Array.isArray(data)) {
      return NextResponse.json(
        { error: "data is required and must be a non-null object" },
        { status: 400 }
      );
    }

    const insight = await prisma.insight.create({
      data: {
        sessionId,
        type,
        data,
      },
    });

    return NextResponse.json({ insight }, { status: 201 });
  } catch (error) {
    console.error("Error saving insight:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save insight" },
      { status: 500 }
    );
  }
}
