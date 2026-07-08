import AppLayout from '@/layouts/app-layout';
import { Head, useForm, Link } from '@inertiajs/react';
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
    AlertTriangle, 
    Calendar, 
    ChevronLeft, 
    Save, 
    FileText, 
    CheckCircle, 
    XCircle, 
    Clock,
    User,
    BookOpen
} from 'lucide-react';

interface UserType {
    id: number;
    name: string;
    email: string;
}

interface ResearchSchema {
    id: number;
    name: string;
    description?: string;
}

interface Proposal {
    id: number;
    judul?: string;
    title?: string;
    deskripsi?: string;
    description?: string;
    user: UserType;
    research_schema: ResearchSchema;
}

interface KomponenPenilaian {
    kriteria: string;
    skor: number;
    max: number;
}

interface Review {
    id: number;
    proposal_id: number;
    reviewer_id: number;
    tanggal_mulai_review: string;
    tanggal_selesai_review: string;
    komponen_penilaian: KomponenPenilaian[] | null;
    catatan_evaluasi: string | null;
    skor_total: number;
    keputusan_rekomendasi: 'Diterima' | 'Ditolak' | 'Revisi' | null;
    proposal: Proposal;
}

interface Props {
    review: Review;
}

const defaultKomponen: KomponenPenilaian[] = [
    { kriteria: 'Urgensi Penelitian & Orisinalitas', skor: 0, max: 25 },
    { kriteria: 'Kesesuaian Tinjauan Pustaka & Metodologi', skor: 0, max: 30 },
    { kriteria: 'Kelayakan Rencana Kerja & Output yang Dijanjikan', skor: 0, max: 25 },
    { kriteria: 'Kompetensi Tim Pengusul & Rencana Anggaran Biaya', skor: 0, max: 20 },
];

