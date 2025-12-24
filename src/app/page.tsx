"use client";

import { useState } from "react";
import { Copy, Check, Sparkles, Loader2, MessageSquareText } from "lucide-react";
import { Highlight, themes } from "prism-react-renderer";
import ReactMarkdown from "react-markdown";
import { useClipboard } from "@/hooks/useClipboard";
import { apiCall } from "@/lib/api";
import { CodePanel } from "@/components/ui/CodePanel";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { TabButton } from "@/components/ui/TabButton";
import { SourceMapBadge } from "@/components/ui/SourceMapBadge";
import { ActionButton } from "@/components/ui/ActionButton";

type OutputTab = "code" | "explanation";

interface BeautifyResponse {
  result: string;
  sourceMapDetected?: boolean;
  externalSourceMapUrl?: string | null;
}

function getErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : "An error occurred";
}

// 220px = header (73px) + main padding (48px) + error banner space (55px) + button area (44px)
const PANEL_HEIGHT = "h-[calc(100vh-220px)]";

interface OutputPanelProps {
  activeTab: OutputTab;
  onTabChange: (tab: OutputTab) => void;
  isLoading: boolean;
  isExplaining: boolean;
  outputCode: string;
  explanation: string;
  onExplain: () => void;
  onCopy: () => void;
  copied: boolean;
  sourceMapDetected: boolean;
  externalSourceMapUrl: string | null;
}

function OutputPanel({
  activeTab,
  onTabChange,
  isLoading,
  isExplaining,
  outputCode,
  explanation,
  onExplain,
  onCopy,
  copied,
  sourceMapDetected,
  externalSourceMapUrl,
}: OutputPanelProps) {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
      <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
        {/* Tabs */}
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <TabButton
              label="Code"
              isActive={activeTab === "code"}
              onClick={() => onTabChange("code")}
            />
            <TabButton
              label="Explanation"
              isActive={activeTab === "explanation"}
              onClick={() => onTabChange("explanation")}
            />
          </div>
          <SourceMapBadge detected={sourceMapDetected} externalUrl={externalSourceMapUrl} />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <ActionButton
            onClick={onExplain}
            disabled={!outputCode || isLoading || isExplaining}
            icon={<MessageSquareText className="h-3.5 w-3.5" />}
            label="Explain"
            isLoading={isExplaining}
            loadingLabel="Analyzing..."
          />
          <ActionButton
            onClick={onCopy}
            disabled={!outputCode}
            icon={<Copy className="h-3.5 w-3.5" />}
            label="Copy"
            isActive={copied}
            activeIcon={<Check className="h-3.5 w-3.5 text-green-500" />}
            activeLabel="Copied!"
            activeClassName="text-green-500"
          />
        </div>
      </div>
      <div className="relative flex-1 overflow-auto">
        {activeTab === "code" ? (
          <OutputContent isLoading={isLoading} outputCode={outputCode} />
        ) : (
          <ExplanationContent isLoading={isExplaining} explanation={explanation} />
        )}
      </div>
    </div>
  );
}

interface OutputContentProps {
  isLoading: boolean;
  outputCode: string;
}

function OutputContent({ isLoading, outputCode }: OutputContentProps) {
  if (isLoading) {
    return <LoadingSpinner message="Beautifying code..." />;
  }

  if (outputCode) {
    return (
      <Highlight theme={themes.nightOwl} code={outputCode} language="javascript">
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
    );
  }

  return (
    <div className="flex h-full items-center justify-center text-zinc-600">
      <span className="text-sm">Beautified code will appear here</span>
    </div>
  );
}

interface ExplanationContentProps {
  isLoading: boolean;
  explanation: string;
}

function ExplanationContent({ isLoading, explanation }: ExplanationContentProps) {
  if (isLoading) {
    return <LoadingSpinner message="Analyzing code..." />;
  }

  if (explanation) {
    return (
      <div className="prose prose-invert prose-sm prose-headings:text-zinc-100 prose-p:text-zinc-300 prose-strong:text-zinc-100 prose-code:text-violet-400 prose-a:text-violet-400 prose-li:text-zinc-300 max-w-none overflow-auto p-4">
        <ReactMarkdown>{explanation}</ReactMarkdown>
      </div>
    );
  }

  return (
    <div className="flex h-full items-center justify-center text-zinc-600">
      <span className="text-sm">Click &quot;Explain&quot; to analyze the code</span>
    </div>
  );
}

