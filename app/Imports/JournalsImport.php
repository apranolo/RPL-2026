<?php

namespace App\Imports;

use App\Models\Journal;
use Illuminate\Support\Facades\Validator;

/**
 * CSV Import for Journals
 *
 * Simplified CSV format per Meeting Notes 11 Feb 2026:
 * - Generic fields only (title, publisher, issn, e_issn, url, oai_url, etc.)
 * - No scientific_field_name (assigned later by user)
 * - No indexations in CSV (managed via UI)
 * - sinta_rank mapped from integer to string enum
 * - Auto-assigns to LPPM user who performs import
 * - Sets approval_status to 'pending'
 */
class JournalsImport
{
    protected int $universityId;

    protected int $userId;

    protected array $errors = [];

    protected int $successCount = 0;

    protected int $errorCount = 0;

    public function __construct(int $universityId, int $userId)
    {
        $this->universityId = $universityId;
        $this->userId = $userId;
    }

    /**
     * Process CSV file and import journals
     */
    public function import(string $filePath): void
    {
        $file = fopen($filePath, 'r');

        if (! $file) {
            throw new \Exception('Unable to open CSV file');
        }

        // Read header row
        $headers = fgetcsv($file);

        if (! $headers) {
            fclose($file);
            throw new \Exception('CSV file is empty or invalid');
        }

        // Normalize headers (trim and lowercase, strip BOM)
        $headers = array_map(function ($h) {
            $h = trim($h);
            // Remove BOM if present
            $h = preg_replace('/^\xEF\xBB\xBF/', '', $h);

            return strtolower($h);
        }, $headers);

        $rowNumber = 1; // Start from 1 (header is row 0)

        // Process each data row
        while (($data = fgetcsv($file)) !== false) {
            $rowNumber++;

            // Skip empty rows
            if (empty(array_filter($data))) {
                continue;
            }

            // Combine headers with data
            if (count($headers) !== count($data)) {
                $this->errors[] = [
                    'row' => $rowNumber,
                    'errors' => ['Jumlah kolom tidak sesuai dengan header'],
                ];
                $this->errorCount++;

                continue;
            }

            $row = array_combine($headers, $data);

            if ($row === false) {
                $this->errors[] = [
                    'row' => $rowNumber,
                    'errors' => ['Jumlah kolom tidak sesuai dengan header'],
                ];
                $this->errorCount++;

                continue;
            }

            $this->processRow($row, $rowNumber);
        }

        fclose($file);
    }

    /**
     * Process a single row from CSV
     */
    protected function processRow(array $row, int $rowNumber): void
    {
        try {
            // Validate the row data
            $validator = Validator::make($row, $this->rules(), $this->messages());

            if ($validator->fails()) {
                $this->errors[] = [
                    'row' => $rowNumber,
                    'errors' => $validator->errors()->all(),
                ];
                $this->errorCount++;

                return;
            }

            $validated = $validator->validated();

            // Check for duplicate ISSN/E-ISSN within same university
            if ($this->isDuplicateIssn($validated)) {
                $this->errors[] = [
                    'row' => $rowNumber,
                    'errors' => ['ISSN atau E-ISSN sudah terdaftar untuk universitas ini.'],
                ];
                $this->errorCount++;

                return;
            }

            // Map sinta_rank from integer to string enum
            $sintaRank = $this->mapSintaRank($validated['sinta_rank'] ?? null);

            // Prepare journal data
            $journalData = [
                'title' => $validated['title'],
                'issn' => $validated['issn'] ?? null,
                'e_issn' => $validated['e_issn'],
                'publisher' => $validated['publisher'],
                'first_published_year' => $validated['publication_year'] ?? null,
                'sinta_rank' => $sintaRank,
                'url' => $validated['url'] ?? null,
                'oai_urls' => isset($validated['oai_url']) && !empty($validated['oai_url']) ? [$validated['oai_url']] : [],
                'email' => $validated['email'] ?? null,
                'phone' => $validated['phone'] ?? null,
                'university_id' => $this->universityId,
                'user_id' => $this->userId,
                'is_active' => true,
                'approval_status' => 'pending',
            ];

            // Create the journal
            Journal::create($journalData);
            $this->successCount++;

        } catch (\Exception $e) {
            $this->errors[] = [
                'row' => $rowNumber,
                'errors' => ['Error: '.$e->getMessage()],
            ];
            $this->errorCount++;
        }
    }

    /**
     * Map sinta_rank from CSV integer value to string enum
     */
    protected function mapSintaRank($value): string
    {
        if (empty($value)) {
            return 'non_sinta';
        }

        $intVal = (int) $value;

        if ($intVal >= 1 && $intVal <= 6) {
            return 'sinta_'.$intVal;
        }

        return 'non_sinta';
    }

    /**
     * Validation rules for each row
     */
    protected function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'publisher' => 'required|string|max:500',
            'issn' => [
                'nullable',
                'string',
                'max:20',
                'regex:/^\d{4}-\d{4}$/',
            ],
            'e_issn' => [
                'required',
                'string',
                'max:20',
                'regex:/^\d{4}-\d{4}$/',
            ],
            'publication_year' => 'nullable|integer|min:1900|max:'.(now()->year + 1),
            'sinta_rank' => 'nullable|integer|min:1|max:6',
            'url' => 'nullable|url|max:500',
            'oai_url' => 'nullable|url|max:500',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
        ];
    }

    /**
     * Custom validation messages
     */
    protected function messages(): array
    {
        return [
            'title.required' => 'Judul jurnal wajib diisi.',
            'publisher.required' => 'Penerbit wajib diisi.',
            'e_issn.required' => 'E-ISSN wajib diisi.',
            'issn.regex' => 'Format ISSN harus: 1234-5678',
            'e_issn.regex' => 'Format E-ISSN harus: 1234-5678',
            'publication_year.integer' => 'Tahun terbit harus berupa angka.',
            'sinta_rank.integer' => 'Ranking SINTA harus berupa angka 1-6.',
            'url.url' => 'URL tidak valid.',
            'oai_url.url' => 'URL OAI-PMH tidak valid.',
            'email.email' => 'Format email tidak valid.',
        ];
    }

    /**
     * Check if ISSN or E-ISSN already exists for this university
     */
    protected function isDuplicateIssn(array $validated): bool
    {
        $query = Journal::where('university_id', $this->universityId);

        if (! empty($validated['issn'])) {
            $exists = (clone $query)->where('issn', $validated['issn'])->exists();
            if ($exists) {
                return true;
            }
        }

        if (! empty($validated['e_issn'])) {
            $exists = (clone $query)->where('e_issn', $validated['e_issn'])->exists();
            if ($exists) {
                return true;
            }
        }

        return false;
    }

    /**
     * Get import summary
     */
    public function getSummary(): array
    {
        return [
            'success_count' => $this->successCount,
            'error_count' => $this->errorCount,
            'errors' => $this->errors,
        ];
    }

    /**
     * Check if import has errors
     */
    public function hasErrors(): bool
    {
        return $this->errorCount > 0;
    }
}
