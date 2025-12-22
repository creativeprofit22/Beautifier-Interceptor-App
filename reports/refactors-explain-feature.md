# Refactor Report: Explain Feature

Generated: 2025-12-22
Feature: Explain feature
Source: reports/bugs-explain-feature.md

## Scope
Files analyzed:
- src/app/page.tsx
- src/app/api/explain/route.ts

## High Priority (Tech Debt / DRY)
| # | Location | Issue | Suggested Fix | Effort |
|---|----------|-------|---------------|--------|
| 1 | page.tsx:59-65, 107-113 | Loading spinner pattern duplicated in OutputContent and ExplanationContent | Extract `LoadingSpinner` component with configurable message prop | S |
| 2 | page.tsx:262-266, 272-276 | Tab button styling duplicated with identical conditional logic | Extract `TabButton` component | S |
| 3 | route.ts:5-6 | MAX_CODE_SIZE and TIMEOUT_MS duplicated across beautify and explain routes | Move to shared constants in src/lib/claude.ts or new src/lib/constants.ts | S |

## Medium Priority (Code Clarity) ✅ COMPLETE
| # | Location | Issue | Suggested Fix | Effort | Status |
|---|----------|-------|---------------|--------|--------|
| 1 | page.tsx | handleBeautify and handleExplain share similar fetch/error handling pattern | Extract `apiCall` utility function for common fetch logic | M | ✅ |
| 2 | page.tsx | Output panel JSX is inline in Home component (70+ lines) | Extract `OutputPanel` component to reduce Home component size | S | ✅ |
| 3 | page.tsx | Action buttons (Explain, Copy) have similar structure and styling | Extract `ActionButton` component with icon, label, loading state props | S | ✅ |

## Low Priority (Nice-to-Have) ✅ COMPLETE
| # | Location | Issue | Suggested Fix | Effort | Status |
|---|----------|-------|---------------|--------|--------|
| 1 | page.tsx:11 | PANEL_HEIGHT magic string could be unclear to new developers | Add comment explaining the calculation or move to a constants file | S | ✅ |
| 2 | page.tsx:101-107 | Long className string (100+ chars) is hard to read | Extract to a variable or use clsx/cn utility for readability | S | ✅ |

## Summary
- High: 3 refactors (3 Small, 0 Medium, 0 Large)
- Medium: 3 refactors (2 Small, 1 Medium) ✅ COMPLETE
- Low: 2 refactors (2 Small) ✅ COMPLETE
- Total: 8 refactors ✅ ALL COMPLETE
