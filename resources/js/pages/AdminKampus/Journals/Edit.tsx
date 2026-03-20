/**
 * JournalsEdit Component for Admin Kampus
 *
 * @description
 * The editing interface for existing journals. Pre-populates all form fields
 * with current journal data and allows Admin Kampus to update information.
 *
 * @route PUT /admin-kampus/journals/{id}
 */
import { JournalCoverUpload } from '@/components/JournalCoverUpload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { FormEventHandler } from 'react';

interface Journal {
    id: number;
    title: string;
    issn: string;
    e_issn: string;
    url: string;
    scientific_field_id: number;
    sinta_rank: string;
    frequency: string;
    publisher: string;
    first_published_year: number | null;
    // Accreditation
    accreditation_start_year?: number | null;
    accreditation_end_year?: number | null;
    accreditation_sk_number?: string | null;
    accreditation_sk_date?: string | null;
    // Contact & Additional Info
    editor_in_chief?: string | null;
    email?: string | null;
    phone?: string | null;
    oai_pmh_url?: string | null;
    about?: string | null;
    scope?: string | null;
    // Cover image
    cover_image?: string | null;
    cover_image_url?: string | null;
    // Indexations
    indexations?: Record<string, { url: string }> | null;
}

interface Props {
    journal: Journal;
    scientificFields: Array<{
        id: number;
        name: string;
    }>;
    sintaRankOptions: Record<string, string>;
    indexationOptions: Array<{
        value: string;
        label: string;
    }>;
}

