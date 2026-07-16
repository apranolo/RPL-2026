import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';

interface SchemeOption {
    value: string;
    label: string;
}

interface FilterBarProps {
    currentYear?: number;
    currentScheme?: string;
    schemeOptions?: SchemeOption[];
}

export function FilterBar({ currentYear, currentScheme, schemeOptions = [] }: FilterBarProps) {
    const [year, setYear] = useState(currentYear || new Date().getFullYear());
    const [scheme, setScheme] = useState(currentScheme || 'all');

    useEffect(() => {
        setYear(currentYear || new Date().getFullYear());
        setScheme(currentScheme || 'all');
    }, [currentYear, currentScheme]);

    const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);

    const schemes = schemeOptions.length > 0
        ? schemeOptions
        : [
            { value: 'all', label: 'Semua Skema' },
            { value: 'draft', label: 'Draft' },
            { value: 'active', label: 'Aktif' },
            { value: 'completed', label: 'Selesai' },
            { value: 'cancelled', label: 'Dibatalkan' },
        ];

    const handleFilter = () => {
        router.get(
            route('finance.reports.index'),
            {
                year,
                scheme,
            },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const handleReset = () => {
        setYear(new Date().getFullYear());
        setScheme('all');
        router.get(
            route('finance.reports.index'),
            {},
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Filter Data Keuangan</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                        <Label htmlFor="year">Tahun</Label>
                        <Select value={year.toString()} onValueChange={(value) => setYear(parseInt(value))}>
                            <SelectTrigger id="year">
                                <SelectValue placeholder="Pilih tahun" />
                            </SelectTrigger>
                            <SelectContent>
                                {years.map((y) => (
                                    <SelectItem key={y} value={y.toString()}>
                                        {y}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="scheme">Skema</Label>
                        <Select value={scheme} onValueChange={setScheme}>
                            <SelectTrigger id="scheme">
                                <SelectValue placeholder="Pilih skema" />
                            </SelectTrigger>
                            <SelectContent>
                                {schemes.map((s) => (
                                    <SelectItem key={s.value} value={s.value}>
                                        {s.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-end gap-2">
                        <Button onClick={handleFilter} className="flex-1">
                            Terapkan Filter
                        </Button>
                        <Button variant="outline" onClick={handleReset}>
                            Reset
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
