<?php

use App\Services\OAIPMHHarvester;

/**
 * Tests for OAIPMHHarvester::parseSourceInfo()
 *
 * Covers OJS 2 vs OJS 3 dc:source format differences:
 * - OJS 3: "Journal Name; Vol. 3 No. 1 (2024); pp. 15-24"  (dots on Vol/No, real page range)
 * - OJS 2: "Journal Name; Vol 3 No 0 (2020); pp 2442-6571" (no dots, ISSN where pages should be)
 */

// Concrete subclass that exposes the protected parseSourceInfo as a public test helper.
class TestableOAIPMHHarvester extends OAIPMHHarvester
{
    public function parseSource(string $source): array
    {
        $data = ['volume' => null, 'issue' => null, 'pages' => null];
        $this->parseSourceInfo($source, $data);

        return $data;
    }
}

// Utility: instantiate and call
function callParseSourceInfo(string $source): array
{
    return (new TestableOAIPMHHarvester)->parseSource($source);
}

// ───────────────────────────────────────────────
// OJS 3 — standard format (dots present)
// ───────────────────────────────────────────────

test('OJS 3: extracts volume and issue from "Vol. X No. Y"', function () {
    $result = callParseSourceInfo('Journal Name; Vol. 5 No. 1 (2024); pp. 15-24');

    expect($result['volume'])->toBe('5')
        ->and($result['issue'])->toBe('1')
        ->and($result['pages'])->toBe('15-24');
});

test('OJS 3: handles comma separator "Vol. 5, No. 1"', function () {
    $result = callParseSourceInfo('Some Journal; Vol. 5, No. 2 (2023); pp. 100-115');

    expect($result['volume'])->toBe('5')
        ->and($result['issue'])->toBe('2')
        ->and($result['pages'])->toBe('100-115');
});

// ───────────────────────────────────────────────
// OJS 2 — dots omitted, ISSN at end
// ───────────────────────────────────────────────

test('OJS 2: extracts volume and issue from "Vol X No Y" (no dots)', function () {
    $result = callParseSourceInfo(
        'International Journal of Advances in Intelligent Informatics; Vol 3 No 0 (2020); pp 2442-6571'
    );

    expect($result['volume'])->toBe('3')
        ->and($result['issue'])->toBe('0');
});

test('OJS 2: does NOT store ISSN (4-digit-hyphen-4-digit) as pages', function () {
    $result = callParseSourceInfo(
        'International Journal of Advances in Intelligent Informatics; Vol 3 No 0 (2020); pp 2442-6571'
    );

    expect($result['pages'])->toBeNull();
});

test('OJS 2: stores real page range when both sides are not 4 digits', function () {
    $result = callParseSourceInfo('Some Journal; Vol 5 No 2 (2020); pp 1-15');

    expect($result['pages'])->toBe('1-15');
});

// ───────────────────────────────────────────────
// ISSN guard — various ISSN formats
// ───────────────────────────────────────────────

test('pages guard: ISSN-like "1234-5678" is silently ignored', function () {
    $result = callParseSourceInfo('Journal Title; 1234-5678');

    expect($result['pages'])->toBeNull();
});

test('pages guard: e-ISSN format does not pollute pages', function () {
    $result = callParseSourceInfo('Journal Title; Vol 1 No 1 (2018); pp 2442-6578');

    expect($result['pages'])->toBeNull();
});

// ───────────────────────────────────────────────
// Year-in-parentheses guard (issue != year)
// ───────────────────────────────────────────────

test('parenthesised year is NOT extracted as issue number', function () {
    $result = callParseSourceInfo('Journal Name; Vol. 3 (2026)');

    // volume may be set, but issue must NOT be 2026
    expect($result['issue'])->toBeNull();
});

test('parenthesised issue ≤ 999 is extracted as issue', function () {
    $result = callParseSourceInfo('3(12)');

    expect($result['volume'])->toBe('3')
        ->and($result['issue'])->toBe('12');
});
