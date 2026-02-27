# MAJU Journal Scraper - Quick Reference

## Overview
The `ScrapeMAJUJournals` command is a Laravel Artisan command that scrapes journal data from the MAJU UAD (Universitas Ahmad Dahlan) website and imports it into the local database.

**Command Class**: `App\Console\Commands\ScrapeMAJUJournals`  
**Source URL**: https://maju.uad.ac.id/beranda  
**Target**: UAD journals for database seeding

---

## Usage

### Basic Command
```bash
php artisan journals:scrape-maju
```

### With Options
```bash
# Limit to 10 journals
php artisan journals:scrape-maju --limit=10

# Dry run (preview without saving)
php artisan journals:scrape-maju --dry-run

# Combine options
php artisan journals:scrape-maju --limit=5 --dry-run
```

---

## Command Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--limit` | integer | 0 (all) | Maximum number of journals to scrape |
| `--dry-run` | flag | false | Preview data without saving to database |

---

## Scraping Process

### 1. **Prerequisite Check**
- Verifies UAD University exists in database
- Exits with error if not found

### 2. **Journal List Scraping**
- Fetches all paginated list pages from MAJU
- Extracts journal UUIDs from "MORE DETAILS" links
- Pattern: `/detail?jid={uuid}`
- Respects `--limit` option if set

### 3. **Detail Page Scraping**
- For each UUID, fetches detail page
- Extracts comprehensive journal metadata
- Rate limited: 0.5s delay between requests

### 4. **Data Persistence**
- Creates/updates journals using `updateOrCreate()`
- Matches by journal title
- Assigns to random Admin Kampus user from UAD

---

## Extracted Data

### Core Metadata
| Field | Source | Notes |
|-------|--------|-------|
| `title` | `<h3 class="title">` or similar | Primary identifier |
| `url` | Links containing "journal" | Journal homepage |
| `issn` | Text matching ISSN patterns | Print ISSN (1234-5678) |
| `e_issn` | Text matching ISSN patterns | Online ISSN |
| `cover_image_url` | `<img src="/covers/...">` | Auto-prefixed with base URL |

### Accreditation
| Field | Source | Example |
|-------|--------|---------|
| `sinta_rank` | Text containing "Sinta N" | 1-6 |
| `accreditation_status` | Derived from SINTA | "Terakreditasi" |
| `accreditation_grade` | Derived from SINTA | "S1", "S2", etc. |

### Contact Information
| Field | Extraction Method |
|-------|-------------------|
| `email` | Regex: email pattern in contact section |
| `editor_in_chief` | Non-keyword lines in contact section |
| `phone` | Regex: 8+ digit phone numbers |

### Content
| Field | XPath Query |
|-------|-------------|
| `about` | Text following "About the journal" |
| `scope` | Text following "Aims and Scope" |

### Indexations
Detected by href patterns:
- **Scopus**: `href` contains "scopus"
- **DOAJ**: `href` contains "doaj"
- **SINTA**: `href` contains "sinta"
- **Google Scholar**: `href` contains "scholar"
- **Web of Science**: `href` contains "webofscience" or "clarivate"

Stored as JSON: `{"Scopus": "https://...", "DOAJ": "https://..."}`

---

## Scientific Field Mapping

### Keyword-Based Classification
The scraper automatically maps journals to scientific fields based on keywords in title and scope:

| Field | Keywords |
|-------|----------|
| Computer Science | computer, informatics, information technology, software, data, intelligent |
| Engineering | engineering, teknik, elektro, mechanical, civil |
| Education | education, pendidikan, teaching, learning, pedagogical |
| Medicine | medical, medicine, health, kedokteran, farmasi, pharmacy |
| Economics | economic, ekonomi, business, management, finance |
| Social Sciences | social, society, psychology, psikologi |
| Language & Literature | language, bahasa, literature, sastra, linguistic |
| Agriculture | agriculture, pertanian, farming |
| Mathematics | math, statistics, statistik |
| Physics | physics, fisika |
| Chemistry | chemistry, kimia |
| Biology | biology, biologi, bioedu |
| Law | law, hukum, legal |

**Fallback**: Returns `null` if no keywords match (manual assignment needed)

---

## Rate Limiting & Politeness

| Action | Delay |
|--------|-------|
| Between detail page requests | 0.5 seconds |
| Between list page requests | 0.3 seconds |

**User-Agent**: `Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0`

---

## Error Handling

### Graceful Failures
- Individual journal scraping errors are caught and logged
- Scraper continues with remaining journals
- Error count displayed in summary

### Timeout
- HTTP timeout: 15 seconds per request
- Uses `Http::timeout(15)`

### Output
```
✅ Successfully scraped: 45 journals
⚠️  Errors encountered: 3
```

---

## Database Operations

