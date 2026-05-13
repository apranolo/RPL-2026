import React from 'react';

interface Option {
    value: string;
    label: string;
}

interface Props {
    options: Option[];
    selectedValues: string[];
    onChange: (values: string[]) => void;
    placeholder?: string;
}

const MultiSelectFilter: React.FC<Props> = ({ options, selectedValues, onChange, placeholder }) => {
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const values = Array.from(e.target.selectedOptions, option => option.value);
        onChange(values);
    };

    return (
        <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">{placeholder || 'Filter'}</label>
            <select
                multiple
                value={selectedValues}
                onChange={handleChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                style={{ minHeight: '100px' }}
            >
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
            <p className="text-xs text-gray-500">*Tahan Ctrl (Windows) / Command (Mac) untuk pilih lebih dari satu</p>
        </div>
    );
};

export default MultiSelectFilter;
