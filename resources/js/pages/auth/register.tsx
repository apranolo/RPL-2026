import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { UniversityCombobox } from '@/components/ui/university-combobox';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

type University = {
    id: number;
    name: string;
    code: string;
    short_name?: string;
};

type RegisterForm = {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    university_id: string;
    role_type: 'user' | 'lppm';
    phone: string;
    position: string;
};

interface Props {
    universities: University[];
}

export default function Register({ universities }: Props) {
    const { data, setData, post, processing, errors } = useForm<RegisterForm>({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        university_id: '',
        role_type: 'user',
        phone: '',
        position: '',
    });

    const [roleType, setRoleType] = useState<'user' | 'lppm'>('user');

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('register'));
    };

    return (
        <>
            <Head title="Register" />

            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 via-white to-yellow-50 p-4 dark:bg-gradient-to-br dark:from-[#020617] dark:via-[#0f172a] dark:to-[#020617]">
                <div className="w-full max-w-md">
                    {/* Header */}
                    <div className="mb-8 text-center">
                        <Link href="/">
                            <h1 className="text-3xl font-bold text-green-600 dark:text-green-300">Journal MU</h1>
                            <p className="mt-2 text-gray-600 dark:text-gray-300">Platform Manajemen Jurnal Ilmiah PTMA</p>
                        </Link>
                    </div>

                    {/* Register Form */}
                    <div className="rounded-2xl bg-white p-4 shadow-xl sm:p-8 dark:bg-[#0f172a] dark:shadow-2xl">
                        <div className="mb-8 text-center">
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Daftar Akun</h2>
                            <p className="mt-2 text-gray-600 dark:text-gray-300">Buat akun baru untuk memulai</p>
                        </div>

                        <form onSubmit={submit} className="space-y-4">
                            {/* Name */}
                            <div>
                                <Label htmlFor="name">Nama Lengkap *</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    required
                                    autoFocus
                                    className="mt-2"
                                />
                                {errors.name && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>}
                            </div>

                            {/* Email */}
                            <div>
                                <Label htmlFor="email">Email *</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    required
                                    className="mt-2"
                                />
                                {errors.email && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>}
                            </div>

                            {/* University Selection */}
                            <div>
                                <Label htmlFor="university">Universitas *</Label>
                                <div className="mt-2">
                                    <UniversityCombobox
                                        universities={universities}
                                        value={data.university_id}
                                        onValueChange={(value) => setData('university_id', value)}
                                        placeholder="Pilih Universitas"
                                        error={errors.university_id}
                                    />
                                </div>
                            </div>

                            {/* Role Type Selection */}
                            <div>
                                <Label>Daftar Sebagai *</Label>
                                <RadioGroup
                                    value={data.role_type}
                                    onValueChange={(value: 'user' | 'lppm') => {
                                        setData('role_type', value);
                                        setRoleType(value);
                                    }}
                                    className="mt-2 space-y-3"
                                >
                                    <div className="flex items-start space-x-3 rounded-lg border p-3 hover:bg-gray-50 dark:hover:bg-gray-800">
                                        <RadioGroupItem value="user" id="user" className="mt-0.5" />
                                        <div className="flex-1">
                                            <Label htmlFor="user" className="cursor-pointer font-medium">
                                                Pengelola Jurnal (User)
                                            </Label>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                Untuk pengelola jurnal yang akan mengelola data jurnal di universitas
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-3 rounded-lg border p-3 hover:bg-gray-50 dark:hover:bg-gray-800">
                                        <RadioGroupItem value="lppm" id="lppm" className="mt-0.5" />
                                        <div className="flex-1">
                                            <Label htmlFor="lppm" className="cursor-pointer font-medium">
                                                Admin LPPM
                                            </Label>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                Untuk admin LPPM yang akan menyetujui pendaftaran user dan jurnal
                                            </p>
                                        </div>
                                    </div>
                                </RadioGroup>
                                {errors.role_type && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.role_type}</p>}

                                {/* Info based on role selection */}
                                <div className="mt-2 rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
                                    <p className="text-xs text-blue-700 dark:text-blue-300">
                                        {roleType === 'lppm'
                                            ? '⚠️ Akun LPPM akan disetujui oleh Dikti (Super Admin)'
                                            : 'ℹ️ Akun User akan disetujui oleh Admin LPPM universitas Anda'}
                                    </p>
                                </div>
                            </div>

                            {/* Phone */}
                            <div>
                                <Label htmlFor="phone">No. Telepon</Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    className="mt-2"
                                    placeholder="08123456789"
                                />
                                {errors.phone && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.phone}</p>}
                            </div>

                            {/* Position */}
                            <div>
                                <Label htmlFor="position">Jabatan</Label>
                                <Input
                                    id="position"
                                    value={data.position}
                                    onChange={(e) => setData('position', e.target.value)}
                                    className="mt-2"
                                    placeholder="Dosen, Staf LPPM, dll"
                                />
                                {errors.position && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.position}</p>}
                            </div>

                            {/* Password */}
                            <div>
                                <Label htmlFor="password">Password *</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    required
                                    className="mt-2"
                                />
                                {errors.password && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password}</p>}
                            </div>

                            {/* Password Confirmation */}
                            <div>
                                <Label htmlFor="password_confirmation">Konfirmasi Password *</Label>
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    required
                                    className="mt-2"
                                />
                                {errors.password_confirmation && (
                                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password_confirmation}</p>
                                )}
                            </div>

                            {/* Submit Button */}
                            <Button type="submit" disabled={processing} className="mt-6 w-full">
                                {processing ? 'Mendaftar...' : 'Daftar'}
                            </Button>
                        </form>

                        {/* Login Link */}
                        <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-300">
                            Sudah punya akun?{' '}
                            <Link
                                href={route('login')}
                                className="font-medium text-green-600 hover:text-green-700 dark:text-green-300 dark:hover:text-green-400"
                            >
                                Login di sini
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
