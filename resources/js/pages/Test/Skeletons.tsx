import { Head } from '@inertiajs/react';
import {
    SkeletonLoader,
    SkeletonTable,
    SkeletonCard,
    SkeletonText,
    SkeletonAvatar,
    SkeletonList,
    SkeletonForm,
    SkeletonDashboard,
} from '@/components/SkeletonLoader';

export default function SkeletonsTestPage() {
    return (
        <>
            <Head title="Testing Skeleton Loaders" />
            <div className="container mx-auto p-8 space-y-12 bg-slate-50 min-h-screen">
                <div className="border-b pb-4">
                    <h1 className="text-3xl font-bold text-slate-800">Skeleton Loading Components Gallery</h1>
                    <p className="text-slate-500 mt-1">Manual view testing page for all Skeleton components implemented in PR #100.</p>
                </div>

                {/* Grid layout for small components */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Basic Skeleton Loader */}
                    <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
                        <h2 className="text-lg font-semibold text-slate-700 border-b pb-2">1. Basic Skeleton Loader (rows=3)</h2>
                        <SkeletonLoader rows={3} />
                    </div>

                    {/* Form Skeleton Loader */}
                    <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
                        <h2 className="text-lg font-semibold text-slate-700 border-b pb-2">2. Form Skeleton Loader (fields=3)</h2>
                        <SkeletonForm fields={3} />
                    </div>

                    {/* List Skeleton Loader */}
                    <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
                        <h2 className="text-lg font-semibold text-slate-700 border-b pb-2">3. List Skeleton Loader (rows=3)</h2>
                        <SkeletonList rows={3} />
                    </div>

                    {/* Individual Text & Avatar Skeletons */}
                    <div className="bg-white p-6 rounded-xl border shadow-sm space-y-6">
                        <h2 className="text-lg font-semibold text-slate-700 border-b pb-2">4. Text & Avatar Skeletons</h2>
                        
                        <div className="space-y-2">
                            <span className="text-xs font-medium text-slate-400">SkeletonText (width="w-2/3")</span>
                            <SkeletonText width="w-2/3" />
                        </div>
                        
                        <div className="space-y-4">
                            <span className="text-xs font-medium text-slate-400 block">SkeletonAvatar (sm, md, lg, xl)</span>
                            <div className="flex items-end gap-4">
                                <div className="text-center">
                                    <SkeletonAvatar size="sm" />
                                    <span className="text-[10px] text-slate-400">sm</span>
                                </div>
                                <div className="text-center">
                                    <SkeletonAvatar size="md" />
                                    <span className="text-[10px] text-slate-400">md</span>
                                </div>
                                <div className="text-center">
                                    <SkeletonAvatar size="lg" />
                                    <span className="text-[10px] text-slate-400">lg</span>
                                </div>
                                <div className="text-center">
                                    <SkeletonAvatar size="xl" />
                                    <span className="text-[10px] text-slate-400">xl</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Card Skeleton Loader */}
                <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
                    <h2 className="text-lg font-semibold text-slate-700 border-b pb-2">5. Card Skeleton Loader (count=3)</h2>
                    <SkeletonCard count={3} />
                </div>

                {/* Table Skeleton Loader */}
                <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
                    <h2 className="text-lg font-semibold text-slate-700 border-b pb-2">6. Table Skeleton Loader (columns=4, rows=3)</h2>
                    <SkeletonTable columns={4} rows={3} />
                </div>

                {/* Dashboard Skeleton Loader */}
                <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
                    <h2 className="text-lg font-semibold text-slate-700 border-b pb-2">7. Dashboard Skeleton Loader</h2>
                    <SkeletonDashboard />
                </div>
            </div>
        </>
    );
}
