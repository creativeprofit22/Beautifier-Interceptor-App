# Bug Report: Code Beautifier MVP

Generated: 2025-12-22
Feature: Code Beautifier MVP

## Scope
Files analyzed:
- src/app/page.tsx
- src/app/api/beautify/route.ts

## High Priority
| # | Location | Description | Impact |
|---|----------|-------------|--------|
| 1 | route.ts:54 | Rejected promise from timeout case is never handled - when `killed=true` the close handler returns early but the rejection from line 37 is already queued | Unhandled promise rejection warning in Node.js |

## Medium Priority
| # | Location | Description | Impact |
|---|----------|-------------|--------|
| 1 | page.tsx:54-56 | If `response.json()` fails (invalid JSON), the error thrown will be generic, not the actual parse error | Confusing error messages when API returns malformed response |
| 2 | route.ts:19 | Regex pattern doesn't handle code fences without newline after opening fence (e.g., ` ```javascript// code`) | Some Claude outputs may not be properly stripped |

## Low Priority
| # | Location | Description | Impact |
|---|----------|-------------|--------|
| 1 | page.tsx:55 | Reading response body twice - first `.json()` for error, then again on line 59 for success | Inefficient; body can only be read once so this works, but is confusing |
| 2 | route.ts:70 | `request.json()` can throw if body is not valid JSON, but error message will be generic | Users see "Failed to beautify code" instead of "Invalid request body" |

## Summary
- High: 1 bug
- Medium: 2 bugs
- Low: 2 bugs
- Total: 5 bugs
