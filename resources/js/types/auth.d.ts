export interface User {
    id: number;
    name: string;
    email: string;
    avatar_url?: string;
    phone?: string;
    position?: string;
    role: Role;
    university: University;
    is_active: boolean;
    last_login_at?: string;
    created_at: string;
    updated_at: string;
}

export interface Role {
    id: number;
    name: 'superadmin' | 'admin' | 'user';
    display_name: string;
    description?: string;
}

export interface University {
    id: number;
    code: string;
    name: string;
    short_name: string;
    city: string;
    province: string;
    logo_url?: string;
}

// Inertia auth page props
export interface PageProps {
    auth: {
        user: User | null;
    };
    flash: {
        success?: string;
        error?: string;
    };
}
