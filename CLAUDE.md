# Code Beautifier

Local web app that beautifies/deobfuscates JavaScript using Claude CLI.

## Current Focus
Feature: Code Beautifier MVP - Refactoring Phase

## Pipeline State
Phase: refactoring
Feature: Code Beautifier MVP
Tier: medium
Tier-Status: pending
Reports:
  - bugs: reports/bugs-code-beautifier-mvp.md
  - refactors: reports/refactors-code-beautifier-mvp.md

## Last Session (2025-12-22)
High priority refactors completed:
- Extracted `getErrorMessage(err: unknown): string` helper in page.tsx (line 11)
- Removed duplicate constants from route.ts, now imports from lib/claude.ts
- Type check passed

## Next Steps
1. Execute medium priority refactors from refactor report
2. Execute low priority refactors (optional)
