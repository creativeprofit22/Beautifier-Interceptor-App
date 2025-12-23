# Code Beautifier

Local web app that beautifies/deobfuscates JavaScript using Claude CLI.

## Current Focus
Feature: Interceptor Module - Phase 1 Implementation

## Pipeline State
Phase: build
Feature: Interceptor Module
Tier: Phase 1 - Core Infrastructure
Tier-Status: pending
Reports:
  - bugs: reports/bugs-code-beautifier-mvp.md
  - refactors: reports/refactors-code-beautifier-mvp.md

## Last Session (2025-12-22)
Designed Interceptor Module - Claude-powered network intelligence system:
- Researched Postman Labs (Newman, Collection SDK, Code Generators) and mitmproxy
- Designed 4-phase architecture: Core -> Intelligence -> Generators -> UI
- mitmproxy as sensor, Claude CLI as brain, LLM-optimized storage
- Made repo private via `gh repo edit --visibility private`

## Next Steps
1. Phase 1: Create `scripts/interceptor.py` (mitmproxy addon)
2. Phase 1: Create `src/lib/interceptor/types.ts` and `storage.ts`
3. Phase 1: Create `/api/intercept/ingest` and `/api/intercept/sessions` routes
4. Test: mitmproxy -> Next.js API -> captures/ storage

## Interceptor Module Plan

### Architecture
```
mitmproxy addon -> /api/intercept/ingest -> captures/sessions/ -> Claude -> artifacts/
```

### Phase 1 Files (Core Infrastructure)
- `scripts/interceptor.py` - mitmproxy addon
- `src/lib/interceptor/types.ts` - TypeScript types
- `src/lib/interceptor/storage.ts` - Session management
- `src/app/api/intercept/ingest/route.ts` - Traffic ingestion
- `src/app/api/intercept/sessions/route.ts` - Session CRUD

### Phase 2 Files (Intelligence)
- `src/lib/interceptor/prompts.ts` - Claude prompts
- `src/lib/interceptor/schema-inference.ts` - OpenAPI inference
- `src/app/api/intercept/analyze/route.ts` - Analysis trigger

### Phase 3 Files (Generators)
- `src/lib/interceptor/generators/openapi.ts`
- `src/lib/interceptor/generators/typescript-client.ts`
- `src/lib/interceptor/generators/test-suite.ts`

### Phase 4 Files (UI)
- `src/app/intercept/page.tsx` - Main UI
- `src/components/ui/TrafficList.tsx`

### Storage Format
```
captures/sessions/{id}/manifest.json, traffic.jsonl, insights/
```

### Quick Start (after Phase 1)
```bash
npm run dev
mitmdump -s scripts/interceptor.py --set api_url=http://localhost:3000/api/intercept/ingest
```

## Tech Stack
Next.js 16.1, React 19, TypeScript 5, Tailwind 4, Prisma 7, tRPC 11
