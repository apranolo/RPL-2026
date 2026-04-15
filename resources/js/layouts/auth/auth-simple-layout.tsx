import AppLogoIcon from '@/components/app-logo-icon';
import { Link } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

interface AuthLayoutProps {
    name?: string;
    title?: string;
    description?: string;
}

export default function AuthSimpleLayout({ children, title, description }: PropsWithChildren<AuthLayoutProps>) {
    return (
        <div className="relative flex min-h-svh flex-col items-center justify-center gap-6 overflow-hidden bg-background p-6 md:p-10">
            {/* Arctic/Aurora Background Animation */}
            <div className="pointer-events-none absolute inset-0 h-full w-full">
                <div className="absolute top-0 left-10 h-96 w-96 animate-blob rounded-full bg-primary/20 opacity-70 mix-blend-multiply blur-3xl filter dark:bg-primary/10 dark:mix-blend-normal"></div>
                <div
                    className="absolute top-0 right-10 h-96 w-96 animate-blob rounded-full bg-secondary/20 opacity-70 mix-blend-multiply blur-3xl filter dark:bg-secondary/10 dark:mix-blend-normal"
                    style={{ animationDelay: '2s' }}
                ></div>
                <div
                    className="absolute -bottom-32 left-20 h-96 w-96 animate-blob rounded-full bg-accent/30 opacity-70 mix-blend-multiply blur-3xl filter dark:bg-accent/10 dark:mix-blend-normal"
                    style={{ animationDelay: '4s' }}
                ></div>
            </div>

            <div className="relative z-10 w-full max-w-sm">
                <div className="flex flex-col gap-6 rounded-2xl border border-white/20 bg-white/40 p-8 shadow-xl backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/50">
                    <div className="flex flex-col items-center gap-4">
                        <Link href={route('home')} className="flex flex-col items-center gap-2 font-medium">
                            <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/30">
                                <AppLogoIcon className="size-6 fill-current" />
                            </div>
                            <span className="sr-only">{title}</span>
                        </Link>

                        <div className="space-y-2 text-center">
                            <h1 className="font-sans text-xl font-bold tracking-tight text-foreground">{title}</h1>
                            <p className="text-center text-sm text-muted-foreground">{description}</p>
                        </div>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
