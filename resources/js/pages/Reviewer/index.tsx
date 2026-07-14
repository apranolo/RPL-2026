import { router } from '@inertiajs/react';
import { useEffect, useState, type FormEvent } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

/**
 * @route /reviewer/tasks
 * @description Dashboard daftar tugas review untuk reviewer
 * @features Menampilkan daftar review yang ditugaskan ke reviewer saat ini
 */
interface AssessmentCriteria {
  id: number;
  criterion: string;
  score: number;
}

interface Proposal {
  id: number;
  title?: string;
  judul?: string;
  description?: string;
  deskripsi?: string;
}

interface Review {
  id: number;
  proposal: Proposal;
  status: string;
  assessment_criteria?: AssessmentCriteria[];
  created_at: string;
  total_score?: number | null;
  notes?: string | null;
  recommendation?: string | null;
}

interface TasksPagination {
  data: Review[];
  current_page: number;
  last_page: number;
}

interface Props {
  tasks?: TasksPagination;
  assignments?: TasksPagination;
  progressReports?: TasksPagination;
  selectedReview?: Review | null;
}

export default function ReviewerIndex({ tasks, assignments, progressReports, selectedReview }: Props) {
  const taskData = tasks ?? assignments ?? progressReports;
  const [activeReview, setActiveReview] = useState<Review | null>(selectedReview ?? null);
  const getProposalTitle = (proposal?: Proposal | null) => proposal?.title ?? proposal?.judul ?? 'Proposal';
  const getProposalDescription = (proposal?: Proposal | null) => proposal?.description ?? proposal?.deskripsi ?? 'Proposal belum memiliki deskripsi tambahan.';
  const [isDialogOpen, setIsDialogOpen] = useState(Boolean(selectedReview));
  const [scoreInput, setScoreInput] = useState('');
  const [feedbackInput, setFeedbackInput] = useState('');
  const [recommendationInput, setRecommendationInput] = useState('');
  const [statusInput, setStatusInput] = useState('completed');

  useEffect(() => {
    if (selectedReview) {
      setActiveReview(selectedReview);
      setIsDialogOpen(true);
      setScoreInput(selectedReview.total_score?.toString() ?? '');
      setFeedbackInput(selectedReview.notes ?? '');
      setRecommendationInput(selectedReview.recommendation ?? '');
      setStatusInput(selectedReview.status ?? 'completed');
    } else {
      setActiveReview(null);
      setIsDialogOpen(false);
    }
  }, [selectedReview]);

  const openReviewDetails = (review: Review) => {
    setActiveReview(review);
    setIsDialogOpen(true);
    setScoreInput(review.total_score?.toString() ?? '');
    setFeedbackInput(review.notes ?? '');
    setRecommendationInput(review.recommendation ?? '');
    setStatusInput(review.status ?? 'completed');
  };

  const closeReviewDetails = () => {
    setIsDialogOpen(false);
    setActiveReview(null);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!activeReview) {
      return;
    }

    router.post(
      route('reviewer.assignments.submit-review', activeReview.id),
      {
        total_score: scoreInput,
        feedback: feedbackInput,
        recommendation: recommendationInput,
        status: statusInput,
      },
      {
        preserveScroll: true,
        onSuccess: () => {
          setIsDialogOpen(false);
        },
      },
    );
  };

  if (!taskData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Daftar Tugas Review</h1>
            <p className="text-sm text-slate-600">
              Review proposal yang ditugaskan kepada Anda.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-600">Belum ada tugas review untuk ditampilkan.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Daftar Tugas Review</h1>
          <p className="text-sm text-slate-600">
            Review proposal yang ditugaskan kepada Anda.
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Proposal</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Kriteria</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Tanggal</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-slate-600">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {taskData.data.map((task) => (
              <tr key={task.id}>
                <td className="px-4 py-4 text-sm text-slate-700">{getProposalTitle(task.proposal)}</td>
                <td className="px-4 py-4 text-sm text-slate-700">{task.status}</td>
                <td className="px-4 py-4 text-sm text-slate-700">
                  {task.assessment_criteria?.length ?? 0} kriteria
                </td>
                <td className="px-4 py-4 text-sm text-slate-700">
                  {new Date(task.created_at).toLocaleDateString('id-ID')}
                </td>
                <td className="px-4 py-4 text-right text-sm">
                  <button
                    type="button"
                    onClick={() => {
                      openReviewDetails(task);
                      router.get(route('reviewer.assignments.show', task.id), {}, { preserveState: true });
                    }}
                    className="inline-flex items-center rounded-full bg-slate-900 px-4 py-2 text-white hover:bg-slate-700"
                  >
                    Lihat
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) {
          closeReviewDetails();
        }
      }}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{getProposalTitle(activeReview?.proposal) ?? 'Detail Peninjauan Proposal'}</DialogTitle>
            <DialogDescription>
              Periksa dokumen proposal dan isi formulir evaluasi reviewer.
            </DialogDescription>
          </DialogHeader>

          {activeReview ? (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <h3 className="text-sm font-semibold text-slate-900">Ringkasan Proposal</h3>
                  <p className="mt-2 text-sm text-slate-700">
                    {getProposalDescription(activeReview.proposal)}
                  </p>

                  <div className="mt-4 rounded-lg border border-dashed border-slate-300 bg-white p-4">
                    <p className="text-sm font-medium text-slate-800">Dokumen Proposal</p>
                    <p className="mt-2 text-sm text-slate-600">
                      Dokumen pendukung proposal dapat ditampilkan di area ini saat lampiran siap diintegrasikan dari backend.
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <h3 className="text-sm font-semibold text-slate-900">Informasi Review</h3>
                  <dl className="mt-3 space-y-2 text-sm text-slate-700">
                    <div className="flex items-center justify-between gap-2">
                      <dt>Status</dt>
                      <dd className="font-medium">{activeReview.status}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <dt>Kriteria</dt>
                      <dd className="font-medium">{activeReview.assessment_criteria?.length ?? 0}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <dt>Tanggal</dt>
                      <dd className="font-medium">{new Date(activeReview.created_at).toLocaleDateString('id-ID')}</dd>
                    </div>
                  </dl>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700" htmlFor="score">
                      Skor Evaluasi
                    </label>
                    <Input
                      id="score"
                      type="number"
                      min="0"
                      max="100"
                      value={scoreInput}
                      onChange={(event) => setScoreInput(event.target.value)}
                      placeholder="Masukkan skor"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700" htmlFor="status">
                      Status Review
                    </label>
                    <select
                      id="status"
                      value={statusInput}
                      onChange={(event) => setStatusInput(event.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">Dalam Proses</option>
                      <option value="completed">Selesai</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700" htmlFor="feedback">
                    Umpan Balik
                  </label>
                  <Textarea
                    id="feedback"
                    value={feedbackInput}
                    onChange={(event) => setFeedbackInput(event.target.value)}
                    placeholder="Tuliskan catatan evaluasi untuk proposal ini"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700" htmlFor="recommendation">
                    Rekomendasi
                  </label>
                  <Textarea
                    id="recommendation"
                    value={recommendationInput}
                    onChange={(event) => setRecommendationInput(event.target.value)}
                    placeholder="Berikan rekomendasi lanjutan"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="inline-flex items-center rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
                  >
                    Simpan Penilaian
                  </button>
                </div>
              </form>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
