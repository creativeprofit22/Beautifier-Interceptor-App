import { spawn } from "child_process";
import { existsSync } from "fs";

// Path to the Interceptor Toolkit CLI
const CLI_PATH = "/home/reaver47/tools/interceptor-toolkit/cli.py";
const CLI_CWD = "/home/reaver47/tools/interceptor-toolkit";

// Timeout for CLI commands (2 minutes)
const DEFAULT_TIMEOUT = 120 * 1000;

export interface InterceptorResult {
  success: boolean;
  data?: unknown;
  error?: string;
  hint?: string; // Helpful suggestion for fixing the error
}

/**
 * Check if the Interceptor Toolkit CLI is available and accessible.
 */
export function checkCliAvailable(): { available: boolean; error?: string; hint?: string } {
  if (!existsSync(CLI_PATH)) {
    return {
      available: false,
      error: `Interceptor Toolkit CLI not found at ${CLI_PATH}`,
      hint: "Ensure the interceptor-toolkit is installed at ~/tools/interceptor-toolkit/",
    };
  }
  if (!existsSync(CLI_CWD)) {
    return {
      available: false,
      error: `Interceptor Toolkit directory not found at ${CLI_CWD}`,
      hint: "Ensure the interceptor-toolkit is installed at ~/tools/interceptor-toolkit/",
    };
  }
  return { available: true };
}

/**
 * Run an Interceptor Toolkit CLI command and return parsed JSON output.
 */
export function runInterceptorCommand(
  args: string[],
  timeout: number = DEFAULT_TIMEOUT
): Promise<InterceptorResult> {
  return new Promise((resolve) => {
    // Check CLI availability before spawning
    const cliCheck = checkCliAvailable();
    if (!cliCheck.available) {
      resolve({
        success: false,
        error: cliCheck.error,
        hint: cliCheck.hint,
      });
      return;
    }

    const child = spawn("python3", [CLI_PATH, ...args], {
      stdio: ["pipe", "pipe", "pipe"],
      cwd: CLI_CWD,
    });

    let stdout = "";
    let stderr = "";
    let settled = false;

    const settle = (result: InterceptorResult) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeoutId);
      resolve(result);
    };

    const timeoutId = setTimeout(() => {
      child.kill("SIGTERM");
      settle({ success: false, error: "Command timed out" });
    }, timeout);

    child.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    child.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    child.on("close", (exitCode) => {
      if (exitCode === 0) {
        try {
          // Try to parse as JSON
          const data = JSON.parse(stdout.trim());
          settle({ success: true, data });
        } catch {
          // If not JSON, return raw output
          settle({ success: true, data: stdout.trim() });
        }
      } else {
        // Extract error message from stderr
        const errorLines = stderr.trim().split("\n");
        const errorMsg =
          errorLines.find((line) => line.startsWith("Error:")) ||
          errorLines[errorLines.length - 1] ||
          `Process exited with code ${exitCode}`;
        settle({ success: false, error: errorMsg });
      }
    });

    child.on("error", (err) => {
      let hint: string | undefined;
      if (err.message.includes("ENOENT")) {
        hint = "Python3 may not be installed or not in PATH";
      } else if (err.message.includes("EACCES")) {
        hint = "Permission denied - check file permissions on cli.py";
      }
      settle({ success: false, error: err.message, hint });
    });

    child.stdin.end();
  });
}

/**
 * Run a security scan on a session.
 * Uses --format json for structured output.
 */
export async function runSecurityScan(
  sessionId: string,
  options?: {
    severity?: string;
    category?: string;
  }
): Promise<InterceptorResult> {
  const args = ["scan", "--session", sessionId, "--format", "json"];

  if (options?.severity) {
    args.push("--severity", options.severity);
  }
  if (options?.category) {
    args.push("--category", options.category);
  }

  // Security scans may take longer
  return runInterceptorCommand(args, 180 * 1000);
}

/**
 * Generate OpenAPI specification from a session.
 */
export async function generateOpenAPI(
  sessionId: string,
  options?: {
    format?: "yaml" | "json";
    includeExamples?: boolean;
  }
): Promise<InterceptorResult> {
  const format = options?.format || "json";
  const args = ["openapi", "--session", sessionId, "--format", format, "--quiet"];

  if (options?.includeExamples) {
    args.push("--include-examples");
  }

  // Add --dry-run to get output to stdout instead of file
  args.push("--dry-run");

  return runInterceptorCommand(args, 180 * 1000);
}
