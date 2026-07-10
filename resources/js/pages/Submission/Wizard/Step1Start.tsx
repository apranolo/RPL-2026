import AppLayout from '@/layouts/app-layout';

import { Head, useForm } from '@inertiajs/react';

import type { BreadcrumbItem } from '@/types';

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

import { Button } from '@/components/ui/button';

import { Checkbox } from '@/components/ui/checkbox';

import { Label } from '@/components/ui/label';

import {
    Select,
    SelectContent,
    SelectItem, 
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface Journal {
    id: number;
    title: string;
}

interface Props {
    journals: Journal[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Submission',
        href: '/submission/step-1',
    },
    {
        title: 'Step 1',
        href: '/submission/step-1',
    },
];

export default function Step1Start({ journals }: Props) {
    const { data, setData, post, processing, errors } = useForm<{
    journal_id: string;
    agreement: boolean;
}>({
    journal_id: '',
    agreement: false,
});

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        post(route('submission.step1.store'));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Submission - Step 1" />

            <div className="mx-auto max-w-3xl p-6">
                <Card>
                    <CardHeader>
                        <CardTitle>
                            Wizard Submission - Step 1
                        </CardTitle>

                        <CardDescription>
                            Pilih jurnal tujuan dan setujui syarat serta
                            lisensi sebelum melanjutkan proses submission.
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <form
                            onSubmit={handleSubmit}
                            className="space-y-6"
                        >
                            {/* Pilih Jurnal */}
                            <div className="space-y-2">
                                <Label htmlFor="journal">
                                    Pilih Jurnal
                                </Label>

                                <Select
                                    value={data.journal_id}
                                    onValueChange={(value) =>
                                        setData('journal_id', value)
                                    }
                                >
                                    <SelectTrigger id="journal">
                                        <SelectValue placeholder="Pilih Jurnal" />
                                    </SelectTrigger>

                                    <SelectContent>
                                        {journals.map((journal) => (
                                            <SelectItem
                                                key={journal.id}
                                                value={journal.id.toString()}
                                            >
                                                {journal.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                {errors.journal_id && (
                                    <p className="text-sm text-red-500">
                                        {errors.journal_id}
                                    </p>
                                )}
                            </div>

                            {/* Persetujuan */}
                            <div className="flex items-start space-x-3">
                                <Checkbox
                                    id="agreement"
                                    checked={data.agreement}
                                    onCheckedChange={(checked) =>
                                        setData(
                                            'agreement',
                                            checked === true
                                        )
                                    }
                                />

                                <div className="space-y-1">
                                    <Label htmlFor="agreement">
                                        Saya menyetujui syarat,
                                        ketentuan, dan lisensi
                                        submission jurnal.
                                    </Label>

                                    {errors.agreement && (
                                        <p className="text-sm text-red-500">
                                            {errors.agreement}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Button */}
                            <div className="flex justify-end">
                                <Button
                                    type="submit"
                                    disabled={processing}
                                >
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