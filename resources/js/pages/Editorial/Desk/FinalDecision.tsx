import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
    assessmentId: number;
}

const breadcrumbs = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Editorial Desk',
        href: '/editorial',
    },
    {
        title: 'Final Decision',
        href: '#',
    },
];

/**
 * FinalDecision Page
 *
 * Halaman untuk memberikan keputusan akhir editorial
 * terhadap naskah yang telah melalui proses review.
 */
export default function FinalDecision({ assessmentId }: Props) {
    const {
        data,
        setData,
        post,
        processing,
    } = useForm({
        decision: 'accept' as 'accept' | 'reject',
        notes: '',
    });

    const submit = () => {
        post(route('editorial.final-decision', assessmentId));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Final Editorial Decision" />

            <Card>
                <CardHeader>
                    <CardTitle>Final Editorial Decision</CardTitle>
                </CardHeader>

                <CardContent className="space-y-6">
                    <div>
                        <label className="mb-2 block font-medium">
                            Decision
                        </label>

                        <select
                            className="w-full rounded border p-2"
                            value={data.decision}
                            onChange={(e) =>
                                setData(
                                    'decision',
                                    e.target.value as 'accept' | 'reject',
                                )
                            }
                        >
                            <option value="accept">Accept</option>
                            <option value="reject">Reject</option>
                        </select>
                    </div>

                    <div>
                        <label className="mb-2 block font-medium">
                            Editorial Note
                        </label>

                        <textarea
                            rows={6}
                            value={data.notes}
                            onChange={(e) =>
                                setData('notes', e.target.value)
                            }
                            className="w-full rounded border p-3"
                            placeholder="Minimal 50 karakter..."
                        />

                        <small className="text-gray-500">
                            {data.notes.length}/50 karakter minimum
                        </small>
                    </div>

                    <Button
                        onClick={submit}
                        disabled={processing || data.notes.length < 50}
                    >
                        {processing
                            ? 'Submitting...'
                            : 'Submit Final Decision'}
                    </Button>
                </CardContent>
            </Card>
        </AppLayout>
    );
}