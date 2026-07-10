import React, { useState } from "react";
import { Head, router } from "@inertiajs/react";

import AppLayout from "@/layouts/app-layout";

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
} from "@/components/ui/card";

interface Props {
    onBack: () => void;
}

export default function Step2Upload({ onBack }: Props) {
    const [manuscript, setManuscript] = useState<File | null>(null);
    const [supplementaryFiles, setSupplementaryFiles] = useState<File[]>([]);
    const [loading, setLoading] = useState(false);

    const handleSubmit = () => {
        if (!manuscript) {
            alert("File manuscript belum dipilih!");
            return;
        }

        const formData = new FormData();

        formData.append("manuscript", manuscript);

        supplementaryFiles.forEach((file, index) => {
            formData.append(`supplementary_files[${index}]`, file);
        });

        setLoading(true);

        router.post(
            "/wizard/step-2-upload",
            formData,
            {
                forceFormData: true,

                onSuccess: () => {
                    alert("Upload berhasil!");
                },

                onError: (errors) => {
                    console.log(errors);
                    alert("Upload gagal");
                },

                onFinish: () => {
                    setLoading(false);
                },
            }
        );
    };

    return (
        <AppLayout>
            <Head title="Submission Step 2" />

            <div className="space-y-6">

                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/">
                                Dashboard
                            </BreadcrumbLink>
                        </BreadcrumbItem>

                        <BreadcrumbSeparator />

                        <BreadcrumbItem>
                            <BreadcrumbLink href="/submission/step-1">
                                Submission
                            </BreadcrumbLink>
                        </BreadcrumbItem>

                        <BreadcrumbSeparator />

                        <BreadcrumbItem>
                            <BreadcrumbPage>
                                Step 2 Upload
                            </BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                <Card className="max-w-3xl">
                    <CardHeader>
                        <CardTitle>
                            Step 2 - Upload File
                        </CardTitle>

                        <CardDescription>
                            Unggah file manuscript utama beserta file tambahan
                            jika diperlukan.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6">

                        <div className="space-y-2">
                            <Label htmlFor="manuscript">
                                Manuscript Utama
                            </Label>

                            <Input
                                id="manuscript"
                                type="file"
                                accept=".pdf,.doc,.docx"
                                onChange={(e) =>
                                    setManuscript(
                                        e.target.files?.[0] || null
                                    )
                                }
                            />

                            <p className="text-sm text-muted-foreground">
                                Format yang diperbolehkan:
                                PDF, DOC, DOCX.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="supplementary">
                                Supplementary Files
                            </Label>

                            <Input
                                id="supplementary"
                                type="file"
                                multiple
                                onChange={(e) =>
                                    setSupplementaryFiles(
                                        e.target.files
                                            ? Array.from(e.target.files)
                                            : []
                                    )
                                }
                            />

                            <p className="text-sm text-muted-foreground">
                                File tambahan bersifat opsional.
                            </p>
                        </div>

                    </CardContent>

                    <CardFooter className="flex justify-between">

                        <Button
                            type="button"
                            variant="outline"
                            onClick={onBack}
                        >
                            Kembali
                        </Button>

                        <Button
                            type="button"
                            onClick={handleSubmit}
                            disabled={loading}
                        >
                            {loading
                                ? "Mengunggah..."
                                : "Lanjut ke Step 3"}
                        </Button>

                    </CardFooter>
                </Card>

            </div>
        </AppLayout>
    );
}