/**
 * UniversityFilterCombobox Component
 *
 * @description
 * Searchable combobox for filtering by university with "All Universities" option.
 * Optimized for filter dropdowns in admin panels.
 *
 * @features
 * - "All Universities" default option
 * - Real-time search functionality
 * - Compact display format
 * - Mobile-friendly
 *
 * @author JurnalMU Team
 */

import * as React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

// Flexible University type for filter component - only requires essential properties
export type UniversityOption = {
    id: number;
    name: string;
    code?: string;
    short_name?: string;
};

interface UniversityFilterComboboxProps {
    universities: UniversityOption[];
    value: string; // Selected university ID as string or 'all'
    onValueChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

export function UniversityFilterCombobox({
    universities,
    value,
    onValueChange,
    placeholder = 'All Universities',
    className,
}: UniversityFilterComboboxProps) {
    const [open, setOpen] = React.useState(false);

    // Find selected university
    const selectedUniversity = value === 'all' || !value ? null : universities.find((uni) => uni.id.toString() === value);

    // Format display text
    const getDisplayText = (uni: UniversityOption) => {
        return uni.code ? `${uni.code} - ${uni.short_name || uni.name}` : uni.name;
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" aria-expanded={open} className={cn('justify-between', className)}>
                    {selectedUniversity ? getDisplayText(selectedUniversity) : placeholder}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                <Command>
                    <CommandInput placeholder="Search university..." />
                    <CommandList>
                        <CommandEmpty>No university found.</CommandEmpty>
                        <CommandGroup>
                            {/* All Universities Option */}
                            <CommandItem
                                value="all universities"
                                onSelect={() => {
                                    onValueChange('all');
                                    setOpen(false);
                                }}
                            >
                                <Check className={cn('mr-2 h-4 w-4', !value || value === 'all' ? 'opacity-100' : 'opacity-0')} />
                                <span className="font-medium">All Universities</span>
                            </CommandItem>

                            {/* Individual Universities */}
                            {universities.map((uni) => (
                                <CommandItem
                                    key={uni.id}
                                    value={`${uni.code} ${uni.short_name} ${uni.name}`}
                                    onSelect={() => {
                                        onValueChange(uni.id.toString());
                                        setOpen(false);
                                    }}
                                >
                                    <Check className={cn('mr-2 h-4 w-4', value === uni.id.toString() ? 'opacity-100' : 'opacity-0')} />
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-xs">{uni.code}</span>
                                        <span className="text-sm">{uni.short_name || uni.name}</span>
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