function useBeautifyState() {
  const [inputCode, setInputCode] = useState("");
  const [outputCode, setOutputCode] = useState("");
  const [explanation, setExplanation] = useState("");
  const [activeTab, setActiveTab] = useState<OutputTab>("code");
  const [isLoading, setIsLoading] = useState(false);
  const [isExplaining, setIsExplaining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sourceMapDetected, setSourceMapDetected] = useState(false);
  const [externalSourceMapUrl, setExternalSourceMapUrl] = useState<string | null>(null);
  const { copied, copy } = useClipboard({ onError: setError });

  return {
    // Input/Output state
    inputCode,
    setInputCode,
    outputCode,
    setOutputCode,
    explanation,
    setExplanation,
    // UI state
    activeTab,
    setActiveTab,
    isLoading,
    setIsLoading,
    isExplaining,
    setIsExplaining,
    error,
    setError,
    // Source map state
    sourceMapDetected,
    setSourceMapDetected,
    externalSourceMapUrl,
    setExternalSourceMapUrl,
    // Clipboard
    copied,
    copy,
  };
}

export default function Home() {
  const {
    inputCode,
    setInputCode,
    outputCode,
    setOutputCode,
    explanation,
    setExplanation,
    activeTab,
    setActiveTab,
    isLoading,
    setIsLoading,
    isExplaining,
    setIsExplaining,
    error,
    setError,
    sourceMapDetected,
    setSourceMapDetected,
    externalSourceMapUrl,
    setExternalSourceMapUrl,
    copied,
    copy,
  } = useBeautifyState();

  const handleBeautify = async () => {
    if (!inputCode.trim()) {
      setError("Please enter some code to beautify");
      return;
    }

    setIsLoading(true);
    setError(null);
    setOutputCode("");
    setExplanation("");
    setActiveTab("code");
    setSourceMapDetected(false);
    setExternalSourceMapUrl(null);

    try {
      const data = await apiCall<BeautifyResponse>(
        "/api/beautify",
        { code: inputCode },
        null,
        "Failed to beautify code"
      );

      if (!data.result) {
        throw new Error("Invalid response from server");
      }

      setOutputCode(data.result);
      setSourceMapDetected(data.sourceMapDetected ?? false);
      setExternalSourceMapUrl(data.externalSourceMapUrl ?? null);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (outputCode) copy(outputCode);
  };

  const handleExplain = async () => {
    if (!outputCode) return;

    setIsExplaining(true);
    setExplanation("");
    setActiveTab("explanation");
    setError(null);

    try {
      const result = await apiCall<string>(
        "/api/explain",
        { code: outputCode },
        "explanation",
        "Failed to explain code"
      );
      setExplanation(result);
    } catch (err) {
      setError(getErrorMessage(err));
      setActiveTab("code");
    } finally {
      setIsExplaining(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 font-sans text-zinc-100">
      {/* Main Content */}
      <main className="flex flex-1 flex-col gap-4 p-6">
        <div className="mx-auto w-full max-w-7xl flex-1">
          {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}

          {/* Code Panels */}
          <div className={`grid ${PANEL_HEIGHT} grid-cols-1 gap-4 lg:grid-cols-2`}>
            {/* Input Panel */}
            <CodePanel
              title="Input"
              headerRight={
                <span className="text-xs text-zinc-500">
                  Paste minified or obfuscated JavaScript
                </span>
              }
            >
              <textarea
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                placeholder="// Paste your minified JavaScript here...&#10;var a=function(b){return b*2};"
                className="flex-1 resize-none bg-transparent p-4 font-mono text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none"
                spellCheck={false}
              />
            </CodePanel>

            {/* Output Panel */}
            <OutputPanel
              activeTab={activeTab}
              onTabChange={setActiveTab}
              isLoading={isLoading}
              isExplaining={isExplaining}
              outputCode={outputCode}
              explanation={explanation}
              onExplain={handleExplain}
              onCopy={handleCopy}
              copied={copied}
              sourceMapDetected={sourceMapDetected}
              externalSourceMapUrl={externalSourceMapUrl}
            />
          </div>

          {/* Beautify Button */}
          <div className="mt-4 flex justify-center">
            <button
              onClick={handleBeautify}
              disabled={isLoading || !inputCode.trim()}
              className="flex items-center gap-2 rounded-lg bg-violet-600 px-6 py-3 font-semibold text-white transition-all hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-violet-600"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Beautifying...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  <span>Beautify</span>
                </>
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
