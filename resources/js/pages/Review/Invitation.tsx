import type { FormEvent } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface InvitationProps {
    assignment: {
        id: number;
        journal_title?: string;
        article_title?: string;
        editor_name?: string;
        deadline?: string;
        status?: string;
    };
}

export default function Invitation({ assignment }: InvitationProps) {
    const { data, setData, post, processing, errors } = useForm({ reason: '' });

    const accept = () => {
        post(route('review.assignment.accept', assignment.id), {
            preserveScroll: true,
        });
    };

    const decline = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        post(route('review.assignment.decline', assignment.id), {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="Review Invitation" />

            <div className="mx-auto max-w-3xl px-4 py-10">
                <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                    <div className="space-y-3">
                        <h1 className="text-3xl font-semibold text-slate-900">Review Invitation</h1>
                        <p className="text-sm text-slate-600">
                            You have been invited to review a submission. Choose whether to accept or decline this invitation.
                        </p>
                    </div>

                    <div className="mt-8 grid gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-700">
                        <div>
                            <span className="font-medium text-slate-900">Assignment ID:</span>{' '}
                            {assignment.id}
                        </div>
                        {assignment.journal_title && (
                            <div>
                                <span className="font-medium text-slate-900">Journal Title:</span>{' '}
                                {assignment.journal_title}
                            </div>
                        )}
                        {assignment.article_title && (
                            <div>
                                <span className="font-medium text-slate-900">Article Title:</span>{' '}
                                {assignment.article_title}
                            </div>
                        )}
                        {assignment.editor_name && (
                            <div>
                                <span className="font-medium text-slate-900">Editor:</span>{' '}
                                {assignment.editor_name}
                            </div>
                        )}
                        {assignment.deadline && (
                            <div>
                                <span className="font-medium text-slate-900">Deadline:</span>{' '}
                                {assignment.deadline}
                            </div>
                        )}
                        {assignment.status && (
                            <div>
                                <span className="font-medium text-slate-900">Status:</span>{' '}
                                {assignment.status}
                            </div>
                        )}
                    </div>

                    <form onSubmit={decline} className="mt-8 space-y-6">
                        <div>
                            <label htmlFor="reason" className="block text-sm font-medium text-slate-900">
                                Alasan penolakan
                            </label>
                            <Textarea
                                id="reason"
                                value={data.reason}
                                onChange={(event) => setData('reason', event.target.value)}
                                placeholder="Berikan alasan singkat mengapa Anda menolak undangan review"
                                className="mt-2 min-h-[120px]"
                            />
                            {errors.reason && (
                                <p className="mt-2 text-sm text-destructive">{errors.reason}</p>
                            )}
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row">
                            <Button
                                type="button"
                                className="w-full"
                                onClick={accept}
                                disabled={processing}
                            >
                                {processing ? 'Processing...' : 'Accept'}
                            </Button>

                            <Button
                                type="submit"
                                variant="destructive"
                                className="w-full"
                                disabled={processing}
                            >
                                {processing ? 'Processing...' : 'Decline'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
