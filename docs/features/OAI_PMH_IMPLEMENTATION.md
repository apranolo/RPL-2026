# OAI-PMH Article Harvesting Implementation Guide

## Overview

This document describes the implementation of OAI-PMH (Open Archives Initiative Protocol for Metadata Harvesting) article harvesting functionality in the Jurnal_Mu platform, inspired by [Garuda Kemdikti](https://garuda.kemdiktisaintek.go.id/) and [MAJU UAD](https://maju.uad.ac.id/).

**Implementation Date:** February 6, 2026  
**Status:** ✅ **COMPLETED** - Production Ready

---

## What is OAI-PMH?

OAI-PMH is a protocol developed for harvesting metadata descriptions of records in digital repositories. Many journal management systems (like OJS - Open Journal Systems) provide OAI-PMH endpoints that allow external systems to collect article metadata automatically.

**Example OAI-PMH URL:**
```
https://journal.unnes.ac.id/journals/inapes/oai
```

**Example Request:**
```
https://journal.unnes.ac.id/journals/inapes/oai?verb=ListRecords&metadataPrefix=oai_dc
```

---

## Architecture

### Database Schema

#### 1. **journals** table - Added field
```sql
ALTER TABLE journals ADD COLUMN oai_pmh_url VARCHAR(500) NULL 
    COMMENT 'OAI-PMH base URL for article harvesting';
```

#### 2. **articles** table - NEW
```sql
CREATE TABLE articles (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    journal_id BIGINT UNSIGNED NOT NULL,
    
    -- OAI-PMH Metadata
    oai_identifier VARCHAR(255) NOT NULL UNIQUE,
    oai_datestamp TIMESTAMP NOT NULL,
    oai_set VARCHAR(100) NULL,
    
    -- Article Metadata (Dublin Core)
    title TEXT NOT NULL,
    abstract TEXT NULL,
    authors JSON NULL,
    keywords JSON NULL,
    doi VARCHAR(255) NULL,
    publication_date DATE NOT NULL,
    
    -- Volume/Issue Info
    volume VARCHAR(50) NULL,
    issue VARCHAR(50) NULL,
    pages VARCHAR(50) NULL,
    
    -- URLs
    article_url VARCHAR(500) NULL,
    pdf_url VARCHAR(500) NULL,
    
    -- Timestamps
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    last_harvested_at TIMESTAMP NULL,
    
    FOREIGN KEY (journal_id) REFERENCES journals(id) ON DELETE CASCADE
);
```

#### 3. **oai_harvesting_logs** table - NEW
```sql
CREATE TABLE oai_harvesting_logs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    journal_id BIGINT UNSIGNED NOT NULL,
    harvested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    records_found INT DEFAULT 0,
    records_imported INT DEFAULT 0,
    status ENUM('success', 'partial', 'failed'),
    error_message TEXT NULL,
    
    FOREIGN KEY (journal_id) REFERENCES journals(id) ON DELETE CASCADE
);
```

---

## Backend Components

### 1. Article Model
**File:** `app/Models/Article.php`

Key features:
- Mass assignable fields for OAI-PMH metadata
- Relationship to Journal model
- Scopes: `recent()`, `byYear()`, `byVolume()`
- Accessors: `authors_list`, `doi_url`, `google_scholar_url`, `volume_issue`

### 2. OAI-PMH Harvester Service
**File:** `app/Services/OAIPMHHarvester.php`

Main method:
```php
public function harvest(Journal $journal, ?string $fromDate = null): array
```

Features:
- Fetches OAI-PMH XML from journal endpoint
- Parses Dublin Core metadata (oai_dc format)
- Creates/updates Article records (prevents duplicates using `oai_identifier`)
- Extracts: title, abstract, authors, DOI, publication date, volume/issue
- Logs all harvesting activities to `oai_harvesting_logs`
- Error handling with detailed error messages

### 3. Artisan Command
**File:** `app/Console/Commands/HarvestJournalArticles.php`

Usage:
```bash
# Harvest articles from a specific journal
php artisan journals:harvest-articles {journal_id}

# Harvest all journals with OAI-PMH URLs
php artisan journals:harvest-articles --all

# Harvest with date filter (only articles modified after date)
php artisan journals:harvest-articles --all --from=2024-01-01
```

Output example:
```
📚 Harvesting: Indonesian Journal for Physical Education and Sport
   OAI-PMH URL: https://journal.unnes.ac.id/journals/inapes/oai
   ✓ Found: 124 records
   ✓ Imported: 120 new articles
   ✓ Updated: 4 existing articles

═══════════════════════════════════════════
📊 Harvesting Summary
═══════════════════════════════════════════
Journals processed: 1
Total records found: 124
New articles imported: 120
Existing articles updated: 4
✅ Harvesting completed successfully!
```

### 4. Controller Updates
**File:** `app/Http/Controllers/PublicJournalController.php`

`show()` method now includes:
- Eager loads `articles` relationship (20 most recent)
- Calculates `articles_count` 
- Provides `articlesByYear` statistics (5 most recent years)

---

## Frontend Components

### 1. TypeScript Interface
**File:** `resources/js/types/index.d.ts`

```typescript
export interface Article {
    id: number;
    journal_id: number;
    oai_identifier: string;
    title: string;
    abstract?: string | null;
    authors?: string[] | null;
    authors_list?: string;
    doi?: string | null;
    doi_url?: string | null;
    publication_date: string;
    volume?: string | null;
    issue?: string | null;
    volume_issue?: string | null;
    pages?: string | null;
    article_url?: string | null;
    pdf_url?: string | null;
    google_scholar_url?: string;
    // ...
}

export interface Journal {
    // ... existing fields ...
    oai_pmh_url?: string;
    articles?: Article[];
    articles_count?: number;
}
```

### 2. Journal Detail Page
**File:** `resources/js/pages/Journals/Show.tsx`

New "Published Articles" section displays:
- Total article count badge
- List of recent articles (20 max) with:
  - Article title (bold, prominent)
  - Authors list
  - Volume/Issue info (e.g., "Vol. 5, No. 1")
  - Publication date (formatted)
  - Abstract preview (truncated to 3 lines)
- Action buttons for each article:
  - **Full Text** (article_url) - Primary button
  - **PDF** (pdf_url) - If available
  - **DOI** link - If available
  - **Google Scholar** search link
- Link to OAI-PMH endpoint at bottom

---

## User Workflows

### For Admin Kampus (University Admin)

#### 1. **Add OAI-PMH URL to Journal**
1. Navigate to Journals → Edit Journal
2. Scroll to "OAI-PMH URL" field
3. Enter the base URL (e.g., `https://journal.example.com/oai`)
4. Save

#### 2. **Manual Harvest Articles**
```bash
# Via terminal (requires SSH access)
php artisan journals:harvest-articles {journal_id}
```

### For Public Users

#### 1. **View Journal Articles**
1. Go to Public Journal Page: `/journals/{id}`
2. Scroll to "Published Articles" section
3. See list of recent articles with metadata
4. Click action buttons to:
   - Read full text
   - Download PDF
   - View on DOI resolver
   - Search on Google Scholar

---

## Metadata Mapping (OAI-PMH to Database)

| Dublin Core Field | Database Column | Notes |
|-------------------|-----------------|-------|
| `dc:title` | `title` | Required |
| `dc:description` | `abstract` | First description becomes abstract |
| `dc:creator` | `authors` (JSON) | Multiple creators stored as array |
| `dc:subject` | `keywords` (JSON) | Multiple keywords stored as array |
| `dc:date` | `publication_date` | Supports YYYY, YYYY-MM, YYYY-MM-DD |
| `dc:identifier` | `doi`, `article_url`, `pdf_url` | DOI extracted via regex, URLs stored |
| `dc:source` | `volume`, `issue`, `pages` | Parsed from patterns like "Vol. 5 No. 1" |

---

## Automated Scheduling (Optional)

To enable daily automatic harvesting, add to `app/Console/Kernel.php`:

```php
protected function schedule(Schedule $schedule)
{
    // Harvest articles daily at 2 AM
    $schedule->command('journals:harvest-articles --all')
             ->daily()
             ->at('02:00')
             ->onOneServer() // If using multiple servers
             ->runInBackground();
}
```

Ensure cron is configured:
```bash
* * * * * cd /path-to-jurnal-mu && php artisan schedule:run >> /dev/null 2>&1
```

---

## Error Handling

### Common Errors and Solutions

#### 1. **"Journal does not have OAI-PMH URL configured"**
- **Solution:** Add `oai_pmh_url` to the journal record

#### 2. **"Failed to harvest from OAI-PMH endpoint: HTTP 404"**
- **Causes:** 
  - Invalid OAI-PMH URL
  - Journal website is down
  - OAI-PMH endpoint moved
- **Solution:** Verify URL manually, check journal website

#### 3. **"Failed to parse XML response"**
- **Causes:**
  - Server returned HTML error page instead of XML
  - Malformed XML
- **Solution:** Check `oai_harvesting_logs` table for error details

#### 4. **Duplicate Key Error on `oai_identifier`**
- **This shouldn't happen** - Service checks for existing records before creating
- If it does, indicates database constraint issue

---

## Testing

### Manual Testing Steps

1. **Add Test Journal with OAI-PMH URL**
```sql
UPDATE journals 
SET oai_pmh_url = 'https://journal.unnes.ac.id/journals/inapes/oai' 
WHERE id = 1;
```

2. **Run Harvest Command**
```bash
php artisan journals:harvest-articles 1
```

3. **Verify Articles Imported**
```sql
SELECT COUNT(*) FROM articles WHERE journal_id = 1;
SELECT * FROM articles WHERE journal_id = 1 LIMIT 5;
```

4. **Check Logs**
```sql
SELECT * FROM oai_harvesting_logs WHERE journal_id = 1 ORDER BY harvested_at DESC LIMIT 1;
```

5. **View on Public Page**
- Navigate to: `http://localhost/jurnal_mu/journals/1`
- Verify "Published Articles" section appears
- Check article metadata displays correctly

---

## Performance Considerations

### Database Indexing
Already implemented:
- `articles.doi` (index)
- `articles.publication_date` (index)
- `articles.oai_identifier` (unique index)

### Optimization Tips

1. **Limit Article Display**
   - Currently showing 20 most recent articles per journal
   - Prevents page load delays

2. **Pagination for Large Datasets**
   - For journals with 500+ articles, consider implementing pagination
   - Or "Load More" button for lazy loading

3. **Caching**
   - Consider caching article lists (15-min TTL):
   ```php
   $articles = Cache::remember("journal_{$journalId}_articles", 900, function() {
       return $journal->articles()->recent()->take(20)->get();
   });
   ```

4. **Background Harvesting**
   - For large journals, queue harvesting jobs:
   ```php
   dispatch(new HarvestJournalArticlesJob($journal))->onQueue('harvesting');
   ```

---

## Security Considerations

1. **External HTTP Requests**
   - Uses Laravel's `Http::timeout(30)` to prevent hanging requests
   - Validates XML before processing

2. **XSS Prevention**
   - All article metadata properly escaped in Blade/React
   - No raw HTML rendering from external sources

3. **SQL Injection**
   - Uses Eloquent ORM and parameter binding
   - No raw SQL queries with user input

4. **Rate Limiting** (TODO)
   - Consider adding rate limiting if harvesting from same server repeatedly
   - Respect robots.txt and server load

---

## Future Enhancements

### Phase 2 (Potential)

1. **Advanced Article Search**
   - Full-text search across article titles/abstracts
   - Filter by year, author, keyword

2. **Article Detail Page**
   - Dedicated `/journals/{id}/articles/{articleId}` route
   - Display full abstract, all keywords, all authors

3. **Citation Export**
   - BibTeX format
   - RIS format
   - APA/MLA citation strings

4. **Article View Counter**
   - Track how many times each article is viewed
   - Display popular articles

5. **OAI-PMH Server** (outbound)
   - Expose Jurnal_Mu data via OAI-PMH
   - Allow external systems to harvest from us

6. **Multi-format Support**
   - Currently supports `oai_dc` (Dublin Core)
   - Add support for `oai_marc`, `oai_datacite`

---

## API Reference

### OAIPMHHarvester Service

```php
use App\Services\OAIPMHHarvester;

$harvester = app(OAIPMHHarvester::class);

// Harvest all articles
$stats = $harvester->harvest($journal);

// Harvest articles after specific date
$stats = $harvester->harvest($journal, '2024-01-01');

// Returns:
// [
//     'records_found' => 124,
//     'records_imported' => 120,
//     'records_updated' => 4,
//     'errors' => []
// ]
```

### Article Model Methods

```php
use App\Models\Article;

// Get recent articles
$articles = Article::recent()->take(10)->get();

// Get articles by year
$articles = Article::byYear(2024)->get();

// Get articles by volume
$articles = Article::byVolume('5')->get();

// Accessors
$article->authors_list;          // "John Doe, Jane Smith"
$article->doi_url;               // "https://doi.org/10.1234/example"
$article->google_scholar_url;    // Google Scholar search URL
$article->volume_issue;          // "Vol. 5, No. 1"
```

---

## References

- **OAI-PMH Specification:** http://www.openarchives.org/OAI/openarchivesprotocol.html
- **Dublin Core Metadata:** https://www.dublincore.org/specifications/dublin-core/
- **Garuda Kemdikti:** https://garuda.kemdiktisaintek.go.id/
- **MAJU UAD:** https://maju.uad.ac.id/
- **OJS OAI-PMH Docs:** https://docs.pkp.sfu.ca/oai/

---

## Troubleshooting

### Issue: Articles not showing on public page

**Check:**
1. Does journal have `oai_pmh_url` set?
   ```sql
   SELECT id, title, oai_pmh_url FROM journals WHERE id = X;
   ```

2. Are articles imported?
   ```sql
   SELECT COUNT(*) FROM articles WHERE journal_id = X;
   ```

3. Check browser console for JS errors

### Issue: Harvesting command fails silently

**Check:**
1. Laravel logs: `storage/logs/laravel.log`
2. OAI harvesting logs:
   ```sql
   SELECT * FROM oai_harvesting_logs WHERE status = 'failed' ORDER BY harvested_at DESC;
   ```

3. Test OAI-PMH URL manually in browser

---

## Conclusion

The OAI-PMH article harvesting system is now fully operational. It enables Jurnal_Mu to automatically collect and display article metadata from journals that provide OAI-PMH endpoints, similar to how Garuda Kemdikti aggregates research articles.

**Key Benefits:**
- ✅ Automatic article discovery and import
- ✅ Rich metadata display on public journal pages
- ✅ Standardized Dublin Core format
- ✅ Comprehensive error logging
- ✅ Production-ready with robust error handling

For questions or issues, refer to:
- `app/Services/OAIPMHHarvester.php` (main logic)
- `storage/logs/laravel.log` (error logs)
- `oai_harvesting_logs` table (harvesting history)
