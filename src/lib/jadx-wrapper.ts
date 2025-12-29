import { existsSync, rm } from "fs";
import { join } from "path";
import {
  CliResult,
  checkToolAvailable,
  runCliCommand,
  CliConfig,
  ToolCheckConfig,
} from "./cli-runner";

// Path to JADX installation
const JADX_ROOT = "/mnt/e/jadx";
const JADX_CLI = join(JADX_ROOT, "build/jadx/bin/jadx");
const JADX_GUI = join(JADX_ROOT, "build/jadx/bin/jadx-gui");

// Timeout for JADX commands (5 minutes for large APKs)
const DEFAULT_TIMEOUT = 300 * 1000;

// Re-export for backwards compatibility
export type JadxResult = CliResult;

export interface JadxDecompileOptions {
  outputDir: string;
  showBadCode?: boolean;
  noRes?: boolean;
  noSrc?: boolean;
  exportGradle?: boolean;
  deobf?: boolean;
  deobfMin?: number;
  deobfMax?: number;
  threadsCount?: number;
}

const toolCheckConfig: ToolCheckConfig = {
  rootPath: JADX_ROOT,
  binaryPath: JADX_CLI,
  toolName: "JADX",
  installHint: "Clone JADX: git clone https://github.com/skylot/jadx.git /mnt/e/jadx",
  buildHint: "Build JADX: cd /mnt/e/jadx && ./gradlew dist (requires JDK 11+)",
};

const cliConfig: CliConfig = {
  command: JADX_CLI,
  cwd: JADX_ROOT,
  toolName: "JADX",
  defaultTimeout: DEFAULT_TIMEOUT,
  timeoutHint: "Try reducing thread count or decompiling smaller sections",
  errorHints: {
    ENOENT: "JADX binary not found - ensure it's built with ./gradlew dist",
    EACCES: "Permission denied - check execute permissions on JADX binary",
  },
};

/**
 * Check if JADX is installed and built.
 */
export function checkJadxAvailable(): { available: boolean; error?: string; hint?: string } {
  return checkToolAvailable(toolCheckConfig);
}

/**
 * Run a JADX CLI command and return the result.
 */
export function runJadxCommand(args: string[], timeout?: number): Promise<JadxResult> {
  const cliCheck = checkJadxAvailable();
  if (!cliCheck.available) {
    return Promise.resolve({
      success: false,
      error: cliCheck.error,
      hint: cliCheck.hint,
    });
  }
  return runCliCommand(args, cliConfig, timeout);
}

/**
 * Decompile an APK/DEX/AAR file to Java source code.
 */
export async function decompileApk(
  inputPath: string,
  options: JadxDecompileOptions
): Promise<JadxResult> {
  if (!existsSync(inputPath)) {
    return {
      success: false,
      error: `Input file not found: ${inputPath}`,
      hint: "Provide a valid path to an APK, DEX, or AAR file",
    };
  }

  const args = ["-d", options.outputDir];

  if (options.showBadCode) args.push("--show-bad-code");
  if (options.noRes) args.push("--no-res");
  if (options.noSrc) args.push("--no-src");
  if (options.exportGradle) args.push("--export-gradle");
  if (options.deobf) args.push("--deobf");
  if (options.deobfMin !== undefined) args.push("--deobf-min", String(options.deobfMin));
  if (options.deobfMax !== undefined) args.push("--deobf-max", String(options.deobfMax));
  if (options.threadsCount !== undefined) args.push("-j", String(options.threadsCount));

  args.push(inputPath);

  return runJadxCommand(args);
}

/**
 * Get JADX version information.
 */
export async function getJadxVersion(): Promise<JadxResult> {
  return runJadxCommand(["--version"], 10000);
}

/**
 * List classes in an APK without full decompilation.
 */
export async function listClasses(inputPath: string): Promise<JadxResult> {
  if (!existsSync(inputPath)) {
    return {
      success: false,
      error: `Input file not found: ${inputPath}`,
    };
  }

  // Use unique temp directory to avoid race conditions
  const tempDir = `/tmp/jadx-list-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const result = await runJadxCommand(["--no-src", "--no-res", "-d", tempDir, inputPath], 60000);

  // Clean up temp directory (fire and forget)
  rm(tempDir, { recursive: true, force: true }, () => {});

  return result;
}

export const JADX_PATH = {
  root: JADX_ROOT,
  cli: JADX_CLI,
  gui: JADX_GUI,
};
