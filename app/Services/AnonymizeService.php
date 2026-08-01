<?php

namespace App\Services;

/**
 * Service for anonymizing submission text/metadata for Double-Blind Review.
 *
 * SCOPE NOTE: The `Submission` model (Kelas G / Modul 4) is not yet merged
 * into `development`, so this service cannot yet be wired into a real
 * submission-viewing flow. It currently exposes a self-contained
 * text-anonymization utility (redacting known author names/emails from a
 * string) that reviewer-facing controllers can call once `Submission` land.
 * TODO: once Submission exists, add anonymizeSubmission(Submission $submission)
 * that reads its authors/affiliations and anonymizes the manuscript file
 * and metadata shown to reviewers.
 */
class AnonymizeService
{
    private const REDACTED_PLACEHOLDER = '[REDACTED]';

    /**
     * Redact a list of known identifying strings (author names, emails,
     * affiliations, etc.) from a block of text.
     *
     * This is a simple case-insensitive literal replacement, not NLP-based
     * detection — it only removes strings explicitly passed in via
     * $identifiers. Callers are responsible for supplying the correct list
     * (e.g. from the submission's author records).
     *
     * @param  string  $text  The text to anonymize (e.g. manuscript content).
     * @param  string[]  $identifiers  Author names, emails, or affiliations to redact.
     * @return string The anonymized text.
     */
    public function anonymize(string $text, array $identifiers = []): string
    {
        $identifiers = array_filter(array_map('trim', $identifiers));

        if ($identifiers === []) {
            return $text;
        }

        // Sort longest-first so "John Smith" is redacted before a lone "John"
        // would otherwise partially match and leave "Smith" behind.
        usort($identifiers, fn (string $a, string $b) => mb_strlen($b) <=> mb_strlen($a));

        foreach ($identifiers as $identifier) {
            $pattern = '/'.preg_quote($identifier, '/').'/iu';
            $text = preg_replace($pattern, self::REDACTED_PLACEHOLDER, $text) ?? $text;
        }

        return $text;
    }

    /**
     * Redact email addresses from a block of text, regardless of whether
     * they were explicitly passed as identifiers.
     */
    public function redactEmails(string $text): string
    {
        return preg_replace('/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/', self::REDACTED_PLACEHOLDER, $text) ?? $text;
    }
}
