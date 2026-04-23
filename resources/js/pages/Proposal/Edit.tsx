import React from 'react';
import { useForm } from '@inertiajs/react';

type Proposal = {
    id: number;
    judul: string;
    deskripsi: string;
};

export default function Edit({ proposal }: { proposal: Proposal }) {
    const { data, setData, put, processing, errors } = useForm({
        judul: proposal.judul || '',
        deskripsi: proposal.deskripsi || '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/proposal/${proposal.id}`);
    };

    return (
        <div>
            <h1>Edit Proposal</h1>

            <form onSubmit={submit}>
                <div>
                    <label>Judul</label>
                    <input
                        type="text"
                        value={data.judul}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setData('judul', e.target.value)
                        }
                    />
                    {errors.judul && <div>{errors.judul}</div>}
                </div>

                <div>
                    <label>Deskripsi</label>
                    <textarea
                        value={data.deskripsi}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                            setData('deskripsi', e.target.value)
                        }
                    />
                    {errors.deskripsi && <div>{errors.deskripsi}</div>}
                </div>

                <button type="submit" disabled={processing}>
                    Update
                </button>
            </form>
        </div>
    );
}
