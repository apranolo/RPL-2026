import React, { useState } from "react";
import { router } from "@inertiajs/react";

export default function Step2Upload({ onBack }: any) {
    const [manuscript, setManuscript] = useState<File | null>(null);
    const [supplementaryFiles, setSupplementaryFiles] = useState<File[]>([]);
    const [loading, setLoading] = useState(false);

    const textDark = { color: "#1f2937" };
    const textMuted = { color: "#6b7280" };

    const handleSubmit = () => {

        if (!manuscript) {
            alert("File manuscript belum dipilih!");
            return;
        }

        const formData = new FormData();

        // file utama
        formData.append("manuscript", manuscript);

        // supplementary files (opsional)
        supplementaryFiles.forEach((file, index) => {
            formData.append(`supplementary_files[${index}]`, file);
        });

        setLoading(true);

        router.post(
            "/wizard/step-2-upload",
            formData,
            {
                forceFormData: true,

                onSuccess: () => {
                    alert("Upload berhasil!");
                },

                onError: (errors) => {
                    console.log("UPLOAD ERROR:", errors);
                    alert("Upload gagal");
                },

                onFinish: () => {
                    setLoading(false);
                }
            }
        );
    };

    return (
        <div
            className="p-8 bg-white rounded-xl shadow-lg space-y-6 max-w-2xl mx-auto my-10 border border-gray-100"
            style={{ backgroundColor: "#ffffff" }}
        >
            <div>
                <h2
                    className="text-2xl font-bold"
                    style={textDark}
                >
                    Step 2 - Upload File
                </h2>

                <p
                    className="text-sm mt-1"
                    style={textMuted}
                >
                    Silakan unggah dokumen naskah jurnal Anda di bawah ini.
                </p>
            </div>

            <hr className="border-gray-200" />

            {/* Manuscript Utama */}
            <div className="space-y-2">
                <label
                    className="block text-sm font-semibold"
                    style={textDark}
                >
                    Manuscript Utama (PDF / DOC / DOCX)
                    <span className="text-red-500"> *</span>
                </label>

                <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) =>
                        setManuscript(
                            e.target.files?.[0] || null
                        )
                    }
                    className="w-full text-sm border p-2 rounded-lg cursor-pointer bg-gray-50"
                    style={{ color: "#1f2937" }}
                />
            </div>

            {/* Supplementary Files */}
            <div className="space-y-2">
                <label
                    className="block text-sm font-semibold"
                    style={textDark}
                >
                    Supplementary Files / File Tambahan
                    <span
                        className="text-xs"
                        style={textMuted}
                    >
                        {" "}
                        (Opsional)
                    </span>
                </label>

                <input
                    type="file"
                    multiple
                    onChange={(e) =>
                        setSupplementaryFiles(
                            e.target.files
                                ? Array.from(e.target.files)
                                : []
                        )
                    }
                    className="w-full text-sm border p-2 rounded-lg cursor-pointer bg-gray-50"
                    style={{ color: "#1f2937" }}
                />
            </div>

            {/* Tombol Navigasi */}
            <div className="flex justify-between pt-6 border-t border-gray-100">

                <button
                    onClick={onBack}
                    type="button"
                    className="px-5 py-2.5 bg-gray-200 hover:bg-gray-300 font-medium rounded-lg transition"
                    style={{ color: "#374151" }}
                >
                    Kembali
                </button>

                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    type="button"
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition shadow-md disabled:opacity-50"
                >
                    {loading
                        ? "Mengunggah..."
                        : "Lanjut ke Step 3"}
                </button>

            </div>
        </div>
    );
}