import React, { useState, useRef, useEffect } from 'react';

export interface MultiSelectOption {
    label: string;
    value: string | number;
}

interface MultiSelectFilterProps {
    label: string;
    options: MultiSelectOption[];
    selectedValues: (string | number)[];
    onChange: (values: (string | number)[]) => void;
    placeholder?: string;
}

export default function MultiSelectFilter({
    label,
    options,
    selectedValues,
    onChange,
    placeholder = 'Pilih filter...',
}: MultiSelectFilterProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleOutsideClick = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleOutsideClick);
        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, []);

    const toggleOption = (value: string | number) => {
        const newSelectedValues = selectedValues.includes(value)
            ? selectedValues.filter((v) => v !== value)
            : [...selectedValues, value];
        onChange(newSelectedValues);
    };

    const clearSelection = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange([]);
    };

    const getSelectedLabels = () => {
        if (selectedValues.length === 0) return placeholder;
        if (selectedValues.length === 1) {
            return options.find((opt) => opt.value === selectedValues[0])?.label || placeholder;
        }
        return `${selectedValues.length} dipilih`;
    };

    return (
        <div className="relative w-full" ref={containerRef}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                {label}
            </label>
            <div
                className="relative flex items-center justify-between w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors duration-200"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex flex-wrap gap-1 overflow-hidden truncate">
                    <span className={`block truncate ${selectedValues.length === 0 ? 'text-gray-400' : 'text-gray-900'}`}>
                        {getSelectedLabels()}
                    </span>
                </div>
                <div className="flex items-center gap-1">
                    {selectedValues.length > 0 && (
                        <button
                            type="button"
                            onClick={clearSelection}
                            className="p-1 text-gray-400 hover:text-gray-600 focus:outline-none"
                            title="Hapus semua"
                        >
                            <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                        </button>
                    )}
                    <svg className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                </div>
            </div>

            {isOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto focus:outline-none custom-scrollbar animate-in fade-in slide-in-from-top-1">
                    <ul className="py-1 text-base sm:text-sm">
                        {options.map((option) => {
                            const isSelected = selectedValues.includes(option.value);
                            return (
                                <li
                                    key={option.value}
                                    className={`relative py-2 pl-3 pr-9 cursor-pointer select-none hover:bg-indigo-50 transition-colors ${
                                        isSelected ? 'text-indigo-900 bg-indigo-50/50' : 'text-gray-900'
                                    }`}
                                    onClick={() => toggleOption(option.value)}
                                >
                                    <span className={`block truncate ${isSelected ? 'font-medium' : 'font-normal'}`}>
                                        {option.label}
                                    </span>
                                    {isSelected && (
                                        <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-indigo-600">
                                            <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                                        </span>
                                    )}
                                </li>
                            );
                        })}
                        {options.length === 0 && (
                            <li className="py-2 pl-3 pr-9 text-gray-500 text-sm italic">
                                Tidak ada opsi tersedia
                            </li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
}
