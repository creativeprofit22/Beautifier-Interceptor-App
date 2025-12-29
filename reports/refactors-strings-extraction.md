# Refactor Report: Strings Extraction Tab

**Date**: 2025-12-29
**Feature**: Strings Extraction Tab
**Status**: In Progress

## Files Analyzed

| File | Lines | Purpose |
|------|-------|---------|
| `src/app/api/android-re/strings/route.ts` | 358 | API endpoint for string extraction |
| `src/features/android-re/components/StringsExtractor.tsx` | 259 | Results display component |
| `src/app/android-re/page.tsx` | 510 | Main page with 3 tabs |
| `src/features/android-re/components/index.ts` | 7 | Barrel exports |

---

## HIGH Priority

### 1. DRY Violation: Repetitive Tab State Pattern

**Location**: `page.tsx:21-260`

**Issue**: Three tabs duplicate identical state/handler patterns:
- File state: `selectedFile` / `nativeFile` / `stringsFile`
- Stage state: `analysisStage` / `nativeStage` / `stringsStage`
- Error state: `errorMessage` / `nativeError` / `stringsError`
- Result state: `fileTree+jobId` / `nativeAnalysis` / `stringsData`
- Abort refs: `decompileAbortRef` / `nativeAbortRef` / `stringsAbortRef`
- Reset functions: `resetDecompileResults` / `resetNativeResults` / `resetStringsResults`
- Select handlers: `handleFileSelect` / `handleNativeFileSelect` / `handleStringsFileSelect`
- Clear handlers: `handleFileClear` / `handleNativeFileClear` / `handleStringsFileClear`

**Fix**: Extract custom hook `useTabAnalysis<TResult>()`

**Impact**: ~180 lines reduced to ~30 lines

---

### 2. DRY Violation: Repetitive Render Functions

**Location**: `page.tsx:301-451`

**Issue**: `renderDecompileTab()`, `renderNativeTab()`, `renderStringsTab()` share identical structure:
1. Uploader component
2. Conditional action button (when file selected & stage idle)
3. AnalysisProgress component (when stage !== idle)
4. Results viewer component (when stage === complete)
5. EmptyState component (when no file)

**Fix**: Create generic `<AnalysisTab>` component

**Impact**: ~150 lines of JSX duplication eliminated

---

## MEDIUM Priority

### 3. Semantic Mismatch: NativeUploader for Strings Tab

**Location**: `page.tsx:404`

**Issue**: Strings tab reuses `<NativeUploader>` with `acceptedTypes` override.

**Fix**: Rename to generic `FileUploader` or create `StringsUploader` wrapper.

---

### 4. Unnecessary Variable Assignment

**Location**: `route.ts:37-41`

**Issue**:
```typescript
const fileField = formData.get("file");
if (!fileField || !(fileField instanceof File)) { ... }
const file = fileField; // Redundant
```

**Fix**: Use `fileField` directly or rename inline.

---

## LOW Priority

### 5. Result Object Assignment Style

**Location**: `route.ts:83-98`

**Issue**: Result initialized empty, then properties assigned individually.

**Fix**: Use spread assignment or return extracted directly.

---

## Summary

| Priority | Issue | Effort | Status |
|----------|-------|--------|--------|
| HIGH | Repetitive tab state pattern | Medium | **Fixed** |
| HIGH | Repetitive render functions | Medium | **Fixed** |
| MED | Semantic mismatch (NativeUploader) | Low | Skipped |
| MED | Unnecessary variable assignment | Trivial | Skipped |
| LOW | Result object assignment style | Trivial | Skipped |

## Fixes Applied

- [x] Created `useTabAnalysis` hook (`src/features/android-re/hooks/useTabAnalysis.ts`)
- [x] Created `AnalysisTab` component (`src/features/android-re/components/AnalysisTab.tsx`)
- [x] Refactored `page.tsx` to use new abstractions

## Results

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| page.tsx lines | 510 | 378 | -132 (-26%) |
| State variables (native tab) | 7 | 1 (hook) | -6 |
| State variables (strings tab) | 5 | 1 (hook) | -4 |
| Render function lines | ~50 each | ~35 each | -30% |

### New Files Created
- `src/features/android-re/hooks/useTabAnalysis.ts` (113 lines)
- `src/features/android-re/hooks/index.ts` (1 line)
- `src/features/android-re/components/AnalysisTab.tsx` (80 lines)

### Architecture Notes
- Decompile tab retains manual state due to file tree navigation complexity
- Native and Strings tabs now use `useTabAnalysis` hook
- All three tabs use `AnalysisTab` for consistent structure
