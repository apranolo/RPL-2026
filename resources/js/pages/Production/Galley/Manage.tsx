import React, { useState } from "react";
import axios from "axios";

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
    const [file, setFile] = useState<File | null>(null);
    const [label, setLabel] = useState("PDF");
    const [loading, setLoading] = useState(false);

    const handleUpload = async () => {
        if (!file) return alert("File belum dipilih");

        const formData = new FormData();
        formData.append("file", file);
        formData.append("label", label);

        setLoading(true);

        try {
            await axios.post(
                `/production/articles/${article.id}/galleys`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            alert("Upload berhasil");
            window.location.reload();
        } catch (err) {
            alert("Upload gagal");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: 20 }}>
            <h2>Galley Management</h2>

            {/* LIST GALLEY */}
            <div>
                <h3>Daftar Galley</h3>

                {galleys?.length === 0 && <p>Belum ada file</p>}

                <ul>
                    {galleys?.map((g) => (
                        <li key={g.id}>
                            <b>{g.label}</b>{" "}
                            <a
                                href={`/storage/${g.file_path}`}
                                target="_blank"
                            >
                                View
                            </a>
                        </li>
                    ))}
                </ul>
            </div>

            <hr />

            {/* UPLOAD SECTION */}
            <div>
                <h3>Upload Galley</h3>

                <select
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                >
                    <option value="PDF">PDF</option>
                    <option value="HTML">HTML</option>
                    <option value="XML">XML</option>
                </select>

                <br /><br />

                <input
                    type="file"
                    onChange={(e) =>
                        setFile(e.target.files?.[0] || null)
                    }
                />

                <br /><br />

                <button onClick={handleUpload} disabled={loading}>
                    {loading ? "Uploading..." : "Upload"}
                </button>
            </div>
        </div>
    );
}