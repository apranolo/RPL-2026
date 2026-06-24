import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { toast } from 'sonner';
import { Transition } from '@headlessui/react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { SkillTagInput } from '@/components/SkillTagInput';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Award, CheckCircle2, Clock, FileText, ShieldAlert } from 'lucide-react';

interface ReviewerProfileData {
    id?: number;
    user_id?: number;
    research_interests: string[];
    biography: string;
    total_reviews?: number;
    completed_reviews?: number;
}

interface ReviewerProfileProps {
    profile: ReviewerProfileData | null;
    statistics: {
        total_reviews: number;
        completed_reviews: number;
        in_progress_reviews: number;
        assigned_reviews: number;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Profil Reviewer',
        href: '/reviewer/profile',
    },
];

export default function ReviewerProfile({ profile, statistics }: ReviewerProfileProps) {
    const { auth } = usePage<SharedData>().props;
    const { user } = auth;

    const { data, setData, post, processing, recentlySuccessful, errors } = useForm({
        research_interests: profile?.research_interests || [],
        biography: profile?.biography || '',
    });

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('reviewer.profile.update'), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Profil Reviewer berhasil diperbarui.');
            },
            onError: () => {
                toast.error('Gagal memperbarui profil. Silakan periksa kembali input Anda.');
            },
        });
    };

    // Calculate completion rate percentage
    const completionRate = statistics.total_reviews > 0 
        ? Math.round((statistics.completed_reviews / statistics.total_reviews) * 100) 
        : 0;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profil Reviewer" />

            <div className="mx-auto max-w-5xl space-y-8 p-4 md:p-6">
                {/* Header Section */}
                <div className="flex flex-col gap-2 border-b border-sidebar-border/50 pb-5">
                    <h1 className="text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
                        Profil Reviewer: {user.name}
                    </h1>
                    <p className="text-sm text-muted-foreground md:text-base">
                        {user.university?.name ? `Institusi: ${user.university.name}` : 'Institusi tidak terdaftar'} • Kelola minat penelitian, keahlian bidang ilmiah, dan pantau catatan peninjauan Anda.
                    </p>
                </div>

                {/* Track Record Stats Grid */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card className="relative overflow-hidden border-sidebar-border/60 bg-card transition-all duration-200 hover:shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                Total Penugasan
                            </CardTitle>
                            <FileText className="h-4 w-4 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{statistics.total_reviews}</div>
                            <p className="text-xs text-muted-foreground mt-1">Seluruh agenda pembinaan</p>
                        </CardContent>
                    </Card>

                    <Card className="relative overflow-hidden border-sidebar-border/60 bg-card transition-all duration-200 hover:shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                Review Selesai
                            </CardTitle>
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                                {statistics.completed_reviews}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">Rekomendasi terkirim</p>
                        </CardContent>
                    </Card>

                    <Card className="relative overflow-hidden border-sidebar-border/60 bg-card transition-all duration-200 hover:shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                Sedang Direview
                            </CardTitle>
                            <Clock className="h-4 w-4 text-amber-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                                {statistics.in_progress_reviews}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">Dalam proses penilaian</p>
                        </CardContent>
                    </Card>

                    <Card className="relative overflow-hidden border-sidebar-border/60 bg-card transition-all duration-200 hover:shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                Menunggu Review
                            </CardTitle>
                            <ShieldAlert className="h-4 w-4 text-indigo-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                                {statistics.assigned_reviews}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">Belum mulai dinilai</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Progress Completion Rate */}
                <Card className="border-sidebar-border/60 bg-card">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-semibold">Tingkat Penyelesaian Tugas</CardTitle>
                        <CardDescription>Rasio penyelesaian tugas review yang diberikan kepada Anda</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs">
                                <span className="font-medium text-muted-foreground">Persentase</span>
                                <span className="font-bold text-primary">{completionRate}%</span>
                            </div>
                            <div className="h-2.5 w-full rounded-full bg-secondary/80 overflow-hidden">
                                <div 
                                    className="h-full rounded-full bg-primary transition-all duration-500 ease-out" 
                                    style={{ width: `${completionRate}%` }}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Profile Form */}
                <div className="rounded-xl border border-sidebar-border/60 bg-card p-6 shadow-sm">
                    <div className="flex items-center gap-3 border-b border-sidebar-border/50 pb-4 mb-6">
                        <Award className="h-5 w-5 text-primary" />
                        <div>
                            <h2 className="text-lg font-bold text-foreground">Detail Data Profil Reviewer</h2>
                            <p className="text-xs text-muted-foreground">
                                Informasi ini akan membantu admin mencocokkan Anda dengan pendaftaran jurnal yang relevan.
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Research Interests / Skills */}
                        <div className="space-y-2">
                            <Label htmlFor="research_interests" className="text-sm font-semibold text-foreground">
                                Bidang Keahlian / Minat Penelitian
                            </Label>
                            <span className="block text-xs text-muted-foreground mb-1">
                                Tambahkan tag bidang keilmuan yang Anda kuasai (misal: Kecerdasan Buatan, Teknik Sipil, Pendidikan Islam, dll.).
                            </span>
                            <SkillTagInput
                                value={data.research_interests}
                                onChange={(tags) => setData('research_interests', tags)}
                                placeholder="Masukkan keahlian lalu tekan Enter atau koma..."
                            />
                            {errors.research_interests && (
                                <p className="text-xs text-destructive mt-1">{errors.research_interests}</p>
                            )}
                        </div>

                        {/* Biography */}
                        <div className="space-y-2">
                            <Label htmlFor="biography" className="text-sm font-semibold text-foreground">
                                Biografi Singkat
                            </Label>
                            <span className="block text-xs text-muted-foreground mb-1">
                                Tuliskan latar belakang singkat Anda sebagai dosen, akademisi, peneliti, atau portofolio publikasi ilmiah Anda.
                            </span>
                            <Textarea
                                id="biography"
                                value={data.biography}
                                onChange={(e) => setData('biography', e.target.value)}
                                placeholder="Tulis biografi singkat Anda di sini..."
                                rows={6}
                                className="resize-none"
                            />
                            {errors.biography && (
                                <p className="text-xs text-destructive mt-1">{errors.biography}</p>
                            )}
                        </div>

                        {/* Form Footer Action */}
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4 border-t border-sidebar-border/50 pt-4">
                            <Button disabled={processing} className="w-full sm:w-auto font-semibold px-6">
                                {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </Button>

                            <Transition
                                show={recentlySuccessful}
                                enter="transition ease-in-out duration-300"
                                enterFrom="opacity-0 translate-y-1"
                                enterTo="opacity-100 translate-y-0"
                                leave="transition ease-in duration-200"
                                leaveFrom="opacity-100"
                                leaveTo="opacity-0"
                            >
                                <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                                    Profil berhasil disimpan!
                                </p>
                            </Transition>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
