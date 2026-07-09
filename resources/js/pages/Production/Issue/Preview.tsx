import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PublishChecklist from '@/components/Production/PublishChecklist';

interface Article {
    id: number;
    title: string;
    authors: string[] | string;
    pages: string;
    doi: string | null;
    article_url: string | null;
}

interface Issue {
    id: number;
    journal_id: number;
    title: string;
    volume: number;
    number: number;
    year: number;
    publication_date: string;
    cover_image_url: string | null;
    journal: {
        title: string;
    };
}

interface Props {
    issue: Issue;
    articles: Article[];
}

export default function Preview({ issue, articles }: Props) {
    return (
        <AppLayout>
            <Head title="Preview Issue" />

            <div className="space-y-6 p-6">
                <Card>
                    <CardHeader>
                        <CardTitle>{issue.journal.title}</CardTitle>
                    </CardHeader>

                    <CardContent>
                        {issue.cover_image_url && (
                            <img
                                src={issue.cover_image_url}
                                alt="Cover Issue"
                                className="mb-4 w-48 rounded"
                            />
                        )}

                        <h2 className="text-2xl font-bold">
                            Volume {issue.volume} No. {issue.number}
                        </h2>

                        <p>{issue.title}</p>

                        <p className="text-gray-500">
                            {issue.publication_date}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Table of Contents</CardTitle>
                    </CardHeader>

                    <CardContent>
                        {articles.length === 0 ? (
                            <p className="text-gray-500">
                                Belum ada artikel pada issue ini.
                            </p>
                        ) : (
                            articles.map((article) => (
                                <div
                                    key={article.id}
                                    className="border-b py-4 last:border-b-0"
                                >
                                    <h3 className="font-semibold">
                                        {article.title}
                                    </h3>

                                    <p className="text-sm text-gray-600">
                                        {Array.isArray(article.authors)
                                            ? article.authors.join(', ')
                                            : article.authors}
                                    </p>

                                    {article.pages && (
                                        <p className="text-sm">
                                            Halaman: {article.pages}
                                        </p>
                                    )}

                                    {article.doi && (
                                        <p className="text-sm">
                                            DOI: {article.doi}
                                        </p>
                                    )}

                                    {article.article_url && (
                                        <a
                                            href={article.article_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:underline"
                                        >
                                            Lihat Artikel
                                        </a>
                                    )}
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <PublishChecklist
                        journalId={issue.journal_id}
                        volume={issue.volume}
                        issue={issue.number}
                    />
                </div>
            </div>
        </AppLayout>
    );
}