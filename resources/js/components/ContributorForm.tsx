import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

interface ContributorData {
    name: string;
    email: string;
    affiliation: string;
    is_corresponding: boolean;
}

interface ContributorFormProps {
    index: number;
    data: ContributorData;
    onChange: (index: number, field: keyof ContributorData, value: any) => void;
    onRemove: (index: number) => void;
    errors?: {
        name?: string;
        email?: string;
        affiliation?: string;
        is_corresponding?: string;
    };
}

export const ContributorForm: React.FC<ContributorFormProps> = ({
    index,
    data,
    onChange,
    onRemove,
    errors,
}) => {
    return (
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 p-4 border rounded-lg bg-card text-card-foreground shadow-sm mb-4">
            <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Name Input */}
                <div className="space-y-1">
                    <Label htmlFor={`contributor-name-${index}`} className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Name
                    </Label>
                    <Input
                        id={`contributor-name-${index}`}
                        type="text"
                        placeholder="John Doe"
                        value={data.name}
                        onChange={(e) => onChange(index, 'name', e.target.value)}
                        className={errors?.name ? 'border-destructive focus-visible:ring-destructive' : ''}
                    />
                    {errors?.name && (
                        <p className="text-xs text-destructive mt-1">{errors.name}</p>
                    )}
                </div>

                {/* Email Input */}
                <div className="space-y-1">
                    <Label htmlFor={`contributor-email-${index}`} className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Email
                    </Label>
                    <Input
                        id={`contributor-email-${index}`}
                        type="email"
                        placeholder="john.doe@example.com"
                        value={data.email}
                        onChange={(e) => onChange(index, 'email', e.target.value)}
                        className={errors?.email ? 'border-destructive focus-visible:ring-destructive' : ''}
                    />
                    {errors?.email && (
                        <p className="text-xs text-destructive mt-1">{errors.email}</p>
                    )}
                </div>

                {/* Affiliation Input */}
                <div className="space-y-1">
                    <Label htmlFor={`contributor-affiliation-${index}`} className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Affiliation
                    </Label>
                    <Input
                        id={`contributor-affiliation-${index}`}
                        type="text"
                        placeholder="University of Science"
                        value={data.affiliation}
                        onChange={(e) => onChange(index, 'affiliation', e.target.value)}
                        className={errors?.affiliation ? 'border-destructive focus-visible:ring-destructive' : ''}
                    />
                    {errors?.affiliation && (
                        <p className="text-xs text-destructive mt-1">{errors.affiliation}</p>
                    )}
                </div>
            </div>

            {/* Corresponding Author Checkbox */}
            <div className="flex items-center space-x-2 pt-2 md:pt-5 h-full">
                <Checkbox
                    id={`contributor-corresponding-${index}`}
                    checked={data.is_corresponding}
                    onCheckedChange={(checked) => onChange(index, 'is_corresponding', !!checked)}
                />
                <Label
                    htmlFor={`contributor-corresponding-${index}`}
                    className="text-sm font-medium leading-none cursor-pointer"
                >
                    Corresponding
                </Label>
            </div>

            {/* Remove Button */}
            <div className="pt-2 md:pt-5 w-full md:w-auto flex justify-end">
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => onRemove(index)}
                    aria-label="Remove contributor"
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
};

export default ContributorForm;
