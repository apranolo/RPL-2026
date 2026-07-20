import React from 'react';

interface DecisionHistory {
    id: number;
    decision: string;
    note?: string;
    created_at?: string;
}

interface Props {
    histories: DecisionHistory[];
}

export default function DecisionHistoryPanel({ histories }: Props) {
    if (!histories || histories.length === 0) return null;

    return (
        <div className="rounded-lg border bg-white p-4 shadow mt-4">
            <h3 className="mb-2 text-lg font-semibold">Riwayat Keputusan</h3>
            <ul className="space-y-2">
                {histories.map((h, i) => (
                    <li key={i} className="text-sm border-b pb-2 last:border-0">
                        <span className="font-medium text-gray-700">{h.decision}</span>
                        {h.note && <p className="text-gray-500">{h.note}</p>}
                    </li>
                ))}
            </ul>
        </div>
    );
}
