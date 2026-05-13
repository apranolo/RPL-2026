import React from 'react';
import { Head, useForm } from '@inertiajs/react';

export default function Index({ articles, filters }) {
    const { data, setData, get } = useForm({
        q: filters.q || '',
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        get(route('public.search'));
    };

    return (
        <div className="p-8">
            <Head title="Search Research Outputs" />
            
            <form onSubmit={handleSearch} className="mb-8">
                <input 
                    type="text" 
                    value={data.q}
                    onChange={e => setData('q', e.target.value)}
                    placeholder="Search titles, authors..."
                    className="border p-2 rounded w-full max-w-md text-black"
                />
                <button type="submit" className="ml-2 bg-blue-600 text-white p-2 rounded">
                    Search
                </button>
            </form>

            <div className="grid gap-4">
                {articles.data.map((article: any) => (
                    <div key={article.id} className="border p-4 rounded shadow-sm">
                        <h2 className="text-xl font-bold">{article.title}</h2>
                        <p className="text-gray-600">Journal: {article.journal?.title}</p>
                        <p className="mt-2">{article.abstract?.substring(0, 200)}...</p>
                    </div>
                ))}
            </div>
        </div>
    );
}