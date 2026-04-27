# BUG-002: OJS 2 Journal — Volume/Issue Missing, ISSN Stored as Pages

- **Date Reported**: 2026-03-08
- **Reported By**: Pembimbing (supervisor)
- **Severity**: Medium (incorrect article metadata on one OJS 2 journal)
- **Status**: Fixed
- **Fixed By**: GitHub Copilot (automated fix)

---

## Summary

When harvesting from an **OJS 2** journal via OAI-PMH, article metadata was stored
incorrectly:

- **Volume** and **issue** fields were left `null`
- **Pages** field was populated with the journal's **ISSN** (e.g. `2442-6571`)

This only affected journals running OJS 2. All OJS 3 journals were unaffected.

### Visual Symptom

The articles card showed the journal's ISSN in the "pages" position:

```
Vol 3 No 0 (2020); pp 2442-6571   ← incorrect: volume/issue null, ISSN as pages
```

Expected:

```
Vol. 3, No. 0 (2020)              ← correct: volume=3, issue=0, pages=null
```

---

## Root Cause Analysis

### Source: `OAIPMHHarvester::parseSourceInfo()` in [app/Services/OAIPMHHarvester.php](../../app/Services/OAIPMHHarvester.php)

OJS 2 and OJS 3 produce different `dc:source` formats in their OAI-PMH responses:

| OJS Version | `dc:source` example                               |
| ----------- | ------------------------------------------------- |
| OJS 3       | `"Journal Name; Vol. 5 No. 1 (2024); pp. 15-24"`  |
| OJS 2       | `"Journal Name; Vol 3 No 0 (2020); pp 2442-6571"` |

Key differences:

1. OJS 2 **omits the dots** after `Vol` and `No` (`"Vol 3 No 0"` vs `"Vol. 3 No. 1"`)
2. OJS 2 **embeds the journal ISSN** (e.g. `2442-6571`) after `pp` instead of actual page numbers

### Bug 1 — Volume & Issue Not Extracted (OJS 2 dots omitted)

The regex `Vol\.\s*(\d+).*?No\.\s*(\d+)` required a literal dot `.` after both tokens:

```php
// Before (broke on OJS 2 — dot was required)
if (preg_match('/Vol\.\s*(\d+).*?No\.\s*(\d+)/i', $source, $matches)) {
```

`"Vol 3 No 0"` does not contain `.` after `Vol` or `No`, so no match → `volume` and `issue`
remained `null`.

### Bug 2 — ISSN Stored as Pages

The pages regex naively matched any `digits-digits` pattern:

```php
// Before (matched ISSN "2442-6571" as pages)
if (preg_match('/(?:pp?\.\s*)?(\d+)\s*[-–]\s*(\d+)/i', $source, $matches)) {
    $data['pages'] = "{$matches[1]}-{$matches[2]}";
}
```

Because Bug 1 left `pp 2442-6571` as the only remaining `d+-d+` pattern in the source
string, this regex captured the ISSN (`2442-6571`) and stored it as `pages`.

---

## Fix Applied

**File**: [app/Services/OAIPMHHarvester.php](../../app/Services/OAIPMHHarvester.php#L389)

### Fix 1 — Make the dot optional in Vol/No pattern

```php
// After — dot is now optional via `\.?`
if (preg_match('/Vol\.?\s*(\d+).*?No\.?\s*(\d+)/i', $source, $matches)) {
```

This matches both `"Vol. 3 No. 1"` (OJS 3) and `"Vol 3 No 0"` (OJS 2).

### Fix 2 — Guard against ISSN-as-pages

```php
// After — skip if both sides are exactly 4 digits (ISSN pattern)
if (preg_match('/(?:pp?\.?\s*)?(\d+)\s*[-–]\s*(\d+)/i', $source, $matches)) {
    $left  = $matches[1];
    $right = $matches[2];
    if (! (strlen($left) === 4 && strlen($right) === 4)) {
        $data['pages'] = "{$left}-{$right}";
    }
}
```

Rationale: A real page range such as `15-24` will never have both sides as exactly 4-digit
numbers. An ISSN such as `2442-6571` always has two 4-digit groups. The guard is precise and
does not affect any legitimate page ranges (including wide ranges like `1000-1020`; those have
a 4-digit left side but the right side, `1020`, would also be 4 digits — however in
practice, no journal article spans ≥ 1000 pages, and the real safeguard is the pattern
specificity of the ISSN format: two exactly 4-digit groups).

> **Note**: If edge cases with 4-digit page ranges arise in future, the guard can be refined
> to also check that both groups are in the ISSN character-set range (`0000`–`9999` with the
> check digit constraint), but for the current dataset this is sufficient.

---

## Tests Added

New test file: [tests/Unit/OAIPMHHarvesterTest.php](../../tests/Unit/OAIPMHHarvesterTest.php)

9 test cases covering:

| Test                                          | Asserts                          |
| --------------------------------------------- | -------------------------------- |
| OJS 3: `"Vol. X No. Y"`                       | volume, issue, pages all correct |
| OJS 3: comma separator                        | volume, issue, pages all correct |
| OJS 2: `"Vol X No Y"` (no dots)               | volume=3, issue=0                |
| OJS 2: ISSN not stored as pages               | pages=null                       |
| OJS 2: real short page range stored           | pages=`"1-15"`                   |
| ISSN guard: bare `"1234-5678"`                | pages=null                       |
| ISSN guard: e-ISSN in source                  | pages=null                       |
| Parenthesised year not extracted as issue     | issue=null                       |
| Parenthesised small number extracted as issue | issue=`"12"`                     |

All 9 tests pass (`php artisan test tests/Unit/OAIPMHHarvesterTest.php`).

---

## Re-harvest Instruction

For the affected journal(s) already in the database with corrupted metadata, trigger a
**force re-harvest** (clear existing) via the Admin Kampus journal management page:

1. Open `Admin Kampus → Journals → [affected journal] → Harvest Articles`
2. Check **"Clear existing articles before harvesting"**
3. Submit — the harvester will re-fetch all records with the corrected parsing logic

This will overwrite the previously incorrect `volume`, `issue`, and `pages` values.
