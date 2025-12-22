import { SourceMapConsumer, type RawSourceMap } from "source-map";

interface SourceMapInfo {
  sourcesContent: string[] | null;
  variableNames: Map<string, string>;
}

export interface SourceMapResult {
  hasSourceMap: boolean;
  originalCode?: string;
  variableHints?: Record<string, string>;
  externalSourceMapUrl?: string;
}

/**
 * Detect sourceMappingURL comment in code
 * Returns the URL/data-uri or null if not found
 */
export function detectSourceMapUrl(code: string): string | null {
  const regex = /\/\/[#@] ?sourceMappingURL=([^\s'"]+)\s*$/gm;
  let match: RegExpExecArray | null;
  let lastMatch: string | null = null;

  while ((match = regex.exec(code)) !== null) {
    lastMatch = match[1];
  }

  return lastMatch;
}

/**
 * Parse inline source map from data URI
 * Handles data:application/json;base64,... and data:application/json;charset=utf-8;base64,... formats
 */
export async function parseInlineSourceMap(dataUri: string): Promise<RawSourceMap | null> {
  try {
    // Handle optional charset parameter: data:application/json;charset=utf-8;base64,...
    const dataUriRegex = /^data:application\/json(?:;charset=[^;]+)?;base64,/;
    const match = dataUri.match(dataUriRegex);
    if (!match) {
      return null;
    }

    const base64 = dataUri.slice(match[0].length);
    const json = Buffer.from(base64, "base64").toString("utf-8");
    return JSON.parse(json) as RawSourceMap;
  } catch {
    return null;
  }
}

/**
 * Extract source map information including original sources and variable name mappings
 */
export async function extractSourceMapInfo(map: RawSourceMap): Promise<SourceMapInfo> {
  const variableNames = new Map<string, string>();

  const consumer = await new SourceMapConsumer(map);

  try {
    consumer.eachMapping((mapping) => {
      if (mapping.name) {
        const generatedKey = `${mapping.generatedLine}:${mapping.generatedColumn}`;
        variableNames.set(generatedKey, mapping.name);
      }
    });
  } finally {
    consumer.destroy();
  }

  return {
    sourcesContent: map.sourcesContent || null,
    variableNames,
  };
}

/**
 * Main entry point: process code with source map
 * Detects, parses, and extracts all source map information in one call
 */
export async function processCodeWithSourceMap(code: string): Promise<SourceMapResult> {
  const sourceMapUrl = detectSourceMapUrl(code);

  if (!sourceMapUrl) {
    return { hasSourceMap: false };
  }

  const map = await parseInlineSourceMap(sourceMapUrl);

  if (!map) {
    // URL was detected but not inline base64 - it's an external file reference
    return { hasSourceMap: false, externalSourceMapUrl: sourceMapUrl };
  }

  const info = await extractSourceMapInfo(map);

  const originalCode = info.sourcesContent?.[0] || undefined;

  const variableHints: Record<string, string> = Object.fromEntries(info.variableNames);

  return {
    hasSourceMap: true,
    originalCode,
    variableHints: Object.keys(variableHints).length > 0 ? variableHints : undefined,
  };
}
