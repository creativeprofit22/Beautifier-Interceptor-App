# Code Beautifier

Local web app that beautifies/deobfuscates JavaScript using Claude CLI.

## Current Focus
Feature: Explain feature
Files: src/app/page.tsx, src/app/api/explain/route.ts

## Pipeline State
Phase: refactoring
Feature: Explain feature
Tier: low
Tier-Status: pending
Reports:
  - bugs: reports/bugs-explain-feature.md
  - refactors: reports/refactors-explain-feature.md

## Last Session (2025-12-22)
- Completed all 3 medium priority refactors:
  - Extracted `ActionButton` component with loading/active state support
  - Extracted `OutputPanel` component (reduced Home component by ~50 lines)
  - Extracted `apiCall<T>()` utility for common fetch logic
- Build passes

## Next Steps
1. Execute low priority refactors (2 items)
