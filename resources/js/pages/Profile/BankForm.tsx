import React from 'react';
import { useForm } from '@inertiajs/react';

export default function BankForm() {
    const { data, setData, post, processing, errors } = useForm({
        bank_name: '',
        account_number: '',
        account_name: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/user-bank/update', {
            preserveScroll: true,
        });
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow dark:bg-gray-800">
            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                Informasi Rekening Bank
            </h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 mb-6">
                Silahkan perbarui informasi rekening bank Anda.
            </p>

            <form onSubmit={submit} className="space-y-6">
                <div>
                    <label htmlFor="bank_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Nama Bank
                    </label>
                    <input
                        id="bank_name"
                        type="text"
                        value={data.bank_name}
                        onChange={(e) => setData('bank_name', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                    />
                    {errors.bank_name && (
                        <p className="mt-2 text-sm text-red-600">{errors.bank_name}</p>
                    )}
                </div>

                <div>
                    <label htmlFor="account_number" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Nomor Rekening
                    </label>
                    <input
                        id="account_number"
                        type="text"
                        value={data.account_number}
                        onChange={(e) => setData('account_number', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                    />
                    {errors.account_number && (
                        <p className="mt-2 text-sm text-red-600">{errors.account_number}</p>
                    )}
                </div>

                <div>
                    <label htmlFor="account_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Nama Pemilik Rekening
                    </label>
                    <input
                        id="account_name"
                        type="text"
                        value={data.account_name}
                        onChange={(e) => setData('account_name', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                    />
                    {errors.account_name && (
                        <p className="mt-2 text-sm text-red-600">{errors.account_name}</p>
                    )}
                </div>

                <div className="flex items-center gap-4">
                    <button 
                        type="submit" 
                        disabled={processing}
                        className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                    >
                        Simpan
                    </button>
                </div>
            </form>
        </div>
    );
}
