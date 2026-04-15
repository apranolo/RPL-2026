import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import { Link } from '@inertiajs/react';
import { Construction, Home, type LucideIcon } from 'lucide-react';

interface UnderConstructionProps {
    /**
     * Title of the feature being developed
     */
    title: string;

    /**
     * Optional description or additional context
     */
    description?: string;

    /**
     * Icon to display (defaults to Construction)
     */
    icon?: LucideIcon;

    /**
     * List of planned features for this section
     */
    features?: string[];

    /**
     * Show back to dashboard button
     */
    showBackButton?: boolean;
}

/**
 * Under Construction Component
 *
 * Displays a professional "under development" message for features not yet implemented.
 * Used across all roles for placeholder pages with consistent branding.
 *
 * @example
 * <UnderConstruction
 *   title="Data Master"
 *   description="Master data management for scientific fields"
 *   icon={BookType}
 *   features={["Manage Bidang Ilmu", "Import/Export data"]}
 * />
 */
export function UnderConstruction({ title, description, icon: Icon = Construction, features, showBackButton = true }: UnderConstructionProps) {
    return (
        <div className="relative flex min-h-[600px] flex-1 flex-col items-center justify-center overflow-hidden rounded-xl border bg-background p-8">
            {/* Background pattern */}
            <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/10 dark:stroke-neutral-100/10" />

            {/* Content */}
            <div className="relative z-10 flex max-w-2xl flex-col items-center space-y-6 text-center">
                {/* Icon */}
                <div className="rounded-full bg-primary/10 p-6">
                    <Icon className="size-16 text-primary" strokeWidth={1.5} />
                </div>

                {/* Main message */}
                <div className="space-y-3">
                    <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
                    <p className="text-lg text-muted-foreground">{description || 'Fitur ini sedang dalam tahap pengembangan.'}</p>
                </div>

                {/* Status card */}
                <Card className="w-full max-w-md border-dashed">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-center text-base">Status Pengembangan</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <CardDescription className="text-center">
                            Fitur ini akan segera tersedia di versi mendatang. Terima kasih atas kesabaran Anda.
                        </CardDescription>

                        {/* Features preview */}
                        {features && features.length > 0 && (
                            <div className="space-y-2 rounded-lg bg-muted/50 p-4">
                                <p className="text-sm font-medium">Fitur yang akan hadir:</p>
                                <ul className="space-y-1 text-sm text-muted-foreground">
                                    {features.map((feature, index) => (
                                        <li key={index} className="flex items-start">
                                            <span className="mr-2">•</span>
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Actions */}
                {showBackButton && (
                    <Button asChild variant="default" size="lg">
                        <Link href="/dashboard">
                            <Home className="mr-2 size-4" />
                            Kembali ke Dashboard
                        </Link>
                    </Button>
                )}
            </div>
        </div>
    );
}
