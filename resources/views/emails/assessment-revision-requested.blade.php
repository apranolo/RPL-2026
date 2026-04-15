<x-mail::message>
# Assessment Revision Requested

Dear {{ $assessment->user->name }},

The administrator has reviewed your self-assessment for **{{ $assessment->journal->title }}** and is requesting some revisions.

**Journal:** {{ $assessment->journal->title }}  
**ISSN:** {{ $assessment->journal->issn }}  
**Submitted:** {{ $assessment->submitted_at?->format('d M Y H:i') }}  
**Reviewed:** {{ $assessment->reviewed_at?->format('d M Y H:i') }}

## Administrator's Feedback

{{ $adminNotes }}

## What's Next?

Your assessment has been returned to **draft** status. Please review the administrator's feedback, make the necessary changes, and resubmit your assessment.

<x-mail::button :url="$url">
Edit Assessment
</x-mail::button>

If you have any questions about the requested revisions, please contact your university administrator.

Best regards,<br>
{{ config('app.name') }}
</x-mail::message>
