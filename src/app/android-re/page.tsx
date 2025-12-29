"use client";

import { useState, useCallback } from "react";
import { Smartphone, FileCode, Cpu, Terminal } from "lucide-react";
import { TabButton } from "@/components/ui/TabButton";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  ApkUploader,
  AnalysisProgress,
  AnalysisStage,
  DecompiledViewer,
} from "@/features/android-re/components";

type Tab = "decompile" | "native" | "strings";

interface FileNode {
  name: string;
  type: "file" | "folder";
  path: string;
  children?: FileNode[];
}

export default function AndroidRePage() {
  const [activeTab, setActiveTab] = useState<Tab>("decompile");
  const [analysisStage, setAnalysisStage] = useState<AnalysisStage>("idle");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  // Decompilation results
  const [jobId, setJobId] = useState<string | null>(null);
  const [fileTree, setFileTree] = useState<FileNode[]>([]);
  const [selectedFilePath, setSelectedFilePath] = useState<string | undefined>();
  const [fileContent, setFileContent] = useState<string | undefined>();
  const [isLoadingFile, setIsLoadingFile] = useState(false);

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
    setAnalysisStage("idle");
    setErrorMessage(undefined);
    // Reset previous results
    setJobId(null);
    setFileTree([]);
    setSelectedFilePath(undefined);
    setFileContent(undefined);
  }, []);

  const handleFileClear = useCallback(() => {
    setSelectedFile(null);
    setAnalysisStage("idle");
    setErrorMessage(undefined);
    setJobId(null);
    setFileTree([]);
    setSelectedFilePath(undefined);
    setFileContent(undefined);
  }, []);

  const handleDecompile = useCallback(async () => {
    if (!selectedFile || analysisStage !== "idle") return;

    try {
      setAnalysisStage("uploading");
      setErrorMessage(undefined);

      // Build form data
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("showBadCode", "true");

      // Upload and decompile
      const response = await fetch("/api/android-re/decompile", {
        method: "POST",
        body: formData,
      });

      setAnalysisStage("decompiling");

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Decompilation failed");
      }

      // Store results
      setJobId(data.jobId);
      setFileTree(data.fileTree || []);
      setAnalysisStage("complete");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Decompilation failed");
      setAnalysisStage("error");
    }
  }, [selectedFile, analysisStage]);

  const handleTreeFileSelect = useCallback(
    async (path: string) => {
      if (!jobId || isLoadingFile) return;

      setSelectedFilePath(path);
      setIsLoadingFile(true);
      setFileContent(undefined);

      try {
        const response = await fetch(
          `/api/android-re/file?jobId=${encodeURIComponent(jobId)}&path=${encodeURIComponent(path)}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to load file");
        }

        setFileContent(data.content);
      } catch (err) {
        console.error("Failed to load file:", err);
        setFileContent(
          `// Error loading file: ${err instanceof Error ? err.message : "Unknown error"}`
        );
      } finally {
        setIsLoadingFile(false);
      }
    },
    [jobId, isLoadingFile]
  );

  const isProcessing =
    analysisStage !== "idle" && analysisStage !== "complete" && analysisStage !== "error";

  const renderDecompileTab = () => (
    <div className="flex flex-col gap-6">
      <ApkUploader
        onFileSelect={handleFileSelect}
        onClear={handleFileClear}
        isLoading={isProcessing}
      />

      {selectedFile && analysisStage === "idle" && (
        <button
          onClick={handleDecompile}
          className="flex items-center justify-center gap-2 rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition-all hover:bg-violet-500"
        >
          <FileCode className="h-4 w-4" />
          <span>Decompile with JADX</span>
        </button>
      )}

      {analysisStage !== "idle" && (
        <AnalysisProgress
          stage={analysisStage}
          message={
            analysisStage === "uploading"
              ? "Preparing file..."
              : analysisStage === "decompiling"
                ? "Extracting Java source code..."
                : undefined
          }
          error={errorMessage}
        />
      )}

      {analysisStage === "complete" && (
        <DecompiledViewer
          files={fileTree}
          onFileSelect={handleTreeFileSelect}
          selectedFile={selectedFilePath}
          fileContent={isLoadingFile ? "// Loading..." : fileContent}
        />
      )}

      {!selectedFile && (
        <EmptyState
          icon={FileCode}
          title="Ready to decompile"
          description="Upload an APK, DEX, or AAR file to decompile it to Java source code using JADX."
        />
      )}
    </div>
  );

  const renderNativeTab = () => (
    <div className="flex flex-col gap-6">
      <EmptyState
        icon={Cpu}
        title="Native Library Analysis"
        description="Upload a native library (.so file) or an APK to analyze native code with Ghidra headless."
      />
    </div>
  );

  const renderStringsTab = () => (
    <div className="flex flex-col gap-6">
      <EmptyState
        icon={Terminal}
        title="String Extraction"
        description="Extract and analyze strings from APK resources, DEX files, and native libraries."
      />
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 font-sans text-zinc-100">
      <main className="flex flex-1 flex-col gap-6 p-6">
        <div className="mx-auto w-full max-w-7xl flex-1">
          {/* Page Header */}
          <div className="mb-8">
            <div className="mb-2 flex items-center gap-3">
              <div className="rounded-lg bg-violet-500/10 p-2">
                <Smartphone className="h-6 w-6 text-violet-400" />
              </div>
              <h1 className="text-2xl font-bold text-zinc-100">Android RE</h1>
            </div>
            <p className="max-w-2xl text-zinc-500">
              Reverse engineer Android applications. Decompile APKs with JADX and analyze native
              libraries with Ghidra.
            </p>
            <div className="mt-4 flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3">
              <Terminal className="h-4 w-4 text-zinc-500" />
              <code className="text-xs text-zinc-400">
                Tools: <span className="text-violet-400">JADX</span> (Java decompiler) +{" "}
                <span className="text-amber-400">Ghidra</span> (native analysis)
              </code>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="mb-6 flex gap-2">
            <TabButton
              label="Decompile"
              icon={FileCode}
              isActive={activeTab === "decompile"}
              onClick={() => setActiveTab("decompile")}
            />
            <TabButton
              label="Native Analysis"
              icon={Cpu}
              isActive={activeTab === "native"}
              onClick={() => setActiveTab("native")}
            />
            <TabButton
              label="Strings"
              icon={Terminal}
              isActive={activeTab === "strings"}
              onClick={() => setActiveTab("strings")}
            />
          </div>

          {/* Tab Content */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
            {activeTab === "decompile" && renderDecompileTab()}
            {activeTab === "native" && renderNativeTab()}
            {activeTab === "strings" && renderStringsTab()}
          </div>
        </div>
      </main>
    </div>
  );
}
