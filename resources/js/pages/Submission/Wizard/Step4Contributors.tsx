import ContributorForm from '@/components/ContributorForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import WizardProgressBar from '@/components/WizardProgressBar';
import AppLayout from '@/layouts/app-layout';
import { PageProps } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, Plus, Save } from 'lucide-react';
import React from 'react';

interface Contributor {
    id?: number;
    submission_id?: number;
    name: string;
    email: string;
    affiliation: string;
    is_corresponding: boolean;
}

interface Submission {
    id: number;
    title: string;
    contributors?: Contributor[];
}

type Step4ContributorsProps = {
    submission: Submission;
};

export default function Step4Contributors({ auth, submission }: PageProps<Step4ContributorsProps>) {
    // Determine initial contributors list
    // Pre-populate with logged in user as corresponding author if empty
    const initialContributors =
        submission.contributors && submission.contributors.length > 0
            ? submission.contributors
            : [
                  {
                      name: auth.user.name,
                      email: auth.user.email,
                      affiliation: auth.user.university?.name || '',
                      is_corresponding: true,
                  },
              ];

    const { data, setData, post, processing, errors } = useForm({
        contributors: initialContributors,
    });

    const handleAddContributor = () => {
        setData('contributors', [
            ...data.contributors,
            {
                name: '',
                email: '',
                affiliation: '',
                is_corresponding: false,
            },
        ]);
    };

    const handleRemoveContributor = (index: number) => {
        // Do not allow removing the corresponding author if it's the only one
        const updated = data.contributors.filter((_, i) => i !== index);

        // If we removed the corresponding author, make the first remaining contributor corresponding
        if (data.contributors[index]?.is_corresponding && updated.length > 0) {
            updated[0].is_corresponding = true;
        }

        setData('contributors', updated);
    };

    const handleContributorChange = (index: number, field: string, value: any) => {
        const updated = [...data.contributors];

        if (field === 'is_corresponding' && value === true) {
            // Enforce single corresponding author
            updated.forEach((c, i) => {
                c.is_corresponding = i === index;
            });
        } else {
            updated[index] = {
                ...updated[index],
                [field]: value,
            };
        }

        setData('contributors', updated);
    };

    const handleSubmit = (e: React.FormEvent, action?: 'draft') => {
        e.preventDefault();

        // Ensure at least one corresponding author is selected
        const hasCorresponding = data.contributors.some((c) => c.is_corresponding);
        if (!hasCorresponding && data.contributors.length > 0) {
            // Automatically make the first one corresponding
            const updated = [...data.contributors];
            updated[0].is_corresponding = true;
            setData('contributors', updated);
        }

        if (action === 'draft') {
            post(`/submissions/wizard/${submission.id}/step4?action=draft`);
        } else {
            post(`/submissions/wizard/${submission.id}/step4`);
        }
    };

    const breadcrumbs = [
        { title: 'Submissions', href: '/submissions' },
        { title: 'Submission Wizard', href: '#' },
        { title: 'Step 4: Contributors', href: `/submissions/wizard/${submission.id}/step4` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Submission Contributors" />

            <div className="mx-auto max-w-4xl space-y-6 pb-12">
                {/* Progress Bar */}
                <Card className="border-none bg-transparent shadow-none">
                    <WizardProgressBar currentStep={4} />
                </Card>

                {/* Main Content Card */}
                <Card className="border border-border/50 shadow-md">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl font-bold">Contributors</CardTitle>
                        <CardDescription>
                            Manage the authors and contributors who helped write this manuscript. At least one author must be designated as the
                            corresponding author.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={(e) => handleSubmit(e)} className="space-y-6">
                            {/* Title display */}
                            <div className="mb-6 rounded-lg border border-muted/50 bg-muted/40 p-4">
                                <span className="mb-1 block text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                    Manuscript Title
                                </span>
                                <h3 className="text-base font-semibold text-foreground">{submission.title || 'Untitled Manuscript'}</h3>
                            </div>

                            {/* Contributors List */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between border-b pb-2">
                                    <h4 className="text-base font-semibold">Author List</h4>
                                    <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={handleAddContributor}>
                                        <Plus className="h-4 w-4" /> Add Contributor
                                    </Button>
                                </div>

                                {data.contributors.length === 0 ? (
                                    <div className="rounded-lg border-2 border-dashed bg-muted/20 py-8 text-center">
                                        <p className="text-sm text-muted-foreground">No authors added. Please add at least one author.</p>
                                    </div>
                                ) : (
                                    data.contributors.map((contributor, index) => (
                                        <ContributorForm
                                            key={index}
                                            index={index}
                                            data={contributor}
                                            onChange={handleContributorChange}
                                            onRemove={handleRemoveContributor}
                                            errors={
                                                (errors && errors[`contributors.${index}.name` as any]) ||
                                                (errors && errors[`contributors.${index}.email` as any]) ||
                                                (errors && errors[`contributors.${index}.affiliation` as any])
                                                    ? {
                                                          name: errors[`contributors.${index}.name` as any],
                                                          email: errors[`contributors.${index}.email` as any],
                                                          affiliation: errors[`contributors.${index}.affiliation` as any],
                                                      }
                                                    : undefined
                                            }
                                        />
                                    ))
                                )}
                            </div>

                            {/* Navigation buttons inside footer area */}
                            <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t pt-6 sm:flex-row">
                                <Link
                                    href={`/submissions/wizard/${submission.id}/step3`}
                                    className="inline-flex w-full items-center justify-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition hover:bg-muted sm:w-auto"
                                >
                                    <ArrowLeft className="h-4 w-4" /> Kembali
                                </Link>

                                <div className="flex w-full flex-col items-center gap-2 sm:w-auto sm:flex-row">
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        className="w-full gap-2 sm:w-auto"
                                        onClick={(e) => handleSubmit(e, 'draft')}
                                        disabled={processing}
                                    >
                                        <Save className="h-4 w-4" /> Simpan sebagai Draft
                                    </Button>

                                    <Button type="submit" className="w-full gap-2 sm:w-auto" disabled={processing || data.contributors.length === 0}>
                                        Lanjut <ArrowRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
