/**
 * FacultyTable Component
 *
 * @description
 * Rekapitulasi performa proposal dan penerimaan per fakultas.
 *
 * @author JurnalMU Team
 * @filepath /resources/js/components/FacultyTable.tsx
 */

import React from 'react';

interface FacultyPerformanceItem {
    faculty_name: string;
    submitted: number;
    accepted: number;
}

interface FacultyTableProps {
    data: FacultyPerformanceItem[];
}

export default function FacultyTable({ data }: FacultyTableProps) {
    return (
        <div className="overflow-hidden rounded-xl border border-sidebar-border/70 bg-white dark:border-sidebar-border dark:bg-neutral-950">
            <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm text-gray-500 dark:text-gray-400">
                    <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-neutral-900 dark:text-gray-300">
                        <tr>
                            <th scope="col" className="px-6 py-3 font-semibold">Nama Bidang / Fakultas</th>
                            <th scope="col" className="px-6 py-3 text-center font-semibold">Proposal Diajukan</th>
                            <th scope="col" className="px-6 py-3 text-center font-semibold">Proposal Diterima</th>
                            <th scope="col" className="px-6 py-3 text-center font-semibold">Rasio Keberhasilan</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-neutral-800">
                        {data.map((item, idx) => {
                            const rate = item.submitted > 0 ? Math.round((item.accepted / item.submitted) * 100) : 0;
                            return (
                                <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-neutral-900/50">
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{item.faculty_name}</td>
                                    <td className="px-6 py-4 text-center text-gray-900 dark:text-white">{item.submitted}</td>
                                    <td className="px-6 py-4 text-center text-gray-900 dark:text-white">{item.accepted}</td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                                            rate >= 70 ? 'bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400' :
                                            rate >= 40 ? 'bg-yellow-50 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400' :
                                            'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400'
                                        }`}>
                                            {rate}%
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
