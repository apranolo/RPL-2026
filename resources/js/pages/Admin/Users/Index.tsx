import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { UserPlus } from 'lucide-react';
import RoleBadge from '@/components/RoleBadge';
import RevokeRoleModal from '@/components/RevokeRoleModal';

export interface UserRole {
    id: number;
    id_user: number;
    id_journal: number | null;
    role_name: 'Author' | 'Editor' | 'SectionEditor' | 'Reviewer' | 'Copyeditor' | 'ProductionEditor' | 'Admin';
    status: 'Active' | 'Invited' | 'Declined';
    journal?: {
        name: string;
    };
}

export interface User {
    id: number;
    name: string;
    email: string;
    roles: UserRole[];
}

export interface IndexProps {
    users: User[];
}

export default function Index({ users }: IndexProps) {
    const [selectedRole, setSelectedRole] = useState<(UserRole & { user_name?: string }) | null>(null);
    const [isRevokeOpen, setIsRevokeOpen] = useState(false);

    const handleRevokeClick = (role: UserRole, userName: string) => {
        setSelectedRole({ ...role, user_name: userName });
        setIsRevokeOpen(true);
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }, { title: 'User Management', href: '/admin/users' }]}>
            <Head title="Manajemen Pengguna & Peran" />

            <div className="space-y-6 p-6">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Pengelola Jurnal</h1>
                        <p className="text-muted-foreground text-sm">
                            Daftar seluruh pengguna dan peran mereka di dalam sistem JurnalMu.
                        </p>
                    </div>
                    <div>
                        <Link href="/admin/users/invite">
                            <Button className="bg-primary hover:bg-primary/95 text-white flex items-center gap-2">
                                <UserPlus className="h-4 w-4" />
                                Undang Peran Baru
                            </Button>
                        </Link>
                    </div>
                </div>

                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nama Pengguna</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Peran & Jurnal</TableHead>
                                    <TableHead>Status Undangan</TableHead>
                                    <TableHead className="text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                            Tidak ada pengguna ditemukan.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    users.flatMap((user) =>
                                        user.roles.map((role) => (
                                            <TableRow key={role.id}>
                                                <TableCell className="font-medium">{user.name}</TableCell>
                                                <TableCell>{user.email}</TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col items-start gap-1">
                                                        <RoleBadge roleName={role.role_name} />
                                                        {role.journal && (
                                                            <span className="text-xs text-muted-foreground italic pl-1">
                                                                {role.journal.name}
                                                            </span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                                        role.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                                        role.status === 'Invited' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' :
                                                        'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400'
                                                    }`}>
                                                        {role.status}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => handleRevokeClick(role, user.name)}
                                                    >
                                                        Cabut Peran
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            {selectedRole && (
                <RevokeRoleModal
                    isOpen={isRevokeOpen}
                    onClose={() => setIsRevokeOpen(false)}
                    userRole={selectedRole}
                />
            )}
        </AppLayout>
    );
}
