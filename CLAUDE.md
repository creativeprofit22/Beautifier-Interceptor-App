# Code Beautifier

Local web app that beautifies/deobfuscates JavaScript using Claude CLI.

## Current Focus
Feature: Code Beautifier MVP
Files: src/app/page.tsx, src/app/api/beautify/route.ts

## Pipeline State
Phase: refactoring
Feature: Code Beautifier MVP
Tier: low
Tier-Status: pending
Reports:
  - bugs: reports/bugs-code-beautifier-mvp.md
  - refactors: reports/refactors-code-beautifier-mvp.md

## Last Session (2025-12-22)
- Completed medium priority refactors (2 items)
- Extracted `OutputContent` component (replaces nested ternary)
- Extracted `ErrorBanner` component (reduces Home component size)
- Home component reduced from 190+ to ~140 lines
- Build passes

## Next Steps
1. Execute low priority refactors (2 remaining) or skip to mark MVP complete
