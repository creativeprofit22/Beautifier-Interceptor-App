# Beautifier-Interceptor-App

Next.js app combining code beautifier with integrated Interceptor Toolkit for HTTP traffic capture and API analysis.

## Current Focus
Section: Android RE - Feature 2 (API Routes)

## Pipeline State
Phase: build
Feature: Android RE API Routes
Last-Completed: Android RE Core Infrastructure (built, validated, refactored)
Features-Remaining:
  - Feature 2: API routes (wire UI to wrappers)
  - Feature 3: Native analysis integration
  - Feature 4: String extraction

## Last Session (2025-12-28)
Refactored Android RE Core Infrastructure:
- Extracted shared CLI runner to `src/lib/cli-runner.ts` (~75 lines deduped)
- Consolidated `JadxResult` and `GhidraResult` as type aliases to `CliResult`
- Implemented file search filtering in DecompiledViewer (was dead code)
- Added temp directory cleanup in `listClasses()`
- Skipped tab renderer extraction (premature - tabs are small, will grow with features)
- TypeScript compiles clean

## Completed
- Android RE Core Infrastructure
  - CLI wrappers: jadx-wrapper.ts, ghidra-wrapper.ts, cli-runner.ts
  - UI: ApkUploader, AnalysisProgress, DecompiledViewer
  - Page: /android-re with tabs
  - Built, validated (6 bugs fixed), refactored (4 improvements)

## Tech Stack
Next.js 16.1, React 19, TypeScript 5, Tailwind 4, Prisma 7, tRPC 11
