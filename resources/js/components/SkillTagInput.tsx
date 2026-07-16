import React, { KeyboardEvent, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface SkillTagInputProps {
    value: string[];
    onChange: (tags: string[]) => void;
    placeholder?: string;
    maxTags?: number;
}

export function SkillTagInput({
    value = [],
    onChange,
    placeholder = 'Tambah keahlian (tekan Enter atau koma)...',
    maxTags = 15,
}: SkillTagInputProps) {
    const [inputValue, setInputValue] = useState('');

    const addTag = (tag: string) => {
        const trimmedTag = tag.trim();
        if (!trimmedTag) return;

        if (value.includes(trimmedTag)) {
            toast.error('Keahlian tersebut sudah ditambahkan.');
            return;
        }

        if (value.length >= maxTags) {
            toast.error(`Maksimal ${maxTags} keahlian.`);
            return;
        }

        const newTags = [...value, trimmedTag];
        onChange(newTags);
        setInputValue('');
    };

    const removeTag = (indexToRemove: number) => {
        const newTags = value.filter((_, index) => index !== indexToRemove);
        onChange(newTags);
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTag(inputValue);
        } else if (e.key === ',') {
            e.preventDefault();
            addTag(inputValue);
        }
    };

    return (
        <div className="space-y-3">
            <div className="flex gap-2">
                <Input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className="flex-1"
                />
                <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => addTag(inputValue)}
                    className="border-primary/20 text-primary hover:bg-primary/5 hover:text-primary dark:border-primary/30 dark:hover:bg-primary/10"
                >
                    <Plus className="h-4 w-4 mr-1" />
                    Tambah
                </Button>
            </div>
            
            {value.length > 0 ? (
                <div className="flex flex-wrap gap-2 rounded-lg border border-dashed border-sidebar-border/80 bg-sidebar/5 p-3 dark:border-sidebar-border/40">
                    {value.map((tag, index) => (
                        <Badge
                            key={index}
                            variant="secondary"
                            className="bg-primary/10 text-primary hover:bg-primary/15 border-primary/20 dark:bg-primary/20 dark:text-primary-foreground dark:hover:bg-primary/35 flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full transition-all duration-200"
                        >
                            <span>{tag}</span>
                            <button
                                type="button"
                                onClick={() => removeTag(index)}
                                className="rounded-full p-0.5 hover:bg-primary/20 transition-colors"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    ))}
                </div>
            ) : (
                <p className="text-xs text-muted-foreground italic">Belum ada keahlian/minat penelitian yang ditambahkan.</p>
            )}
        </div>
    );
}
