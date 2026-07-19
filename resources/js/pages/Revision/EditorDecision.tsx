/**
 * @route POST /user/editorial/revision/editor-decision/{id}
 * @features Proses keputusan hasil revisi dokumen dari Editor kepada Author
 * @description Halaman panel keputusan editor untuk menerima, menolak, atau meminta revisi kembali.
 */

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';

interface Props {
    articleId: number;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Keputusan Editor', href: '#' },
];

export default function EditorDecision({ articleId }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        decision: '',
        notes: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('user.editorial.revision.decide', articleId));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Keputusan Editor Atas Revisi" />
            <div className="mx-auto max-w-xl p-4 md:p-8">
                <div className="rounded-lg border border-border bg-white p-6 shadow-sm">
                    <h2 className="mb-4 text-xl font-bold text-foreground">Keputusan Editor Atas Revisi</h2>

                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="mb-2 block font-medium text-foreground">Pilih Keputusan</label>
                            <Select value={data.decision} onValueChange={(value) => setData('decision', value)}>
                                <SelectTrigger className="w-full rounded-lg">
                                    <SelectValue placeholder="-- Pilih --" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Approved">Accept (Approved)</SelectItem>
                                    <SelectItem value="Rejected">Return to Review (Rejected)</SelectItem>
                                    <SelectItem value="Awaiting_Revision">Request More Revision</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.decision && <span className="text-sm text-red-500">{errors.decision}</span>}
                        </div>

                        <div className="mb-6">
                            <label className="mb-2 block font-medium text-foreground">Catatan Editor</label>
                            <textarea
                                value={data.notes}
                                onChange={(e) => setData('notes', e.target.value)}
                                className="w-full rounded-lg border border-border p-2"
                                rows={4}
                            />
                            {errors.notes && <span className="text-sm text-red-500">{errors.notes}</span>}
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full rounded-lg bg-primary p-3 font-bold text-white disabled:opacity-50"
                        >
                            {processing ? 'Mengirim...' : 'Simpan Keputusan'}
                        </button>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
