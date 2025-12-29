import { spawn } from "child_process";
import { existsSync } from "fs";

/**
 * Shared result type for CLI tool operations.
 */
export interface CliResult {
  success: boolean;
  data?: string;
  error?: string;
  hint?: string;
}

/**
 * Configuration for CLI tool execution.
 */
export interface CliConfig {
  command: string;
  cwd: string;
  toolName: string;
  defaultTimeout: number;
  timeoutHint?: string;
  errorHints?: Record<string, string>;
}

/**
 * Configuration for tool availability check.
 */
export interface ToolCheckConfig {
  rootPath: string;
  binaryPath: string;
  toolName: string;
  installHint: string;
  buildHint: string;
}

/**
 * Check if a CLI tool is installed and available.
 */
export function checkToolAvailable(config: ToolCheckConfig): {
  available: boolean;
  error?: string;
  hint?: string;
} {
  if (!existsSync(config.rootPath)) {
    return {
      available: false,
      error: `${config.toolName} not found at ${config.rootPath}`,
      hint: config.installHint,
    };
  }
  if (!existsSync(config.binaryPath)) {
    return {
      available: false,
      error: `${config.toolName} binary not found at ${config.binaryPath}`,
      hint: config.buildHint,
    };
  }
  return { available: true };
}

/**
 * Run a CLI command with timeout and error handling.
 */
export function runCliCommand(
  args: string[],
  config: CliConfig,
  timeout?: number
): Promise<CliResult> {
  return new Promise((resolve) => {
    const child = spawn(config.command, args, {
      stdio: ["pipe", "pipe", "pipe"],
      cwd: config.cwd,
    });

    let stdout = "";
    let stderr = "";
    let settled = false;

    const settle = (result: CliResult) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeoutId);
      resolve(result);
    };

    const effectiveTimeout = timeout ?? config.defaultTimeout;
    const timeoutId = setTimeout(() => {
      child.kill("SIGTERM");
      settle({
        success: false,
        error: `${config.toolName} command timed out`,
        hint: config.timeoutHint,
      });
    }, effectiveTimeout);

    child.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    child.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    child.on("close", (exitCode) => {
      if (exitCode === 0) {
        settle({ success: true, data: stdout.trim() });
      } else {
        const errorLines = stderr.trim().split("\n").filter(Boolean);
        const errorMsg =
          errorLines.find((line) => line.toLowerCase().includes("error")) ||
          (errorLines.length > 0 ? errorLines[errorLines.length - 1] : null) ||
          `${config.toolName} exited with code ${exitCode ?? "unknown"}`;
        settle({ success: false, error: errorMsg });
      }
    });

    child.on("error", (err) => {
      let hint: string | undefined;
      if (config.errorHints) {
        for (const [key, value] of Object.entries(config.errorHints)) {
          if (err.message.includes(key)) {
            hint = value;
            break;
          }
        }
      }
      settle({ success: false, error: err.message, hint });
    });

    child.stdin.end();
  });
}
