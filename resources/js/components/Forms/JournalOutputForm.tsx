/**
 * JournalOutputForm Component
 *
 * Sub-form for adding Publikasi Jurnal Ilmiah output.
 * Features DOI input for metadata auto-fill via CrossRef API.
 *
 * @submits POST /user/outputs/store-journal
 */
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from '@inertiajs/react';
import { AlertCircle, CheckCircle2, Loader2, Search, Upload } from 'lucide-react';
import { type FormEvent, useRef, useState } from 'react';

interface Journal {
    id: number;
    title: string;
    issn: string;
    e_issn?: string;
}

interface Props {
    journals: Journal[];
}

interface DoiMetadata {
    title?: string;
    authors?: string;
    journal_name?: string;
    volume?: string;
    issue?: string;
    pages?: string;
    year?: number;
    publisher?: string;
    issn?: string;
    url?: string;
}

export function JournalOutputForm({ journals }: Props) {
    const [doiInput, setDoiInput] = useState('');
    const [doiStatus, setDoiStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [doiMessage, setDoiMessage] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        authors: '',
        year: new Date().getFullYear(),
        doi: '',
        url: '',
        journal_name: '',
        volume: '',
        issue: '',
        pages: '',
        issn: '',
        e_issn: '',
        publisher: '',
        journal_id: '',
        file: null as File | null,
    });

    /**
     * Fetch metadata from CrossRef API using DOI
     */
    const handleDoiLookup = async () => {
        if (!doiInput.trim()) return;

        setDoiStatus('loading');
        setDoiMessage('Mengambil metadata dari CrossRef...');

        try {
            // Clean DOI input — accept full URL or plain DOI
            let doi = doiInput.trim();
            doi = doi.replace(/^https?:\/\/(dx\.)?doi\.org\//i, '');

            const response = await fetch(`https://api.crossref.org/works/${encodeURIComponent(doi)}`);

            if (!response.ok) {
                throw new Error('DOI tidak ditemukan');
            }

            const result = await response.json();
            const work = result.message;

            // Extract metadata
            const metadata: DoiMetadata = {
                title: work.title?.[0] || '',
                authors: work.author
                    ?.map((a: { given?: string; family?: string }) =>
                        [a.given, a.family].filter(Boolean).join(' ')
                    )
                    .join(', ') || '',
                journal_name: work['container-title']?.[0] || '',
                volume: work.volume || '',
                issue: work.issue || '',
                pages: work.page || '',
                year: work.published?.['date-parts']?.[0]?.[0] ||
                    work['published-print']?.['date-parts']?.[0]?.[0] ||
                    work['published-online']?.['date-parts']?.[0]?.[0] ||
                    new Date().getFullYear(),
                publisher: work.publisher || '',
                issn: work.ISSN?.[0] || '',
                url: work.URL || `https://doi.org/${doi}`,
            };

            // Auto-fill form
            setData((prev) => ({
                ...prev,
                title: metadata.title || prev.title,
                authors: metadata.authors || prev.authors,
                journal_name: metadata.journal_name || prev.journal_name,
                volume: metadata.volume || prev.volume,
                issue: metadata.issue || prev.issue,
                pages: metadata.pages || prev.pages,
                year: metadata.year || prev.year,
                publisher: metadata.publisher || prev.publisher,
                issn: metadata.issn || prev.issn,
                doi: doi,
                url: metadata.url || prev.url,
            }));

            setDoiStatus('success');
            setDoiMessage('Metadata berhasil diambil dari CrossRef');
        } catch {
            setDoiStatus('error');
            setDoiMessage('Gagal mengambil metadata. Periksa DOI dan coba lagi, atau isi data secara manual.');
        }
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
            if (key === 'file' && value instanceof File) {
                formData.append(key, value);
            } else if (value !== null && value !== '') {
                formData.append(key, String(value));
            }
        });

        post(route('user.outputs.store-journal'), {
            forceFormData: true,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* DOI Lookup Section */}
            <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-4 dark:border-blue-800 dark:bg-blue-900/10">
                <Label className="mb-2 block text-sm font-medium text-blue-800 dark:text-blue-300">
                    <Search className="mr-1 inline h-4 w-4" />
                    Cari via DOI (Opsional)
                </Label>
                <p className="mb-3 text-xs text-blue-600 dark:text-blue-400">
                    Masukkan DOI untuk mengisi formulir secara otomatis dari database CrossRef
                </p>
                <div className="flex gap-2">
                    <Input
                        type="text"
                        placeholder="Contoh: 10.1234/example.2024"
                        value={doiInput}
                        onChange={(e) => setDoiInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                handleDoiLookup();
                            }
                        }}
                        className="flex-1 border-blue-300 bg-white dark:border-blue-700 dark:bg-gray-800"
                    />
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleDoiLookup}
                        disabled={doiStatus === 'loading' || !doiInput.trim()}
                        className="border-blue-300 text-blue-700 hover:bg-blue-100 dark:border-blue-700 dark:text-blue-300"
                    >
                        {doiStatus === 'loading' ? (
                            <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                        ) : (
                            <Search className="mr-1 h-4 w-4" />
                        )}
                        Cari
                    </Button>
                </div>
                {doiMessage && (
                    <div
                        className={`mt-2 flex items-center gap-1 text-sm ${
                            doiStatus === 'success'
                                ? 'text-green-600 dark:text-green-400'
                                : doiStatus === 'error'
                                  ? 'text-red-600 dark:text-red-400'
                                  : 'text-blue-600 dark:text-blue-400'
                        }`}
                    >
                        {doiStatus === 'success' && <CheckCircle2 className="h-4 w-4" />}
                        {doiStatus === 'error' && <AlertCircle className="h-4 w-4" />}
                        {doiStatus === 'loading' && <Loader2 className="h-4 w-4 animate-spin" />}
                        {doiMessage}
                    </div>
                )}
            </div>

            {/* Main Form Fields */}
            <div className="space-y-4">
                {/* Title */}
                <div>
                    <Label htmlFor="title">
                        Judul Publikasi <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="title"
                        value={data.title}
                        onChange={(e) => setData('title', e.target.value)}
                        placeholder="Masukkan judul artikel"
                        className={errors.title ? 'border-red-500' : ''}
                    />
                    {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
                </div>

                {/* Authors */}
                <div>
                    <Label htmlFor="authors">
                        Penulis <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                        id="authors"
                        value={data.authors}
                        onChange={(e) => setData('authors', e.target.value)}
                        placeholder="Nama penulis, dipisahkan dengan koma"
                        rows={2}
                        className={errors.authors ? 'border-red-500' : ''}
                    />
                    {errors.authors && <p className="mt-1 text-sm text-red-500">{errors.authors}</p>}
                </div>

                {/* Journal Name & Year */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <Label htmlFor="journal_name">
                            Nama Jurnal <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="journal_name"
                            value={data.journal_name}
                            onChange={(e) => setData('journal_name', e.target.value)}
                            placeholder="Nama jurnal tempat publikasi"
                            className={errors.journal_name ? 'border-red-500' : ''}
                        />
                        {errors.journal_name && <p className="mt-1 text-sm text-red-500">{errors.journal_name}</p>}
                    </div>
                    <div>
                        <Label htmlFor="year">
                            Tahun <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="year"
                            type="number"
                            value={data.year}
                            onChange={(e) => setData('year', parseInt(e.target.value) || new Date().getFullYear())}
                            min={1900}
                            max={new Date().getFullYear() + 1}
                            className={errors.year ? 'border-red-500' : ''}
                        />
                        {errors.year && <p className="mt-1 text-sm text-red-500">{errors.year}</p>}
                    </div>
                </div>

                {/* Volume, Issue, Pages */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                        <Label htmlFor="volume">Volume</Label>
                        <Input
                            id="volume"
                            value={data.volume}
                            onChange={(e) => setData('volume', e.target.value)}
                            placeholder="Vol."
                        />
                    </div>
                    <div>
                        <Label htmlFor="issue">Nomor/Issue</Label>
                        <Input
                            id="issue"
                            value={data.issue}
                            onChange={(e) => setData('issue', e.target.value)}
                            placeholder="No."
                        />
                    </div>
                    <div>
                        <Label htmlFor="pages">Halaman</Label>
                        <Input
                            id="pages"
                            value={data.pages}
                            onChange={(e) => setData('pages', e.target.value)}
                            placeholder="e.g., 1-15"
                        />
                    </div>
                </div>

                {/* DOI & URL */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <Label htmlFor="doi">DOI</Label>
                        <Input
                            id="doi"
                            value={data.doi}
                            onChange={(e) => setData('doi', e.target.value)}
                            placeholder="10.xxxx/xxxxx"
                        />
                    </div>
                    <div>
                        <Label htmlFor="url">URL Artikel</Label>
                        <Input
                            id="url"
                            value={data.url}
                            onChange={(e) => setData('url', e.target.value)}
                            placeholder="https://..."
                        />
                        {errors.url && <p className="mt-1 text-sm text-red-500">{errors.url}</p>}
                    </div>
                </div>

                {/* ISSN & E-ISSN */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <Label htmlFor="issn">ISSN</Label>
                        <Input
                            id="issn"
                            value={data.issn}
                            onChange={(e) => setData('issn', e.target.value)}
                            placeholder="xxxx-xxxx"
                        />
                    </div>
                    <div>
                        <Label htmlFor="e_issn">E-ISSN</Label>
                        <Input
                            id="e_issn"
                            value={data.e_issn}
                            onChange={(e) => setData('e_issn', e.target.value)}
                            placeholder="xxxx-xxxx"
                        />
                    </div>
                </div>

                {/* Publisher */}
                <div>
                    <Label htmlFor="publisher">Penerbit</Label>
                    <Input
                        id="publisher"
                        value={data.publisher}
                        onChange={(e) => setData('publisher', e.target.value)}
                        placeholder="Nama penerbit"
                    />
                </div>

                {/* Link to existing journal (optional) */}
                {journals.length > 0 && (
                    <div>
                        <Label htmlFor="journal_id">Tautkan ke Jurnal (Opsional)</Label>
                        <Select
                            value={data.journal_id}
                            onValueChange={(value) => setData('journal_id', value)}
                        >
                            <SelectTrigger id="journal_id">
                                <SelectValue placeholder="Pilih jurnal yang terdaftar..." />
                            </SelectTrigger>
                            <SelectContent>
                                {journals.map((journal) => (
                                    <SelectItem key={journal.id} value={String(journal.id)}>
                                        {journal.title} ({journal.issn})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            Tautkan ke jurnal yang sudah terdaftar di sistem
                        </p>
                    </div>
                )}

                {/* File Upload */}
                <div>
                    <Label htmlFor="file">Upload File (PDF, maks 10MB)</Label>
                    <div
                        className="mt-1 flex cursor-pointer items-center gap-3 rounded-lg border-2 border-dashed border-gray-300 p-4 transition-colors hover:border-blue-400 dark:border-gray-600 dark:hover:border-blue-500"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <Upload className="h-5 w-5 text-gray-400" />
                        <div className="text-sm">
                            {data.file ? (
                                <span className="font-medium text-blue-600 dark:text-blue-400">
                                    {data.file.name}
                                </span>
                            ) : (
                                <span className="text-gray-500 dark:text-gray-400">
                                    Klik untuk memilih file PDF
                                </span>
                            )}
                        </div>
                    </div>
                    <input
                        ref={fileInputRef}
                        id="file"
                        type="file"
                        accept=".pdf"
                        className="hidden"
                        onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            setData('file', file);
                        }}
                    />
                    {errors.file && <p className="mt-1 text-sm text-red-500">{errors.file}</p>}
                </div>
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-3 border-t pt-4 dark:border-gray-700">
                <Button type="submit" disabled={processing}>
                    {processing ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Menyimpan...
                        </>
                    ) : (
                        'Simpan Luaran'
                    )}
                </Button>
            </div>
        </form>
    );
}