export default function JournalsEdit({ journal, scientificFields, sintaRankOptions, indexationOptions }: Props) {
    const normalizeDateInput = (value?: string | null) => {
        if (!value) return '';
        const direct = value.match(/^(\d{4}-\d{2}-\d{2})$/);
        if (direct) return direct[1];

        const iso = value.match(/^(\d{4}-\d{2}-\d{2})T/);
        if (iso) return iso[1];

        const dmy = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
        if (dmy) return `${dmy[3]}-${dmy[2]}-${dmy[1]}`;

        return '';
    };

    // Transform existing indexations from object to array format
    const existingIndexations = journal.indexations
        ? Object.entries(journal.indexations).map(([platform, data]) => ({
              platform,
              url: data.url || '',
          }))
        : [];

    const { data, setData, post, processing, errors } = useForm({
        _method: 'put' as const,
        title: journal.title || '',
        issn: journal.issn || '',
        e_issn: journal.e_issn || '',
        url: journal.url || '',
        scientific_field_id: journal.scientific_field_id ? journal.scientific_field_id.toString() : '',
        sinta_rank: journal.sinta_rank || 'non_sinta',
        frequency: journal.frequency || '',
        publisher: journal.publisher || '',
        first_published_year: journal.first_published_year || '',
        // Accreditation
        accreditation_start_year: journal.accreditation_start_year?.toString() || '',
        accreditation_end_year: journal.accreditation_end_year?.toString() || '',
        accreditation_sk_number: journal.accreditation_sk_number || '',
        accreditation_sk_date: normalizeDateInput(journal.accreditation_sk_date),
        // Contact & Additional Info
        editor_in_chief: journal.editor_in_chief || '',
        email: journal.email || '',
        phone: journal.phone || '',
        oai_pmh_url: journal.oai_pmh_url || '',
        about: journal.about || '',
        scope: journal.scope || '',
        // Indexations
        indexations: existingIndexations as Array<{ platform: string; url: string }>,
        // Cover image (null = no new upload, keep existing)
        cover_image: null as File | null,
    });

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('admin-kampus.journals.update', journal.id), { forceFormData: true });
    };

    const currentYear = new Date().getFullYear();
    const todayLocal = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0];

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Journals', href: route('admin-kampus.journals.index') },
        { title: journal.title, href: route('admin-kampus.journals.show', journal.id) },
        { title: 'Edit', href: route('admin-kampus.journals.edit', journal.id) },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Journal" />

            <div className="py-6">
                <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-6">
                        <Link href={route('admin-kampus.journals.index')}>
                            <Button variant="ghost" className="mb-4 pl-0 hover:bg-transparent hover:text-blue-600 dark:hover:text-blue-400">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Journals Management
                            </Button>
                        </Link>
                        <div className="flex items-center gap-2">
                            <BookOpen className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Edit Journal</h1>
                        </div>
                        <p className="mt-1 ml-10 text-gray-600 dark:text-gray-400">Update the journal information</p>
                    </div>

                    {/* Form */}
                    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Basic Info */}
                            <div className="space-y-4">
                                <h3 className="border-b pb-2 text-lg font-semibold text-gray-900 dark:border-gray-700 dark:text-gray-100">
                                    Journal Information
                                </h3>

                                <div>
                                    <Label htmlFor="title">
                                        Journal Title <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="title"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        placeholder="e.g. Jurnal Ilmiah Teknik Elektro"
                                        className="mt-1"
                                        required
                                    />
                                    {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
                                </div>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                        <Label htmlFor="issn">ISSN (Print)</Label>
                                        <Input
                                            id="issn"
                                            value={data.issn}
                                            onChange={(e) => setData('issn', e.target.value)}
                                            placeholder="xxxx-xxxx"
                                            className="mt-1"
                                        />
                                        {errors.issn && <p className="mt-1 text-sm text-red-600">{errors.issn}</p>}
                                    </div>

                                    <div>
                                        <Label htmlFor="e_issn">
                                            E-ISSN (Online) <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="e_issn"
                                            value={data.e_issn}
                                            onChange={(e) => setData('e_issn', e.target.value)}
                                            placeholder="xxxx-xxxx"
                                            className="mt-1"
                                            required
                                        />
                                        {errors.e_issn && <p className="mt-1 text-sm text-red-600">{errors.e_issn}</p>}
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="url">
                                        Journal URL <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="url"
                                        type="url"
                                        value={data.url}
                                        onChange={(e) => setData('url', e.target.value)}
                                        placeholder="https://journal.example.ac.id/index.php/jite"
                                        className="mt-1"
                                        required
                                    />
                                    {errors.url && <p className="mt-1 text-sm text-red-600">{errors.url}</p>}
                                </div>
                            </div>

                            {/* Classification */}
                            <div className="space-y-4">
                                <h3 className="border-b pb-2 text-lg font-semibold text-gray-900 dark:border-gray-700 dark:text-gray-100">
                                    Classification & Metadata
                                </h3>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                        <Label>
                                            Scientific Field <span className="text-red-500">*</span>
                                        </Label>
                                        <Select value={data.scientific_field_id} onValueChange={(val) => setData('scientific_field_id', val)}>
                                            <SelectTrigger className="mt-1">
                                                <SelectValue placeholder="Select Field" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {scientificFields.map((field) => (
                                                    <SelectItem key={field.id} value={field.id.toString()}>
                                                        {field.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.scientific_field_id && <p className="mt-1 text-sm text-red-600">{errors.scientific_field_id}</p>}
                                    </div>

                                    <div>
                                        <Label>
                                            Peringkat Akreditasi <span className="text-red-500">*</span>
                                        </Label>
                                        <Select value={data.sinta_rank} onValueChange={(val) => setData('sinta_rank', val)}>
                                            <SelectTrigger className="mt-1">
                                                <SelectValue placeholder="Pilih Peringkat" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.entries(sintaRankOptions).map(([value, label]) => (
                                                    <SelectItem key={value} value={value}>
                                                        {label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.sinta_rank && <p className="mt-1 text-sm text-red-600">{errors.sinta_rank}</p>}
                                    </div>
                                </div>

                                {data.sinta_rank && data.sinta_rank !== 'non_sinta' && (
                                    <div className="rounded-md border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950">
                                        <h4 className="mb-3 text-sm font-semibold text-blue-800 dark:text-blue-200">Detail Akreditasi</h4>
                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                            <div>
                                                <Label htmlFor="accreditation_start_year">Tahun Mulai Akreditasi</Label>
                                                <Input
                                                    id="accreditation_start_year"
                                                    type="number"
                                                    min="1900"
                                                    max={currentYear + 5}
                                                    value={data.accreditation_start_year}
                                                    onChange={(e) => setData('accreditation_start_year', e.target.value)}
                                                    placeholder="e.g. 2024"
                                                    className="mt-1"
                                                />
                                                {errors.accreditation_start_year && (
                                                    <p className="mt-1 text-sm text-red-600">{errors.accreditation_start_year}</p>
                                                )}
                                            </div>
                                            <div>
                                                <Label htmlFor="accreditation_end_year">Tahun Berakhir Akreditasi</Label>
                                                <Input
                                                    id="accreditation_end_year"
                                                    type="number"
                                                    min="1900"
                                                    max={currentYear + 10}
                                                    value={data.accreditation_end_year}
                                                    onChange={(e) => setData('accreditation_end_year', e.target.value)}
                                                    placeholder="e.g. 2029"
                                                    className="mt-1"
                                                />
                                                {errors.accreditation_end_year && (
                                                    <p className="mt-1 text-sm text-red-600">{errors.accreditation_end_year}</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                                            <div>
                                                <Label htmlFor="accreditation_sk_number">Nomor SK</Label>
                                                <Input
                                                    id="accreditation_sk_number"
                                                    value={data.accreditation_sk_number}
                                                    onChange={(e) => setData('accreditation_sk_number', e.target.value)}
                                                    placeholder="e.g. 105/E/KPT/2024"
                                                    className="mt-1"
                                                />
                                                {errors.accreditation_sk_number && (
                                                    <p className="mt-1 text-sm text-red-600">{errors.accreditation_sk_number}</p>
                                                )}
                                            </div>
                                            <div>
                                                <Label htmlFor="accreditation_sk_date">Tanggal SK</Label>
                                                <Input
                                                    id="accreditation_sk_date"
                                                    type="date"
                                                    value={data.accreditation_sk_date}
                                                    onChange={(e) => setData('accreditation_sk_date', e.target.value)}
                                                    max={todayLocal}
                                                    className="mt-1"
                                                />
                                                {errors.accreditation_sk_date && (
                                                    <p className="mt-1 text-sm text-red-600">{errors.accreditation_sk_date}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                        <Label htmlFor="frequency">
                                            Publication Frequency <span className="text-red-500">*</span>
                                        </Label>
                                        <Select value={data.frequency} onValueChange={(val) => setData('frequency', val)}>
                                            <SelectTrigger className="mt-1">
                                                <SelectValue placeholder="Select Frequency" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Monthly">Monthly (Bulanan)</SelectItem>
                                                <SelectItem value="Bi-Monthly">Bi-Monthly (2 Bulanan)</SelectItem>
                                                <SelectItem value="Quarterly">Quarterly (Triwulan)</SelectItem>
                                                <SelectItem value="Semi-Annual">Semi-Annual (Semesteran)</SelectItem>
                                                <SelectItem value="Annual">Annual (Tahunan)</SelectItem>
                                                <SelectItem value="Other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.frequency && <p className="mt-1 text-sm text-red-600">{errors.frequency}</p>}
                                    </div>

                                    <div>
                                        <Label htmlFor="first_published_year">First Published Year</Label>
                                        <Input
                                            id="first_published_year"
                                            type="number"
                                            min="1900"
                                            max={currentYear + 1}
                                            value={data.first_published_year}
                                            onChange={(e) => setData('first_published_year', e.target.value)}
                                            placeholder="e.g. 2010"
                                            className="mt-1"
                                        />
                                        {errors.first_published_year && <p className="mt-1 text-sm text-red-600">{errors.first_published_year}</p>}
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="publisher">Publisher</Label>
                                    <Input
                                        id="publisher"
                                        value={data.publisher}
                                        onChange={(e) => setData('publisher', e.target.value)}
                                        placeholder="e.g. Universitas Muhammadiyah Yogyakarta"
                                        className="mt-1"
                                    />
                                    {errors.publisher && <p className="mt-1 text-sm text-red-600">{errors.publisher}</p>}
                                </div>
                            </div>

                            {/* Contact & Additional Info */}
                            <div className="space-y-4">
                                <h3 className="border-b pb-2 text-lg font-semibold text-gray-900 dark:border-gray-700 dark:text-gray-100">
                                    Contact & Additional Information
                                </h3>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                        <Label htmlFor="editor_in_chief">Editor-in-Chief</Label>
                                        <Input
                                            id="editor_in_chief"
                                            value={data.editor_in_chief}
                                            onChange={(e) => setData('editor_in_chief', e.target.value)}
                                            placeholder="Dr. John Doe"
                                            className="mt-1"
                                        />
                                        {errors.editor_in_chief && <p className="mt-1 text-sm text-red-600">{errors.editor_in_chief}</p>}
                                    </div>

                                    <div>
                                        <Label htmlFor="email">Journal Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            placeholder="editor@journal.ac.id"
                                            className="mt-1"
                                        />
                                        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                                    </div>

                                    <div>
                                        <Label htmlFor="phone">Phone Number</Label>
                                        <Input
                                            id="phone"
                                            value={data.phone}
                                            onChange={(e) => setData('phone', e.target.value)}
                                            placeholder="+62 274 123456"
                                            className="mt-1"
                                        />
                                        {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                                    </div>

                                    <div>
                                        <Label htmlFor="oai_pmh_url">
                                            OAI-PMH URL <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="oai_pmh_url"
                                            type="url"
                                            value={data.oai_pmh_url}
                                            onChange={(e) => setData('oai_pmh_url', e.target.value)}
                                            placeholder="https://journal.ac.id/index.php/jite/oai"
                                            className="mt-1"
                                            required
                                        />
                                        <p className="mt-1 text-xs text-muted-foreground">Wajib diisi untuk harvesting dan indeksasi metadata</p>
                                        {errors.oai_pmh_url && <p className="mt-1 text-sm text-red-600">{errors.oai_pmh_url}</p>}
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="about">About Journal</Label>
                                    <Textarea
                                        id="about"
                                        rows={4}
                                        value={data.about}
                                        onChange={(e) => setData('about', e.target.value)}
                                        placeholder="Brief description of the journal..."
                                        className="mt-1"
                                        maxLength={1000}
                                    />
                                    <p className="mt-1 text-xs text-muted-foreground">{data.about.length}/1000 characters</p>
                                    {errors.about && <p className="mt-1 text-sm text-red-600">{errors.about}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="scope">Scope & Focus</Label>
                                    <Textarea
                                        id="scope"
                                        rows={3}
                                        value={data.scope}
                                        onChange={(e) => setData('scope', e.target.value)}
                                        placeholder="Research areas covered by the journal..."
                                        className="mt-1"
                                        maxLength={1000}
                                    />
                                    <p className="mt-1 text-xs text-muted-foreground">{data.scope.length}/1000 characters</p>
                                    {errors.scope && <p className="mt-1 text-sm text-red-600">{errors.scope}</p>}
                                </div>

                                <div>
                                    <Label>Cover Image</Label>
                                    <div className="mt-1">
                                        <JournalCoverUpload
                                            currentCover={journal.cover_image ?? journal.cover_image_url}
                                            onChange={(file) => setData('cover_image', file)}
                                            error={errors.cover_image}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Indexations */}
                            <div className="space-y-4">
                                <h3 className="border-b pb-2 text-lg font-semibold text-gray-900 dark:border-gray-700 dark:text-gray-100">
                                    Indexations (Optional)
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Select databases where this journal is indexed</p>

                                <div className="space-y-3">
                                    {indexationOptions.map((option) => {
                                        const isSelected = data.indexations.some((i) => i.platform === option.value);
                                        const selectedItem = data.indexations.find((i) => i.platform === option.value);

                                        return (
                                            <div key={option.value} className="rounded-md border p-4 dark:border-gray-700">
                                                <div className="flex items-start gap-3">
                                                    <input
                                                        type="checkbox"
                                                        id={`indexation-${option.value}`}
                                                        checked={isSelected}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                setData('indexations', [...data.indexations, { platform: option.value, url: '' }]);
                                                            } else {
                                                                setData(
                                                                    'indexations',
                                                                    data.indexations.filter((i) => i.platform !== option.value),
                                                                );
                                                            }
                                                        }}
                                                        className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                    />
                                                    <div className="flex-1">
                                                        <Label htmlFor={`indexation-${option.value}`} className="cursor-pointer font-medium">
                                                            {option.label}
                                                        </Label>
                                                        {isSelected && (
                                                            <div className="mt-2">
                                                                <Label className="text-xs text-gray-600 dark:text-gray-400">URL (opsional)</Label>
                                                                <Input
                                                                    type="url"
                                                                    value={selectedItem?.url || ''}
                                                                    onChange={(e) => {
                                                                        setData(
                                                                            'indexations',
                                                                            data.indexations.map((i) =>
                                                                                i.platform === option.value ? { ...i, url: e.target.value } : i,
                                                                            ),
                                                                        );
                                                                    }}
                                                                    placeholder={`https://example.com/journal/${option.value.toLowerCase().replace(' ', '-')}`}
                                                                    className="mt-1"
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                {errors.indexations && <p className="mt-1 text-sm text-red-600">{errors.indexations}</p>}
                            </div>

                            <div className="flex flex-col-reverse items-stretch justify-end gap-4 border-t pt-4 sm:flex-row sm:items-center dark:border-gray-700">
                                <Link href={route('admin-kampus.journals.index')}>
                                    <Button type="button" variant="outline">
                                        Cancel
                                    </Button>
                                </Link>
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Saving...' : 'Update Journal'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
