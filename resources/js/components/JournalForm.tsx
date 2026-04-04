import { JournalCoverUpload } from '@/components/JournalCoverUpload';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Link, useForm } from '@inertiajs/react';
import { AlertCircle, Trash2 } from 'lucide-react';
import { FormEventHandler, useEffect, useRef } from 'react';

export interface JournalFormData {
    title: string;
    issn: string;
    e_issn: string;
    url: string;
    scientific_field_id: string;
    sinta_rank: string;
    frequency: string;
    publisher: string;
    first_published_year: string;
    accreditation_start_year: string;
    accreditation_end_year: string;
    accreditation_sk_number: string;
    accreditation_sk_date: string;
    editor_in_chief: string;
    email: string;
    phone: string;
    oai_urls: string[];
    about: string;
    scope: string;
    indexations: Array<{ platform: string; url: string }>;
    cover_image: File | null;
    user_id?: string;
    _method?: 'post' | 'put';
}

interface UniversityUser {
    id: number;
    name: string;
    email: string;
}

interface Props {
    submitUrl: string;
    cancelUrl: string;
    scientificFields: Array<{ id: number; name: string }>;
    sintaRankOptions: Record<string, string>;
    indexationOptions: Array<{ value: string; label: string }>;
    universityUsers?: UniversityUser[]; // If provided, shows the journal assignment field
    initialData?: Partial<JournalFormData>; // Provide this for edit forms
    isEdit?: boolean;
    currentCover?: string | null;
}

export default function JournalForm({
    submitUrl,
    cancelUrl,
    scientificFields,
    sintaRankOptions,
    indexationOptions,
    universityUsers,
    initialData,
    isEdit = false,
    currentCover = null,
}: Props) {
    const { data, setData, post, processing, errors } = useForm({
        title: initialData?.title || '',
        issn: initialData?.issn || '',
        e_issn: initialData?.e_issn || '',
        url: initialData?.url || '',
        scientific_field_id: initialData?.scientific_field_id || '',
        sinta_rank: initialData?.sinta_rank || 'non_sinta',
        frequency: initialData?.frequency || '',
        publisher: initialData?.publisher || '',
        first_published_year: initialData?.first_published_year || '',
        accreditation_start_year: initialData?.accreditation_start_year || '',
        accreditation_end_year: initialData?.accreditation_end_year || '',
        accreditation_sk_number: initialData?.accreditation_sk_number || '',
        accreditation_sk_date: initialData?.accreditation_sk_date || '',
        editor_in_chief: initialData?.editor_in_chief || '',
        email: initialData?.email || '',
        phone: initialData?.phone || '',
        oai_urls: initialData?.oai_urls || [''],
        about: initialData?.about || '',
        scope: initialData?.scope || '',
        indexations: initialData?.indexations || [],
        cover_image: null as File | null,
        user_id: initialData?.user_id || '',
        ...(isEdit ? { _method: 'put' } : {}),
    });

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        post(submitUrl, {
            forceFormData: true, // Necessary because of cover_image Upload
            preserveScroll: true,
        });
    };

    const currentYear = new Date().getFullYear();
    const todayLocal = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0];

    const errorSummaryRef = useRef<HTMLDivElement>(null);
    const hasErrors = Object.keys(errors).length > 0;

    useEffect(() => {
        if (hasErrors && errorSummaryRef.current) {
            errorSummaryRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [hasErrors]);

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {hasErrors && (
                <div ref={errorSummaryRef}>
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Terdapat kesalahan pada form</AlertTitle>
                        <AlertDescription>
                            <ul className="mt-1 list-disc space-y-1 pl-4 text-sm">
                                {Object.entries(errors).map(([field, message]) => (
                                    <li key={field}>{message as string}</li>
                                ))}
                            </ul>
                        </AlertDescription>
                    </Alert>
                </div>
            )}

            {/* Admin Kampus Journal Owner Selection */}
            {universityUsers && universityUsers.length > 0 && (
                <div className="space-y-4">
                    <h3 className="border-b pb-2 text-lg font-semibold text-gray-900 dark:border-gray-700 dark:text-gray-100">
                        Journal Owner
                    </h3>
                    <div>
                        <Label>Assign to User (Pengelola Jurnal)</Label>
                        <Select value={data.user_id} onValueChange={(val) => setData('user_id', val)}>
                            <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Select user (leave empty for self)" />
                            </SelectTrigger>
                            <SelectContent>
                                {universityUsers.map((user) => (
                                    <SelectItem key={user.id} value={user.id.toString()}>
                                        {user.name} ({user.email})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <p className="mt-1 text-xs text-muted-foreground">Jika tidak dipilih, jurnal akan ditugaskan ke Anda</p>
                        {errors.user_id && <p className="mt-1 text-sm text-red-600">{errors.user_id}</p>}
                    </div>
                </div>
            )}

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
                            onChange={(e) =>
                                setData('first_published_year', e.target.value === '' ? '' : String(Number(e.target.value)))
                            }
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

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label>
                                OAI-PMH URLs (Multi) <span className="text-red-500">*</span>
                            </Label>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setData('oai_urls', [...data.oai_urls, ''])}
                            >
                                Tambah URL OAI
                            </Button>
                        </div>
                        {data.oai_urls.map((oaiUrl, index) => (
                            <div key={index} className="flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                    <Input
                                        type="url"
                                        value={oaiUrl}
                                        onChange={(e) => {
                                            const newUrls = [...data.oai_urls];
                                            newUrls[index] = e.target.value;
                                            setData('oai_urls', newUrls);
                                        }}
                                        placeholder="https://journal.ac.id/index.php/jite/oai"
                                        className="mt-1"
                                        required
                                    />
                                    {data.oai_urls.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="text-red-500 hover:text-red-700"
                                            onClick={() => {
                                                const newUrls = data.oai_urls.filter((_, i) => i !== index);
                                                setData('oai_urls', newUrls);
                                            }}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                                {errors[`oai_urls.${index}` as keyof typeof errors] && (
                                    <p className="mt-1 text-sm text-red-600">{errors[`oai_urls.${index}` as keyof typeof errors]}</p>
                                )}
                            </div>
                        ))}
                        <p className="mt-1 text-xs text-muted-foreground">URL untuk harvesting dan indeksasi metadata</p>
                        {errors.oai_urls && <p className="mt-1 text-sm text-red-600">{errors.oai_urls}</p>}
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
                        maxLength={2500}
                    />
                    <p className="mt-1 text-xs text-muted-foreground">{data.scope.length}/2500 characters</p>
                    {errors.scope && <p className="mt-1 text-sm text-red-600">{errors.scope}</p>}
                </div>

                <div>
                    <Label>Cover Image (Opsional)</Label>
                    <div className="mt-1">
                        <JournalCoverUpload
                            currentCover={currentCover}
                            onChange={(file) => setData('cover_image' as any, file)}
                            error={errors.cover_image}
                        />
                        {hasErrors && (
                            <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                                Jika sebelumnya sudah memilih gambar, silakan pilih ulang setelah memperbaiki error di atas.
                            </p>
                        )}
                    </div>
                </div>
            </div>

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
                <Link href={cancelUrl}>
                    <Button type="button" variant="outline">
                        Cancel
                    </Button>
                </Link>
                <Button type="submit" disabled={processing}>
                    {processing ? 'Saving...' : (isEdit ? 'Update Journal' : 'Save Journal')}
                </Button>
            </div>
        </form>
    );
}
