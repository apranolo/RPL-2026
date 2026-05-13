import React from 'react';

export type ReviewMatrixReviewer = {
  id: number | string;
  name: string;
};

export type ReviewMatrixCriterion = {
  id: number | string;
  name: string;
};

export type ReviewMatrixCell = {
  score: number | null;
  note: string | null;
};

type Props = {
  reviewers: ReviewMatrixReviewer[];
  criteria: ReviewMatrixCriterion[];
  // cells[criterionName][reviewerId] -> { score, note }
  cells: Record<string, Record<string, ReviewMatrixCell>>;
};

export default function ReviewMatrixTable({ reviewers, criteria, cells }: Props) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200/60 bg-white/50 backdrop-blur-md shadow-sm">
      <table className="w-full table-auto border-collapse">
        <thead>
          <tr className="bg-gray-50/80 border-b border-gray-200">
            <th className="min-w-[200px] px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-gray-400">
              Criteria
            </th>
            {reviewers.map((r) => (
              <th
                key={r.id}
                className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-gray-400 whitespace-nowrap"
              >
                {r.name}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100">
          {criteria.map((c) => {
            const criterionKey = String(c.id);
            const criterionCells = cells?.[criterionKey] ?? {};

            return (
              <tr key={c.id} className="group hover:bg-blue-50/30 transition-colors duration-200">
                <td className="px-6 py-5 text-sm font-semibold text-gray-700 group-hover:text-blue-600 transition-colors">
                  {c.name}
                </td>

                {reviewers.map((r) => {
                  const reviewerKey = String(r.id);
                  const cell = criterionCells?.[reviewerKey];

                  const score = cell?.score ?? null;
                  const displayScore = score === null ? '—' : score;
                  const isHigh = typeof score === 'number' && score >= 80;

                  return (
                    <td key={`${r.id}-${c.id}`} className="px-6 py-5">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center justify-center w-9 h-9 rounded-lg font-black text-sm shadow-inner ${
                              score !== null && isHigh
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-amber-100 text-amber-700'
                            }`}
                          >
                            {displayScore}
                          </span>
                        </div>

                        <p
                          className={`text-xs leading-relaxed max-w-[200px] ${
                            cell?.note ? 'text-gray-500 italic' : 'text-gray-300'
                          }`}
                        >
                          {cell?.note ? `"${cell.note}"` : 'No comments provided'}
                        </p>
                      </div>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}