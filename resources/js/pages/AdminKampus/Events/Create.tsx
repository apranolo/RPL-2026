/**
 * @route GET /admin-kampus/events/create
 * @features Form to create an Agenda
 */
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import React from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin-kampus/dashboard' },
    { title: 'Events', href: '/admin-kampus/events' },
    { title: 'Create Event', href: '/admin-kampus/events/create' },
];

export default function EventsCreate() {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        type: 'webinar',
        description: '',
        date_start: '',
        date_end: '',
        time_start: '',
        time_end: '',
        location_type: 'Online',
        location_venue: '',
        location_link: '',
        registration_link: '',
        price: '',
        contact_person_name: '',
        contact_person_phone: '',
        contact_person_email: '',
        is_active: true,
        is_featured: false,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin-kampus.events.store'));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Event" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="mx-auto w-full max-w-4xl overflow-hidden rounded-xl border border-sidebar-border/70 bg-white p-6 dark:border-sidebar-border dark:bg-neutral-950">
                    
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <Link
                                href={route('admin-kampus.events.index')}
                                className="mb-2 flex items-center text-sm text-muted-foreground hover:text-foreground"
                            >
                                <ArrowLeft className="mr-1 h-4 w-4" />
                                Back to Events
                            </Link>
                            <h1 className="text-2xl font-bold">Create New Event</h1>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            
                            {/* Title */}
                            <div className="md:col-span-2 space-y-2">
                                <Label htmlFor="title">Event Title <span className="text-red-500">*</span></Label>
                                <Input
                                    id="title"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    placeholder="Enter event title"
                                />
                                {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
                            </div>

                            {/* Type */}
                            <div className="space-y-2">
                                <Label htmlFor="type">Event Type <span className="text-red-500">*</span></Label>
                                <Select value={data.type} onValueChange={(val) => setData('type', val)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="webinar">Webinar</SelectItem>
                                        <SelectItem value="workshop">Workshop</SelectItem>
                                        <SelectItem value="conference">Conference</SelectItem>
                                        <SelectItem value="seminar">Seminar</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.type && <p className="text-sm text-red-500">{errors.type}</p>}
                            </div>

                            {/* Location Type */}
                            <div className="space-y-2">
                                <Label htmlFor="location_type">Location Type <span className="text-red-500">*</span></Label>
                                <Select value={data.location_type} onValueChange={(val) => setData('location_type', val)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select location type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Online">Online</SelectItem>
                                        <SelectItem value="Offline">Offline</SelectItem>
                                        <SelectItem value="Hybrid">Hybrid</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.location_type && <p className="text-sm text-red-500">{errors.location_type}</p>}
                            </div>

                            {/* Date Start/End */}
                            <div className="space-y-2">
                                <Label htmlFor="date_start">Start Date <span className="text-red-500">*</span></Label>
                                <Input
                                    id="date_start"
                                    type="date"
                                    value={data.date_start}
                                    onChange={(e) => setData('date_start', e.target.value)}
                                />
                                {errors.date_start && <p className="text-sm text-red-500">{errors.date_start}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="date_end">End Date</Label>
                                <Input
                                    id="date_end"
                                    type="date"
                                    value={data.date_end}
                                    onChange={(e) => setData('date_end', e.target.value)}
                                />
                                {errors.date_end && <p className="text-sm text-red-500">{errors.date_end}</p>}
                            </div>

                            {/* Time Start/End */}
                            <div className="space-y-2">
                                <Label htmlFor="time_start">Start Time</Label>
                                <Input
                                    id="time_start"
                                    type="time"
                                    value={data.time_start}
                                    onChange={(e) => setData('time_start', e.target.value)}
                                />
                                {errors.time_start && <p className="text-sm text-red-500">{errors.time_start}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="time_end">End Time</Label>
                                <Input
                                    id="time_end"
                                    type="time"
                                    value={data.time_end}
                                    onChange={(e) => setData('time_end', e.target.value)}
                                />
                                {errors.time_end && <p className="text-sm text-red-500">{errors.time_end}</p>}
                            </div>

                            {/* Location Details */}
                            <div className="space-y-2">
                                <Label htmlFor="location_venue">Venue Name / Platform</Label>
                                <Input
                                    id="location_venue"
                                    value={data.location_venue}
                                    onChange={(e) => setData('location_venue', e.target.value)}
                                    placeholder="e.g. Zoom, Main Hall"
                                />
                                {errors.location_venue && <p className="text-sm text-red-500">{errors.location_venue}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="location_link">Meeting Link</Label>
                                <Input
                                    id="location_link"
                                    value={data.location_link}
                                    onChange={(e) => setData('location_link', e.target.value)}
                                    placeholder="https://"
                                />
                                {errors.location_link && <p className="text-sm text-red-500">{errors.location_link}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="registration_link">Registration Link</Label>
                                <Input
                                    id="registration_link"
                                    value={data.registration_link}
                                    onChange={(e) => setData('registration_link', e.target.value)}
                                    placeholder="https://"
                                />
                                {errors.registration_link && <p className="text-sm text-red-500">{errors.registration_link}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="price">Price</Label>
                                <Input
                                    id="price"
                                    type="number"
                                    step="0.01"
                                    value={data.price}
                                    onChange={(e) => setData('price', e.target.value)}
                                    placeholder="0.00"
                                />
                                {errors.price && <p className="text-sm text-red-500">{errors.price}</p>}
                            </div>

                            {/* Contact Person Details */}
                            <div className="space-y-2">
                                <Label htmlFor="contact_person_name">Contact Person Name</Label>
                                <Input
                                    id="contact_person_name"
                                    value={data.contact_person_name}
                                    onChange={(e) => setData('contact_person_name', e.target.value)}
                                />
                                {errors.contact_person_name && <p className="text-sm text-red-500">{errors.contact_person_name}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="contact_person_email">Contact Person Email</Label>
                                <Input
                                    id="contact_person_email"
                                    type="email"
                                    value={data.contact_person_email}
                                    onChange={(e) => setData('contact_person_email', e.target.value)}
                                />
                                {errors.contact_person_email && <p className="text-sm text-red-500">{errors.contact_person_email}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="contact_person_phone">Contact Person Phone</Label>
                                <Input
                                    id="contact_person_phone"
                                    value={data.contact_person_phone}
                                    onChange={(e) => setData('contact_person_phone', e.target.value)}
                                />
                                {errors.contact_person_phone && <p className="text-sm text-red-500">{errors.contact_person_phone}</p>}
                            </div>

                             {/* Is Active & Feature toggles */}
                             <div className="flex flex-col gap-4 py-4 md:col-span-2">
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="is_active"
                                        checked={data.is_active}
                                        onCheckedChange={(val) => setData('is_active', val)}
                                    />
                                    <Label htmlFor="is_active">Active (Visible)</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="is_featured"
                                        checked={data.is_featured}
                                        onCheckedChange={(val) => setData('is_featured', val)}
                                    />
                                    <Label htmlFor="is_featured">Featured Event</Label>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="description">Event Description</Label>
                                <Textarea
                                    id="description"
                                    rows={5}
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Provide detailed information about the event..."
                                />
                                {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
                            </div>
                        </div>

                        <div className="flex justify-end gap-2">
                            <Link href={route('admin-kampus.events.index')} className="mr-2">
                                <Button variant="outline" type="button">Cancel</Button>
                            </Link>
                            <Button type="submit" disabled={processing}>
                                <Save className="mr-2 h-4 w-4" />
                                Create Event
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}