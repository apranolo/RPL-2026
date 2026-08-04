/**
 * @file BankForm.tsx
 * @description Formulir pengisian dan pembaruan data rekening bank Dosen untuk keaslian transfer pencairan dana
 * @route POST /user-bank/update (route: user-bank.update)
 * @features Form input Nama Bank, Nomor Rekening, dan Nama Pemilik Rekening dengan useForm Inertia
 * @author KHANSA KAMILAH LICTJELITA
 */
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import React from 'react';

export default function BankForm() {
    const { data, setData, post, processing, errors } = useForm({
        bank_name: '',
        account_number: '',
        account_name: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('user-bank.update'), {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout>
            <Head title="Informasi Rekening Bank" />

            <div className="p-4 sm:p-6 max-w-2xl mx-auto">
                <Card className="rounded-lg shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-xl font-semibold">Informasi Rekening Bank</CardTitle>
                        <CardDescription>Silakan perbarui informasi rekening bank Anda untuk keperluan transfer pencairan dana penelitian.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-6">
                            <div className="grid gap-2">
                                <Label htmlFor="bank_name">Nama Bank</Label>
                                <Input
                                    id="bank_name"
                                    type="text"
                                    placeholder="Contoh: Bank Mandiri / BNI / BRI"
                                    value={data.bank_name}
                                    onChange={(e) => setData('bank_name', e.target.value)}
                                />
                                <InputError message={errors.bank_name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="account_number">Nomor Rekening</Label>
                                <Input
                                    id="account_number"
                                    type="text"
                                    placeholder="Contoh: 1370012345678"
                                    value={data.account_number}
                                    onChange={(e) => setData('account_number', e.target.value)}
                                />
                                <InputError message={errors.account_number} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="account_name">Nama Pemilik Rekening</Label>
                                <Input
                                    id="account_name"
                                    type="text"
                                    placeholder="Nama sesuai di buku tabungan"
                                    value={data.account_name}
                                    onChange={(e) => setData('account_name', e.target.value)}
                                />
                                <InputError message={errors.account_name} />
                            </div>

                            <div className="flex items-center gap-4 pt-2">
                                <Button type="submit" disabled={processing} className="rounded-lg">
                                    Simpan Perubahan
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
