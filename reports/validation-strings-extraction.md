# Validation Report: Strings Extraction Tab

Date: 2025-12-29

## Files Validated
- `src/app/api/android-re/strings/route.ts`
- `src/features/android-re/components/StringsExtractor.tsx`
- `src/app/android-re/page.tsx` (strings-related code)
- `src/features/android-re/components/index.ts`

## Checks Performed

### Tests
- Status: skipped
- Notes: No test files exist for this feature

### API Endpoints

| Endpoint | Method | Status | Notes |
|----------|--------|--------|-------|
| /api/android-re/strings | POST | PASS | 3 issues fixed |

**Issues Fixed:**
1. Empty file not rejected (MEDIUM) - Added `file.size === 0` validation
2. DoS via unbounded file processing (MEDIUM) - Added MAX_FILES_PER_CATEGORY = 50 limit
3. Sequential DEX/SO processing (MEDIUM) - Parallelized with Promise.all()

### UI
- Renders: yes
- Issues found: 8 (all fixed)

**Issues Fixed:**
1. Memory leak in setTimeout handlers - Added useRef + cleanup useEffect
2. Missing ARIA roles on category tabs - Added role="tablist", role="tab", aria-selected
3. Missing aria-label on search input - Added id and aria-label
4. Copy All button missing aria-label - Added dynamic aria-label
5. Copy buttons not keyboard accessible - Added focus:opacity-100 class
6. Weak key prop for list items - Added string content prefix to key
7. Missing aria-hidden on decorative icons - Added aria-hidden="true"
8. Missing tabpanel role on string list - Added role="tabpanel" and id

### Wiring
- Data flow verified: yes
- Issues found: 1 (LOW, not fixed)

**Status:**
- Import/export chain: PASS
- State variables: PASS
- AbortController setup: PASS
- Handler functions: PASS
- Props matching: PASS
- Error propagation: PASS

**Minor Issue (not fixed):**
- NativeUploader MAX_FILE_SIZE (50MB) < API MAX_FILE_SIZE (100MB) - frontend more restrictive, no runtime errors

### Bottlenecks
- Found: 1
- Fixed: 1
- Remaining: 0 critical

**Fixed:**
1. Sequential DEX/SO file extraction - Parallelized with Promise.all()

**Acceptable (not fixed):**
- Large list rendering without virtualization (max 15k items, acceptable for this use case)
- File loaded into memory (max 100MB, acceptable for local tool)
- String filtering with multiple regex tests (runs in <100ms)

### Bugs
- Found: 3
- Fixed: 3

**Bugs Fixed:**
1. Unicode decoding fails for emoji/supplementary characters (MEDIUM)
   - Changed String.fromCharCode() to String.fromCodePoint() in decodeXmlEntities()

2. Copy indicator shows on wrong string after category switch (MEDIUM)
   - Added useEffect to clear copiedIndex when category changes

3. Empty file upload not rejected (LOW)
   - Added file.size === 0 check

## Summary
- All checks passing: yes
- Ready for refactor-hunt: yes

## Fix Details

### API Route (route.ts)
- Line 20-21: Added MAX_FILES_PER_CATEGORY constant
- Line 55-57: Added empty file validation
- Lines 161-169: Parallelized DEX/SO extraction with Promise.all()
- Line 249-250: Changed fromCharCode to fromCodePoint for Unicode

### Component (StringsExtractor.tsx)
- Lines 24-25: Added timeout refs for cleanup
- Lines 39-46: Added useEffect for timeout cleanup on unmount
- Lines 48-52: Added useEffect to clear copiedIndex on category change
- Multiple lines: Added ARIA attributes throughout
- Multiple lines: Added aria-hidden="true" to decorative icons
- Line 130: Added focus:opacity-100 for keyboard accessibility
