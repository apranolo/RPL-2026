/**
 * -----------------------------------------------------------------------------
 * Production Galley Management Page
 *
 * Manage galley upload and assign article to issue.
 * -----------------------------------------------------------------------------
 */

import AppLayout from "@/layouts/app-layout";
import { type BreadcrumbItem } from "@/types";
import { useForm } from "@inertiajs/react";

type Galley = {
    id: number;
    label: string;
    file_path: string;
};

type Article = {
    id: number;
    title?: string;
};

type Props = {
    article: Article;
    galleys: Galley[];
};

export default function Manage({ article, galleys }: Props) {
    const { data, setData, post, processing } = useForm({
        file: null as File | null,
        label: "PDF",
    });

    const handleUpload = () => {
        if (!data.file) {
            alert("File belum dipilih");
            return;
        }

        post(`/production/articles/${article.id}/galleys`, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                alert("Upload berhasil");
            },
            onError: () => {
                alert("Upload gagal");
            },
        });
    };

    const breadcrumbs: BreadcrumbItem[] = [
    {
        title: "Galley Management",
        href: `/production/articles/${article.id}/galleys`,
    },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="p-6">
                <h2 className="mb-6 text-2xl font-bold">
                    Galley Management
                </h2>

                {/* LIST GALLEY */}
                <div className="mb-8">
                    <h3 className="mb-3 text-lg font-semibold">
                        Daftar Galley
                    </h3>

                    {galleys.length === 0 ? (
                        <p className="text-gray-500">
                            Belum ada file.
                        </p>
                    ) : (
                        <ul className="space-y-2">
                            {galleys.map((g) => (
                                <li
                                    key={g.id}
                                    className="flex items-center gap-3"
                                >
                                    <span className="font-medium">
                                        {g.label}
                                    </span>

                                    <a
                                        href={`/storage/${g.file_path}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline"
                                    >
                                        View
                                    </a>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <hr className="my-6" />

                {/* UPLOAD */}
                <div>
                    <h3 className="mb-4 text-lg font-semibold">
                        Upload Galley
                    </h3>

                    <select
                        className="rounded border px-3 py-2"
                        value={data.label}
                        onChange={(e) =>
                            setData("label", e.target.value)
                        }
                    >
                        <option value="PDF">PDF</option>
                        <option value="HTML">HTML</option>
                        <option value="XML">XML</option>
                    </select>

                    <div className="mt-4">
                        <input
                            type="file"
                            onChange={(e) =>
                                setData(
                                    "file",
                                    e.target.files?.[0] ?? null
                                )
                            }
                        />
                    </div>

                    <button
                        type="button"
                        onClick={handleUpload}
                        disabled={processing}
                        className="mt-4 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {processing ? "Uploading..." : "Upload"}
                    </button>
                </div>
            </div>
        </AppLayout>
    );
}