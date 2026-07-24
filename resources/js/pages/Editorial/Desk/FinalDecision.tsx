import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Props {
    submissionId: number;
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
export default function FinalDecision({ submissionId }: Props) {
    const { data, setData, post, processing } = useForm({
        decision: 'accept' as 'accept' | 'reject' | 'minor_revision' | 'major_revision',
        notes: '',
    });

    const submit = () => {
        post(route('editorial.final-decision', submissionId));
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
                        <Label className="mb-2 block">Decision</Label>

                        <Select
                            value={data.decision}
                            onValueChange={(value) => setData('decision', value as 'accept' | 'minor_revision' | 'major_revision' | 'reject')}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select final decision" />
                            </SelectTrigger>

                            <SelectContent>
                                <SelectItem value="accept">Accept</SelectItem>

                                <SelectItem value="minor_revision">Minor Revision</SelectItem>

                                <SelectItem value="major_revision">Major Revision</SelectItem>

                                <SelectItem value="reject">Reject</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label className="mb-2 block">Editorial Note</Label>

                        <Textarea
                            rows={6}
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                            placeholder="Masukkan catatan editorial (minimal 50 karakter jika memilih Reject)"
                        />

                        <small className="text-gray-500">
                            {data.decision === 'reject' ? `${data.notes.length}/50 karakter minimum` : `${data.notes.length} karakter`}
                        </small>
                    </div>

                    <Button onClick={submit} disabled={processing || (data.decision === 'reject' && data.notes.length < 50)}>
                        {processing ? 'Submitting...' : 'Submit Final Decision'}
                    </Button>
                </CardContent>
            </Card>
        </AppLayout>
    );
}
