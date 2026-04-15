/**
 * MultiRoleSelect Component
 *
 * @description
 * A checkbox-based multi-select component for assigning multiple roles to users.
 * Displays roles as checkboxes with labels and descriptions.
 *
 * @component
 *
 * @interface Role
 * @property {number} id - Unique identifier for the role
 * @property {string} name - Role name (e.g., "Pengelola Jurnal")
 * @property {string} display_name - Human-readable display name
 * @property {string} description - Role description
 *
 * @interface Props
 * @property {Role[]} roles - Array of available roles to choose from
 * @property {number[]} selectedRoleIds - Array of selected role IDs
 * @property {(roleIds: number[]) => void} onChange - Callback when selection changes
 * @property {string} [error] - Error message to display
 * @property {string} [label] - Label for the field
 * @property {boolean} [required] - Whether at least one role must be selected
 *
 * @example
 * ```tsx
 * <MultiRoleSelect
 *   roles={availableRoles}
 *   selectedRoleIds={[1, 3]}
 *   onChange={(ids) => setData('role_ids', ids)}
 *   label="Assign Roles"
 *   required
 * />
 * ```
 *
 * @author JurnalMU Team
 * @filepath /resources/js/components/multi-role-select.tsx
 */
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface Role {
    id: number;
    name: string;
    display_name: string;
    description: string;
}

interface Props {
    roles: Role[];
    selectedRoleIds: number[];
    onChange: (roleIds: number[]) => void;
    error?: string;
    label?: string;
    required?: boolean;
}

export default function MultiRoleSelect({ roles, selectedRoleIds, onChange, error, label = 'Roles', required = false }: Props) {
    const handleRoleToggle = (roleId: number, checked: boolean) => {
        if (checked) {
            // Add role
            onChange([...selectedRoleIds, roleId]);
        } else {
            // Remove role
            onChange(selectedRoleIds.filter((id) => id !== roleId));
        }
    };

    return (
        <div className="space-y-3">
            <Label>
                {label} {required && <span className="text-red-500">*</span>}
            </Label>

            <div className="space-y-3 rounded-md border border-sidebar-border/70 bg-muted/30 p-4 dark:border-sidebar-border dark:bg-muted/10">
                {roles.map((role) => (
                    <div key={role.id} className="flex items-start space-x-3">
                        <Checkbox
                            id={`role-${role.id}`}
                            checked={selectedRoleIds.includes(role.id)}
                            onCheckedChange={(checked) => handleRoleToggle(role.id, checked as boolean)}
                        />
                        <div className="flex-1 space-y-1">
                            <Label
                                htmlFor={`role-${role.id}`}
                                className="cursor-pointer text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                {role.display_name}
                            </Label>
                            {role.description && <p className="text-xs text-muted-foreground">{role.description}</p>}
                        </div>
                    </div>
                ))}
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            {required && selectedRoleIds.length === 0 && <p className="text-xs text-muted-foreground">* Please select at least one role</p>}
        </div>
    );
}
