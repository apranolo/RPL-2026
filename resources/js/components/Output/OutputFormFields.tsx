'use client';

import { OutputType, OutputFormData, getOutputFormFields } from '@/utils/OutputFormSelector';

interface OutputFormFieldsProps {
  type: OutputType;
  data: OutputFormData;
  onChange: (field: string, value: string) => void;
  errors?: Record<string, string>;
  disabled?: boolean;
}

export default function OutputFormFields({
  type,
  data,
  onChange,
  errors = {},
  disabled = false,
}: OutputFormFieldsProps) {
  const fields = getOutputFormFields(type);

  if (fields.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Tidak ada field tambahan untuk jenis luaran <strong>{type}</strong></p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
        Detail {type === 'Jurnal' ? 'Jurnal' : type === 'Buku' ? 'Buku' : type === 'HKI' ? 'HKI' : 'Produk'}
      </h3>
      <div className="grid gap-4 md:grid-cols-2">
        {fields.map((field) => (
          <div
            key={field.name}
            className={field.type === 'textarea' ? 'md:col-span-2' : ''}
          >
            <label
              htmlFor={field.name}
              className={`block text-sm font-medium text-gray-700 ${
                field.required ? 'after:content-["*"] after:text-red-500 after:ml-0.5' : ''
              }`}
            >
              {field.label}
            </label>
            {field.type === 'textarea' ? (
              <textarea
                id={field.name}
                name={field.name}
                value={data[field.name] || ''}
                onChange={(e) => onChange(field.name, e.target.value)}
                placeholder={field.placeholder}
                maxLength={field.maxLength}
                disabled={disabled}
                rows={3}
                className={`
                  mt-1 block w-full rounded-md border px-3 py-2 text-sm shadow-sm
                  focus:border-indigo-500 focus:ring-indigo-500 focus:ring-1
                  disabled:bg-gray-100 disabled:cursor-not-allowed
                  ${errors[field.name] ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'}
                `}
              />
            ) : (
              <input
                type={field.type}
                id={field.name}
                name={field.name}
                value={data[field.name] || ''}
                onChange={(e) => onChange(field.name, e.target.value)}
                placeholder={field.placeholder}
                maxLength={field.maxLength}
                disabled={disabled}
                className={`
                  mt-1 block w-full rounded-md border px-3 py-2 text-sm shadow-sm
                  focus:border-indigo-500 focus:ring-indigo-500 focus:ring-1
                  disabled:bg-gray-100 disabled:cursor-not-allowed
                  ${errors[field.name] ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'}
                `}
              />
            )}
            {errors[field.name] && (
              <p className="mt-1 text-sm text-red-600">{errors[field.name]}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}