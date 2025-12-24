import { NextRequest, NextResponse } from "next/server";
import { generateOpenAPI } from "@/lib/interceptor";

/**
 * POST /api/interceptor/openapi
 * Generate OpenAPI specification from a session
 *
 * Request body:
 * - sessionId: string (required) - Session ID or "latest"
 * - format?: "yaml" | "json" - Output format (default: json)
 * - includeExamples?: boolean - Include request/response examples from traffic
 */
export async function POST(request: NextRequest) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  try {
    const { sessionId, format, includeExamples } = body;

    if (!sessionId || typeof sessionId !== "string") {
      return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
    }

    // Validate format if provided
    const validFormats = ["yaml", "json"];
    if (format && !validFormats.includes(format.toLowerCase())) {
      return NextResponse.json(
        { error: `Invalid format. Must be one of: ${validFormats.join(", ")}` },
        { status: 400 }
      );
    }

    const result = await generateOpenAPI(sessionId, {
      format: format?.toLowerCase() as "yaml" | "json" | undefined,
      includeExamples: includeExamples === true,
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
        { error: result.error || "Failed to generate OpenAPI spec" },
        { status: 500 }
      );
    }

    // For JSON format, parse and return as object
    // For YAML, return as string
    const outputFormat = format?.toLowerCase() || "json";
    if (outputFormat === "json" && typeof result.data === "string") {
      try {
        const parsed = JSON.parse(result.data);
        return NextResponse.json({
          sessionId,
          format: "json",
          spec: parsed,
        });
      } catch {
        // If parsing fails, return as string
        return NextResponse.json({
          sessionId,
          format: "json",
          spec: result.data,
        });
      }
    }

    return NextResponse.json({
      sessionId,
      format: outputFormat,
      spec: result.data,
    });
  } catch (error) {
    console.error("OpenAPI generation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate OpenAPI spec" },
      { status: 500 }
    );
  }
}
