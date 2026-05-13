import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AssessmentJournalMetadata } from '@/types';
import { BookOpen, Plus } from 'lucide-react';
import { useState } from 'react';
import JournalMetadataCard from './JournalMetadataCard';
import JournalMetadataFormDialog from './JournalMetadataFormDialog';

interface JournalMetadataManagerProps {
    metadata: AssessmentJournalMetadata[];
    onChange: (metadata: AssessmentJournalMetadata[]) => void;
    readOnly?: boolean;
    aggregateCounts?: {
        jumlah_editor?: number;
        jumlah_reviewer?: number;
        jumlah_author?: number;
        jumlah_institusi_editor?: number;
        jumlah_institusi_reviewer?: number;
        jumlah_institusi_author?: number;
    };
}

export default function JournalMetadataManager({ metadata = [], onChange, readOnly = false, aggregateCounts = {} }: JournalMetadataManagerProps) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [editingMetadata, setEditingMetadata] = useState<AssessmentJournalMetadata | null>(null);
    const [deletingIndex, setDeletingIndex] = useState<number | null>(null);
    const [mode, setMode] = useState<'create' | 'edit'>('create');

    const handleAddMetadata = (
        metadataData: Omit<AssessmentJournalMetadata, 'id' | 'journal_assessment_id' | 'created_at' | 'updated_at' | 'display_order'>,
    ) => {
        const newMetadata: AssessmentJournalMetadata = {
            ...metadataData,
            id: Date.now(), // Temporary ID for frontend
            journal_assessment_id: 0, // Will be set on backend
            display_order: metadata.length,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };

        onChange([...metadata, newMetadata]);
    };

    const handleEditMetadata = (
        metadataData: Omit<AssessmentJournalMetadata, 'id' | 'journal_assessment_id' | 'created_at' | 'updated_at' | 'display_order'>,
    ) => {
        if (!editingMetadata) return;

        const updatedMetadata = metadata.map((item) =>
            item.id === editingMetadata.id
                ? {
                      ...item,
                      ...metadataData,
                      updated_at: new Date().toISOString(),
                  }
                : item,
        );

        onChange(updatedMetadata);
        setEditingMetadata(null);
    };

    const handleDeleteMetadata = () => {
        if (deletingIndex === null) return;

        const updatedMetadata = metadata.filter((_, index) => index !== deletingIndex);
        onChange(updatedMetadata);
        setDeletingIndex(null);
        setDeleteDialogOpen(false);
    };

    const openAddDialog = () => {
        setMode('create');
        setEditingMetadata(null);
        setDialogOpen(true);
    };

    const openEditDialog = (item: AssessmentJournalMetadata) => {
        setMode('edit');
        setEditingMetadata(item);
        setDialogOpen(true);
    };

    const openDeleteDialog = (index: number) => {
        setDeletingIndex(index);
        setDeleteDialogOpen(true);
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Data Terbitan Jurnal</CardTitle>
                            <p className="mt-1 text-sm text-muted-foreground">
                                {readOnly ? 'Informasi terbitan jurnal yang dinilai' : 'Tambahkan informasi terbitan jurnal (volume, nomor, tahun)'}
                            </p>
                        </div>
                        {!readOnly && (
                            <Button onClick={openAddDialog} size="sm">
                                <Plus className="mr-2 h-4 w-4" />
                                Tambah Terbitan
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    {metadata.length === 0 ? (
                        <div className="py-12 text-center">
                            <BookOpen className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
                            <p className="mb-2 text-muted-foreground">
                                {readOnly ? 'Tidak ada data terbitan yang dicatat' : 'Belum ada data terbitan jurnal'}
                            </p>
                            {!readOnly && (
                                <p className="mb-4 text-sm text-muted-foreground">Tambahkan minimal satu terbitan jurnal untuk assessment</p>
                            )}
                            {!readOnly && (
                                <Button onClick={openAddDialog} variant="outline" size="sm">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Tambah Terbitan Pertama
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {metadata.map((item, index) => (
                                <JournalMetadataCard
                                    key={item.id}
                                    metadata={item}
                                    readOnly={readOnly}
                                    onEdit={() => openEditDialog(item)}
                                    onDelete={() => openDeleteDialog(index)}
                                />
                            ))}
                        </div>
                    )}

                    {!readOnly && metadata.length > 0 && (
                        <div className="mt-4 border-t pt-4">
                            <p className="text-sm text-muted-foreground">
                                Total: <span className="font-medium">{metadata.length}</span> {metadata.length === 1 ? 'terbitan' : 'terbitan'}
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Add/Edit Dialog */}
            <JournalMetadataFormDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onSave={mode === 'edit' ? handleEditMetadata : handleAddMetadata}
                metadata={editingMetadata}
                mode={mode}
                aggregateCounts={aggregateCounts}
            />

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Data Terbitan?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Data terbitan ini akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteMetadata}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
