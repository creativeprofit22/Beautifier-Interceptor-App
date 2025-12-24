import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/interceptor/insights/[id]
 * Get a single insight by ID
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const insight = await prisma.insight.findUnique({
      where: { id },
    });

    if (!insight) {
      return NextResponse.json({ error: "Insight not found" }, { status: 404 });
    }

    return NextResponse.json({ insight });
  } catch (error) {
    console.error("Error fetching insight:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch insight" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/interceptor/insights/[id]
 * Delete an insight by ID
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Check if insight exists
    const existing = await prisma.insight.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Insight not found" }, { status: 404 });
    }

    await prisma.insight.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, deleted: id });
  } catch (error) {
    console.error("Error deleting insight:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete insight" },
      { status: 500 }
    );
  }
}
