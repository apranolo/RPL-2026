import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import WizardProgressBar from '@/components/WizardProgressBar';
import ContributorForm from '@/components/ContributorForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, ArrowLeft, Save, ArrowRight } from 'lucide-react';
import { PageProps } from '@/types';

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
    const initialContributors = submission.contributors && submission.contributors.length > 0
        ? submission.contributors
        : [
            {
                name: auth.user.name,
                email: auth.user.email,
                affiliation: auth.user.university?.name || '',
                is_corresponding: true,
            }
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
            }
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
                [field]: value
            };
        }

        setData('contributors', updated);
    };

    const handleSubmit = (e: React.FormEvent, action?: 'draft') => {
        e.preventDefault();
        
        // Ensure at least one corresponding author is selected
        const hasCorresponding = data.contributors.some(c => c.is_corresponding);
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

            <div className="max-w-4xl mx-auto space-y-6 pb-12">
                {/* Progress Bar */}
                <Card className="border-none shadow-none bg-transparent">
                    <WizardProgressBar currentStep={4} />
                </Card>

                {/* Main Content Card */}
                <Card className="border border-border/50 shadow-md">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl font-bold">Contributors</CardTitle>
                        <CardDescription>
                            Manage the authors and contributors who helped write this manuscript. At least one author must be designated as the corresponding author.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={(e) => handleSubmit(e)} className="space-y-6">
                            {/* Title display */}
                            <div className="p-4 rounded-lg bg-muted/40 border border-muted/50 mb-6">
                                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
                                    Manuscript Title
                                </span>
                                <h3 className="text-base font-semibold text-foreground">
                                    {submission.title || 'Untitled Manuscript'}
                                </h3>
                            </div>

                            {/* Contributors List */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between border-b pb-2">
                                    <h4 className="font-semibold text-base">Author List</h4>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="gap-1.5"
                                        onClick={handleAddContributor}
                                    >
                                        <Plus className="h-4 w-4" /> Add Contributor
                                    </Button>
                                </div>

                                {data.contributors.length === 0 ? (
                                    <div className="text-center py-8 border-2 border-dashed rounded-lg bg-muted/20">
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
                                                errors && errors[`contributors.${index}.name` as any] ||
                                                errors && errors[`contributors.${index}.email` as any] ||
                                                errors && errors[`contributors.${index}.affiliation` as any]
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
                            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-t pt-6 mt-8">
                                <Link
                                    href={`/submissions/wizard/${submission.id}/step3`}
                                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 border rounded-md hover:bg-muted text-sm font-medium transition"
                                >
                                    <ArrowLeft className="h-4 w-4" /> Kembali
                                </Link>

                                <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        className="w-full sm:w-auto gap-2"
                                        onClick={(e) => handleSubmit(e, 'draft')}
                                        disabled={processing}
                                    >
                                        <Save className="h-4 w-4" /> Simpan sebagai Draft
                                    </Button>

                                    <Button
                                        type="submit"
                                        className="w-full sm:w-auto gap-2"
                                        disabled={processing || data.contributors.length === 0}
                                    >
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
