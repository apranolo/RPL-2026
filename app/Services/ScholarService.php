<?php

namespace App\Services;

class ScholarService
{
    /**
     * Dummy author dataset.
     *
     * This is a placeholder implementation. In a real application, this data
     * would come from the Google Scholar API / scraping or the local database.
     *
     * @return array<int, array<string, mixed>>
     */
    private function authors(): array
    {
        return [
            [
                'id' => 1,
                'name' => 'Dr. John Doe',
                'affiliation' => 'Universitas Ahmad Dahlan, Indonesia',
                'total_citations' => 1234,
                'h_index' => 17,
                'i10_index' => 25,
                'citations_per_year' => [
                    '2020' => 100,
                    '2021' => 150,
                    '2022' => 200,
                    '2023' => 250,
                ],
                'publications' => [
                    ['title' => 'Research on AI in Education', 'year' => 2020, 'citations' => 50],
                    ['title' => 'Advancements in Machine Learning', 'year' => 2021, 'citations' => 75],
                    ['title' => 'Data Science Applications', 'year' => 2022, 'citations' => 100],
                ],
            ],
            [
                'id' => 2,
                'name' => 'Prof. Siti Aminah',
                'affiliation' => 'Institut Teknologi Bandung, Indonesia',
                'total_citations' => 4820,
                'h_index' => 34,
                'i10_index' => 61,
                'citations_per_year' => [
                    '2020' => 380,
                    '2021' => 420,
                    '2022' => 510,
                    '2023' => 640,
                ],
                'publications' => [
                    ['title' => 'Deep Learning for Remote Sensing', 'year' => 2019, 'citations' => 320],
                    ['title' => 'Graph Neural Networks in Practice', 'year' => 2021, 'citations' => 210],
                    ['title' => 'Federated Learning at Scale', 'year' => 2023, 'citations' => 95],
                ],
            ],
            [
                'id' => 3,
                'name' => 'Dr. Budi Santoso',
                'affiliation' => 'Universitas Gadjah Mada, Indonesia',
                'total_citations' => 876,
                'h_index' => 12,
                'i10_index' => 14,
                'citations_per_year' => [
                    '2020' => 60,
                    '2021' => 90,
                    '2022' => 130,
                    '2023' => 180,
                ],
                'publications' => [
                    ['title' => 'IoT Architectures for Smart Cities', 'year' => 2020, 'citations' => 70],
                    ['title' => 'Edge Computing Survey', 'year' => 2022, 'citations' => 45],
                ],
            ],
            [
                'id' => 4,
                'name' => 'Prof. Maria Hartono',
                'affiliation' => 'Universitas Indonesia, Indonesia',
                'total_citations' => 9510,
                'h_index' => 48,
                'i10_index' => 102,
                'citations_per_year' => [
                    '2020' => 720,
                    '2021' => 810,
                    '2022' => 980,
                    '2023' => 1150,
                ],
                'publications' => [
                    ['title' => 'Bioinformatics Pipelines for Genomics', 'year' => 2018, 'citations' => 540],
                    ['title' => 'Statistical Methods in Epidemiology', 'year' => 2020, 'citations' => 410],
                    ['title' => 'Public Health Data Modeling', 'year' => 2023, 'citations' => 130],
                ],
            ],
        ];
    }

    /**
     * Get the list of authors (summary fields for the index table).
     *
     * @return array<int, array<string, mixed>>
     */
    public function all(): array
    {
        return array_map(fn (array $author) => [
            'id' => $author['id'],
            'name' => $author['name'],
            'affiliation' => $author['affiliation'],
            'total_citations' => $author['total_citations'],
            'h_index' => $author['h_index'],
        ], $this->authors());
    }

    /**
     * Fetch a single author's full scholar profile by id.
     *
     * @return array<string, mixed>|null
     */
    public function fetch(int $id): ?array
    {
        foreach ($this->authors() as $author) {
            if ($author['id'] === $id) {
                return $author;
            }
        }

        return null;
    }
}
