/**
 * Role name constants
 * These must match the role names in the database and the Role model constants
 * @see App\Models\Role
 */
export const ROLE_NAMES = {
    SUPER_ADMIN: 'Super Admin',
    ADMIN_KAMPUS: 'Admin Kampus',
    ADMIN_KEUANGAN: 'Admin Keuangan',
    USER: 'User',
    PENGELOLA_JURNAL: 'Pengelola Jurnal',
    REVIEWER: 'Reviewer',
    DOSEN: 'Dosen',
} as const;

/**
 * Type for role names
 */
export type RoleName = (typeof ROLE_NAMES)[keyof typeof ROLE_NAMES];
