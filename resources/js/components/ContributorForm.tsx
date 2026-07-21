import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2 } from 'lucide-react';
import React from 'react';

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

export const ContributorForm: React.FC<ContributorFormProps> = ({ index, data, onChange, onRemove, errors }) => {
    return (
        <div className="mb-4 flex flex-col items-start gap-4 rounded-lg border bg-card p-4 text-card-foreground shadow-sm md:flex-row md:items-center">
            <div className="grid w-full flex-1 grid-cols-1 gap-4 md:grid-cols-3">
                {/* Name Input */}
                <div className="space-y-1">
                    <Label htmlFor={`contributor-name-${index}`} className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
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
                    {errors?.name && <p className="mt-1 text-xs text-destructive">{errors.name}</p>}
                </div>

                {/* Email Input */}
                <div className="space-y-1">
                    <Label htmlFor={`contributor-email-${index}`} className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
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
                    {errors?.email && <p className="mt-1 text-xs text-destructive">{errors.email}</p>}
                </div>

                {/* Affiliation Input */}
                <div className="space-y-1">
                    <Label
                        htmlFor={`contributor-affiliation-${index}`}
                        className="text-xs font-semibold tracking-wider text-muted-foreground uppercase"
                    >
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
                    {errors?.affiliation && <p className="mt-1 text-xs text-destructive">{errors.affiliation}</p>}
                </div>
            </div>

            {/* Corresponding Author Checkbox */}
            <div className="flex h-full items-center space-x-2 pt-2 md:pt-5">
                <Checkbox
                    id={`contributor-corresponding-${index}`}
                    checked={data.is_corresponding}
                    onCheckedChange={(checked) => onChange(index, 'is_corresponding', !!checked)}
                />
                <Label htmlFor={`contributor-corresponding-${index}`} className="cursor-pointer text-sm leading-none font-medium">
                    Corresponding
                </Label>
            </div>

            {/* Remove Button */}
            <div className="flex w-full justify-end pt-2 md:w-auto md:pt-5">
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
