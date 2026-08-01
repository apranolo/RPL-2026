import { useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface CancelReviewModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    assignmentId: number;
    reviewerName?: string;
}

/**
 * Confirmation modal for cancelling a review assignment invitation.
 *
 * Submits a POST to `review-assignments.cancel`. Only assignments still in
 * the 'Invited' status can actually be cancelled server-side; this modal
 * does not duplicate that check, it just surfaces whatever error message
 * the backend returns (e.g. via the `error` flash message).
 */
export default function CancelReviewModal({ open, onOpenChange, assignmentId, reviewerName }: CancelReviewModalProps) {
    const { data, setData, post, processing, reset, errors, clearErrors } = useForm<{ reason: string }>({ reason: '' });

    const cancelAssignment: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('review-assignments.cancel', assignmentId), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        clearErrors();
        reset();
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Cancel review invitation{reviewerName ? ` — ${reviewerName}` : ''}</DialogTitle>
                    <DialogDescription>
                        This will cancel the reviewer's invitation. This action can only be undone by re-inviting the reviewer.
                    </DialogDescription>
                </DialogHeader>

                <form className="space-y-4" onSubmit={cancelAssignment}>
                    <div className="grid gap-2">
                        <Label htmlFor="reason">Reason (optional)</Label>
                        <Textarea
                            id="reason"
                            name="reason"
                            value={data.reason}
                            onChange={(e) => setData('reason', e.target.value)}
                            placeholder="Let the reviewer know why this invitation was cancelled..."
                            maxLength={500}
                        />
                        <InputError message={errors.reason} />
                    </div>

                    <DialogFooter className="gap-2">
                        <DialogClose asChild>
                            <Button type="button" variant="secondary" onClick={closeModal}>
                                Keep invitation
                            </Button>
                        </DialogClose>

                        <Button type="submit" variant="destructive" disabled={processing}>
                            {processing ? 'Cancelling...' : 'Cancel invitation'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
