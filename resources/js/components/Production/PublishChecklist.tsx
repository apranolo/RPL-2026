import { router } from '@inertiajs/react';
import { useState } from 'react';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

interface Props {
    journalId: number;
    volume: number;
    issue: number;
    metadataComplete: boolean;
    hasArticles: boolean;
    tocComplete: boolean;
}

export default function PublishChecklist({
    journalId,
    volume,
    issue,
    metadataComplete,
    hasArticles,
    tocComplete,
}: Props) {
    const [confirmed, setConfirmed] = useState(false);
    const [processing, setProcessing] = useState(false);

    const allRequirementsMet =
        metadataComplete &&
        hasArticles &&
        tocComplete;

    const handlePublish = () => {
        if (!allRequirementsMet || !confirmed || processing) {
            return;
        }

        router.post(
            route('user.journals.issues.publish', {
                journalId,
                volume,
                issue,
            }),
            {},
            {
                preserveScroll: true,

                onStart: () => {
                    setProcessing(true);
                },

                onFinish: () => {
                    setProcessing(false);
                },
            },
        );
    };

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button>
                    Publish Issue
                </Button>
            </AlertDialogTrigger>

            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        Konfirmasi Publish Issue
                    </AlertDialogTitle>

                    <AlertDialogDescription>
                        Pastikan seluruh persyaratan telah terpenuhi sebelum
                        issue diterbitkan ke publik.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="space-y-4 py-2">
                    <div className="flex items-center gap-3">
                        <Checkbox
                            checked={metadataComplete}
                            disabled
                        />
                        <span className="text-sm">
                            Metadata issue telah lengkap.
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        <Checkbox
                            checked={hasArticles}
                            disabled
                        />
                        <span className="text-sm">
                            Issue memiliki minimal satu artikel.
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        <Checkbox
                            checked={tocComplete}
                            disabled
                        />
                        <span className="text-sm">
                            Daftar isi dan informasi artikel telah diperiksa.
                        </span>
                    </div>

                    {!allRequirementsMet && (
                        <p className="text-sm text-destructive">
                            Lengkapi seluruh persyaratan sebelum mempublish
                            issue.
                        </p>
                    )}

                    <div className="border-t pt-4">
                        <div className="flex items-start gap-3">
                            <Checkbox
                                id="publish-confirmation"
                                checked={confirmed}
                                disabled={
                                    !allRequirementsMet ||
                                    processing
                                }
                                onCheckedChange={(value) =>
                                    setConfirmed(value === true)
                                }
                            />

                            <label
                                htmlFor="publish-confirmation"
                                className="cursor-pointer text-sm leading-5"
                            >
                                Saya telah memeriksa seluruh informasi dan
                                yakin ingin mempublish issue ini.
                            </label>
                        </div>
                    </div>
                </div>

                <AlertDialogFooter>
                    <AlertDialogCancel disabled={processing}>
                        Batal
                    </AlertDialogCancel>

                    <AlertDialogAction
                        disabled={
                            !allRequirementsMet ||
                            !confirmed ||
                            processing
                        }
                        onClick={(event) => {
                            event.preventDefault();
                            handlePublish();
                        }}
                    >
                        {processing
                            ? 'Mempublish...'
                            : 'Publish Issue'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}