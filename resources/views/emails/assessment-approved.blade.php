<x-mail::message>
# Assessment Approved

Dear {{ $assessment->user->name }},

Good news! Your self-assessment for **{{ $assessment->journal->title }}** has been reviewed and approved by the administrator.

**Journal:** {{ $assessment->journal->title }}  
**ISSN:** {{ $assessment->journal->issn }}  
**Submitted:** {{ $assessment->submitted_at?->format('d M Y H:i') }}  
**Reviewed:** {{ $assessment->reviewed_at?->format('d M Y H:i') }}

@if($adminNotes)
## Administrator's Notes

{{ $adminNotes }}
@endif

You can now view the complete assessment report and download the certificate if applicable.

<x-mail::button :url="$url">
View Assessment
</x-mail::button>

Thank you for completing your journal assessment.

Best regards,<br>
{{ config('app.name') }}
</x-mail::message>
