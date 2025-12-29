import { NextRequest, NextResponse } from "next/server";
import { readFile, access } from "fs/promises";
import { join, resolve } from "path";

const OUTPUT_DIR = "/tmp/android-re-output";

// Allowed file extensions for reading
const ALLOWED_EXTENSIONS = [
  ".java",
  ".kt",
  ".xml",
  ".json",
  ".txt",
  ".properties",
  ".gradle",
  ".pro",
  ".cfg",
  ".md",
  ".html",
  ".css",
  ".js",
  ".c",
  ".h",
  ".cpp",
  ".hpp",
];

/**
 * GET /api/android-re/file
 * Read a decompiled file's content.
 *
 * Query params:
 * - jobId: string (required) - The decompilation job ID
 * - path: string (required) - Relative path to the file within the output
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get("jobId");
  const filePath = searchParams.get("path");

  if (!jobId) {
    return NextResponse.json({ error: "jobId is required" }, { status: 400 });
  }

  if (!filePath) {
    return NextResponse.json({ error: "path is required" }, { status: 400 });
  }

  // Validate jobId format to prevent path traversal
  if (!/^jadx-\d+-[a-z0-9]+$/.test(jobId) && !/^ghidra-\d+-[a-z0-9]+$/.test(jobId)) {
    return NextResponse.json({ error: "Invalid jobId format" }, { status: 400 });
  }

  // Prevent path traversal
  if (filePath.includes("..") || filePath.startsWith("/")) {
    return NextResponse.json({ error: "Invalid file path" }, { status: 400 });
  }

  // Check file extension
  const ext = filePath.substring(filePath.lastIndexOf(".")).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return NextResponse.json(
      { error: `File type not supported. Allowed: ${ALLOWED_EXTENSIONS.join(", ")}` },
      { status: 400 }
    );
  }

  // Build full path (check both sources/ and root)
  const jobOutputDir = join(OUTPUT_DIR, jobId);
  const sourcesPath = join(jobOutputDir, "sources", filePath);
  const directPath = join(jobOutputDir, filePath);

  let targetPath = sourcesPath;

  try {
    await access(sourcesPath);
  } catch {
    try {
      await access(directPath);
      targetPath = directPath;
    } catch {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }
  }

  // Ensure the resolved path is still within the output directory
  const resolvedPath = resolve(targetPath);
  if (!resolvedPath.startsWith(OUTPUT_DIR)) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  try {
    const content = await readFile(targetPath, "utf-8");

    return NextResponse.json({
      path: filePath,
      content,
      size: content.length,
    });
  } catch (error) {
    console.error("File read error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to read file" },
      { status: 500 }
    );
  }
}
