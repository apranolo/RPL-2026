<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;

class DebugOAIPMH extends Command
{
    protected $signature = 'oai:debug {url}';

    protected $description = 'Debug OAI-PMH endpoint by fetching and displaying raw XML';

    public function handle()
    {
        $baseUrl = $this->argument('url');
        $url = $baseUrl.'?verb=ListRecords&metadataPrefix=oai_dc';

        $this->info("Fetching: $url");
        $this->newLine();

        $response = Http::timeout(30)->get($url);

        if (! $response->successful()) {
            $this->error("Failed: HTTP {$response->status()}");

            return 1;
        }

        // Save to file for inspection
        $filename = 'storage/logs/oai_debug_'.date('YmdHis').'.xml';
        file_put_contents($filename, $response->body());

        $this->info("✓ Response saved to: $filename");
        $this->newLine();

        // Parse XML
        libxml_use_internal_errors(true);
        $xml = simplexml_load_string($response->body());

        if ($xml === false) {
            $errors = libxml_get_errors();
            $this->error('XML Parsing failed:');
            foreach ($errors as $error) {
                $this->error("  - {$error->message}");
            }

            return 1;
        }

        // Register namespaces
        $xml->registerXPathNamespace('oai', 'http://www.openarchives.org/OAI/2.0/');
        $xml->registerXPathNamespace('dc', 'http://purl.org/dc/elements/1.1/');
        $xml->registerXPathNamespace('oai_dc', 'http://www.openarchives.org/OAI/2.0/oai_dc/');

        // Check different XPath variations
        $this->info('Testing XPath patterns:');
        $this->newLine();

        $patterns = [
            '//oai:record' => 'Records',
            '//oai:record/oai:metadata' => 'Metadata blocks',
            '//oai:record/oai:metadata/oai_dc:dc' => 'Dublin Core (with oai_dc namespace)',
            '//oai:record/oai:metadata/oai_dc:dc/*' => 'DC elements (with oai_dc namespace)',
            '//oai:record/oai:metadata/*' => 'Metadata children (any)',
            '//oai:record/oai:metadata/*/*' => 'Metadata grandchildren',
        ];

        foreach ($patterns as $pattern => $label) {
            $results = $xml->xpath($pattern);
            $count = is_array($results) ? count($results) : 0;

            if ($count > 0) {
                $this->info("✓ $label: $count found");
                $this->line("  Pattern: $pattern");

                // Show first result structure
                if ($count > 0 && isset($results[0])) {
                    $this->line('  Sample:');
                    $sample = $results[0]->asXML();
                    $lines = explode("\n", $sample);
                    foreach (array_slice($lines, 0, 10) as $line) {
                        $this->line('    '.$line);
                    }
                    if (count($lines) > 10) {
                        $this->line('    ... (truncated)');
                    }
                }
            } else {
                $this->warn("✗ $label: not found");
            }
            $this->newLine();
        }

        return 0;
    }
}
