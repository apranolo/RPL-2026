import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save, FileText, Wallet } from 'lucide-react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Keuangan', href: '#' },
    { title: 'Pencairan Dana Termin', href: '/finance/funding/create' },
];

interface Contract {
    id: number;
    number: string;
    total: number;
}

interface CreateProps {
    contracts: Contract[];
}

export default function Create({ contracts }: CreateProps) {
    const { data, setData, post, processing, errors, reset } = useForm({
        contract_id: '',
        termin_name: '',
        amount: '',
        disbursement_date: '',
        evidence: null as File | null,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('finance.funding.store'), {
            onSuccess: () => {
                toast.success('Termin pencairan berhasil disimpan');
                reset();
            },
            onError: () => {
                toast.error('Gagal menyimpan termin pencairan');
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Input Termin Pencairan" />
            
            <div className="flex h-full flex-1 flex-col gap-4 p-4 sm:p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Pencairan Dana Termin</h2>
                        <p className="text-muted-foreground">Input data tahapan pencairan dana kontrak penelitian.</p>
                    </div>
                    <Link href="/dashboard">
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
                        </Button>
                    </Link>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Form Input Termin</CardTitle>
                                <CardDescription>Lengkapi informasi pencairan dana di bawah ini.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="contract_id">Pilih Kontrak</Label>
                                        <Select 
                                            value={data.contract_id} 
                                            onValueChange={(value) => setData('contract_id', value)}
                                        >
                                            <SelectTrigger id="contract_id">
                                                <SelectValue placeholder="Pilih nomor kontrak" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {contracts.map((contract) => (
                                                    <SelectItem key={contract.id} value={contract.id.toString()}>
                                                        {contract.number}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.contract_id && <p className="text-sm text-destructive">{errors.contract_id}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="termin_name">Nama Termin / Tahapan</Label>
                                        <Input
                                            id="termin_name"
                                            placeholder="Contoh: Termin 1 (70%)"
                                            value={data.termin_name}
                                            onChange={(e) => setData('termin_name', e.target.value)}
                                        />
                                        {errors.termin_name && <p className="text-sm text-destructive">{errors.termin_name}</p>}
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="amount">Nominal Pencairan (Rp)</Label>
                                            <Input
                                                id="amount"
                                                type="number"
                                                placeholder="0"
                                                value={data.amount}
                                                onChange={(e) => setData('amount', e.target.value)}
                                            />
                                            {errors.amount && <p className="text-sm text-destructive">{errors.amount}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="disbursement_date">Tanggal Pencairan</Label>
                                            <Input
                                                id="disbursement_date"
                                                type="date"
                                                value={data.disbursement_date}
                                                onChange={(e) => setData('disbursement_date', e.target.value)}
                                            />
                                            {errors.disbursement_date && <p className="text-sm text-destructive">{errors.disbursement_date}</p>}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="evidence">Bukti Pencairan (PDF/JPG/PNG)</Label>
                                        <Input
                                            id="evidence"
                                            type="file"
                                            onChange={(e) => setData('evidence', e.target.files ? e.target.files[0] : null)}
                                        />
                                        <p className="text-xs text-muted-foreground">Maksimal 5MB.</p>
                                        {errors.evidence && <p className="text-sm text-destructive">{errors.evidence}</p>}
                                    </div>

                                    <div className="flex justify-end border-t pt-6">
                                        <Button type="submit" disabled={processing}>
                                            {processing ? 'Menyimpan...' : (
                                                <>
                                                    <Save className="mr-2 h-4 w-4" /> Simpan Data Termin
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card className="bg-muted/50">
                            <CardHeader>
                                <CardTitle className="text-sm font-medium">Informasi Saldo</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Total Dana Kontrak:</span>
                                        <span className="font-semibold text-primary">Rp 50.000.000</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Dana Terpakai:</span>
                                        <span className="font-semibold text-orange-600">Rp 0</span>
                                    </div>
                                    <div className="border-t pt-4 flex items-center justify-between">
                                        <span className="text-sm font-bold">Sisa Dana:</span>
                                        <span className="text-lg font-bold text-green-600">Rp 50.000.000</span>
                                    </div>
                                    <div className="mt-4 flex items-center gap-2 rounded-lg bg-blue-50 p-3 text-xs text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
                                        <Wallet className="h-4 w-4 shrink-0" />
                                        <span>Pastikan nominal termin tidak melebihi sisa dana yang tersedia.</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm font-medium">Riwayat Termin</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                                    <FileText className="h-8 w-8 opacity-20" />
                                    <p className="mt-2 text-xs">Belum ada riwayat termin untuk kontrak terpilih.</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
