import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/layouts/public-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarDays, MapPin, Clock, ArrowLeft, Mail, Phone, ExternalLink, Globe, User } from 'lucide-react';

interface AgendaDetails {
    id: number;
    title: string;
    type: string;
    description: string;
    thumbnail_url: string | null;
    date_start: string | null;
    date_end: string | null;
    time_start: string | null;
    time_end: string | null;
    location_type: string;
    location_venue: string | null;
    location_link: string | null;
    registration_link: string | null;
    price: string | null;
    contact_person_name: string | null;
    contact_person_phone: string | null;
    contact_person_email: string | null;
    is_featured: boolean;
    university: {
        name: string;
        short_name: string | null;
        logo_url: string | null;
        website_url: string | null;
    } | null;
}

interface Props {
    agenda: AgendaDetails;
}

export default function Show({ agenda }: Props) {
    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'TBA';
        return new Date(dateString).toLocaleDateString('id-ID', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const isFree = !agenda.price || parseFloat(agenda.price) === 0;

    return (
        <PublicLayout>
            <Head title={`${agenda.title} - Events & Agendas`} />
            
            {/* Minimalist Hero Background Overlay */}
            <div className="bg-primary/5 pb-12 pt-8 border-b">
                <div className="container mx-auto px-4 lg:px-8">
                    <Link 
                        href={route('events.index')} 
                        className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors mb-6"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Events
                    </Link>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Title & Info section */}
                        <div className="lg:col-span-2 flex flex-col justify-center">
                            <div className="flex gap-2 items-center mb-4">
                                <Badge variant="secondary" className="capitalize text-sm px-3 py-1 shadow-sm">
                                    {agenda.type}
                                </Badge>
                                {agenda.is_featured && (
                                    <Badge variant="default" className="text-sm px-3 py-1 shadow-sm">
                                        Featured
                                    </Badge>
                                )}
                            </div>

                            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground leading-tight mb-6">
                                {agenda.title}
                            </h1>

                            <div className="flex flex-wrap items-center gap-6 mt-4 text-foreground/80">
                                {agenda.university && (
                                    <div className="flex items-center gap-3">
                                        {agenda.university.logo_url && (
                                            <div className="w-10 h-10 bg-white rounded-full p-1 shadow-sm border overflow-hidden">
                                                <img src={agenda.university.logo_url} alt={agenda.university.name} className="w-full h-full object-contain" />
                                            </div>
                                        )}
                                        <div className="flex flex-col">
                                            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Organized by</span>
                                            <span className="font-semibold">{agenda.university.name}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Thumbnail / Image Area */}
                        {agenda.thumbnail_url && (
                            <div className="lg:col-span-1 rounded-xl overflow-hidden shadow-lg border bg-muted aspect-[4/3] lg:aspect-square flex-shrink-0">
                                <img 
                                    src={agenda.thumbnail_url} 
                                    alt={agenda.title} 
                                    className="object-cover w-full h-full"
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 lg:px-8 py-12 relative z-10 -mt-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    
                    {/* Main Content Area */}
                    <div className="lg:col-span-2 space-y-8">
                        <Card className="shadow-md overflow-hidden">
                            <CardHeader className="bg-muted/30 border-b pb-4">
                                <CardTitle className="text-xl">About the Event</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="max-w-none whitespace-pre-line break-words text-sm leading-7 text-foreground">
                                    {agenda.description || 'No description provided.'}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Registration Call to Action area inside content (fallback or complementary) */}
                        {!agenda.registration_link && (
                            <Card className="bg-primary/5 border-primary/20 border-dashed">
                                <CardContent className="pt-6 flex flex-col items-center justify-center text-center">
                                    <h3 className="text-lg font-semibold mb-2">Registration Link Unavailable</h3>
                                    <p className="text-muted-foreground text-sm">Please check the description or contact the organizer for registration details.</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar / Sticky Info Panel */}
                    <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-24">
                        <Card className="shadow-lg border-primary/10 overflow-hidden relative">
                            {/* Accent line on top of card */}
                            <div className="absolute top-0 inset-x-0 h-1.5 bg-primary rounded-t-lg" />
                            
                            <CardContent className="pt-8 pb-6 px-6 divide-y divide-border/50">
                                {/* Price and Action */}
                                <div className="pb-6">
                                    <div className="flex justify-between items-end mb-6">
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-1">Registration</p>
                                            <span className="text-3xl font-bold tracking-tight">
                                                {isFree ? (
                                                    <span className="text-emerald-600">Free</span>
                                                ) : (
                                                    `Rp ${parseFloat(agenda.price!).toLocaleString('id-ID')}`
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    {agenda.registration_link ? (
                                        <Button 
                                            asChild 
                                            size="lg" 
                                            className="w-full text-lg h-14 font-semibold shadow-md hover:-translate-y-0.5 transition-all"
                                        >
                                            <a href={agenda.registration_link} target="_blank" rel="noopener noreferrer">
                                                Register Now
                                                <ExternalLink className="ml-2 h-5 w-5" />
                                            </a>
                                        </Button>
                                    ) : (
                                        <Button disabled size="lg" className="w-full text-lg h-14 font-semibold opacity-50 cursor-not-allowed">
                                            Registration Closed
                                        </Button>
                                    )}
                                </div>

                                {/* Date & Time */}
                                <div className="py-5 space-y-4">
                                    <div className="flex gap-4">
                                        <div className="mt-0.5 bg-primary/10 p-2 rounded-md">
                                            <CalendarDays className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Date</p>
                                            <p className="font-semibold mt-0.5">{formatDate(agenda.date_start)}</p>
                                            {agenda.date_end && agenda.date_end !== agenda.date_start && (
                                                <p className="font-semibold text-muted-foreground">
                                                    to {formatDate(agenda.date_end)}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {(agenda.time_start || agenda.time_end) && (
                                        <div className="flex gap-4">
                                            <div className="mt-0.5 bg-primary/10 p-2 rounded-md">
                                                <Clock className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground">Time</p>
                                                <p className="font-semibold mt-0.5">
                                                    {agenda.time_start || '?'} 
                                                    {agenda.time_end && ` - ${agenda.time_end}`}
                                                    <span className="text-xs font-normal text-muted-foreground ml-1">WIB</span>
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Location Area */}
                                <div className="py-5 space-y-4">
                                    <div className="flex gap-4">
                                        <div className="mt-0.5 bg-primary/10 p-2 rounded-md">
                                            <MapPin className="h-5 w-5 text-primary" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-muted-foreground">Location</p>
                                            <div className="mt-1">
                                                <Badge variant="outline" className="capitalize mb-2">
                                                    {agenda.location_type}
                                                </Badge>
                                                {agenda.location_venue && (
                                                    <p className="font-medium">{agenda.location_venue}</p>
                                                )}
                                                {agenda.location_link && (
                                                    <a 
                                                        href={agenda.location_link}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center text-sm font-medium text-primary hover:underline mt-2 break-all"
                                                    >
                                                        <Globe className="mr-1 h-3.5 w-3.5 shrink-0" />
                                                        View Location / Map
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Contact Person Card */}
                        {(agenda.contact_person_name || agenda.contact_person_phone || agenda.contact_person_email) && (
                            <Card className="shadow-sm border-muted">
                                <CardHeader className="pb-3 bg-muted/20">
                                    <CardTitle className="text-base flex items-center">
                                        <User className="mr-2 h-4 w-4 text-primary" />
                                        Contact Person
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-4 space-y-3">
                                    {agenda.contact_person_name && (
                                        <p className="font-semibold text-foreground">{agenda.contact_person_name}</p>
                                    )}
                                    {agenda.contact_person_phone && (
                                        <div className="flex items-center gap-3 text-sm">
                                            <Phone className="h-4 w-4 text-muted-foreground" />
                                            <a href={`https://wa.me/${agenda.contact_person_phone.replace(/[^0-9]/g, '')}`} className="hover:text-primary transition-colors">
                                                {agenda.contact_person_phone}
                                            </a>
                                        </div>
                                    )}
                                    {agenda.contact_person_email && (
                                        <div className="flex items-center gap-3 text-sm">
                                            <Mail className="h-4 w-4 text-muted-foreground" />
                                            <a href={`mailto:${agenda.contact_person_email}`} className="hover:text-primary transition-colors break-all">
                                                {agenda.contact_person_email}
                                            </a>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
