import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { JournalAssessment } from '@/types';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';

interface ReviewerFeedbackProps {
    assessment: JournalAssessment;
}

/**
 * ReviewerFeedback Component
 *
 * @description Display admin review feedback for assessments
 * @features Shows approval or revision notes, review timestamps
 */
export default function ReviewerFeedback({ assessment }: ReviewerFeedbackProps) {
    // Only show if assessment has been reviewed
    if (!assessment.reviewed_at || !assessment.admin_notes) {
        return null;
    }

    const isApproved = assessment.status === 'reviewed';
    const isRevisionRequested = assessment.status === 'draft' && assessment.reviewed_at;

    const cardClassName = isApproved ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50';

    const titleClassName = isApproved ? 'text-green-900' : 'text-yellow-900';
    const alertVariant = isApproved ? 'default' : 'destructive';

    return (
        <Card className={cardClassName}>
            <CardHeader>
                <div className="flex items-center gap-2">
                    {isApproved ? <CheckCircle className="h-5 w-5 text-green-600" /> : <AlertCircle className="h-5 w-5 text-yellow-600" />}
                    <CardTitle className={titleClassName}>{isApproved ? 'Assessment Approved' : 'Revision Requested'}</CardTitle>
                </div>
                <CardDescription>
                    <div className="flex items-center gap-2 pt-1">
                        <span>Reviewed by: {assessment.reviewer?.name || 'Admin'}</span>
                        <span>•</span>
                        <span>{new Date(assessment.reviewed_at).toLocaleString('id-ID')}</span>
                    </div>
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Alert variant={alertVariant} className="bg-white">
                    <Info className="h-4 w-4" />
                    <AlertTitle className="mb-2 font-semibold">Administrator's Feedback</AlertTitle>
                    <AlertDescription className="text-sm leading-relaxed whitespace-pre-wrap">{assessment.admin_notes}</AlertDescription>
                </Alert>

                {isRevisionRequested && (
                    <div className="mt-4 rounded-md bg-white p-4">
                        <h4 className="mb-2 font-semibold text-yellow-900">What's Next?</h4>
                        <ul className="ml-5 list-disc space-y-1 text-sm text-yellow-900">
                            <li>Review the administrator's feedback above</li>
                            <li>Make the necessary changes to your assessment</li>
                            <li>Update responses and issues as needed</li>
                            <li>Resubmit when ready for another review</li>
                        </ul>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
