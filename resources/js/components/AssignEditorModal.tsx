/**
 * @file AssignEditorModal.tsx
 * @description Modal untuk menugaskan Section Editor ke submission naskah ilmiah.
 *              Menampilkan dropdown daftar editor yang tersedia dan mengirim
 *              request penugasan ke server via Inertia.js.
 * @module Editorial/Components
 * @author 2300018400
 */

import { useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

interface Editor {
    id: number;
    name: string;
    email: string;
}

interface Props {
    submissionId: number;
    editors: Editor[];
    open: boolean;
    onClose: () => void;
}

/**
 * Modal penugasan Section Editor ke submission.
 */
export default function AssignEditorModal({ submissionId, editors, open, onClose }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        editor_id: '',
    });

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('editorial.desk.assign-editor', { submission: submissionId }), {
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
            <div className="w-full max-w-md rounded-lg border border-border bg-background p-6 shadow-xl">
                {/* Header */}
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-foreground">Tugaskan Section Editor</h2>
                    <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground">
                        ✕
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="editor_id" className="mb-1 block text-sm font-medium text-foreground">
                            Pilih Section Editor <span className="text-destructive">*</span>
                        </label>
                        <select
                            id="editor_id"
                            value={data.editor_id}
                            onChange={(e) => setData('editor_id', e.target.value)}
                            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                        >
                            <option value="">-- Pilih Editor --</option>
                            {editors.map((editor) => (
                                <option key={editor.id} value={editor.id}>
                                    {editor.name} ({editor.email})
                                </option>
                            ))}
                        </select>

                        {errors.editor_id && <p className="mt-1 text-sm text-destructive">{errors.editor_id}</p>}
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-2 border-t border-border pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={processing || !data.editor_id}
                            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                        >
                            {processing ? 'Menyimpan...' : 'Tugaskan'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
