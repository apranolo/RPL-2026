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
}

export default function PublishChecklist({
    journalId,
    volume,
    issue,
}: Props) {
    const [checked, setChecked] = useState(false);

    const handlePublish = () => {
        router.post(
            route('user.production.issue.publish', {
                journalId,
                volume,
                issue,
            }),
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
                        Publish Issue
                    </AlertDialogTitle>

                    <AlertDialogDescription>
                        Pastikan seluruh persyaratan telah terpenuhi sebelum issue dipublish.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="space-y-3 py-2">

                    <div className="flex items-center gap-2">
                        <Checkbox checked disabled />
                        <span>Metadata Issue telah lengkap</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <Checkbox checked disabled />
                        <span>Seluruh artikel telah masuk</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <Checkbox checked disabled />
                        <span>Daftar isi sudah benar</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <Checkbox checked={checked}
                            onCheckedChange={(v) => setChecked(v === true)}
                        />

                        <span>
                            Saya yakin ingin mempublish issue ini.
                        </span>
                    </div>

                </div>

                <AlertDialogFooter>

                    <AlertDialogCancel>
                        Batal
                    </AlertDialogCancel>

                    <AlertDialogAction
                        disabled={!checked}
                        onClick={handlePublish}
                    >
                        Publish
                    </AlertDialogAction>

                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}