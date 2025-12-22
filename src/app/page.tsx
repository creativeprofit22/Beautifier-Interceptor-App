"use client";

import { useState, ReactNode } from "react";
import { Copy, Check, Sparkles, Loader2, X, MessageSquareText } from "lucide-react";
import { Highlight, themes } from "prism-react-renderer";
import ReactMarkdown from "react-markdown";
import { useClipboard } from "@/hooks/useClipboard";

type OutputTab = "code" | "explanation";

// 220px = header (73px) + main padding (48px) + error banner space (55px) + button area (44px)
const PANEL_HEIGHT = "h-[calc(100vh-220px)]";

interface CodePanelProps {
  title: string;
  headerRight?: ReactNode;
  children: ReactNode;
}

function CodePanel({ title, headerRight, children }: CodePanelProps) {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
      <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
        <span className="text-sm font-medium text-zinc-400">{title}</span>
        {headerRight}
      </div>
      {children}
    </div>
  );
}

interface ErrorBannerProps {
  message: string;
  onDismiss: () => void;
}

function ErrorBanner({ message, onDismiss }: ErrorBannerProps) {
  return (
    <div className="mb-4 flex items-center justify-between rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-3 text-red-400">
      <span>{message}</span>
      <button
        onClick={onDismiss}
        className="ml-4 rounded p-1 transition-colors hover:bg-red-500/20"
        aria-label="Dismiss error"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

interface LoadingSpinnerProps {
  message: string;
}

function LoadingSpinner({ message }: LoadingSpinnerProps) {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-zinc-500">
        <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
        <span className="text-sm">{message}</span>
      </div>
    </div>
  );
}

interface TabButtonProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

function TabButton({ label, isActive, onClick }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
        isActive
          ? "bg-zinc-800 text-zinc-100"
          : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
      }`}
    >
      {label}
    </button>
  );
}

interface ActionButtonProps {
  onClick: () => void;
  disabled?: boolean;
  icon: ReactNode;
  label: string;
  isLoading?: boolean;
  loadingLabel?: string;
  isActive?: boolean;
  activeIcon?: ReactNode;
  activeLabel?: string;
  activeClassName?: string;
}

const actionButtonStyles = [
  "flex items-center gap-1.5 rounded-md px-2.5 py-1.5",
  "text-xs font-medium text-zinc-400 transition-colors",
  "hover:bg-zinc-800 hover:text-zinc-200",
  "disabled:cursor-not-allowed disabled:opacity-50",
  "disabled:hover:bg-transparent disabled:hover:text-zinc-400",
].join(" ");

function ActionButton({
  onClick,
  disabled,
  icon,
  label,
  isLoading,
  loadingLabel,
  isActive,
  activeIcon,
  activeLabel,
  activeClassName = "",
}: ActionButtonProps) {
  const renderContent = () => {
    if (isLoading && loadingLabel) {
      return (
        <>
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          <span>{loadingLabel}</span>
        </>
      );
    }

    if (isActive && activeIcon && activeLabel) {
      return (
        <>
          {activeIcon}
          <span className={activeClassName}>{activeLabel}</span>
        </>
      );
    }

    return (
      <>
        {icon}
        <span>{label}</span>
      </>
    );
  };

  return (
    <button onClick={onClick} disabled={disabled} className={actionButtonStyles}>
      {renderContent()}
    </button>
  );
}

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
}: OutputPanelProps) {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
      <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
        {/* Tabs */}
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

async function apiCall<T>(
  url: string,
  body: object,
  resultField: string,
  errorMessage: string
): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.error || errorMessage);
  }

  if (!data?.[resultField]) {
    throw new Error("Invalid response from server");
  }

  return data[resultField];
}

export default function Home() {
  const [inputCode, setInputCode] = useState("");
  const [outputCode, setOutputCode] = useState("");
  const [explanation, setExplanation] = useState("");
  const [activeTab, setActiveTab] = useState<OutputTab>("code");
  const [isLoading, setIsLoading] = useState(false);
  const [isExplaining, setIsExplaining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { copied, copy } = useClipboard({ onError: setError });

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

    try {
      const result = await apiCall<string>(
        "/api/beautify",
        { code: inputCode },
        "result",
        "Failed to beautify code"
      );
      setOutputCode(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
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
      setError(err instanceof Error ? err.message : "An error occurred");
      setActiveTab("code");
    } finally {
      setIsExplaining(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 font-sans text-zinc-100">
      {/* Header */}
      <header className="border-b border-zinc-800 px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center gap-3">
          <Sparkles className="h-6 w-6 text-violet-500" />
          <h1 className="text-2xl font-bold tracking-tight">Code Beautifier</h1>
        </div>
      </header>

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
