"use client";

import { useState, useEffect } from "react";
import { Radio, Shield, FileCode, Terminal, MessageSquare, Database } from "lucide-react";
import { TabButton } from "@/components/ui/TabButton";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { apiCall } from "@/lib/api";
import {
  SessionList,
  Session,
  SessionDetail,
  TrafficEntryData,
  ScanResults,
  Finding,
  OpenApiViewer,
  InterceptorChat,
  SavedInsights,
} from "@/features/interceptor/components";

type Tab = "sessions" | "scan" | "openapi" | "chat" | "saved";

// API response types
interface SessionsResponse {
  sessions: Array<{
    session_id: string;
    status: string;
    mode: string;
    started_at: string;
    stats: {
      request_count: number;
      bandwidth_bytes: number;
      duration_seconds: number;
    };
  }>;
}

interface SessionDetailResponse {
  session: {
    session_id: string;
    status: string;
    mode: string;
    started_at: string;
    ended_at: string | null;
    stats: {
      request_count: number;
      bandwidth_bytes: number;
      duration_seconds: number;
    };
    traffic_entries: number;
  };
}

interface ScanResponse {
  sessionId: string;
  scan: string;
}

interface OpenApiResponse {
  sessionId: string;
  format: string;
  spec: string;
}

// Transform API session to UI Session
function transformSession(apiSession: SessionsResponse["sessions"][0]): Session {
  return {
    id: apiSession.session_id,
    status: apiSession.status === "active" ? "active" : "completed",
    requestCount: apiSession.stats?.request_count || 0,
    mode: apiSession.mode === "passive" ? "passive" : "intercept",
    startedAt: new Date(apiSession.started_at),
  };
}

