import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, BookOpen } from 'lucide-react';
import React from 'react';
import { route } from 'ziggy-js';

type Output = {
    id: number;
    proposal_id: number;
    user_id: number;
    kategori: string;
    judul: string;
    file_path: string;
    status: string;
    keterangan: string;
    created_at: string;
    updated_at: string;
};

const kategoriOptions = [
    { value: 'jurnal', label: 'Jurnal' },
    { value: 'buku', label: 'Buku' },
    { value: 'hki', label: 'HKI' },
    { value: 'prosiding', label: 'Prosiding' },
    { value: 'produk', label: 'Produk' },
];

const statusOptions = [
    { value: 'draft', label: 'Draft' },
    { value: 'submitted', label: 'Submitted' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
];

export default function Edit({ outputs }: { outputs: Output }) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: route('dashboard') },
        { title: 'Research Outputs', href: route('user.outputs.index') },
    ];

    const { data, setData, put, processing, errors } = useForm({
        kategori: outputs.kategori,
        judul: outputs.judul,
        file_path: outputs.file_path,
        status: outputs.status,
        keterangan: outputs.keterangan,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Submit ke route update
        put(route('user.outputs.update', outputs.id));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Research Output" />
            <div className="py">
                <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-6">
                        <Link href={route('user.outputs.index')}>
                            <Button variant="ghost" className="mb-4 pl-0 hover:bg-transparent hover:text-blue-600 dark:hover:text-blue-400">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Research Outputs
                            </Button>
                        </Link>
                        <div className="flex items-center gap-2">
                            <BookOpen className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Edit Research Output</h1>
                        </div>
                        <p className="mt-1 ml-10 text-gray-600 dark:text-gray-400">Update the details of the research output</p>
                    </div>
                    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                <h3 className="border-b pb-2 text-lg font-semibold text-gray-900 dark:border-gray-700 dark:text-gray-100">
                                    Research Output Information
                                </h3>

                                <div>
                                    <Label htmlFor="judul">
                                        Judul <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="judul"
                                        value={data.judul}
                                        onChange={(e) => setData({ ...data, judul: e.target.value })}
                                        placeholder="Enter research output title"
                                        className="mt-1"
                                    />
                                    {errors.judul && <p className="mt-1 text-sm text-red-600">{errors.judul}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="kategori">
                                        Kategori <span className="text-red-500">*</span>
                                    </Label>
                                    <Select value={data.kategori} onValueChange={(val) => setData({ ...data, kategori: val })}>
                                        <SelectTrigger className="mt-1">
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {kategoriOptions.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                        <Label htmlFor="file_path">File Path</Label>
                                        <Input
                                            id="file_path"
                                            value={data.file_path}
                                            onChange={(e) => setData({ ...data, file_path: e.target.value })}
                                            placeholder="/path/to/research/output.pdf"
                                            className="mt-1"
                                        />
                                        {errors.file_path && <p className="mt-1 text-sm text-red-600">{errors.file_path}</p>}
                                    </div>

                                    <div>
                                        <Label htmlFor="status">
                                            Status <span className="text-red-500">*</span>
                                        </Label>
                                        <Select value={data.status} onValueChange={(val) => setData({ ...data, status: val })}>
                                            <SelectTrigger className="mt-1">
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {statusOptions.map((option) => (
                                                    <SelectItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="keterangan">Keterangan</Label>
                                    <Textarea
                                        id="keterangan"
                                        value={data.keterangan}
                                        onChange={(e) => setData({ ...data, keterangan: e.target.value })}
                                        placeholder="Additional information about the research output"
                                        className="mt-1"
                                    />
                                    {errors.keterangan && <p className="mt-1 text-sm text-red-600">{errors.keterangan}</p>}
                                </div>

                                <div className="flex flex-col-reverse items-stretch justify-end gap-4 border-t pt-4 sm:flex-row sm:items-center dark:border-gray-700">
                                    <Link href={route('user.outputs.index')}>
                                        <Button type="button" variant="outline">
                                            Cancel
                                        </Button>
                                    </Link>
                                    <Button type="submit" disabled={processing}>
                                        {processing ? 'Saving...' : 'Output'}
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
