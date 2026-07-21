import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from '@inertiajs/react';
import { AlertCircle, CheckCircle2, Loader2, Search, Upload } from 'lucide-react';
import { type FormEvent, useRef, useState } from 'react';

interface Proposal {
    id: number;
    title: string;
}

interface Journal {
    id: number;
    title: string;
    issn: string | null;
    e_issn?: string | null;
}

interface Props {
    proposals: Proposal[];
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

type JournalOutputFormData = {
    proposal_id: string;
    title: string;
    authors: string;
    year: string;
    doi: string;
    url: string;
    journal_name: string;
    volume: string;
    issue: string;
    pages: string;
    issn: string;
    e_issn: string;
    publisher: string;
    journal_id: string;
    file: File | null;
    keterangan: string;
};

export default function JournalForm({ proposals, journals }: Props) {
    const [doiInput, setDoiInput] = useState('');
    const [doiStatus, setDoiStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [doiMessage, setDoiMessage] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data, setData, post, processing, errors, transform } = useForm<JournalOutputFormData>({
        proposal_id: '',
        title: '',
        authors: '',
        year: String(new Date().getFullYear()),
        doi: '',
        url: '',
        journal_name: '',
        volume: '',
        issue: '',
        pages: '',
        issn: '',
        e_issn: '',
        publisher: '',
        journal_id: 'none',
        file: null,
        keterangan: '',
    });

    const normalizeDoi = (value: string) => value.trim().replace(/^https?:\/\/(dx\.)?doi\.org\//i, '');

    const handleDoiLookup = async () => {
        if (!doiInput.trim()) return;

        setDoiStatus('loading');
        setDoiMessage('Mengambil metadata dari CrossRef...');

        try {
            const doi = normalizeDoi(doiInput);
            const response = await fetch(`https://api.crossref.org/works/${encodeURIComponent(doi)}`);

            if (!response.ok) {
                throw new Error('DOI tidak ditemukan');
            }

            const result = await response.json();
            const work = result.message;
            const metadata: DoiMetadata = {
                title: work.title?.[0] || '',
                authors:
                    work.author
                        ?.map((author: { given?: string; family?: string }) => [author.given, author.family].filter(Boolean).join(' '))
                        .join(', ') || '',
                journal_name: work['container-title']?.[0] || '',
                volume: work.volume || '',
                issue: work.issue || '',
                pages: work.page || '',
                year:
                    work.published?.['date-parts']?.[0]?.[0] ||
                    work['published-print']?.['date-parts']?.[0]?.[0] ||
                    work['published-online']?.['date-parts']?.[0]?.[0] ||
                    new Date().getFullYear(),
                publisher: work.publisher || '',
                issn: work.ISSN?.[0] || '',
                url: work.URL || `https://doi.org/${doi}`,
            };

            setData('title', metadata.title || data.title);
            setData('authors', metadata.authors || data.authors);
            setData('journal_name', metadata.journal_name || data.journal_name);
            setData('volume', metadata.volume || data.volume);
            setData('issue', metadata.issue || data.issue);
            setData('pages', metadata.pages || data.pages);
            setData('year', String(metadata.year || data.year));
            setData('publisher', metadata.publisher || data.publisher);
            setData('issn', metadata.issn || data.issn);
            setData('doi', doi);
            setData('url', metadata.url || data.url);

            setDoiStatus('success');
            setDoiMessage('Metadata berhasil diambil dari CrossRef.');
        } catch {
            setDoiStatus('error');
            setDoiMessage('DOI tidak ditemukan. Isi data publikasi secara manual.');
        }
    };

    const handleSubmit = (event: FormEvent) => {
        event.preventDefault();

        transform((formData) => ({
            ...formData,
            journal_id: formData.journal_id === 'none' ? '' : formData.journal_id,
        }));

        post(route('user.outputs.store-journal'), {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {Object.keys(errors).length > 0 && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Data luaran belum lengkap</AlertTitle>
                    <AlertDescription>Periksa kembali field yang ditandai sebelum menyimpan.</AlertDescription>
                </Alert>
            )}

            <div className="rounded-md border border-sky-200 bg-sky-50 p-4 dark:border-sky-900 dark:bg-sky-950/30">
                <Label className="mb-2 flex items-center gap-2 text-sm font-medium text-sky-800 dark:text-sky-200">
                    <Search className="h-4 w-4" />
                    Cari Metadata DOI
                </Label>
                <div className="flex flex-col gap-2 sm:flex-row">
                    <Input
                        value={doiInput}
                        onChange={(event) => setDoiInput(event.target.value)}
                        onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                                event.preventDefault();
                                handleDoiLookup();
                            }
                        }}
                        placeholder="10.1234/contoh.2026"
                    />
                    <Button type="button" variant="outline" onClick={handleDoiLookup} disabled={doiStatus === 'loading' || !doiInput.trim()}>
                        {doiStatus === 'loading' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                        Cari
                    </Button>
                </div>
                {doiMessage && (
                    <div
                        className={`mt-2 flex items-center gap-2 text-sm ${
                            doiStatus === 'success'
                                ? 'text-green-700 dark:text-green-300'
                                : doiStatus === 'error'
                                  ? 'text-red-700 dark:text-red-300'
                                  : 'text-sky-700 dark:text-sky-300'
                        }`}
                    >
                        {doiStatus === 'success' && <CheckCircle2 className="h-4 w-4" />}
                        {doiStatus === 'error' && <AlertCircle className="h-4 w-4" />}
                        {doiStatus === 'loading' && <Loader2 className="h-4 w-4 animate-spin" />}
                        {doiMessage}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                    <Label>
                        Proposal <span className="text-red-500">*</span>
                    </Label>
                    <Select value={data.proposal_id} onValueChange={(value) => setData('proposal_id', value)}>
                        <SelectTrigger className={errors.proposal_id ? 'border-red-500' : ''}>
                            <SelectValue placeholder="Pilih proposal penelitian" />
                        </SelectTrigger>
                        <SelectContent>
                            {proposals.map((proposal) => (
                                <SelectItem key={proposal.id} value={String(proposal.id)}>
                                    {proposal.title}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.proposal_id && <p className="mt-1 text-sm text-red-500">{errors.proposal_id}</p>}
                </div>

                <div className="sm:col-span-2">
                    <Label htmlFor="title">
                        Judul Publikasi <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="title"
                        value={data.title}
                        onChange={(event) => setData('title', event.target.value)}
                        className={errors.title ? 'border-red-500' : ''}
                    />
                    {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
                </div>

                <div className="sm:col-span-2">
                    <Label htmlFor="authors">
                        Penulis <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                        id="authors"
                        value={data.authors}
                        onChange={(event) => setData('authors', event.target.value)}
                        rows={2}
                        className={errors.authors ? 'border-red-500' : ''}
                    />
                    {errors.authors && <p className="mt-1 text-sm text-red-500">{errors.authors}</p>}
                </div>

                <div>
                    <Label htmlFor="journal_name">
                        Nama Jurnal <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="journal_name"
                        value={data.journal_name}
                        onChange={(event) => setData('journal_name', event.target.value)}
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
                        min={1900}
                        max={new Date().getFullYear() + 1}
                        value={data.year}
                        onChange={(event) => setData('year', event.target.value)}
                        className={errors.year ? 'border-red-500' : ''}
                    />
                    {errors.year && <p className="mt-1 text-sm text-red-500">{errors.year}</p>}
                </div>

                <div>
                    <Label htmlFor="doi">DOI</Label>
                    <Input id="doi" value={data.doi} onChange={(event) => setData('doi', normalizeDoi(event.target.value))} />
                    {errors.doi && <p className="mt-1 text-sm text-red-500">{errors.doi}</p>}
                </div>

                <div>
                    <Label htmlFor="url">URL Artikel</Label>
                    <Input id="url" type="url" value={data.url} onChange={(event) => setData('url', event.target.value)} />
                    {errors.url && <p className="mt-1 text-sm text-red-500">{errors.url}</p>}
                </div>

                <div>
                    <Label htmlFor="volume">Volume</Label>
                    <Input id="volume" value={data.volume} onChange={(event) => setData('volume', event.target.value)} />
                </div>

                <div>
                    <Label htmlFor="issue">Nomor/Issue</Label>
                    <Input id="issue" value={data.issue} onChange={(event) => setData('issue', event.target.value)} />
                </div>

                <div>
                    <Label htmlFor="pages">Halaman</Label>
                    <Input id="pages" value={data.pages} onChange={(event) => setData('pages', event.target.value)} />
                </div>

                <div>
                    <Label htmlFor="publisher">Penerbit</Label>
                    <Input id="publisher" value={data.publisher} onChange={(event) => setData('publisher', event.target.value)} />
                </div>

                <div>
                    <Label htmlFor="issn">ISSN</Label>
                    <Input id="issn" value={data.issn} onChange={(event) => setData('issn', event.target.value)} placeholder="xxxx-xxxx" />
                </div>

                <div>
                    <Label htmlFor="e_issn">E-ISSN</Label>
                    <Input id="e_issn" value={data.e_issn} onChange={(event) => setData('e_issn', event.target.value)} placeholder="xxxx-xxxx" />
                </div>

                {journals.length > 0 && (
                    <div className="sm:col-span-2">
                        <Label>Tautkan Jurnal Terdaftar</Label>
                        <Select value={data.journal_id} onValueChange={(value) => setData('journal_id', value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Opsional" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">Tidak ditautkan</SelectItem>
                                {journals.map((journal) => (
                                    <SelectItem key={journal.id} value={String(journal.id)}>
                                        {journal.title} ({journal.e_issn || journal.issn || 'tanpa ISSN'})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.journal_id && <p className="mt-1 text-sm text-red-500">{errors.journal_id}</p>}
                    </div>
                )}

                <div className="sm:col-span-2">
                    <Label htmlFor="keterangan">Keterangan</Label>
                    <Textarea id="keterangan" value={data.keterangan} onChange={(event) => setData('keterangan', event.target.value)} rows={3} />
                    {errors.keterangan && <p className="mt-1 text-sm text-red-500">{errors.keterangan}</p>}
                </div>

                <div className="sm:col-span-2">
                    <Label htmlFor="file">File Bukti Publikasi</Label>
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="mt-1 flex w-full items-center gap-3 rounded-md border-2 border-dashed border-gray-300 p-4 text-left text-sm transition hover:border-sky-400 dark:border-gray-700 dark:hover:border-sky-600"
                    >
                        <Upload className="h-5 w-5 text-gray-400" />
                        <span className={data.file ? 'font-medium text-sky-700 dark:text-sky-300' : 'text-gray-500'}>
                            {data.file ? data.file.name : 'Pilih PDF, maksimal 10MB'}
                        </span>
                    </button>
                    <input
                        ref={fileInputRef}
                        id="file"
                        type="file"
                        accept="application/pdf,.pdf"
                        className="hidden"
                        onChange={(event) => setData('file', event.target.files?.[0] || null)}
                    />
                    {errors.file && <p className="mt-1 text-sm text-red-500">{errors.file}</p>}
                </div>
            </div>

            <div className="flex justify-end border-t pt-4 dark:border-gray-800">
                <Button type="submit" disabled={processing || proposals.length === 0}>
                    {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Simpan Luaran
                </Button>
            </div>
        </form>
    );
}
