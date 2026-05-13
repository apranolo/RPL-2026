import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { AssessmentIssue } from '@/types';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface IssueFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (issue: Omit<AssessmentIssue, 'id' | 'journal_assessment_id' | 'created_at' | 'updated_at' | 'display_order'>) => void;
    issue?: AssessmentIssue | null;
    mode?: 'create' | 'edit';
}

export default function IssueFormDialog({ open, onOpenChange, onSave, issue, mode = 'create' }: IssueFormDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'editorial' as AssessmentIssue['category'],
        priority: 'medium' as AssessmentIssue['priority'],
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Reset form when dialog opens or issue changes
    useEffect(() => {
        if (open) {
            if (mode === 'edit' && issue) {
                setFormData({
                    title: issue.title,
                    description: issue.description,
                    category: issue.category,
                    priority: issue.priority,
                });
            } else {
                setFormData({
                    title: '',
                    description: '',
                    category: 'editorial',
                    priority: 'medium',
                });
            }
            setErrors({});
        }
    }, [open, issue, mode]);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Title is required';
        } else if (formData.title.length > 200) {
            newErrors.title = 'Title must not exceed 200 characters';
        }

        if (!formData.description.trim()) {
            newErrors.description = 'Description is required';
        } else if (formData.description.length > 1000) {
            newErrors.description = 'Description must not exceed 1000 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        // Simulate async operation
        setTimeout(() => {
            onSave(formData);
            setIsSubmitting(false);
            onOpenChange(false);
        }, 300);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>{mode === 'edit' ? 'Edit Issue' : 'Add New Issue'}</DialogTitle>
                        <DialogDescription>
                            {mode === 'edit' ? 'Update the issue details below.' : 'Describe the problem or issue found in the journal.'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        {/* Title */}
                        <div className="space-y-2">
                            <Label htmlFor="title">
                                Title <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="title"
                                placeholder="e.g., Missing editorial board information"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                maxLength={200}
                                className={errors.title ? 'border-destructive' : ''}
                            />
                            <div className="flex justify-between text-xs">
                                {errors.title && <span className="text-destructive">{errors.title}</span>}
                                <span className="ml-auto text-muted-foreground">{formData.title.length}/200</span>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <Label htmlFor="description">
                                Description <span className="text-destructive">*</span>
                            </Label>
                            <Textarea
                                id="description"
                                placeholder="Provide detailed description of the issue..."
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={4}
                                maxLength={1000}
                                className={errors.description ? 'border-destructive' : ''}
                            />
                            <div className="flex justify-between text-xs">
                                {errors.description && <span className="text-destructive">{errors.description}</span>}
                                <span className="ml-auto text-muted-foreground">{formData.description.length}/1000</span>
                            </div>
                        </div>

                        {/* Category */}
                        <div className="space-y-2">
                            <Label htmlFor="category">
                                Category <span className="text-destructive">*</span>
                            </Label>
                            <Select
                                value={formData.category}
                                onValueChange={(value: AssessmentIssue['category']) => setFormData({ ...formData, category: value })}
                            >
                                <SelectTrigger id="category">
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="editorial">Editorial</SelectItem>
                                    <SelectItem value="technical">Technical</SelectItem>
                                    <SelectItem value="content_quality">Content Quality</SelectItem>
                                    <SelectItem value="management">Management</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Priority */}
                        <div className="space-y-2">
                            <Label htmlFor="priority">
                                Priority <span className="text-destructive">*</span>
                            </Label>
                            <Select
                                value={formData.priority}
                                onValueChange={(value: AssessmentIssue['priority']) => setFormData({ ...formData, priority: value })}
                            >
                                <SelectTrigger id="priority">
                                    <SelectValue placeholder="Select priority" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="high">High</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="low">Low</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : mode === 'edit' ? (
                                'Update Issue'
                            ) : (
                                'Add Issue'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
