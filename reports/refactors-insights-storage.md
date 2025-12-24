# Refactor Report: Insights Storage

Generated: 2025-12-23
Feature: Insights Storage
Source: reports/bugs-insights-storage.md

## Scope
Files analyzed:
- src/app/api/interceptor/insights/route.ts
- src/app/api/interceptor/insights/[id]/route.ts
- src/features/interceptor/components/SavedInsights.tsx
- src/features/interceptor/components/ScanResults.tsx
- src/features/interceptor/components/OpenApiViewer.tsx

## High Priority (Tech Debt / DRY) ✅ COMPLETE
| # | Location | Issue | Suggested Fix | Effort | Status |
|---|----------|-------|---------------|--------|--------|
| 1 | route.ts:4 | `validTypes` array defined twice | Extract to constant `VALID_INSIGHT_TYPES` at top of file | S | ✅ Done |
| 2 | ScanResults.tsx:250-268 | Report object structure duplicated in handleExport and handleSave | Extract `buildScanReport()` helper function | S | ✅ Done |

## Medium Priority (Code Clarity) ✅ COMPLETE
| # | Location | Issue | Suggested Fix | Effort | Status |
|---|----------|-------|---------------|--------|--------|
| 1 | ScanResults.tsx + OpenApiViewer.tsx | Nearly identical `handleSave` async patterns | Extract `useSaveInsight(type)` custom hook | M | ✅ Done |
| 2 | SavedInsights.tsx:109-110 | `getSummary()` called twice in render | Store result in variable before JSX | S | ✅ Done |

## Low Priority (Nice-to-Have) ✅ COMPLETE
| # | Location | Issue | Suggested Fix | Effort | Status |
|---|----------|-------|---------------|--------|--------|
| 1 | Multiple files | Repeated button styling class string | Extract to shared `ActionButton` component or CSS class | M | ✅ Done |
| 2 | ScanResults.tsx | 377 lines with multiple internal components | Consider splitting FindingCard, SeverityGroup to separate files | L | ✅ Done |

## Summary
- High: 2 refactors (2 Small) ✅
- Medium: 2 refactors (1 Small, 1 Medium) ✅
- Low: 2 refactors (1 Medium, 1 Large) ✅
- Total: 6 refactors - **ALL COMPLETE**
