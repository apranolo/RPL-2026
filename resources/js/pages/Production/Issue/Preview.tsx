import PublishChecklist from '@/components/Production/PublishChecklist';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';

interface Galley {
    id: number;
    id_submission: number;
    id_issue: number | null;
    file_path: string;
    file_extension: string;
    doi: string | null;
    pages: string | null;
    sequence: number;
    file_url?: string | null;
}

interface Article {
    id: number;
    title: string;
    status: string;
    author?: {
        id: number;
        name: string;
    } | null;
    galley: Galley;
}

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
    return (
        <AppLayout>
            <Head
                title={`Preview Issue - Volume ${issue.volume} No. ${issue.number}`}
            />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold">
                        Preview Issue
                    </h1>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Periksa kembali informasi issue dan daftar artikel
                        sebelum menerbitkannya ke publik.
                    </p>
                </div>

                {/* Informasi Issue */}
                <Card>
                    <CardHeader>
                        <CardTitle>
                            {issue.journal.title}
                        </CardTitle>
                    </CardHeader>

                    <CardContent>
                        <div className="flex flex-col gap-6 md:flex-row">
                            {issue.cover_image_url && (
                                <div className="shrink-0">
                                    <img
                                        src={issue.cover_image_url}
                                        alt={`Cover ${issue.title}`}
                                        className="w-40 rounded-md border object-cover shadow-sm"
                                    />
                                </div>
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

                {/* Table of Contents */}
                <Card>
                    <CardHeader>
                        <CardTitle>
                            Table of Contents
                        </CardTitle>
                    </CardHeader>

                    <CardContent>
                        {articles.length === 0 ? (
                            <div className="py-8 text-center">
                                <p className="text-sm text-muted-foreground">
                                    Belum ada artikel pada issue ini.
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y">
                                {articles.map((article, index) => (
                                    <div
                                        key={article.galley.id}
                                        className="py-5 first:pt-0 last:pb-0"
                                    >
                                        <div className="flex gap-4">
                                            {/* Nomor Urut */}
                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium">
                                                {index + 1}
                                            </div>

                                            {/* Informasi Artikel */}
                                            <div className="min-w-0 flex-1">
                                                <h3 className="font-semibold">
                                                    {article.title}
                                                </h3>

                                                <p className="mt-1 text-sm text-muted-foreground">
                                                    Penulis:{' '}
                                                    {article.author?.name ||
                                                        'Unknown Author'}
                                                </p>

                                                <div className="mt-2 space-y-1 text-sm">
                                                    {article.galley.pages && (
                                                        <p>
                                                            Halaman:{' '}
                                                            {
                                                                article.galley
                                                                    .pages
                                                            }
                                                        </p>
                                                    )}

                                                    {article.galley.doi && (
                                                        <p>
                                                            DOI:{' '}
                                                            {
                                                                article.galley
                                                                    .doi
                                                            }
                                                        </p>
                                                    )}

                                                    {article.galley
                                                        .file_extension && (
                                                        <p>
                                                            Format:{' '}
                                                            {article.galley.file_extension.toUpperCase()}
                                                        </p>
                                                    )}
                                                </div>

                                                {article.galley.file_url && (
                                                    <a
                                                        href={
                                                            article.galley
                                                                .file_url
                                                        }
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="mt-2 inline-block text-sm font-medium text-primary hover:underline"
                                                    >
                                                        Lihat Berkas
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Publish Checklist */}
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