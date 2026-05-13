<?php

namespace App\Console\Commands;

use App\Models\Journal;
use App\Models\ScientificField;
use App\Models\University;
use App\Models\User;
use DOMDocument;
use DOMXPath;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class ScrapeMAJUJournals extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'journals:scrape-maju {--limit=0 : Limit number of journals to scrape (0 = all)} {--dry-run : Preview data without saving}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Scrape journal data from maju.uad.ac.id for seeding';

    protected int $scrapedCount = 0;

    protected int $errorCount = 0;

    protected ?int $uadUniversityId = null;

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('Starting MAJU UAD Journal Scraper...');

        // Get UAD university ID
        $this->uadUniversityId = University::where('name', 'like', '%Ahmad Dahlan%')->first()?->id;

        if (! $this->uadUniversityId) {
            $this->error('UAD University not found in database. Please seed universities first.');

            return Command::FAILURE;
        }

        $limit = (int) $this->option('limit');
        $dryRun = $this->option('dry-run');

        if ($dryRun) {
            $this->warn('DRY RUN MODE - No data will be saved');
        }

        // Step 1: Scrape journal list from all pages
        $this->info('Fetching journal list...');
        $journalUUIDs = $this->scrapeJournalList($limit);

        $total = count($journalUUIDs);
        $this->info("Found {$total} journals to scrape");

        // Step 2: Scrape details for each journal
        $progressBar = $this->output->createProgressBar($total);
        $progressBar->start();

        foreach ($journalUUIDs as $uuid) {
            try {
                $journalData = $this->scrapeJournalDetail($uuid);

                if ($journalData && ! $dryRun) {
                    $this->saveJournal($journalData);
                    $this->scrapedCount++;
                } elseif ($journalData && $dryRun) {
                    $this->scrapedCount++;
                }

                // Rate limiting - be nice to the server
                usleep(500000); // 0.5 second delay

            } catch (\Exception $e) {
                $this->errorCount++;
                $this->newLine();
                $this->error("Error scraping {$uuid}: {$e->getMessage()}");
            }

            $progressBar->advance();
        }

        $progressBar->finish();
        $this->newLine(2);

        // Summary
        $this->info("✅ Successfully scraped: {$this->scrapedCount} journals");
        if ($this->errorCount > 0) {
            $this->warn("⚠️  Errors encountered: {$this->errorCount}");
        }

        if ($dryRun) {
            $this->info('DRY RUN completed - no data was saved');
        }

        return Command::SUCCESS;
    }

    /**
     * Scrape journal list from all pages
     */
    protected function scrapeJournalList(int $limit): array
    {
        $journalUUIDs = [];
        $page = 1;

        while (true) {
            try {
                $response = Http::timeout(15)
                    ->withHeaders(['User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0'])
                    ->get('https://maju.uad.ac.id/beranda', ['page' => $page]);

                if (! $response->successful()) {
                    break;
                }

                $html = $response->body();
                $dom = new DOMDocument;
                @$dom->loadHTML($html, LIBXML_NOERROR | LIBXML_NOWARNING);
                $xpath = new DOMXPath($dom);

                // Debug: Log response status and show a snippet of HTML
                $this->info("Page {$page}: Response status {$response->status()}, body length: ".strlen($html));

                // Show first 500 chars of HTML to understand structure
                if ($page === 1) {
                    $this->info('HTML snippet (first 500 chars):');
                    $this->line(substr($html, 0, 500));
                }

                // Find all "MORE DETAILS" links
                $links = $xpath->query("//a[contains(@href, '/detail?jid=')]");

                // Debug: Show how many links found
                $this->info("Page {$page}: Found {$links->length} detail links");

                if ($links->length === 0) {
                    // Debug: Try to find any links to see what's available
                    $allLinks = $xpath->query('//a[@href]');
                    $this->warn("No detail links found. Total links on page: {$allLinks->length}");

                    if ($allLinks->length > 0 && $allLinks->length < 10) {
                        $this->info('Sample hrefs:');
                        for ($i = 0; $i < min(5, $allLinks->length); $i++) {
                            $this->line('  - '.$allLinks->item($i)->getAttribute('href'));
                        }
                    }

                    break; // No more journals found
                }

                foreach ($links as $link) {
                    $href = $link->getAttribute('href');
                    if (preg_match('/jid=([a-f0-9\-]+)/', $href, $matches)) {
                        $uuid = $matches[1];
                        if (! in_array($uuid, $journalUUIDs)) {
                            $journalUUIDs[] = $uuid;

                            // Check limit
                            if ($limit > 0 && count($journalUUIDs) >= $limit) {
                                return $journalUUIDs;
                            }
                        }
                    }
                }

                $page++;
                usleep(300000); // 0.3 second delay between pages

            } catch (\Exception $e) {
                $this->warn("Error fetching page {$page}: {$e->getMessage()}");
                break;
            }
        }

        return $journalUUIDs;
    }

    /**
     * Scrape detail page for a journal
     */
    protected function scrapeJournalDetail(string $uuid): ?array
    {
        $response = Http::timeout(15)
            ->withHeaders(['User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0'])
            ->get('https://maju.uad.ac.id/detail', ['jid' => $uuid]);

        if (! $response->successful()) {
            return null;
        }

        $html = $response->body();
        $dom = new DOMDocument;
        @$dom->loadHTML($html, LIBXML_NOERROR | LIBXML_NOWARNING);
        $xpath = new DOMXPath($dom);

        $data = [
            'uuid' => $uuid,
            'title' => $this->extractTitle($xpath),
            'url' => $this->extractURL($xpath),
            'issn' => null,
            'e_issn' => null,
            'sinta_rank' => 'non_sinta',
            'publisher' => 'Universitas Ahmad Dahlan',
            'editor_in_chief' => null,
            'email' => null,
            'phone' => null,
            'cover_image_url' => $this->extractCoverImage($xpath),
            'about' => $this->extractAbout($xpath),
            'scope' => $this->extractScope($xpath),
            'indexations' => [],
            'university_id' => $this->uadUniversityId,
        ];

        // Extract ISSN
        $this->extractISSN($xpath, $data);

        // Extract accreditation (SINTA rank)
        $this->extractAccreditation($xpath, $data);

        // Extract contact info
        $this->extractContact($xpath, $data);

        // Extract indexations
        $data['indexations'] = $this->extractIndexations($xpath);

        // Map scientific field
        $data['scientific_field_id'] = $this->mapScientificField($data['title'], $data['scope'] ?? '');

        return $data;
    }

    protected function extractTitle(DOMXPath $xpath): ?string
    {
        $nodes = $xpath->query("//h3[contains(@class, 'title')] | //h3 | //h2[contains(@class, 'title')]");

        return $nodes->length > 0 ? trim($nodes->item(0)->textContent) : null;
    }

    protected function extractURL(DOMXPath $xpath): ?string
    {
        $nodes = $xpath->query("//a[contains(text(), 'Submit') or contains(@href, 'journal') or contains(@href, 'http://journal')]");
        foreach ($nodes as $node) {
            $href = $node->getAttribute('href');
            if (Str::startsWith($href, 'http') && Str::contains($href, 'journal')) {
                return $href;
            }
        }

        return null;
    }

    protected function extractCoverImage(DOMXPath $xpath): ?string
    {
        $nodes = $xpath->query("//img[contains(@src, '/covers/')]");
        if ($nodes->length > 0) {
            $src = $nodes->item(0)->getAttribute('src');
            if (! Str::startsWith($src, 'http')) {
                $src = 'https://maju.uad.ac.id'.$src;
            }

            return $src;
        }

        return null;
    }

    protected function extractAbout(DOMXPath $xpath): ?string
    {
        $nodes = $xpath->query("//*[contains(text(), 'About the journal')]/following-sibling::* | //*[contains(text(), 'About')]/following-sibling::p");

        return $nodes->length > 0 ? trim($nodes->item(0)->textContent) : null;
    }

    protected function extractScope(DOMXPath $xpath): ?string
    {
        $nodes = $xpath->query("//*[contains(text(), 'Aims and Scope')]/following-sibling::* | //*[contains(text(), 'Scope')]/following-sibling::p");

        return $nodes->length > 0 ? trim($nodes->item(0)->textContent) : null;
    }

    protected function extractISSN(DOMXPath $xpath, array &$data): void
    {
        $nodes = $xpath->query("//*[contains(text(), 'ISSN')]");
        foreach ($nodes as $node) {
            $text = $node->textContent;

            // Pattern: "ISSN 1234-5678 (Print) | 9876-5432 (Online)"
            if (preg_match('/(\d{4}-\d{3}[\dXx])\s*\(Print\)/i', $text, $matches)) {
                $data['issn'] = $matches[1];
            }
            if (preg_match('/(\d{4}-\d{3}[\dXx])\s*\(Online\)/i', $text, $matches)) {
                $data['e_issn'] = $matches[1];
            }
        }
    }

    protected function extractAccreditation(DOMXPath $xpath, array &$data): void
    {
        $nodes = $xpath->query("//*[contains(text(), 'Accreditation') or contains(text(), 'Sinta')]");
        foreach ($nodes as $node) {
            $text = $node->textContent;

            if (preg_match('/Sinta\s*(\d)/i', $text, $matches)) {
                $rank = (int) $matches[1];
                $data['sinta_rank'] = 'sinta_'.$rank;
                break;
            }
        }
    }

    protected function extractContact(DOMXPath $xpath, array &$data): void
    {
        $contactSection = $xpath->query("//*[contains(text(), 'Contact')]");

        if ($contactSection->length > 0) {
            $parent = $contactSection->item(0)->parentNode;
            $text = $parent->textContent;

            // Extract email
            if (preg_match('/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/', $text, $matches)) {
                $data['email'] = $matches[1];
            }

            // Extract editor name (usually before email)
            $lines = explode("\n", $text);
            foreach ($lines as $line) {
                $line = trim($line);
                if (! empty($line) && ! Str::contains($line, ['Contact', 'Email', 'Phone', '@', 'http'])) {
                    if (strlen($line) > 5 && strlen($line) < 100) {
                        $data['editor_in_chief'] = $line;
                        break;
                    }
                }
            }

            // Extract phone
            if (preg_match('/(\+?[\d\s\-()]{8,})/', $text, $matches)) {
                $phone = preg_replace('/[^\d+]/', '', $matches[1]);
                if (strlen($phone) >= 8) {
                    $data['phone'] = $matches[1];
                }
            }
        }
    }

    protected function extractIndexations(DOMXPath $xpath): array
    {
        $indexations = [];
        $nodes = $xpath->query("//a[contains(@href, 'scopus') or contains(@href, 'doaj') or contains(@href, 'sinta') or contains(@href, 'scholar')]");

        foreach ($nodes as $node) {
            $href = $node->getAttribute('href');
            $text = trim($node->textContent);

            if (Str::contains(strtolower($href), 'scopus')) {
                $indexations['Scopus'] = $href;
            } elseif (Str::contains(strtolower($href), 'doaj')) {
                $indexations['DOAJ'] = $href;
            } elseif (Str::contains(strtolower($href), 'sinta')) {
                $indexations['SINTA'] = $href;
            } elseif (Str::contains(strtolower($href), 'scholar')) {
                $indexations['Google Scholar'] = $href;
            } elseif (Str::contains(strtolower($href), 'webofscience') || Str::contains(strtolower($href), 'clarivate')) {
                $indexations['Web of Science'] = $href;
            }
        }

        return $indexations;
    }

    protected function mapScientificField(string $title, string $scope): ?int
    {
        $keywords = [
            'Computer Science' => ['computer', 'informatics', 'information technology', 'software', 'data', 'intelligent'],
            'Engineering' => ['engineering', 'teknik', 'elektro', 'mechanical', 'civil'],
            'Education' => ['education', 'pendidikan', 'teaching', 'learning', 'pedagogical'],
            'Medicine' => ['medical', 'medicine', 'health', 'kedokteran', 'farmasi', 'pharmacy'],
            'Economics' => ['economic', 'ekonomi', 'business', 'management', 'finance'],
            'Social Sciences' => ['social', 'society', 'psychology', 'psikologi'],
            'Language and Literature' => ['language', 'bahasa', 'literature', 'sastra', 'linguistic'],
            'Agriculture' => ['agriculture', 'pertanian', 'farming'],
            'Mathematics' => ['math', 'statistics', 'statistik'],
            'Physics' => ['physics', 'fisika'],
            'Chemistry' => ['chemistry', 'kimia'],
            'Biology' => ['biology', 'biologi', 'bioedu'],
            'Law' => ['law', 'hukum', 'legal'],
        ];

        $searchText = strtolower($title.' '.$scope);

        foreach ($keywords as $fieldName => $terms) {
            foreach ($terms as $term) {
                if (Str::contains($searchText, strtolower($term))) {
                    $field = ScientificField::where('name', 'like', "%{$fieldName}%")->first();
                    if ($field) {
                        return $field->id;
                    }
                }
            }
        }

        return null;
    }

    protected function saveJournal(array $data): void
    {
        // Get a random UAD admin kampus user for ownership
        $adminKampus = User::where('university_id', $this->uadUniversityId)
            ->where('role_id', 2) // Admin Kampus role
            ->inRandomOrder()
            ->first();

        Journal::updateOrCreate(
            ['title' => $data['title']], // Match by title
            [
                'url' => $data['url'],
                'issn' => $data['issn'],
                'e_issn' => $data['e_issn'] ?? '',
                'sinta_rank' => $data['sinta_rank'],
                'oai_pmh_url' => '',
                'publisher' => $data['publisher'],
                'editor_in_chief' => $data['editor_in_chief'],
                'email' => $data['email'],
                'phone' => $data['phone'],
                'cover_image_url' => $data['cover_image_url'],
                'about' => $data['about'],
                'scope' => $data['scope'],
                'indexations' => $data['indexations'],
                'university_id' => $data['university_id'],
                'scientific_field_id' => $data['scientific_field_id'],
                'user_id' => $adminKampus?->id,
                'is_active' => true,
                'approval_status' => 'pending',
            ]
        );
    }
}
