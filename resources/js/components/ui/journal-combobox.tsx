import * as React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export type Journal = {
    id: number;
    title: string;
    issn?: string;
    code?: string;
};

interface JournalComboboxProps {
    journals: Journal[];
    value: string;
    onValueChange: (value: string) => void;
    placeholder?: string;
    emptyText?: string;
    disabled?: boolean;
    loading?: boolean;
    className?: string;
    error?: string;
}

export function JournalCombobox({
    journals = [],
    value,
    onValueChange,
    placeholder = 'Pilih jurnal...',
    emptyText = 'Jurnal tidak ditemukan.',
    disabled = false,
    loading = false,
    className,
    error,
}: JournalComboboxProps) {
    const [open, setOpen] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState('');

    const selectedJournal = React.useMemo(() => {
        return journals.find((j) => String(j.id) === String(value));
    }, [journals, value]);

    const filteredJournals = React.useMemo(() => {
        if (!searchQuery) return journals;
        const query = searchQuery.toLowerCase();
        return journals.filter(
            (j) =>
                j.title.toLowerCase().includes(query) ||
                (j.issn && j.issn.toLowerCase().includes(query)) ||
                (j.code && j.code.toLowerCase().includes(query))
        );
    }, [journals, searchQuery]);

    return (
        <div className="w-full">
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        disabled={disabled || loading}
                        className={cn(
                            'w-full justify-between font-normal',
                            !value && 'text-muted-foreground',
                            error && 'border-red-500 focus:ring-red-500',
                            className
                        )}
                    >
                        <span className="truncate">
                            {selectedJournal
                                ? `${selectedJournal.title}${selectedJournal.issn ? ` (${selectedJournal.issn})` : ''}`
                                : placeholder}
                        </span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                    <Command>
                        <CommandInput
                            placeholder="Cari jurnal..."
                            value={searchQuery}
                            onValueChange={setSearchQuery}
                        />
                        <CommandList>
                            <CommandEmpty>{loading ? 'Memuat data...' : emptyText}</CommandEmpty>
                            <CommandGroup>
                                {filteredJournals.map((journal) => (
                                    <CommandItem
                                        key={journal.id}
                                        value={String(journal.id)}
                                        onSelect={(currentValue) => {
                                            onValueChange(currentValue === value ? '' : currentValue);
                                            setOpen(false);
                                        }}
                                    >
                                        <Check
                                            className={cn(
                                                'mr-2 h-4 w-4',
                                                String(value) === String(journal.id) ? 'opacity-100' : 'opacity-0'
                                            )}
                                        />
                                        <div className="flex flex-col">
                                            <span>{journal.title}</span>
                                            {journal.issn && (
                                                <span className="text-xs text-muted-foreground">ISSN: {journal.issn}</span>
                                            )}
                                        </div>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
            {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
        </div>
    );
}
