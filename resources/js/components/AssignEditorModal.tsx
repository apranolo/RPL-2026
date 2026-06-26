import { useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

interface User {
    id: number;
    name: string;
    email: string;
}

interface Props {
    registrationId: number;
    editors: User[];         // daftar user yang bisa dipilih sebagai Section Editor
    open: boolean;
    onClose: () => void;
}

export default function AssignEditorModal({ registrationId, editors, open, onClose }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        editor_id: '',
    });

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('editorial.desk.assign-editor', { registration: registrationId }), {
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    if (!open) return null;

    return (
        // Overlay
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">

                {/* Header */}
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">
                        Tugaskan Section Editor
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        ✕
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label
                            htmlFor="editor_id"
                            className="mb-1 block text-sm font-medium text-gray-700"
                        >
                            Pilih Section Editor
                        </label>
                        <select
                            id="editor_id"
                            value={data.editor_id}
                            onChange={(e) => setData('editor_id', e.target.value)}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                            <option value="">-- Pilih Editor --</option>
                            {editors.map((editor) => (
                                <option key={editor.id} value={editor.id}>
                                    {editor.name} ({editor.email})
                                </option>
                            ))}
                        </select>

                        {errors.editor_id && (
                            <p className="mt-1 text-sm text-red-600">{errors.editor_id}</p>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-2 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={processing || !data.editor_id}
                            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                            {processing ? 'Menyimpan...' : 'Tugaskan'}
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
}