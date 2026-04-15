import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from '@inertiajs/react';
import { Edit, Mail, MapPin, Phone, User as UserIcon } from 'lucide-react';

interface ProfileCardProps {
    user: {
        id: number;
        name: string;
        email: string;
        phone?: string;
        position?: string;
        avatar_url?: string;
        initials?: string;
        email_verified_at?: string;
        university?: {
            id: number;
            name: string;
            short_name?: string;
        };
        scientific_field?: {
            id: number;
            name: string;
            code: string;
        };
    };
}

export default function ProfileCard({ user }: ProfileCardProps) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-lg font-semibold">Profile Information</CardTitle>
                <Link href={route('profile.edit')}>
                    <Button variant="outline" size="sm">
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Profile
                    </Button>
                </Link>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col items-center space-y-4 sm:flex-row sm:items-start sm:space-y-0 sm:space-x-6">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                        {user.avatar_url ? (
                            <img src={user.avatar_url} alt={user.name} className="h-24 w-24 rounded-full object-cover ring-2 ring-sidebar-border" />
                        ) : (
                            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-blue-100 ring-2 ring-sidebar-border dark:bg-blue-900/20">
                                <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                                    {user.initials || user.name.charAt(0).toUpperCase()}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 space-y-3">
                        <div>
                            <h3 className="text-xl font-bold">{user.name}</h3>
                            {user.position && <p className="text-sm text-muted-foreground">{user.position}</p>}
                        </div>

                        <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Mail className="h-4 w-4" />
                                <span>{user.email}</span>
                                {user.email_verified_at && (
                                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700 dark:bg-green-900/20 dark:text-green-400">
                                        Verified
                                    </span>
                                )}
                            </div>

                            {user.phone && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Phone className="h-4 w-4" />
                                    <span>{user.phone}</span>
                                </div>
                            )}

                            {user.university && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <MapPin className="h-4 w-4" />
                                    <span>{user.university.short_name || user.university.name}</span>
                                </div>
                            )}

                            {user.scientific_field && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <UserIcon className="h-4 w-4" />
                                    <span>
                                        {user.scientific_field.code} - {user.scientific_field.name}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
