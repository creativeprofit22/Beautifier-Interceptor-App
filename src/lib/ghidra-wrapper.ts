import { existsSync } from "fs";
import { join } from "path";
import {
  CliResult,
  checkToolAvailable,
  runCliCommand,
  CliConfig,
  ToolCheckConfig,
} from "./cli-runner";

// Path to Ghidra installation
const GHIDRA_ROOT = "/mnt/e/ghidra/ghidra_12.0_PUBLIC";
const GHIDRA_HEADLESS = join(GHIDRA_ROOT, "support/analyzeHeadless");

// Timeout for Ghidra analysis (10 minutes for complex binaries)
const DEFAULT_TIMEOUT = 600 * 1000;

// Re-export for backwards compatibility
export type GhidraResult = CliResult;

export interface GhidraAnalyzeOptions {
  projectDir: string;
  projectName: string;
  import?: string;
  process?: string;
  postScript?: string;
  scriptPath?: string;
  deleteProject?: boolean;
  overwrite?: boolean;
  recursive?: boolean;
  readOnly?: boolean;
  maxCpu?: number;
}

const toolCheckConfig: ToolCheckConfig = {
  rootPath: GHIDRA_ROOT,
  binaryPath: GHIDRA_HEADLESS,
  toolName: "Ghidra",
  installHint: "Download Ghidra from https://ghidra-sre.org/ and extract to /mnt/e/ghidra/",
  buildHint: "Ensure Ghidra is properly extracted with support/analyzeHeadless script",
};

const cliConfig: CliConfig = {
  command: GHIDRA_HEADLESS,
  cwd: GHIDRA_ROOT,
  toolName: "Ghidra",
  defaultTimeout: DEFAULT_TIMEOUT,
  timeoutHint: "Large binaries may require more time - consider increasing timeout",
  errorHints: {
    ENOENT: "Ghidra analyzeHeadless script not found",
    EACCES: "Permission denied - check execute permissions on analyzeHeadless",
    JAVA_HOME: "Set JAVA_HOME to your JDK installation (JDK 17+ recommended)",
  },
};

/**
 * Check if Ghidra headless analyzer is available.
 */
export function checkGhidraAvailable(): { available: boolean; error?: string; hint?: string } {
  return checkToolAvailable(toolCheckConfig);
}

/**
 * Run a Ghidra headless command and return the result.
 */
export function runGhidraCommand(args: string[], timeout?: number): Promise<GhidraResult> {
  const cliCheck = checkGhidraAvailable();
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
 * Import and analyze a binary file with Ghidra.
 */
export async function analyzeWithGhidra(
  inputPath: string,
  options: GhidraAnalyzeOptions
): Promise<GhidraResult> {
  if (!existsSync(inputPath)) {
    return {
      success: false,
      error: `Input file not found: ${inputPath}`,
      hint: "Provide a valid path to a binary file (ELF, PE, DEX, etc.)",
    };
  }

  const args = [options.projectDir, options.projectName];

  if (options.import) {
    args.push("-import", options.import);
  } else {
    args.push("-import", inputPath);
  }

  if (options.process) args.push("-process", options.process);
  if (options.postScript) args.push("-postScript", options.postScript);
  if (options.scriptPath) args.push("-scriptPath", options.scriptPath);
  if (options.deleteProject) args.push("-deleteProject");
  if (options.overwrite) args.push("-overwrite");
  if (options.recursive) args.push("-recursive");
  if (options.readOnly) args.push("-readOnly");
  if (options.maxCpu !== undefined) args.push("-max-cpu", String(options.maxCpu));

  return runGhidraCommand(args);
}

/**
 * Analyze a native library (SO file) from an APK.
 */
export async function analyzeNativeLib(
  libPath: string,
  outputDir: string,
  options?: {
    projectName?: string;
    exportScript?: string;
    maxCpu?: number;
  }
): Promise<GhidraResult> {
  const projectName = options?.projectName || "native_analysis";

  const analyzeOptions: GhidraAnalyzeOptions = {
    projectDir: outputDir,
    projectName,
    import: libPath,
    deleteProject: true,
    maxCpu: options?.maxCpu,
  };

  if (options?.exportScript) {
    analyzeOptions.postScript = options.exportScript;
  }

  return analyzeWithGhidra(libPath, analyzeOptions);
}

/**
 * Export decompiled C code from a binary using Ghidra.
 * Requires a decompiler export script in Ghidra's script directory.
 */
export async function exportDecompiledCode(
  inputPath: string,
  outputDir: string,
  options?: {
    scriptPath?: string;
    maxCpu?: number;
  }
): Promise<GhidraResult> {
  const analyzeOptions: GhidraAnalyzeOptions = {
    projectDir: outputDir,
    projectName: "decompile_export",
    import: inputPath,
    postScript: "ExportDecompiledFunctions.java",
    deleteProject: true,
    maxCpu: options?.maxCpu,
  };

  if (options?.scriptPath) {
    analyzeOptions.scriptPath = options.scriptPath;
  }

  return analyzeWithGhidra(inputPath, analyzeOptions);
}

export const GHIDRA_PATH = {
  root: GHIDRA_ROOT,
  headless: GHIDRA_HEADLESS,
};
