import React from 'react';
import { Head, usePage } from '@inertiajs/react';
import ReviewMatrixTable, {
  type ReviewMatrixCell,
  type ReviewMatrixCriterion,
  type ReviewMatrixReviewer,
} from '../../components/ReviewMatrixTable';

type Subject = {
  id: number;
  label: string;
};

type PageProps = {
  subject: Subject;
  reviewers: ReviewMatrixReviewer[];
  criteria: ReviewMatrixCriterion[];
  cells: Record<string, Record<string, ReviewMatrixCell>>;
};

export default function Summary() {
  const { props } = usePage<PageProps>();
  const { subject, reviewers, criteria, cells } = props;

  // Hitung rata-rata sederhana
  const allScores = Object.values(cells)
    .flatMap((r) => Object.values(r).map((c) => c.score))
    .filter((s): s is number => s !== null);

  const avgScore = allScores.length
    ? (allScores.reduce((a, b) => a + b, 0) / allScores.length).toFixed(1)
    : '0.0';

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans">
      <Head title="Review Summary" />

      <div className="mx-auto max-w-6xl px-6 py-12">
        {/* Header Section */}
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <nav className="mb-2 text-xs font-bold uppercase tracking-widest text-blue-600">
              Performance Report
            </nav>
            <h1 className="text-4xl font-black tracking-tight text-slate-900 md:text-5xl">
              Review Summary
            </h1>
            <p className="mt-3 text-lg text-slate-500">
              Detailed assessment for{' '}
              <span className="text-slate-900 font-semibold underline decoration-blue-500 underline-offset-4">
                {subject.label}
              </span>
            </p>
          </div>

          <div className="flex gap-4">
            <div className="bg-white border border-slate-200 px-5 py-3 rounded-2xl shadow-sm">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Average Score
              </p>
              <p className="text-2xl font-black text-blue-600">{avgScore}</p>
            </div>
          </div>
        </header>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-3xl text-white shadow-xl">
            <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mb-1">
              Status
            </p>
            <p className="text-xl font-bold">Review Completed</p>
          </div>
          <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">
              Total Reviewers
            </p>
            <p className="text-xl font-bold text-slate-800">{reviewers.length} Assigned</p>
          </div>
          <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">
              Total Criteria
            </p>
            <p className="text-xl font-bold text-slate-800">{criteria.length} Points</p>
          </div>
        </div>

        {}
        <div className="relative">
          <ReviewMatrixTable reviewers={reviewers} criteria={criteria} cells={cells} />
        </div>
      </div>
    </div>
  );
}