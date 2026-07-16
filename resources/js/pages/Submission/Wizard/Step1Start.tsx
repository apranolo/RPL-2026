/**
 * @file Step1Start.tsx
 * @description Komponen halaman langkah pertama submission wizard: Pemilihan Jurnal & Persetujuan Lisensi.
 * @author Haryansyah Dwi Nugroho <@Haryansyah15>
 */

import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import type { BreadcrumbItem } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
// import WizardProgressBar from '@/components/WizardProgressBar';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Journal {
    id: number;
    title: string;
}

interface Props {
    journals: Journal[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Submission', href: '/submission/step-1' },
    { title: 'Step 1 - Start', href: '/submission/step-1' },
];

const wizardSteps = [
    { label: 'Start', description: 'Pilih Jurnal', complete: false },
    { label: 'Upload', description: 'Upload File', complete: false },
    { label: 'Metadata', description: 'Informasi Artikel', complete: false },
    { label: 'Contributor', description: 'Penulis', complete: false },
    { label: 'Confirm', description: 'Final Submit', complete: false },
];

export default function Step1Start({ journals }: Props) {
    const { data, setData, post, processing, errors } = useForm<{
    journal_id: string;
    agreement1: boolean;
    agreement2: boolean;
    agreement3: boolean;
    agreement4: boolean;
}>({
    journal_id: '',
    agreement1: false,
    agreement2: false,
    agreement3: false,
    agreement4: false,
});

    const isAgreedAll = data.agreement1 && data.agreement2 && data.agreement3 && data.agreement4;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('submission.step1.store'));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Submission - Step 1" />

            <div className="mx-auto max-w-3xl p-6">
                {/* <WizardProgressBar steps={wizardSteps} currentStep={0} className="mb-8" /> */}
                
                <Card>
                    <CardHeader>
                        <CardTitle>Wizard Submission - Step 1</CardTitle>
                        <CardDescription>
                            Pilih jurnal tujuan dan setujui syarat serta lisensi sebelum melanjutkan proses submission.
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Pilih Jurnal */}
                            <div className="space-y-2">
                                <Label htmlFor="journal">Pilih Jurnal</Label>
                                <Select
                                    value={data.journal_id}
                                    onValueChange={(value) => setData('journal_id', value)}
                                >
                                    <SelectTrigger id="journal">
                                        <SelectValue placeholder="Pilih Jurnal" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {journals.map((journal) => (
                                            <SelectItem key={journal.id} value={journal.id.toString()}>
                                                {journal.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.journal_id && <p className="text-sm text-red-500">{errors.journal_id}</p>}
                            </div>

                            {/* 4 Poin Komitmen Lisensi */}
                            <div className="space-y-4 border-t pt-4">
                                <Label className="text-base font-semibold">Komitmen Submission</Label>
                                
                                <div className="flex items-start space-x-3">
                                    <Checkbox
                                        id="agreement1"
                                        checked={data.agreement1}
                                        onCheckedChange={(checked) => setData('agreement1', checked === true)}
                                    />
                                    <Label htmlFor="agreement1" className="text-sm font-normal leading-snug">
                                        Naskah belum pernah diterbitkan sebelumnya atau sedang dalam pertimbangan jurnal lain.
                                    </Label>
                                </div>

                                <div className="flex items-start space-x-3">
                                    <Checkbox
                                        id="agreement2"
                                        checked={data.agreement2}
                                        onCheckedChange={(checked) => setData('agreement2', checked === true)}
                                    />
                                    <Label htmlFor="agreement2" className="text-sm font-normal leading-snug">
                                        File naskah dalam format dokumen OpenOffice, Microsoft Word, atau PDF.
                                    </Label>
                                </div>

                                <div className="flex items-start space-x-3">
                                    <Checkbox
                                        id="agreement3"
                                        checked={data.agreement3}
                                        onCheckedChange={(checked) => setData('agreement3', checked === true)}
                                    />
                                    <Label htmlFor="agreement3" className="text-sm font-normal leading-snug">
                                        Teks mematuhi persyaratan gaya selingkung dan bibliografi yang ditentukan dalam Panduan Penulis.
                                    </Label>
                                </div>

                                <div className="flex items-start space-x-3">
                                    <Checkbox
                                        id="agreement4"
                                        checked={data.agreement4}
                                        onCheckedChange={(checked) => setData('agreement4', checked === true)}
                                    />
                                    <Label htmlFor="agreement4" className="text-sm font-normal leading-snug">
                                        Naskah ini adalah karya orisinal saya dan bebas dari unsur plagiarisme.
                                    </Label>
                                </div>
                            </div>

                            {/* Button */}
                            <div className="flex justify-end border-t pt-4">
                                <Button type="submit" disabled={processing || !isAgreedAll}>
                                    Lanjut Step 2
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}