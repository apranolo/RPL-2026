import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Edit } from 'lucide-react';

export default function Show({ announcement }: any) {
    return (
        <AppLayout title={announcement.title}>
            <Head title={announcement.title} />
            <div className="container mx-auto py-6 space-y-6">
                <div className="flex items-center justify-between">
                    <Button variant="ghost" asChild>
                        <Link href="/admin/announcements">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
                        </Link>
                    </Button>
                    <Button asChild>
                        <Link href={`/admin/announcements/${announcement.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" /> Edit
                        </Link>
                    </Button>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold">{announcement.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {announcement.description && (
                            <p className="text-muted-foreground">{announcement.description}</p>
                        )}
                        <div className="prose max-w-none dark:prose-invert">
                            {announcement.content}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