export default function FormReview({ review }: Props) {
    // Fallback untuk judul dan deskripsi proposal
    const proposalJudul = review.proposal?.judul || review.proposal?.title || 'Judul tidak tersedia';
    const proposalDeskripsi = review.proposal?.deskripsi || review.proposal?.description || 'Deskripsi tidak tersedia';

    // Inisialisasi komponen penilaian dengan data default jika masih kosong
    const initialKomponen = review.komponen_penilaian && review.komponen_penilaian.length > 0
        ? review.komponen_penilaian.map(item => ({
            kriteria: item.kriteria,
            skor: item.skor ?? 0,
            max: item.max ?? (
                item.kriteria.includes('Urgensi') ? 25 :
                item.kriteria.includes('Metodologi') ? 30 :
                item.kriteria.includes('Kelayakan') ? 25 : 20
            )
          }))
        : defaultKomponen;

    const { data, setData, post, put, processing, errors } = useForm({
        komponen_penilaian: initialKomponen,
        keputusan_rekomendasi: review.keputusan_rekomendasi || '',
        catatan_evaluasi: review.catatan_evaluasi || '',
    });

    // Menghitung sisa hari
    const getRemainingDays = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const end = new Date(review.tanggal_selesai_review);
        end.setHours(23, 59, 59, 999);
        
        const diffTime = end.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const remainingDays = getRemainingDays();
    const isTimelineOver = remainingDays < 0;

    // Hitung real-time total skor
    const totalSkor = data.komponen_penilaian.reduce((sum, item) => sum + (Number(item.skor) || 0), 0);

    const handleScoreChange = (index: number, val: string) => {
        const newKomponen = [...data.komponen_penilaian];
        const numVal = Math.min(Math.max(Number(val) || 0, 0), newKomponen[index].max);
        newKomponen[index].skor = numVal;
        setData('komponen_penilaian', newKomponen);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Tentukan route dan method berdasarkan keberadaan rekomendasi sebelumnya (store vs update)
        const isUpdate = review.keputusan_rekomendasi !== null;
        
        if (isUpdate) {
            // Menggunakan put untuk update
            put(route('reviewer.reviews.update', { review: review.id }));
        } else {
            // Menggunakan post untuk store
            post(route('reviewer.reviews.store', { review: review.id }));
        }
    };

    // Helper warna status tenggat waktu
    const getDeadlineBadgeColor = () => {
        if (remainingDays < 0) return 'destructive';
        if (remainingDays <= 3) return 'warning';
        return 'secondary';
    };

    return (
        <AppLayout>
            <Head title="Form Penilaian Proposal" />
            <div className="mx-auto max-w-7xl p-6">
                
                {/* Back Button & Title */}
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link
                            href={route('reviewer.evaluations.index')}
                            className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                        >
                            <ChevronLeft className="mr-1 h-4 w-4" />
                            Kembali ke Daftar Tugas
                        </Link>
                    </div>
                    <div>
                        <Badge variant={getDeadlineBadgeColor()} className="px-3 py-1 text-sm font-semibold">
                            {remainingDays < 0 ? (
                                <span className="flex items-center"><Clock className="mr-1 h-4 w-4" /> Waktu Penilaian Habis</span>
                            ) : (
                                <span className="flex items-center"><Clock className="mr-1 h-4 w-4" /> {remainingDays} Hari Tersisa</span>
                            )}
                        </Badge>
                    </div>
                </div>

                {/* Form Main Layout */}
                <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    
                    {/* Left Column: Proposal Details & Rubric */}
                    <div className="space-y-6 lg:col-span-2">
                        
                        {/* Proposal Info Card */}
                        <Card className="border border-gray-100 shadow-sm dark:border-gray-800">
                            <CardHeader className="bg-gray-50/50 pb-4 dark:bg-gray-900/50">
                                <CardTitle className="text-xl font-bold flex items-center text-blue-600 dark:text-blue-400">
                                    <FileText className="mr-2 h-5 w-5" /> Detail Proposal Penelitian
                                </CardTitle>
                                <CardDescription>Informasi mengenai proposal yang diajukan oleh dosen.</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-4 text-sm">
                                <div>
                                    <h3 className="font-semibold text-gray-700 dark:text-gray-300">Judul Penelitian</h3>
                                    <p className="mt-1 text-base text-gray-900 dark:text-white font-medium">{proposalJudul}</p>
                                </div>
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                        <h3 className="font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                                            <User className="mr-1 h-4 w-4 text-gray-400" /> Dosen Pengusul
                                        </h3>
                                        <p className="mt-1 text-gray-900 dark:text-white">{review.proposal?.user?.name || '-'}</p>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                                            <BookOpen className="mr-1 h-4 w-4 text-gray-400" /> Skema Penelitian
                                        </h3>
                                        <p className="mt-1 text-gray-900 dark:text-white">{review.proposal?.research_schema?.name || '-'}</p>
                                    </div>
                                </div>
                                <hr className="border-gray-100 dark:border-gray-800" />
                                <div>
                                    <h3 className="font-semibold text-gray-700 dark:text-gray-300">Deskripsi / Abstrak</h3>
                                    <p className="mt-1 leading-relaxed text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{proposalDeskripsi}</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Rubric Evaluation Card */}
                        <Card className="border border-gray-100 shadow-sm dark:border-gray-800">
                            <CardHeader className="bg-gray-50/50 pb-4 dark:bg-gray-900/50">
                                <CardTitle className="text-xl font-bold flex items-center text-blue-600 dark:text-blue-400">
                                    <CheckCircle className="mr-2 h-5 w-5" /> Rubrik Rubrik Penilaian
                                </CardTitle>
                                <CardDescription>Berikan skor yang objektif untuk setiap kriteria pengujian berikut.</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6">
                                
                                {errors.komponen_penilaian && (
                                    <Alert variant="destructive" className="mb-4">
                                        <AlertTriangle className="h-4 w-4" />
                                        <AlertTitle>Validasi Gagal</AlertTitle>
                                        <AlertDescription>{errors.komponen_penilaian}</AlertDescription>
                                    </Alert>
                                )}

                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[10px]">No</TableHead>
                                            <TableHead>Kriteria Penilaian</TableHead>
                                            <TableHead className="w-[150px]">Skor Maksimal</TableHead>
                                            <TableHead className="w-[150px] text-right">Input Skor</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {data.komponen_penilaian.map((item, index) => (
                                            <TableRow key={index}>
                                                <TableCell className="font-medium">{index + 1}</TableCell>
                                                <TableCell className="font-medium text-gray-900 dark:text-white">
                                                    {item.kriteria}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="text-gray-600">
                                                        Maks. {item.max}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end space-x-2">
                                                        <input
                                                            type="number"
                                                            min={0}
                                                            max={item.max}
                                                            value={item.skor === 0 ? '' : item.skor}
                                                            placeholder="0"
                                                            disabled={isTimelineOver || processing}
                                                            onChange={(e) => handleScoreChange(index, e.target.value)}
                                                            className="w-24 rounded-md border border-gray-300 px-3 py-1.5 text-right font-semibold text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                                        />
                                                    </div>
                                                    {errors[`komponen_penilaian.${index}.skor` as any] && (
                                                        <span className="text-xs text-red-500 block mt-1">
                                                            {errors[`komponen_penilaian.${index}.skor` as any]}
                                                        </span>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>

                                {/* Score Aggregator Summary */}
                                <div className="mt-6 flex items-center justify-between rounded-xl bg-gray-50 p-4 dark:bg-gray-900">
                                    <div>
                                        <h4 className="text-base font-bold text-gray-900 dark:text-white">Total Nilai Akumulasi</h4>
                                        <p className="text-xs text-gray-500">Skor agregat maksimum adalah 100.</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">
                                            {totalSkor}
                                        </span>
                                        <span className="text-lg font-bold text-gray-400"> / 100</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Recommendation Decisions & Actions */}
                    <div className="space-y-6 lg:col-span-1">
                        
                        {/* Timeline Calendar Info */}
                        <Card className="border border-gray-100 shadow-sm dark:border-gray-800">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-lg font-bold flex items-center text-gray-800 dark:text-white">
                                    <Calendar className="mr-2 h-5 w-5 text-gray-400" /> Rentang Waktu Penilaian
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Mulai Penilaian:</span>
                                    <span className="font-semibold text-gray-900 dark:text-white">
                                        {new Date(review.tanggal_mulai_review).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Batas Tenggat:</span>
                                    <span className="font-semibold text-gray-900 dark:text-white">
                                        {new Date(review.tanggal_selesai_review).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Recommendation Decisions & Submission Form */}
                        <Card className="border border-gray-100 shadow-sm dark:border-gray-800">
                            <CardHeader className="bg-gray-50/50 pb-4 dark:bg-gray-900/50">
                                <CardTitle className="text-lg font-bold flex items-center text-blue-600 dark:text-blue-400">
                                    <Save className="mr-2 h-5 w-5" /> Keputusan Reviewer
                                </CardTitle>
                                <CardDescription>Tentukan kelayakan proposal penelitian ini.</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-6">
                                
                                {errors.timeline && (
                                    <Alert variant="destructive">
                                        <AlertTriangle className="h-4 w-4" />
                                        <AlertTitle>Gagal Menyimpan</AlertTitle>
                                        <AlertDescription>{errors.timeline}</AlertDescription>
                                    </Alert>
                                )}

                                {/* Recommendation Input Group */}
                                <div className="space-y-3">
                                    <Label className="font-semibold text-sm">Keputusan Rekomendasi</Label>
                                    <div className="grid grid-cols-1 gap-2">
                                        {[
                                            { value: 'Diterima', label: 'Diterima', desc: 'Proposal layak didanai dan dilaksanakan.', color: 'border-green-500 text-green-700 bg-green-50/20 hover:bg-green-50/30' },
                                            { value: 'Revisi', label: 'Perlu Revisi', desc: 'Proposal butuh perbaikan sebelum disetujui.', color: 'border-amber-500 text-amber-700 bg-amber-50/20 hover:bg-amber-50/30' },
                                            { value: 'Ditolak', label: 'Ditolak', desc: 'Proposal tidak layak dilanjutkan.', color: 'border-red-500 text-red-700 bg-red-50/20 hover:bg-red-50/30' },
                                        ].map((item) => (
                                            <label
                                                key={item.value}
                                                className={`flex cursor-pointer flex-col rounded-lg border p-3 transition focus-within:ring-2 focus-within:ring-blue-500 ${
                                                    data.keputusan_rekomendasi === item.value
                                                        ? `${item.color.split(' ')[0]} bg-gray-50 dark:bg-gray-900 ring-2 ring-blue-500`
                                                        : 'border-gray-200 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-900/50'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-bold text-gray-900 dark:text-white">{item.label}</span>
                                                    <input
                                                        type="radio"
                                                        name="keputusan_rekomendasi"
                                                        value={item.value}
                                                        checked={data.keputusan_rekomendasi === item.value}
                                                        disabled={isTimelineOver || processing}
                                                        onChange={(e) => setData('keputusan_rekomendasi', e.target.value as any)}
                                                        className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                                                    />
                                                </div>
                                                <span className="mt-1 text-xs text-gray-500 leading-normal">{item.desc}</span>
                                            </label>
                                        ))}
                                    </div>
                                    {errors.keputusan_rekomendasi && (
                                        <p className="text-xs text-red-500 font-semibold mt-1">{errors.keputusan_rekomendasi}</p>
                                    )}
                                </div>

                                {/* Evaluation Feedback Input */}
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <Label htmlFor="catatan_evaluasi" className="font-semibold text-sm">
                                            Catatan Evaluasi / Umpan Balik
                                        </Label>
                                        {(data.keputusan_rekomendasi === 'Revisi' || data.keputusan_rekomendasi === 'Ditolak') && (
                                            <span className="text-xs font-bold text-red-500 flex items-center">
                                                <AlertTriangle className="h-3 w-3 mr-0.5" /> Wajib diisi
                                            </span>
                                        )}
                                    </div>
                                    <Textarea
                                        id="catatan_evaluasi"
                                        placeholder="Berikan masukan konstruktif atau alasan penolakan/revisi di sini..."
                                        rows={6}
                                        value={data.catatan_evaluasi}
                                        disabled={isTimelineOver || processing}
                                        onChange={(e) => setData('catatan_evaluasi', e.target.value)}
                                        className={`w-full focus:ring-2 focus:outline-none text-sm leading-relaxed ${
                                            errors.catatan_evaluasi ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:ring-blue-500'
                                        }`}
                                    />
                                    {errors.catatan_evaluasi && (
                                        <p className="text-xs text-red-500 font-semibold mt-1">{errors.catatan_evaluasi}</p>
                                    )}
                                </div>

                                {/* Timeline Alert Message */}
                                {isTimelineOver && (
                                    <Alert variant="destructive">
                                        <XCircle className="h-4 w-4" />
                                        <AlertTitle>Masa Pengisian Habis</AlertTitle>
                                        <AlertDescription>
                                            Penilaian tidak dapat dikirim karena sudah melewati tenggat waktu yang ditentukan.
                                        </AlertDescription>
                                    </Alert>
                                )}
                            </CardContent>
                            <CardFooter className="bg-gray-50/50 p-4 border-t border-gray-100 dark:bg-gray-900/50 dark:border-gray-800 flex justify-end">
                                <Button
                                    type="submit"
                                    disabled={isTimelineOver || processing || !data.keputusan_rekomendasi}
                                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2 shadow-sm transition disabled:opacity-50"
                                >
                                    {processing ? 'Menyimpan...' : 'Kirim Penilaian'}
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