### Update Strategy
```php
Journal::updateOrCreate(
    ['title' => $data['title']], // Match existing by title
    [ /* all other fields */ ]
)
```

- **Idempotent**: Re-running won't create duplicates
- **Updates**: Existing journals are refreshed with latest data

### User Assignment
- Randomly assigns to Admin Kampus users from UAD
- Requires seeded Admin Kampus users to exist
- Query: `User::where('role_id', 2)->where('university_id', $uadId)`

---

## Typical Workflow

### 1. Development/Testing
```bash
# Preview 5 journals
php artisan journals:scrape-maju --limit=5 --dry-run
```

### 2. Initial Seed
```bash
# Scrape all journals
php artisan journals:scrape-maju
```

### 3. Update Existing Data
```bash
# Re-scrape all (updates existing records)
php artisan journals:scrape-maju
```

### 4. Targeted Update
```bash
# Update only 10 journals
php artisan journals:scrape-maju --limit=10
```

---

## Integration with Seeders

### DatabaseSeeder Integration
```php
// In DatabaseSeeder.php after UniversitySeeder and UserSeeder
Artisan::call('journals:scrape-maju', ['--limit' => 20]);
```

### Manual Execution
```bash
# After migrate:fresh --seed, optionally run:
php artisan journals:scrape-maju --limit=50
```

---

## Technical Details

### DOM Parsing
- **Library**: PHP's native `DOMDocument` + `DOMXPath`
- **Error Suppression**: `@$dom->loadHTML()` with `LIBXML_NOERROR | LIBXML_NOWARNING`
- **XPath Queries**: Used for flexible element selection

### HTTP Client
- **Laravel HTTP Facade**: `Http::timeout(15)->withHeaders(...)->get(...)`
- **Timeout**: 15 seconds
- **Retries**: None (single attempt per request)

### Data Validation
- **ISSN Format**: `\d{4}-\d{3}[\dXx]` (e.g., 1234-567X)
- **UUID Format**: `[a-f0-9\-]+` (from URL query string)
- **Email Regex**: Standard RFC-compliant pattern

---

## Troubleshooting

### "UAD University not found"
**Cause**: University seeder hasn't run or UAD entry missing  
**Fix**: Run `php artisan db:seed --class=UniversitySeeder`

### Zero Journals Scraped
**Possible Causes**:
1. Website structure changed (XPath queries outdated)
2. Network/firewall blocking requests
3. Website is down

**Debug**: Run with `--dry-run --limit=1` and check for errors

### Timeout Errors
**Cause**: Slow network or server  
**Fix**: Increase timeout in `Http::timeout(30)`

### Missing Scientific Fields
**Cause**: Field mapping keywords don't match journal topics  
**Fix**: Update `mapScientificField()` keyword arrays

---

## Maintenance

### When to Update

1. **Website Redesign**: If MAJU site structure changes, update XPath queries
2. **New Indexations**: Add detection patterns in `extractIndexations()`
3. **New Scientific Fields**: Update keyword mappings in `mapScientificField()`

### Key Methods to Review
- `extractTitle()` - Title selector may change
- `extractURL()` - Link patterns may change
- `extractIndexations()` - New indexers may be added
- `mapScientificField()` - Expand keyword coverage

---

## Best Practices

✅ **DO**:
- Run with `--dry-run` first on production
- Use `--limit` for testing
- Monitor error count in output
- Re-run periodically to update data

❌ **DON'T**:
- Run without rate limiting (respect server resources)
- Remove User-Agent header (may get blocked)
- Assume 100% success rate (websites change)
- Scrape excessively (cache results when possible)

---

## Related Files

- **Model**: [app/Models/Journal.php](../app/Models/Journal.php)
- **Seeder**: [database/seeders/JournalSeeder.php](../database/seeders/JournalSeeder.php)
- **Policy**: [app/Policies/JournalPolicy.php](../app/Policies/JournalPolicy.php)
- **Schema**: [docs/ERD Database.md](ERD%20Database.md)

---

## Future Enhancements

### Potential Improvements
1. **Multi-source Support**: Scrape from multiple journal aggregators
2. **Incremental Updates**: Only fetch journals updated since last run
3. **Image Download**: Store cover images locally vs. hotlinking
4. **Validation**: Add schema validation for scraped data
5. **Retry Logic**: Implement exponential backoff for failed requests
6. **Parallel Processing**: Use Laravel queues for concurrent scraping

### Configuration File
Consider moving to config file:
```php
// config/scraper.php
return [
    'maju' => [
        'base_url' => 'https://maju.uad.ac.id',
        'timeout' => 15,
        'rate_limit' => 500, // milliseconds
    ],
];
```

---

**Last Updated**: February 7, 2026  
**Laravel Version**: 12.x  
**PHP Version**: 8.2+
