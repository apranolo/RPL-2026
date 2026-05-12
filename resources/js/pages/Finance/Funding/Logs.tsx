import { Head } from '@inertiajs/react';

interface FundingLog {
    id: number;
    termin: string;
    nominal: number;
    status: string;
    updated_at: string;
    project?: {
        name: string;
    };
    updated_by?: {
        name: string;
    };
}

interface Props {
    logs: {
        data: FundingLog[];
    };
}

export default function Logs({ logs }: Props) {
    return (
        <>
            <Head title="Log Perubahan Termin" />

            <div className="p-6">
                <h1 className="text-2xl font-bold mb-4">
                    Riwayat Perubahan Termin
                </h1>

                <div className="overflow-x-auto bg-white rounded shadow">
                    <table className="min-w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border p-3 text-left">Project</th>
                                <th className="border p-3 text-left">Termin</th>
                                <th className="border p-3 text-left">Nominal</th>
                                <th className="border p-3 text-left">Status</th>
                                <th className="border p-3 text-left">Updated By</th>
                                <th className="border p-3 text-left">Updated At</th>
                            </tr>
                        </thead>

                        <tbody>
                            {logs.data.map((log) => (
                                <tr key={log.id}>
                                    <td className="border p-3">
                                        {log.project?.name ?? '-'}
                                    </td>

                                    <td className="border p-3">
                                        {log.termin}
                                    </td>

                                    <td className="border p-3">
                                        Rp {Number(log.nominal).toLocaleString('id-ID')}
                                    </td>

                                    <td className="border p-3">
                                        {log.status}
                                    </td>

                                    <td className="border p-3">
                                        {log.updated_by?.name ?? '-'}
                                    </td>

                                    <td className="border p-3">
                                        {new Date(log.updated_at).toLocaleString('id-ID')}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}