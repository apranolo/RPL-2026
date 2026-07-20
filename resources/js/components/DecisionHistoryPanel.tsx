import React from 'react';

interface DecisionHistoryPanelProps {
    histories: any[];
}

export default function DecisionHistoryPanel({ histories }: DecisionHistoryPanelProps) {
    if (!histories || histories.length === 0) {
        return (
            <div className="rounded-lg border bg-white p-4 shadow mt-6">
                <h2 className="mb-4 text-lg font-semibold">Riwayat Keputusan</h2>
                <p className="text-sm text-gray-500">Belum ada riwayat keputusan.</p>
            </div>
        );
    }

    return (
        <div className="rounded-lg border bg-white p-4 shadow mt-6">
            <h2 className="mb-4 text-lg font-semibold">Riwayat Keputusan</h2>
            <div className="space-y-3">
                {histories.map((history, idx) => (
                    <div key={idx} className="border-l-2 border-blue-500 pl-3">
                        <p className="text-sm font-medium">{history.decision || 'No decision'}</p>
                        <p className="text-xs text-gray-500">{history.created_at || 'Unknown date'}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
