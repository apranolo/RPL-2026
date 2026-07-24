/**
 * Halaman thread diskusi editorial per submission.
 *
 * Merender daftar thread diskusi (SubmissionDiscussion) beserta pesan-pesan
 * di dalamnya (DiscussionMessage) untuk satu submission tertentu. Menjadi
 * entry point Inertia untuk `EditorialDiscussionController@index`.
 *
 * @module resources/js/pages/Editorial/Desk/Discussion
 */

import DiscussionThread, { DiscussionThreadData } from '@/components/DiscussionThread';
import AppLayout from '@/layouts/app-layout';

interface DiscussionPageProps {
    submissionId: number;
    discussions: DiscussionThreadData[];
}

export default function Discussion({ submissionId, discussions }: DiscussionPageProps) {
    return (
        <AppLayout>
            <div className="p-6">
                <h1 className="mb-6 text-2xl font-bold">Editorial Discussion</h1>

                {/* Teruskan submissionId dan data discussions asli dari backend */}
                <DiscussionThread submissionId={submissionId} discussions={discussions} loading={false} />
            </div>
        </AppLayout>
    );
}
