/**
 * @file GlobalSearch.tsx
 * @description Komponen widget pencarian global melayang dengan ikon pencarian dan tombol pembersihan cepat (clear).
 * @author Tutur Pryambadha <@AamPryambadha>
 * @copyright 2026 RPL-2026 Project
 */

import { Search, X } from 'lucide-react'; // Menggunakan lucide-react untuk ikon standard
import React, { useState } from 'react';

interface GlobalSearchProps {
    onSearch: (query: string) => void;
    placeholder?: string;
}

export default function GlobalSearch({ onSearch, placeholder = 'Cari luaran publik...' }: GlobalSearchProps) {
    const [query, setQuery] = useState('');

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch(query);
    };

    const handleClear = () => {
        setQuery('');
        onSearch('');
    };

    return (
        <form onSubmit={handleSearchSubmit} className="relative mx-auto w-full max-w-md">
            <div className="relative flex items-center">
                {/* Ikon Search di sebelah Kiri */}
                <div className="pointer-events-none absolute left-3 text-zinc-400">
                    <Search className="h-5 w-5" />
                </div>

                {/* Input Text Box */}
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={placeholder}
                    className="w-full rounded-lg border border-zinc-300 bg-white py-2 pr-10 pl-10 text-sm text-zinc-900 shadow-sm transition-all focus:border-transparent focus:ring-2 focus:ring-primary focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />

                {/* Tombol Clear (X) di sebelah Kanan jika ada teks input */}
                {query && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="absolute right-3 rounded-full p-1 text-zinc-400 transition-colors hover:text-zinc-600 focus:outline-none dark:hover:text-zinc-200"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>
        </form>
    );
}
