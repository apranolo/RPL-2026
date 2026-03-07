<?php

namespace App\Services;

use App\Models\Article;
use App\Models\Journal;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class OAIPMHHarvester
{
    /**
     * Harvest articles from a journal's OAI-PMH endpoint
     *
     * @param  Journal  $journal  The journal to harvest articles from
     * @param  string|null  $fromDate  Optional start date for harvesting (format: YYYY-MM-DD)
     * @param  bool  $clearExisting  If true, delete all existing articles before harvesting (full re-import)
     * @return array Harvesting statistics
     *
     * @throws \Exception
     */
    public function harvest(Journal $journal, ?string $fromDate = null, bool $clearExisting = false): array
    {
        if (! $journal->oai_pmh_url) {
            throw new \Exception("Journal '{$journal->title}' does not have OAI-PMH URL configured");
        }

        // Force fresh import: wipe existing articles so re-harvest starts clean
        if ($clearExisting) {
            $deleted = Article::where('journal_id', $journal->id)->delete();
            Log::info("Force harvest: deleted {$deleted} existing articles for journal '{$journal->title}' (ID: {$journal->id})");
        }

        $stats = [
            'records_found' => 0,
            'records_imported' => 0,
            'records_updated' => 0,
            'errors' => [],
        ];

        try {
            $url = $this->buildListRecordsUrl($journal->oai_pmh_url, $fromDate);
            $pageCount = 0;
            $maxPages = 500; // Safety cap to prevent infinite loops

            // Loop through all pages using OAI-PMH resumption tokens
            while ($url !== null && $pageCount < $maxPages) {
                $pageCount++;

                $response = Http::timeout(60)->get($url);

                if (! $response->successful()) {
                    throw new \Exception("Failed to harvest from OAI-PMH endpoint: HTTP {$response->status()}");
                }

                // Suppress XML errors and handle them gracefully
                libxml_use_internal_errors(true);
                $xml = simplexml_load_string($response->body());

                if ($xml === false) {
                    $errors = libxml_get_errors();
                    libxml_clear_errors();
                    $errorMessage = 'Failed to parse XML response';
                    if (! empty($errors)) {
                        $errorMessage .= ': '.$errors[0]->message;
                    }
                    throw new \Exception($errorMessage);
                }

                // Register OAI namespaces
                $xml->registerXPathNamespace('oai', 'http://www.openarchives.org/OAI/2.0/');
                $xml->registerXPathNamespace('oai_dc', 'http://www.openarchives.org/OAI/2.0/oai_dc/');
                $xml->registerXPathNamespace('dc', 'http://purl.org/dc/elements/1.1/');

                // Extract and process records from this page
                $records = $xml->xpath('//oai:record');

                if (! empty($records)) {
                    $stats['records_found'] += count($records);

                    foreach ($records as $record) {
                        try {
                            $this->processRecord($journal, $record, $stats);
                        } catch (\Exception $e) {
                            $stats['errors'][] = $e->getMessage();
                            Log::error("Error processing OAI record: {$e->getMessage()}");
                        }
                    }
                }

                // Check for a resumption token to determine if there are more pages
                $resumptionTokenNodes = $xml->xpath('//oai:resumptionToken');
                $resumptionToken = null;

                if (! empty($resumptionTokenNodes)) {
                    $token = trim((string) $resumptionTokenNodes[0]);
                    if ($token !== '') {
                        $resumptionToken = $token;
                    }
                }

                if ($resumptionToken) {
                    // Fetch next page using the resumption token
                    $url = $this->buildResumptionUrl($journal->oai_pmh_url, $resumptionToken);
                    Log::info("Harvesting page {$pageCount} for journal: {$journal->title} (resumptionToken: {$resumptionToken})");
                } else {
                    $url = null; // No more pages
                }
            }

            if ($pageCount >= $maxPages) {
                Log::warning("Harvest for journal '{$journal->title}' reached the max page limit ({$maxPages}). Some records may not have been imported.");
            }

            if ($stats['records_found'] === 0) {
                Log::info("No records found for journal: {$journal->title}");
            }

            // Log harvesting activity
            DB::table('oai_harvesting_logs')->insert([
                'journal_id' => $journal->id,
                'harvested_at' => now(),
                'records_found' => $stats['records_found'],
                'records_imported' => $stats['records_imported'],
                'status' => empty($stats['errors']) ? 'success' : 'partial',
                'error_message' => empty($stats['errors']) ? null : implode('; ', $stats['errors']),
            ]);

            Log::info("Harvested {$stats['records_imported']} articles for journal: {$journal->title} ({$pageCount} page(s) fetched)");

            return $stats;

        } catch (\Exception $e) {
            // Log failed harvesting
            DB::table('oai_harvesting_logs')->insert([
                'journal_id' => $journal->id,
                'harvested_at' => now(),
                'records_found' => $stats['records_found'],
                'records_imported' => $stats['records_imported'],
                'status' => 'failed',
                'error_message' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    /**
     * Process a single OAI-PMH record
     */
    protected function processRecord(Journal $journal, \SimpleXMLElement $record, array &$stats): void
    {
        // Register namespaces
        $record->registerXPathNamespace('oai', 'http://www.openarchives.org/OAI/2.0/');
        $record->registerXPathNamespace('dc', 'http://purl.org/dc/elements/1.1/');
        $record->registerXPathNamespace('oai_dc', 'http://www.openarchives.org/OAI/2.0/oai_dc/');

        // Extract OAI header information
        $header = $record->xpath('oai:header')[0] ?? null;
        if (! $header) {
            throw new \Exception('Missing OAI header in record');
        }

        // Skip deleted records
        $status = (string) $header->attributes()['status'] ?? '';
        if ($status === 'deleted') {
            return; // Silently skip deleted records
        }

        $oaiIdentifier = trim((string) $header->identifier);
        $oaiDatestamp = (string) $header->datestamp;
        $oaiSet = isset($header->setSpec) ? (string) $header->setSpec : null;

        // Guard: skip records without a usable identifier — inserting with an empty
        // oai_identifier would bypass the unique index and create silent duplicates.
        if ($oaiIdentifier === '') {
            Log::warning("Skipping OAI record with empty identifier for journal ID {$journal->id}");

            return;
        }

        // Try multiple XPath patterns for metadata (different OAI-PMH implementations)
        $metadata = $record->xpath('oai:metadata/oai_dc:dc/*');
        if (empty($metadata)) {
            $metadata = $record->xpath('oai:metadata/*/*');
        }
        if (empty($metadata)) {
            throw new \Exception("No metadata found for record: {$oaiIdentifier}");
        }

        $dcData = $this->extractDublinCoreMetadata($metadata);

        // Validate required fields
        if (empty($dcData['title'])) {
            throw new \Exception("Missing title for record: {$oaiIdentifier}");
        }

        $articleData = [
            'journal_id' => $journal->id,
            'oai_identifier' => $oaiIdentifier,
            'oai_datestamp' => $oaiDatestamp,
            'oai_set' => $oaiSet,
            'title' => $dcData['title'],
            'abstract' => $dcData['abstract'] ?? null,
            'authors' => $dcData['authors'] ?? null,
            'keywords' => $dcData['keywords'] ?? null,
            'doi' => $dcData['doi'] ?? null,
            'publication_date' => $dcData['date'] ?? now()->toDateString(),
            'volume' => $dcData['volume'] ?? null,
            'issue' => $dcData['issue'] ?? null,
            'pages' => $dcData['pages'] ?? null,
            'article_url' => $dcData['identifier'] ?? null,
            'pdf_url' => $dcData['pdf_url'] ?? null,
            'last_harvested_at' => now(),
        ];

        // Primary lookup: match by oai_identifier (unique index).
        // Secondary lookup: if the OAI server changed the identifier format between harvests
        // (a known quirk of several OJS installations) fall back to matching by DOI within
        // the same journal, so we update rather than create a duplicate.
        $existingByDoi = null;
        if (! empty($dcData['doi'])) {
            $existingByDoi = Article::where('journal_id', $journal->id)
                ->where('doi', $dcData['doi'])
                ->whereNot('oai_identifier', $oaiIdentifier)
                ->first();
        }

        try {
            if ($existingByDoi) {
                // Identifier changed but DOI matches — update in-place and correct the identifier
                $existingByDoi->update($articleData);
                $stats['records_updated']++;
            } else {
                // Atomic upsert: updateOrCreate is a single SELECT+INSERT/UPDATE operation
                // wrapped in Laravel's query builder, preventing the race condition that the
                // old manual SELECT→INSERT pattern was vulnerable to.
                $result = Article::updateOrCreate(
                    ['oai_identifier' => $oaiIdentifier],
                    $articleData
                );

                if ($result->wasRecentlyCreated) {
                    $stats['records_imported']++;
                } else {
                    $stats['records_updated']++;
                }
            }
        } catch (UniqueConstraintViolationException $e) {
            // Last-resort fallback: unique constraint fired despite updateOrCreate
            // (can happen in a tight race between two concurrent harvest jobs).
            // Attempt a plain update so the record ends up with the latest data.
            $updated = Article::where('oai_identifier', $oaiIdentifier)->update(
                array_merge($articleData, ['last_harvested_at' => now()])
            );

            if ($updated) {
                $stats['records_updated']++;
                Log::warning("Race condition on oai_identifier '{$oaiIdentifier}' — resolved via fallback update.");
            } else {
                throw $e; // Re-throw only if we genuinely could not handle it
            }
        }
    }

    /**
     * Extract Dublin Core metadata from XML elements
     */
    protected function extractDublinCoreMetadata(array $metadata): array
    {
        $data = [
            'title' => null,
            'abstract' => null,
            'authors' => [],
            'keywords' => [],
            'doi' => null,
            'date' => null,
            'volume' => null,
            'issue' => null,
            'pages' => null,
            'identifier' => null,
            'pdf_url' => null,
        ];

        foreach ($metadata as $element) {
            $name = $element->getName();
            $value = trim((string) $element);

            if (empty($value)) {
                continue;
            }

            switch ($name) {
                case 'title':
                    if (! $data['title']) { // Take first title only
                        $data['title'] = $value;
                    }
                    break;

                case 'description':
                    if (! $data['abstract']) { // Take first description as abstract
                        $data['abstract'] = $value;
                    }
                    break;

                case 'creator':
                    $data['authors'][] = $value;
                    break;

                case 'subject':
                    $data['keywords'][] = $value;
                    break;

                case 'date':
                    if (! $data['date']) {
                        // Try to parse date (formats: YYYY-MM-DD, YYYY-MM, YYYY)
                        $data['date'] = $this->parseDate($value);
                    }
                    break;

                case 'identifier':
                    // Check if identifier is DOI
                    if (stripos($value, 'doi') !== false || stripos($value, '10.') !== false) {
                        $data['doi'] = $this->extractDoi($value);
                    } elseif (filter_var($value, FILTER_VALIDATE_URL)) {
                        // Store first URL as article identifier
                        if (! $data['identifier']) {
                            $data['identifier'] = $value;
                        }
                        // Check if URL ends with .pdf
                        if (! $data['pdf_url'] && strtolower(substr($value, -4)) === '.pdf') {
                            $data['pdf_url'] = $value;
                        }
                    }
                    break;

                case 'source':
                    // Try to extract volume/issue/pages from source
                    // Common formats: "Vol. 5 No. 1 (2024)", "5(1):10-20"
                    $this->parseSourceInfo($value, $data);
                    break;
            }
        }

        return $data;
    }

    /**
     * Parse date from various formats
     */
    protected function parseDate(string $dateString): ?string
    {
        // Try ISO format first (YYYY-MM-DD)
        if (preg_match('/^(\d{4})-(\d{2})-(\d{2})/', $dateString, $matches)) {
            return $matches[0];
        }

        // Try YYYY-MM format
        if (preg_match('/^(\d{4})-(\d{2})/', $dateString, $matches)) {
            return $matches[0].'-01'; // Default to first day of month
        }

        // Try YYYY format
        if (preg_match('/^(\d{4})/', $dateString, $matches)) {
            return $matches[0].'-01-01'; // Default to first day of year
        }

        return null;
    }

    /**
     * Extract DOI from identifier string
     */
    protected function extractDoi(string $identifier): ?string
    {
        // Match DOI pattern: 10.XXXX/...
        if (preg_match('/10\.\d{4,}\/[^\s]+/', $identifier, $matches)) {
            return $matches[0];
        }

        return null;
    }

    /**
     * Parse volume, issue, and pages from source string
     */
    protected function parseSourceInfo(string $source, array &$data): void
    {
        // Pattern: "Vol. 5 No. 1" or "Vol. 5, No. 1"
        if (preg_match('/Vol\.\s*(\d+).*?No\.\s*(\d+)/i', $source, $matches)) {
            $data['volume'] = $matches[1];
            $data['issue'] = $matches[2];
        }

        // Pattern: "5(1)" or "5 (1)" — only treat the parenthesised number as an issue if it
        // is NOT a 4-digit year (e.g. "Vol. 1 (2026)" must NOT yield issue = 2026)
        if (preg_match('/(\d+)\s*\((\d+)\)/', $source, $matches)) {
            if (! $data['volume']) {
                $data['volume'] = $matches[1];
            }
            if (! $data['issue'] && (int) $matches[2] < 1000) {
                $data['issue'] = $matches[2];
            }
        }

        // Pattern: pages "10-20" or "pp. 10-20"
        if (preg_match('/(?:pp?\.\s*)?(\d+)\s*[-–]\s*(\d+)/i', $source, $matches)) {
            $data['pages'] = "{$matches[1]}-{$matches[2]}";
        }
    }

    /**
     * Build OAI-PMH ListRecords URL
     */
    protected function buildListRecordsUrl(string $baseUrl, ?string $fromDate = null): string
    {
        $params = [
            'verb' => 'ListRecords',
            'metadataPrefix' => 'oai_dc', // Dublin Core metadata format
        ];

        if ($fromDate) {
            $params['from'] = $fromDate;
        }

        // Remove trailing slash from base URL
        $baseUrl = rtrim($baseUrl, '/');

        return $baseUrl.'?'.http_build_query($params);
    }

    /**
     * Build the URL to fetch the next page of records using a resumption token.
     * Per OAI-PMH spec, resumption token requests must NOT include metadataPrefix.
     */
    protected function buildResumptionUrl(string $baseUrl, string $resumptionToken): string
    {
        $baseUrl = rtrim($baseUrl, '/');

        return $baseUrl.'?'.http_build_query([
            'verb' => 'ListRecords',
            'resumptionToken' => $resumptionToken,
        ]);
    }
}
