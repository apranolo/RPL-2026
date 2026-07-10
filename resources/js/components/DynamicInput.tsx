/**
 * DynamicInput Component
 *
 * @description
 * Reusable dynamic input component for Kriteria Penilaian forms.
 * Renders different input types based on the answer_type selection:
 * - boolean: Switch/toggle
 * - scale: Slider with 1-5 range
 * - text: Textarea input
 *
 * Also supports dynamic form field rows that can be added/removed,
 * useful for batch creation of criteria.
 *
 * @author JurnalMU Team
 */
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { GripVertical, Plus, Trash2 } from 'lucide-react';
import React from 'react';

// --- Answer Type Preview ---

interface AnswerTypePreviewProps {
    answerType: 'boolean' | 'scale' | 'text' | string;
    className?: string;
}

/**
 * Renders a preview of the answer input based on answer_type.
 * Used in the criteria form to show what the evaluator will see.
 */
export function AnswerTypePreview({ answerType, className }: AnswerTypePreviewProps) {
    return (
        <div className={cn('rounded-lg border border-dashed bg-muted/30 p-4', className)}>
            <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Pratinjau Input Jawaban</p>

            {answerType === 'boolean' && (
                <div className="flex items-center gap-3">
                    <Switch disabled checked={false} />
                    <span className="text-sm text-muted-foreground">Ya / Tidak</span>
                </div>
            )}

            {answerType === 'scale' && (
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Skala 1-5</span>
                    </div>
                    <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((value) => (
                            <button
                                key={value}
                                type="button"
                                disabled
                                className={cn(
                                    'flex h-10 w-10 items-center justify-center rounded-lg border text-sm font-medium transition-colors',
                                    value === 3
                                        ? 'border-primary bg-primary text-primary-foreground'
                                        : 'border-border bg-background text-muted-foreground',
                                )}
                            >
                                {value}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {answerType === 'text' && (
                <Textarea disabled placeholder="Jawaban teks akan diisi di sini..." rows={3} className="resize-none opacity-60" />
            )}

            {!answerType && <p className="text-sm italic text-muted-foreground">Pilih tipe jawaban untuk melihat pratinjau</p>}
        </div>
    );
}

// --- Dynamic Field Row ---

export interface DynamicFieldValue {
    id: string;
    code: string;
    question: string;
    weight: string;
    answer_type: 'boolean' | 'scale' | 'text' | '';
}

interface DynamicFieldRowProps {
    index: number;
    value: DynamicFieldValue;
    onChange: (index: number, field: keyof DynamicFieldValue, value: string) => void;
    onRemove: (index: number) => void;
    errors?: Record<string, string>;
    canRemove: boolean;
}

/**
 * A single row of dynamic form fields for batch criteria creation.
 */
function DynamicFieldRow({ index, value, onChange, onRemove, errors, canRemove }: DynamicFieldRowProps) {
    const getError = (field: string) => errors?.[`items.${index}.${field}`];

    return (
        <div className="group relative flex items-start gap-3 rounded-lg border bg-card p-4 transition-colors hover:bg-accent/30">
            {/* Drag handle placeholder */}
            <div className="mt-2 flex-shrink-0 cursor-grab text-muted-foreground/40">
                <GripVertical className="h-5 w-5" />
            </div>

            <div className="flex-1 space-y-4">
                <div className="grid gap-4 sm:grid-cols-3">
                    {/* Code */}
                    <div className="space-y-1.5">
                        <Label htmlFor={`item-${index}-code`} className="text-xs">
                            Kode <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id={`item-${index}-code`}
                            value={value.code}
                            onChange={(e) => onChange(index, 'code', e.target.value)}
                            placeholder="e.g., KP-01"
                            className={cn('h-9', getError('code') && 'border-destructive')}
                        />
                        {getError('code') && <p className="text-xs text-destructive">{getError('code')}</p>}
                    </div>

                    {/* Weight */}
                    <div className="space-y-1.5">
                        <Label htmlFor={`item-${index}-weight`} className="text-xs">
                            Bobot <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id={`item-${index}-weight`}
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            value={value.weight}
                            onChange={(e) => onChange(index, 'weight', e.target.value)}
                            placeholder="0.00"
                            className={cn('h-9', getError('weight') && 'border-destructive')}
                        />
                        {getError('weight') && <p className="text-xs text-destructive">{getError('weight')}</p>}
                    </div>

                    {/* Answer Type */}
                    <div className="space-y-1.5">
                        <Label htmlFor={`item-${index}-answer_type`} className="text-xs">
                            Tipe Jawaban <span className="text-destructive">*</span>
                        </Label>
                        <Select value={value.answer_type} onValueChange={(v) => onChange(index, 'answer_type', v)}>
                            <SelectTrigger id={`item-${index}-answer_type`} className={cn('h-9', getError('answer_type') && 'border-destructive')}>
                                <SelectValue placeholder="Pilih tipe" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="boolean">Ya/Tidak</SelectItem>
                                <SelectItem value="scale">Skala 1-5</SelectItem>
                                <SelectItem value="text">Teks</SelectItem>
                            </SelectContent>
                        </Select>
                        {getError('answer_type') && <p className="text-xs text-destructive">{getError('answer_type')}</p>}
                    </div>
                </div>

                {/* Question */}
                <div className="space-y-1.5">
                    <Label htmlFor={`item-${index}-question`} className="text-xs">
                        Pertanyaan <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                        id={`item-${index}-question`}
                        value={value.question}
                        onChange={(e) => onChange(index, 'question', e.target.value)}
                        placeholder="Tuliskan pertanyaan kriteria penilaian..."
                        rows={2}
                        className={cn('resize-none', getError('question') && 'border-destructive')}
                    />
                    {getError('question') && <p className="text-xs text-destructive">{getError('question')}</p>}
                </div>
            </div>

            {/* Remove button */}
            {canRemove && (
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemove(index)}
                    className="mt-1 h-8 w-8 flex-shrink-0 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            )}
        </div>
    );
}

// --- Dynamic Input Container ---

interface DynamicInputProps {
    items: DynamicFieldValue[];
    onChange: (items: DynamicFieldValue[]) => void;
    errors?: Record<string, string>;
    maxItems?: number;
}

/**
 * Dynamic input container for batch creation of criteria.
 * Manages a list of DynamicFieldRow components with add/remove functionality.
 */
export function DynamicInput({ items, onChange, errors, maxItems = 20 }: DynamicInputProps) {
    const generateId = () => `item-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

    const handleFieldChange = (index: number, field: keyof DynamicFieldValue, value: string) => {
        const updated = [...items];
        updated[index] = { ...updated[index], [field]: value };
        onChange(updated);
    };

    const handleAdd = () => {
        if (items.length >= maxItems) return;
        onChange([
            ...items,
            {
                id: generateId(),
                code: '',
                question: '',
                weight: '1.00',
                answer_type: '',
            },
        ]);
    };

    const handleRemove = (index: number) => {
        const updated = items.filter((_, i) => i !== index);
        onChange(updated);
    };

    return (
        <div className="space-y-3">
            {items.map((item, index) => (
                <DynamicFieldRow
                    key={item.id}
                    index={index}
                    value={item}
                    onChange={handleFieldChange}
                    onRemove={handleRemove}
                    errors={errors}
                    canRemove={items.length > 1}
                />
            ))}

            {items.length < maxItems && (
                <Button type="button" variant="outline" size="sm" onClick={handleAdd} className="w-full gap-2 border-dashed">
                    <Plus className="h-4 w-4" />
                    Tambah Kriteria
                </Button>
            )}

            {items.length >= maxItems && (
                <p className="text-center text-sm text-muted-foreground">Maksimal {maxItems} kriteria per batch.</p>
            )}
        </div>
    );
}

export default DynamicInput;
