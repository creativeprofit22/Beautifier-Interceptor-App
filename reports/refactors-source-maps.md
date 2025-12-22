# Refactor Report: Source Maps

Generated: 2025-12-22
Feature: Source Maps
Source: reports/bugs-source-maps.md

## Scope
Files analyzed:
- src/lib/source-map.ts
- src/lib/prompts.ts
- src/app/api/beautify/route.ts
- src/app/page.tsx

## High Priority (Tech Debt / DRY) ✅ COMPLETE
| # | Location | Issue | Suggested Fix | Effort | Status |
|---|----------|-------|---------------|--------|--------|
| 1 | page.tsx:351-389 | `handleBeautify` duplicates fetch/error logic that `apiCall` already abstracts | Refactor to use `apiCall` helper, extend it to return full response object | S | ✅ |
| 2 | source-map.ts:99-102 | Manual Map→Object conversion duplicates what `Object.fromEntries()` does | Replace loop with `Object.fromEntries(info.variableNames)` | S | ✅ |

## Medium Priority (Code Clarity) ✅ COMPLETE
| # | Location | Issue | Suggested Fix | Effort | Status |
|---|----------|-------|---------------|--------|--------|
| 1 | page.tsx:199-212 | Source map badge rendering logic inline in OutputPanel is verbose | Extract to `SourceMapBadge` component for consistency with other small components | S | ✅ |
| 2 | source-map.ts:3-13 | `SourceMapInfo` interface is only used internally but exported | Make `SourceMapInfo` non-exported (remove `export`) since only `SourceMapResult` is public API | S | ✅ |
| 3 | page.tsx:340-349 | 9 useState calls in Home component getting unwieldy | Consider grouping related state into a reducer or custom hook (e.g., `useBeautifyState`) | M | ✅ |

## Low Priority (Nice-to-Have) ✅ COMPLETE
| # | Location | Issue | Suggested Fix | Effort | Status |
|---|----------|-------|---------------|--------|--------|
| 1 | page.tsx:101-107 | `actionButtonStyles` array joined to string at module level | Use template literal directly for simpler code | S | ✅ |
| 2 | route.ts:9-15 | `stripMarkdownFences` is beautify-specific utility in route file | Move to a shared utils file if other routes need similar parsing | S | ✅ |
| 3 | prompts.ts:21-23 | Variable mapping format string could be a constant for consistency | Extract format string to constant if reused elsewhere | S | ✅ |

## Summary
- High: 2 refactors (2 Small, 0 Medium, 0 Large) ✅
- Medium: 3 refactors (2 Small, 1 Medium, 0 Large) ✅
- Low: 3 refactors (3 Small, 0 Medium, 0 Large) ✅
- Total: 8 refactors - **ALL COMPLETE**
