import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';

interface Journal {
    id: number;
    title: string;
}

interface Issue {
    id: number;
    title?: string | null;
    volume: number;
    number: number;
    year: number;
    publication_date?: string | null;
}

interface Props {
    journal: Journal;
    issues: Issue[];
}

export default function BackIssues({
    journal,
    issues,
}: Props) {
    return (
        <AppLayout>
            <Head title={`Back Issues - ${journal.title}`} />

            <div className="space-y-6 p-6">
                <div>
                    <h1 className="text-2xl font-bold">
                        Back Issues
                    </h1>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Arsip seluruh issue yang telah diterbitkan pada{' '}
                        {journal.title}.
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>
                            Arsip Terbitan
                        </CardTitle>
                    </CardHeader>

                    <CardContent>
                        {issues.length === 0 ? (
                            <div className="py-8 text-center">
                                <p className="text-sm text-muted-foreground">
                                    Belum ada issue yang diterbitkan.
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="p-3 text-left">
                                                Volume
                                            </th>

                                            <th className="p-3 text-left">
                                                Nomor
                                            </th>

                                            <th className="p-3 text-left">
                                                Tahun
                                            </th>

                                            <th className="p-3 text-left">
                                                Judul
                                            </th>

                                            <th className="p-3 text-left">
                                                Tanggal Publikasi
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {issues.map((issue) => (
                                            <tr
                                                key={issue.id}
                                                className="border-b last:border-b-0"
                                            >
                                                <td className="p-3">
                                                    {issue.volume}
                                                </td>

                                                <td className="p-3">
                                                    {issue.number}
                                                </td>

                                                <td className="p-3">
                                                    {issue.year}
                                                </td>

                                                <td className="p-3">
                                                    {issue.title || '-'}
                                                </td>

                                                <td className="p-3">
                                                    {issue.publication_date ||
                                                        '-'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}