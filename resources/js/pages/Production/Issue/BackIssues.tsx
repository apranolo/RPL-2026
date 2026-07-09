import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Issue {
    id: number;
    title: string;
    volume: number;
    number: number;
    publication_date: string;
}

interface Props {
    issues: Issue[];
}

export default function BackIssues({ issues }: Props) {
    return (
        <AppLayout>
            <Head title="Back Issues" />

            <div className="space-y-6 p-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Back Issues</CardTitle>
                    </CardHeader>

                    <CardContent>
                        {issues.length === 0 ? (
                            <p>Belum ada issue yang dipublish.</p>
                        ) : (
                            <table className="w-full border">
                                <thead>
                                    <tr className="border-b">
                                        <th className="p-2 text-left">Volume</th>
                                        <th className="p-2 text-left">Issue</th>
                                        <th className="p-2 text-left">Title</th>
                                        <th className="p-2 text-left">Publication Date</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {issues.map((issue) => (
                                        <tr key={issue.id} className="border-b">
                                            <td className="p-2">
                                                {issue.volume}
                                            </td>

                                            <td className="p-2">
                                                {issue.number}
                                            </td>

                                            <td className="p-2">
                                                {issue.title}
                                            </td>

                                            <td className="p-2">
                                                {issue.publication_date}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}