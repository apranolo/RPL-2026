import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Article {
    id: number;
    title: string;
    authors: string[];
    pages: string;
    doi: string | null;
    article_url: string | null;
}

interface Issue {
    id: number;
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
            <Head title="Issue Preview" />

            <div className="space-y-6 p-6">

                <Card>
                    <CardHeader>
                        <CardTitle>
                            {issue.journal.title}
                        </CardTitle>
                    </CardHeader>

                    <CardContent>

                        {issue.cover_image_url && (
                            <img
                                src={issue.cover_image_url}
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
                        <CardTitle>Articles</CardTitle>
                    </CardHeader>

                    <CardContent>

                        {articles.map((article) => (

                            <div
                                key={article.id}
                                className="border-b py-4"
                            >

                                <h3 className="font-semibold">
                                    {article.title}
                                </h3>

                                <p>
                                    {Array.isArray(article.authors)
                                        ? article.authors.join(', ')
                                        : article.authors}
                                </p>

                                <p>{article.pages}</p>

                                {article.doi && (
                                    <p>DOI: {article.doi}</p>
                                )}

                                {article.article_url && (
                                    <a
                                        href={article.article_url}
                                        target="_blank"
                                        className="text-blue-600"
                                    >
                                        View Article
                                    </a>
                                )}

                            </div>

                        ))}

                    </CardContent>
                </Card>

                <Button>
                    Publish Issue
                </Button>

            </div>
        </AppLayout>
    );
}