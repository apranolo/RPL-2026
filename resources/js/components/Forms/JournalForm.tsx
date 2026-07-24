import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from '@inertiajs/react';
import { Loader2, Upload } from 'lucide-react';
import { FormEventHandler, useRef } from 'react';

interface Journal {
    id: number;
    title: string;
    issn: string;
    e_issn?: string;
}

interface Props {
    journals?: Journal[];
}

export function JournalForm({ journals = [] }: Props) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data, setData, post, processing, errors } = useForm({
        title: '',
        authors: '',
        journal_name: '',
        year: new Date().getFullYear(),
        volume: '',
        issue: '',
        pages: '',
        doi: '',
        url: '',
        issn: '',
        e_issn: '',
        publisher: '',
        journal_id: '',
        file: null as File | null,
    });

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('user.outputs.store-journal'), {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4">
                {/* Judul Artikel */}
                <div>
                    <Label htmlFor="title">
                        Judul Artikel <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="title"
                        value={data.title}
                        onChange={(e) => setData('title', e.target.value)}
                        placeholder="Judul artikel ilmiah..."
                        className={errors.title ? 'border-red-500' : ''}
                    />
                    {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
                </div>

                {/* Penulis & Nama Jurnal */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <Label htmlFor="authors">
                            Penulis <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="authors"
                            value={data.authors}
                            onChange={(e) => setData('authors', e.target.value)}
                            placeholder="Nama penulis (contoh: Ahmad, Budi)..."
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
                            onChange={(e) => setData('journal_name', e.target.value)}
                            placeholder="Nama jurnal publikasi..."
                            className={errors.journal_name ? 'border-red-500' : ''}
                        />
                        {errors.journal_name && <p className="mt-1 text-sm text-red-500">{errors.journal_name}</p>}
                    </div>
                </div>

                {/* Tahun, Volume, Issue, Pages */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
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
                            placeholder="Contoh: 1-15"
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

                {/* ISSN, E-ISSN & Penerbit */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
                    <div>
                        <Label htmlFor="publisher">Penerbit</Label>
                        <Input
                            id="publisher"
                            value={data.publisher}
                            onChange={(e) => setData('publisher', e.target.value)}
                            placeholder="Nama penerbit"
                        />
                    </div>
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
                    </div>
                )}

                {/* File Upload */}
                <div>
                    <Label htmlFor="file">Upload File Bukti (PDF, maks 10MB)</Label>
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
                                    Klik untuk memilih berkas PDF
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
                        'Simpan Luaran Jurnal'
                    )}
                </Button>
            </div>
        </form>
    );
}
