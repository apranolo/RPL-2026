import AppLayout from '@/layouts/app-layout';
import DiscussionThread from '@/components/DiscussionThread';

export default function Discussion() {
    const discussions = [
        {
            id: 1,
            subject: 'Revision Request',
            message: 'Please revise the abstract section.',
            created_at: new Date().toISOString(),
            user: {
                id: 1,
                name: 'Editor',
            },
        },
    ];

    return (
        <AppLayout>
            <div className="p-6">
                <h1 className="mb-6 text-2xl font-bold">
                    Editorial Discussion
                </h1>

                <DiscussionThread
                    discussions={discussions}
                    loading={false}
                />
            </div>
        </AppLayout>
    );
}