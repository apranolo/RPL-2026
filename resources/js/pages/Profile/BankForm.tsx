/** @author KHANSA KAMILAH LICTJELITA */
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { useForm } from '@inertiajs/react';
import React from 'react';

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
        <AppLayout>
            <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                <h2 className="mb-4 text-lg font-medium text-gray-900 dark:text-gray-100">Informasi Rekening Bank</h2>
                <p className="mt-1 mb-6 text-sm text-gray-600 dark:text-gray-400">Silahkan perbarui informasi rekening bank Anda.</p>

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
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                        />
                        {errors.bank_name && <p className="mt-2 text-sm text-red-600">{errors.bank_name}</p>}
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
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                        />
                        {errors.account_number && <p className="mt-2 text-sm text-red-600">{errors.account_number}</p>}
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
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                        />
                        {errors.account_name && <p className="mt-2 text-sm text-red-600">{errors.account_name}</p>}
                    </div>

                    <div className="flex items-center gap-4">
                        <Button type="submit" disabled={processing}>
                            Simpan
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
