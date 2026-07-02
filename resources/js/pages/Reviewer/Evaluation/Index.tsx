import { Link } from '@inertiajs/react';

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
  title: string;
}

interface Review {
  id: number;
  proposal: Proposal;
  status: string;
  assessmentCriteria: AssessmentCriteria[];
  created_at: string;
}

interface TasksPagination {
  data: Review[];
  current_page: number;
  last_page: number;
}

interface Props {
  tasks: TasksPagination;
}

export default function ReviewerIndex({ tasks }: Props) {
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
            {tasks.data.map((task) => (
              <tr key={task.id}>
                <td className="px-4 py-4 text-sm text-slate-700">{task.proposal.title}</td>
                <td className="px-4 py-4 text-sm text-slate-700">{task.status}</td>
                <td className="px-4 py-4 text-sm text-slate-700">
                  {task.assessmentCriteria.length} kriteria
                </td>
                <td className="px-4 py-4 text-sm text-slate-700">
                  {new Date(task.created_at).toLocaleDateString('id-ID')}
                </td>
                <td className="px-4 py-4 text-right text-sm">
                  <Link
                    href="#"
                    className="inline-flex items-center rounded-full bg-slate-900 px-4 py-2 text-white hover:bg-slate-700"
                  >
                    Lihat
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}