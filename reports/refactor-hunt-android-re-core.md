# Refactor Hunt Report: Android RE Core Infrastructure

**Date**: 2025-12-28
**Phase**: refactor-hunt
**Files Analyzed**: 7

---

## High Priority

### 1. DRY Violation: Duplicate CLI Runner Logic
**Files**: `jadx-wrapper.ts:56-129`, `ghidra-wrapper.ts:57-132`
**Issue**: Both wrappers have nearly identical command execution logic (~70 lines each):
- Same Promise-based spawn wrapper
- Same timeout handling with settle pattern
- Same stdout/stderr collection
- Same error handling with ENOENT/EACCES hints
- Same result interface shape

**Recommendation**: Extract shared logic into `src/lib/cli-runner.ts`:
```typescript
// cli-runner.ts
interface CliResult {
  success: boolean;
  data?: string;
  error?: string;
  hint?: string;
}

interface CliConfig {
  command: string;
  cwd: string;
  timeout: number;
  toolName: string; // For error messages
}

function runCliCommand(args: string[], config: CliConfig): Promise<CliResult>
```

Both wrappers become thin adapters calling the shared runner.

**Impact**: ~60 lines of duplication removed, single point for CLI behavior changes.

---

### 2. DRY Violation: Duplicate Availability Check Pattern
**Files**: `jadx-wrapper.ts:35-51`, `ghidra-wrapper.ts:36-52`
**Issue**: Both `checkXXXAvailable()` functions follow identical pattern:
- Check root path exists
- Check binary/script exists
- Return `{ available, error?, hint? }`

**Recommendation**: Extract to shared utility:
```typescript
function checkToolAvailable(
  rootPath: string,
  binaryPath: string,
  toolName: string,
  installHint: string,
  buildHint: string
): { available: boolean; error?: string; hint?: string }
```

**Impact**: ~15 lines of duplication removed.

---

## Medium Priority

### 3. Dead Code: Unused Search State
**File**: `DecompiledViewer.tsx:95`
**Issue**: `searchQuery` state is set but never used to filter files:
```tsx
const [searchQuery, setSearchQuery] = useState("");
// ... searchQuery is only bound to input, never used for filtering
```

**Recommendation**: Either:
- Remove the search input and state (if search not planned)
- Implement file filtering logic using `searchQuery`

**Impact**: Removes unused code or completes intended feature.

---

### 4. Large Inline Functions: Tab Renderers
**File**: `page.tsx:53-140`
**Issue**: Three `renderXxxTab()` functions (20-30 lines each) clutter the main component. As features grow, this becomes harder to maintain.

**Recommendation**: Extract to separate components:
- `DecompileTabContent.tsx`
- `NativeAnalysisTabContent.tsx`
- `StringsTabContent.tsx`

**Impact**: Better separation of concerns, easier to extend individual tabs.

---

## Low Priority

### 5. Temp Directory Cleanup
**File**: `jadx-wrapper.ts:181-182`
**Issue**: `listClasses()` creates temp directories but doesn't clean them up:
```typescript
const tempDir = `/tmp/jadx-list-${Date.now()}-${Math.random().toString(36).slice(2)}`;
return runJadxCommand(["--no-src", "--no-res", "-d", tempDir, inputPath], 60000);
```

**Recommendation**: Add cleanup after command completes:
```typescript
// After command, schedule cleanup
setTimeout(() => rmdir(tempDir, { recursive: true }), 0);
```

**Impact**: Prevents /tmp accumulation over time.

---

### 6. Result Type Consolidation
**Files**: `jadx-wrapper.ts:13-18`, `ghidra-wrapper.ts:12-17`
**Issue**: Identical result interfaces with different names:
```typescript
// jadx-wrapper.ts
export interface JadxResult { success: boolean; data?: string; error?: string; hint?: string; }

// ghidra-wrapper.ts
export interface GhidraResult { success: boolean; data?: string; error?: string; hint?: string; }
```

**Recommendation**: Single shared type in `cli-runner.ts`:
```typescript
export interface CliResult { ... }
export type JadxResult = CliResult;
export type GhidraResult = CliResult;
```

**Impact**: Type aliases preserve existing imports while consolidating definition.

---

## Summary

| Priority | Count | Lines Affected |
|----------|-------|----------------|
| High     | 2     | ~75 lines duplication |
| Medium   | 2     | ~10 lines dead code + structure |
| Low      | 2     | ~10 lines cleanup |

**Recommendation**: Start with High priority items - the CLI runner extraction provides the most value and sets up clean patterns for future tool integrations.
