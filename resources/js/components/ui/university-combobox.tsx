/**
 * UniversityCombobox Component
 *
 * @description
 * Searchable combobox for selecting universities from a large list (172+ items).
 * Provides better UX than standard dropdown with search/filter functionality.
 *
 * @features
 * - Real-time search by code, short_name, or full name
 * - Keyboard navigation (arrow keys, enter, escape)
 * - Mobile-friendly with responsive design
 * - "No results" feedback
 * - Displays "Name (PTM Code)" format for better readability
 *
 * @author JurnalMU Team
 */

import * as React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export type University = {
    id: number;
    name: string;
    code: string;
    short_name?: string;
};

interface UniversityComboboxProps {
    universities: University[];
    value: string; // Selected university ID as string
    onValueChange: (value: string) => void;
    placeholder?: string;
    emptyText?: string;
    disabled?: boolean;
    loading?: boolean;
    className?: string;
    error?: string;
}

export function UniversityCombobox({
    universities,
    value,
    onValueChange,
    placeholder = 'Select university...',
    emptyText = 'No university found.',
    disabled = false,
    loading = false,
    className,
    error,
}: UniversityComboboxProps) {
    const [open, setOpen] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState('');

    // Performance-optimized filtering for large lists
    const filteredUniversities = React.useMemo(() => {
        if (!searchQuery.trim()) return universities;
        const query = searchQuery.toLowerCase();
        return universities.filter(
            (uni) =>
                uni.code.toLowerCase().includes(query) ||
                uni.name.toLowerCase().includes(query) ||
                uni.short_name?.toLowerCase().includes(query),
        );
    }, [universities, searchQuery]);

    // Find selected university
    const selectedUniversity = universities.find((uni) => uni.id.toString() === value);

    // Format display text: "Name (PTM Code)"
    const getDisplayText = (uni: University) => {
        return `${uni.short_name || uni.name} (${uni.code})`;
    };

    return (
        <div className="space-y-2">
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className={cn(
                            'w-full justify-between h-auto py-2',
                            !selectedUniversity && 'text-muted-foreground',
                            error && 'border-red-500',
                            className,
                        )}
                        disabled={disabled || loading}
                    >
                        <span className="text-left break-words overflow-hidden flex-1">
                            {loading ? 'Loading universities...' : selectedUniversity ? getDisplayText(selectedUniversity) : placeholder}
                        </span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0 z-50" align="start">
                    <Command shouldFilter={false}>
                        <CommandInput placeholder="Search by name or code..." value={searchQuery} onValueChange={setSearchQuery} />
                        <CommandList>
                            <CommandEmpty>{emptyText}</CommandEmpty>
                            <CommandGroup>
                                {filteredUniversities.map((uni) => (
                                    <CommandItem
                                        key={uni.id}
                                        value={uni.id.toString()}
                                        onSelect={() => {
                                            onValueChange(uni.id.toString());
                                            setSearchQuery('');
                                            setOpen(false);
                                        }}
                                    >
                                        <Check className={cn('mr-2 h-4 w-4', value === uni.id.toString() ? 'opacity-100' : 'opacity-0')} />
                                        <span className="flex-1 truncate">
                                            {uni.short_name || uni.name} <span className="text-muted-foreground">({uni.code})</span>
                                        </span>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
            {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        </div>
    );
}
