/**
 * JournalFilterCombobox Component
 *
 * @description
 * Searchable combobox for filtering by journal with "All Journals" option.
 * Optimized for filter dropdowns in admin panels.
 */

import * as React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export type JournalOption = {
    id: number;
    title: string;
    issn?: string;
};

interface JournalFilterComboboxProps {
    journals: JournalOption[];
    value: string; // Selected journal ID as string or 'all'
    onValueChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

export function JournalFilterCombobox({
    journals,
    value,
    onValueChange,
    placeholder = 'All Journals',
    className,
}: JournalFilterComboboxProps) {
    const [open, setOpen] = React.useState(false);

    // Find selected journal
    const selectedJournal = value === 'all' || !value ? null : journals.find((j) => j.id.toString() === value);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" aria-expanded={open} className={cn('justify-between w-full', className)}>
                    {selectedJournal ? selectedJournal.title : placeholder}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                <Command>
                    <CommandInput placeholder="Search journal..." />
                    <CommandList>
                        <CommandEmpty>No journal found.</CommandEmpty>
                        <CommandGroup>
                            {/* All Journals Option */}
                            <CommandItem
                                value="all journals"
                                onSelect={() => {
                                    onValueChange('all');
                                    setOpen(false);
                                }}
                            >
                                <Check className={cn('mr-2 h-4 w-4', !value || value === 'all' ? 'opacity-100' : 'opacity-0')} />
                                <span className="font-medium">All Journals</span>
                            </CommandItem>

                            {/* Individual Journals */}
                            {journals.map((j) => (
                                <CommandItem
                                    key={j.id}
                                    value={`${j.title} ${j.issn || ''}`}
                                    onSelect={() => {
                                        onValueChange(j.id.toString());
                                        setOpen(false);
                                    }}
                                >
                                    <Check className={cn('mr-2 h-4 w-4', value === j.id.toString() ? 'opacity-100' : 'opacity-0')} />
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium">{j.title}</span>
                                        {j.issn && <span className="text-xs text-muted-foreground">ISSN: {j.issn}</span>}
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
