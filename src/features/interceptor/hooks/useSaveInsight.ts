"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/Toast";

type InsightType = "scan" | "openapi" | "patterns";

interface UseSaveInsightOptions {
  type: InsightType;
  successMessage?: string;
}

interface UseSaveInsightReturn {
  isSaving: boolean;
  saveInsight: (sessionId: string | undefined, data: unknown) => Promise<boolean>;
}

export function useSaveInsight({
  type,
  successMessage = "Insight saved",
}: UseSaveInsightOptions): UseSaveInsightReturn {
  const [isSaving, setIsSaving] = useState(false);
  const { showToast } = useToast();

  const saveInsight = async (sessionId: string | undefined, data: unknown): Promise<boolean> => {
    if (!sessionId) {
      showToast("Session ID required to save", "error");
      return false;
    }

    setIsSaving(true);
    try {
      const response = await fetch("/api/interceptor/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          type,
          data,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save");
      }

      showToast(successMessage, "success");
      return true;
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to save", "error");
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return { isSaving, saveInsight };
}
