/**
 * @route GET /admin-kampus/events
 * @features Display events list with search, filter, and actions
 */
import { Head, Link, router } from '@inertiajs/react';
import { CalendarDays, Edit, Plus, Search, Trash2 } from 'lucide-react';
import React, { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

// Assuming standard pagination interface logic
interface PaginationData<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Agenda {
    id: number;
    title: string;
    type: string;
    date_start: string;
    date_end?: string;
    location_type: string;
    is_active: boolean;
}

interface Props {
    events: PaginationData<Agenda>;
    filters?: {
        search?: string;
    };
    flash?: {
        success?: string;
        error?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin-kampus/dashboard' },
    { title: 'Events', href: '/admin-kampus/events' },
];

export default function EventsIndex({ events, filters, flash }: Props) {
    const [search, setSearch] = useState(filters?.search || '');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deletingEvent, setDeletingEvent] = useState<Agenda | null>(null);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('admin-kampus.events.index'), { search }, { preserveState: true });
    };

    const handleDelete = (agenda: Agenda) => {
        setDeletingEvent(agenda);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (!deletingEvent) return;
        router.delete(route('admin-kampus.events.destroy', deletingEvent.id), {
            preserveScroll: true,
            onSuccess: () => {
                setDeleteDialogOpen(false);
                setDeletingEvent(null);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Events Management" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="relative overflow-hidden rounded-xl border border-sidebar-border/70 bg-white p-6 dark:border-sidebar-border dark:bg-neutral-950">
                    {/* Header */}
                    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="flex items-center gap-2 text-3xl font-bold text-foreground">
                                <CalendarDays className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                                Events Management
                            </h1>
                            <p className="mt-1 text-muted-foreground">Manage events and agendas for your university</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Link href={route('admin-kampus.events.create')}>
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add New Event
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="mb-6 rounded-xl border border-sidebar-border/70 bg-card p-4 shadow-sm dark:border-sidebar-border">
                        <form onSubmit={handleSearch} className="flex gap-4">
                            <div className="relative max-w-md flex-1">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="Search by event title..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                            <Button type="submit" variant="secondary">
                                Search
                            </Button>
                            {search && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setSearch('');
                                        router.get(route('admin-kampus.events.index'));
                                    }}
                                >
                                    Clear
                                </Button>
                            )}
                        </form>
                    </div>

                    {/* Desktop Table View */}
                    <div className="hidden overflow-hidden rounded-lg border border-sidebar-border/70 bg-card shadow-sm md:block dark:border-sidebar-border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Start Date</TableHead>
                                    <TableHead>Location Type</TableHead>
                                    <TableHead className="text-center">Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {events.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">
                                            No events found matching your criteria.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    events.data.map((event) => (
                                        <TableRow key={event.id}>
                                            <TableCell className="font-medium">{event.title}</TableCell>
                                            <TableCell className="capitalize">{event.type}</TableCell>
                                            <TableCell>{new Date(event.date_start).toLocaleDateString()}</TableCell>
                                            <TableCell className="capitalize">{event.location_type}</TableCell>
                                            <TableCell className="text-center">
                                                {event.is_active ? (
                                                    <Badge
                                                        variant="default"
                                                        className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                                                    >
                                                        Active
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="secondary">Draft</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => router.visit(route('admin-kampus.events.edit', event.id))}
                                                        title="Edit Event"
                                                        aria-label="Edit Event"
                                                    >
                                                        <Edit className="h-4 w-4 text-blue-500" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDelete(event)}
                                                        title="Delete Event"
                                                        aria-label="Delete Event"
                                                    >
                                                        <Trash2 className="h-4 w-4 text-red-500" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="grid grid-cols-1 gap-4 md:hidden">
                        {events.data.length === 0 ? (
                            <Card>
                                <CardContent className="py-8 text-center text-muted-foreground">No events found.</CardContent>
                            </Card>
                        ) : (
                            events.data.map((event) => (
                                <Card key={event.id}>
                                    <div className="space-y-4 p-4">
                                        <div>
                                            <h3 className="text-lg font-semibold">{event.title}</h3>
                                            <p className="mt-1 text-sm text-muted-foreground capitalize">
                                                {event.type} &bull; {new Date(event.date_start).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            {event.is_active ? (
                                                <Badge className="bg-green-100 text-green-800">Active</Badge>
                                            ) : (
                                                <Badge variant="secondary">Draft</Badge>
                                            )}
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => router.visit(route('admin-kampus.events.edit', event.id))}
                                                >
                                                    Edit
                                                </Button>
                                                <Button size="sm" variant="destructive" onClick={() => handleDelete(event)}>
                                                    Delete
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ))
                        )}
                    </div>

                    {/* Dialog */}
                    <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Delete Event</DialogTitle>
                                <DialogDescription>
                                    Are you sure you want to delete "{deletingEvent?.title}"? This action cannot be undone.
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button variant="destructive" onClick={confirmDelete}>
                                    Delete Event
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </AppLayout>
    );
}
