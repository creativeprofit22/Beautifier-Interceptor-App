"use client";

import { useState } from "react";
import { Copy, Check, Download, FileCode } from "lucide-react";
import { Highlight, themes } from "prism-react-renderer";

interface OpenApiViewerProps {
  spec: string;
  title?: string;
  onDownload?: () => void;
}

export function OpenApiViewer({
  spec,
  title = "OpenAPI Specification",
  onDownload,
}: OpenApiViewerProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(spec);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleDownload = () => {
    if (onDownload) {
      onDownload();
    } else {
      const blob = new Blob([spec], { type: "text/yaml" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "openapi.yaml";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  if (!spec) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900">
        <FileCode className="h-8 w-8 text-zinc-600" />
        <span className="text-sm text-zinc-600">No OpenAPI specification generated</span>
        <span className="text-xs text-zinc-700">Capture some traffic first to generate a spec</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
        <div className="flex items-center gap-2">
          <FileCode className="h-4 w-4 text-violet-500" />
          <span className="text-sm font-medium text-zinc-400">{title}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download</span>
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-green-500" />
                <span className="text-green-500">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code Content */}
      <div className="relative max-h-[600px] flex-1 overflow-auto">
        <Highlight theme={themes.nightOwl} code={spec} language="yaml">
          {({ style, tokens, getLineProps, getTokenProps }) => (
            <pre
              className="h-full overflow-auto p-4 font-mono text-sm"
              style={{ ...style, background: "transparent" }}
            >
              {tokens.map((line, i) => (
                <div key={i} {...getLineProps({ line })}>
                  <span className="mr-4 inline-block w-8 text-right text-zinc-600 select-none">
                    {i + 1}
                  </span>
                  {line.map((token, key) => (
                    <span key={key} {...getTokenProps({ token })} />
                  ))}
                </div>
              ))}
            </pre>
          )}
        </Highlight>
      </div>
    </div>
  );
}