export default function InterceptorPage() {
  const [activeTab, setActiveTab] = useState<Tab>("sessions");
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [trafficEntries, setTrafficEntries] = useState<TrafficEntryData[]>([]);
  const [scanResults, setScanResults] = useState<Finding[]>([]);
  const [openApiSpec, setOpenApiSpec] = useState<string>("");
  const [scanSessionId, setScanSessionId] = useState<string>("");
  const [openApiSessionId, setOpenApiSessionId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    setIsLoadingSessions(true);
    try {
      const response = await fetch("/api/interceptor/sessions");
      const data: SessionsResponse = await response.json();
      if (data.sessions) {
        setSessions(data.sessions.map(transformSession));
      }
    } catch (err) {
      console.error("Failed to load sessions:", err);
      showToast("Failed to load sessions", "error");
    } finally {
      setIsLoadingSessions(false);
    }
  };

  const handleViewSession = async (sessionId: string) => {
    const session = sessions.find((s) => s.id === sessionId);
    if (!session) return;

    setIsLoading(true);

    try {
      const response = await fetch(`/api/interceptor/sessions/${sessionId}`);
      const data: SessionDetailResponse = await response.json();

      if (data.session) {
        setSelectedSession(session);
        setTrafficEntries([]);
        showToast("Session loaded", "success");
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to load session", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!confirm("Delete this session? This action cannot be undone.")) return;

    try {
      await fetch("/api/interceptor/sessions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      setSessions(sessions.filter((s) => s.id !== sessionId));
      showToast("Session deleted", "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to delete session", "error");
    }
  };

  const handleBackToList = () => {
    setSelectedSession(null);
    setTrafficEntries([]);
  };

  const handleRunScan = async () => {
    if (!scanSessionId) {
      showToast("Please select a session first", "warning");
      return;
    }

    setIsLoading(true);
    setScanResults([]);

    try {
      const result = await apiCall<ScanResponse>(
        "/api/interceptor/scan",
        { sessionId: scanSessionId },
        null,
        "Failed to run scan"
      );

      if (result.scan) {
        setScanResults([]);
        showToast("Security scan completed", "success");
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Scan failed", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateOpenApi = async () => {
    if (!openApiSessionId) {
      showToast("Please select a session first", "warning");
      return;
    }

    setIsLoading(true);
    setOpenApiSpec("");

    try {
      const result = await apiCall<OpenApiResponse>(
        "/api/interceptor/openapi",
        { sessionId: openApiSessionId, format: "yaml" },
        null,
        "Failed to generate OpenAPI spec"
      );

      if (result.spec) {
        setOpenApiSpec(
          typeof result.spec === "string"
            ? result.spec
            : JSON.stringify(result.spec, null, 2)
        );
        showToast("OpenAPI spec generated", "success");
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Generation failed", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const renderSessionsTab = () => {
    if (isLoadingSessions) {
      return <TableSkeleton rows={3} />;
    }

    if (selectedSession) {
      const stats = {
        totalRequests: selectedSession.requestCount,
        successfulRequests: selectedSession.requestCount,
        failedRequests: 0,
        averageResponseTime: 0,
      };

      return (
        <SessionDetail
          session={selectedSession}
          stats={stats}
          trafficEntries={trafficEntries}
          onBack={handleBackToList}
        />
      );
    }

    return (
      <SessionList
        sessions={sessions}
        onView={handleViewSession}
        onDelete={handleDeleteSession}
      />
    );
  };

  const renderScanTab = () => (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-4">
        <select
          value={scanSessionId}
          onChange={(e) => setScanSessionId(e.target.value)}
          className="min-w-[200px] rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm text-zinc-100 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
        >
          <option value="">Select a session...</option>
          {sessions.map((session) => (
            <option key={session.id} value={session.id}>
              {session.id.slice(0, 8)}... ({session.requestCount} requests)
            </option>
          ))}
        </select>
        <button
          onClick={handleRunScan}
          disabled={isLoading || !scanSessionId}
          className="flex items-center gap-2 rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition-all hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
        >
          {isLoading ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              <span>Scanning...</span>
            </>
          ) : (
            <>
              <Shield className="h-4 w-4" />
              <span>Run Security Scan</span>
            </>
          )}
        </button>
      </div>

      {scanResults.length > 0 && <ScanResults findings={scanResults} sessionId={scanSessionId} />}

      {scanResults.length === 0 && !isLoading && (
        <EmptyState
          icon={Shield}
          title="Ready to scan"
          description="Select a capture session and run a security scan to detect potential vulnerabilities in the captured traffic."
        />
      )}
    </div>
  );

  const renderOpenApiTab = () => (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-4">
        <select
          value={openApiSessionId}
          onChange={(e) => setOpenApiSessionId(e.target.value)}
          className="min-w-[200px] rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm text-zinc-100 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
        >
          <option value="">Select a session...</option>
          {sessions.map((session) => (
            <option key={session.id} value={session.id}>
              {session.id.slice(0, 8)}... ({session.requestCount} requests)
            </option>
          ))}
        </select>
        <button
          onClick={handleGenerateOpenApi}
          disabled={isLoading || !openApiSessionId}
          className="flex items-center gap-2 rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition-all hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
        >
          {isLoading ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <FileCode className="h-4 w-4" />
              <span>Generate OpenAPI Spec</span>
            </>
          )}
        </button>
      </div>

      {openApiSpec && <OpenApiViewer spec={openApiSpec} sessionId={openApiSessionId} />}

      {!openApiSpec && !isLoading && (
        <EmptyState
          icon={FileCode}
          title="Generate API documentation"
          description="Select a capture session to automatically generate an OpenAPI specification from the recorded HTTP traffic."
        />
      )}
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 font-sans text-zinc-100">
      <main className="flex flex-1 flex-col gap-6 p-6">
        <div className="mx-auto w-full max-w-7xl flex-1">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="rounded-lg bg-violet-500/10 p-2">
                <Radio className="h-6 w-6 text-violet-400" />
              </div>
              <h1 className="text-2xl font-bold text-zinc-100">Traffic Interceptor</h1>
            </div>
            <p className="text-zinc-500 max-w-2xl">
              View captured HTTP sessions, run security scans, and generate OpenAPI documentation from your traffic.
            </p>
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-zinc-900/50 border border-zinc-800 px-4 py-3">
              <Terminal className="h-4 w-4 text-zinc-500" />
              <code className="text-xs text-zinc-400">
                Start capture: <span className="text-violet-400">interceptor capture --mode passive --port 8888</span>
              </code>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="mb-6 flex gap-2">
            <TabButton
              label="Sessions"
              icon={Radio}
              isActive={activeTab === "sessions"}
              onClick={() => setActiveTab("sessions")}
              count={sessions.length}
            />
            <TabButton
              label="Security Scan"
              icon={Shield}
              isActive={activeTab === "scan"}
              onClick={() => setActiveTab("scan")}
            />
            <TabButton
              label="OpenAPI"
              icon={FileCode}
              isActive={activeTab === "openapi"}
              onClick={() => setActiveTab("openapi")}
            />
            <TabButton
              label="Assistant"
              icon={MessageSquare}
              isActive={activeTab === "chat"}
              onClick={() => setActiveTab("chat")}
            />
            <TabButton
              label="Saved"
              icon={Database}
              isActive={activeTab === "saved"}
              onClick={() => setActiveTab("saved")}
            />
          </div>

          {/* Tab Content */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
            {activeTab === "sessions" && renderSessionsTab()}
            {activeTab === "scan" && renderScanTab()}
            {activeTab === "openapi" && renderOpenApiTab()}
            {activeTab === "chat" && <InterceptorChat />}
            {activeTab === "saved" && <SavedInsights />}
          </div>
        </div>
      </main>
    </div>
  );
}
