import ArticleSequencer, {
    Galley,
    Submission,
} from '@/components/ArticleSequencer';
import PublishChecklist from '@/components/Production/PublishChecklist';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { useState } from 'react';

interface Issue {
    id: number;
    journal_id: number;
    title: string;
    volume: number;
    number: number;
    year: number;
    publication_date?: string | null;
    cover_image_url?: string | null;
    journal: {
        title: string;
    };
}

interface PublishReadiness {
    metadataComplete: boolean;
    hasArticles: boolean;
    tocComplete: boolean;
}

type Article = Submission & {
    galley: Galley;
};

interface Props {
    issue: Issue;
    articles: Article[];
    publishReadiness: PublishReadiness;
}

export default function Preview({
    issue,
    articles,
    publishReadiness,
}: Props) {
    const [orderedArticles, setOrderedArticles] =
        useState<Article[]>(articles);

    const handleOrderChange = (orderedIds: number[]) => {
        const reordered = orderedIds
            .map((galleyId) =>
                orderedArticles.find(
                    (article) => article.galley.id === galleyId,
                ),
            )
            .filter((article): article is Article => article !== undefined);

        setOrderedArticles(reordered);
    };

    return (
        <AppLayout>
            <Head
                title={`Preview Issue - Volume ${issue.volume} No. ${issue.number}`}
            />

            <div className="space-y-6 p-6">
                <div>
                    <h1 className="text-2xl font-bold">
                        Preview Issue
                    </h1>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Periksa informasi issue dan urutan artikel sebelum
                        menerbitkannya ke publik.
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>
                            {issue.journal.title}
                        </CardTitle>
                    </CardHeader>

                    <CardContent>
                        <div className="flex flex-col gap-6 md:flex-row">
                            {issue.cover_image_url && (
                                <img
                                    src={issue.cover_image_url}
                                    alt={`Cover ${issue.title}`}
                                    className="w-40 rounded-md border object-cover shadow-sm"
                                />
                            )}

                            <div className="space-y-2">
                                <h2 className="text-xl font-bold">
                                    Volume {issue.volume}, Nomor {issue.number}
                                    {issue.year && ` (${issue.year})`}
                                </h2>

                                {issue.title && (
                                    <p className="font-medium">
                                        {issue.title}
                                    </p>
                                )}

                                {issue.publication_date && (
                                    <p className="text-sm text-muted-foreground">
                                        Tanggal Publikasi:{' '}
                                        {issue.publication_date}
                                    </p>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>
                            Table of Contents
                        </CardTitle>
                    </CardHeader>

                    <CardContent>
                        {orderedArticles.length === 0 ? (
                            <div className="py-8 text-center">
                                <p className="text-sm text-muted-foreground">
                                    Belum ada artikel pada issue ini.
                                </p>
                            </div>
                        ) : (
                            <ArticleSequencer
                                articles={orderedArticles}
                                onOrderChange={handleOrderChange}
                            />
                        )}
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <PublishChecklist
                        journalId={issue.journal_id}
                        volume={issue.volume}
                        issue={issue.number}
                        metadataComplete={
                            publishReadiness.metadataComplete
                        }
                        hasArticles={
                            publishReadiness.hasArticles
                        }
                        tocComplete={
                            publishReadiness.tocComplete
                        }
                    />
                </div>
            </div>
        </AppLayout>
    );
}