/**
 * Vitest tests for the ProfileCard component.
 *
 * Tests:
 * - Renders avatar image when avatar_url is set
 * - Renders initials fallback when avatar_url is absent
 * - Renders the first letter of name as fallback when initials is also absent
 * - Shows Verified badge when email_verified_at is set
 * - Does NOT show Verified badge when email_verified_at is absent
 * - Renders phone when provided
 * - Does NOT render phone row when phone is absent
 * - Renders university info when provided
 * - Does NOT render university row when university is absent
 * - Renders scientific_field when provided
 * - Edit Profile button links to /settings/profile
 */

import ProfileCard from '@/components/profile/ProfileCard';
import { render, screen } from '@testing-library/react';
import { beforeAll, describe, expect, it, vi } from 'vitest';

// Mock @inertiajs/react (Link + route helper)
vi.mock('@inertiajs/react', () => ({
    Link: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}));

// Mock the global route() Ziggy function
beforeAll(() => {
    (globalThis as Record<string, unknown>).route = (name: string) => `/${name.replace(/\./g, '/')}`;
});

const baseUser = {
    id: 1,
    name: 'Dewi Rahayu',
    email: 'dewi@example.com',
    initials: 'DR',
    phone: undefined as string | undefined,
    position: undefined as string | undefined,
    avatar_url: undefined as string | undefined,
    email_verified_at: undefined as string | undefined,
    university: undefined as { id: number; name: string; short_name?: string } | undefined,
    scientific_field: undefined as { id: number; name: string; code: string } | undefined,
};

describe('ProfileCard', () => {
    describe('Avatar rendering', () => {
        it('renders the avatar image when avatar_url is set', () => {
            render(<ProfileCard user={{ ...baseUser, avatar_url: '/storage/avatars/test.jpg' }} />);

            const img = screen.getByRole('img', { name: 'Dewi Rahayu' });
            expect(img).toBeInTheDocument();
            expect(img).toHaveAttribute('src', '/storage/avatars/test.jpg');
        });

        it('renders initials fallback when avatar_url is absent but initials is set', () => {
            render(<ProfileCard user={{ ...baseUser, avatar_url: undefined, initials: 'DR' }} />);

            expect(screen.queryByRole('img', { name: 'Dewi Rahayu' })).not.toBeInTheDocument();
            expect(screen.getByText('DR')).toBeInTheDocument();
        });

        it('renders first letter of name when neither avatar_url nor initials are set', () => {
            render(<ProfileCard user={{ ...baseUser, avatar_url: undefined, initials: undefined }} />);

            expect(screen.getByText('D')).toBeInTheDocument();
        });
    });

    describe('Email verification badge', () => {
        it('shows Verified badge when email_verified_at is provided', () => {
            render(<ProfileCard user={{ ...baseUser, email_verified_at: '2025-01-01T00:00:00.000Z' }} />);

            expect(screen.getByText('Verified')).toBeInTheDocument();
        });

        it('does NOT show Verified badge when email_verified_at is absent', () => {
            render(<ProfileCard user={{ ...baseUser, email_verified_at: undefined }} />);

            expect(screen.queryByText('Verified')).not.toBeInTheDocument();
        });
    });

    describe('Phone and position', () => {
        it('renders phone number when provided', () => {
            render(<ProfileCard user={{ ...baseUser, phone: '+6281234567890' }} />);

            expect(screen.getByText('+6281234567890')).toBeInTheDocument();
        });

        it('does NOT render phone row when phone is absent', () => {
            render(<ProfileCard user={{ ...baseUser, phone: undefined }} />);

            expect(screen.queryByText(/\+62/)).not.toBeInTheDocument();
        });
    });

    describe('University', () => {
        it('renders university short_name when available', () => {
            render(
                <ProfileCard
                    user={{
                        ...baseUser,
                        university: { id: 1, name: 'Universitas Ahmad Dahlan', short_name: 'UAD' },
                    }}
                />,
            );

            expect(screen.getByText('UAD')).toBeInTheDocument();
        });

        it('falls back to full university name when short_name is absent', () => {
            render(
                <ProfileCard
                    user={{
                        ...baseUser,
                        university: { id: 2, name: 'Universitas Muhammadiyah Yogyakarta' },
                    }}
                />,
            );

            expect(screen.getByText('Universitas Muhammadiyah Yogyakarta')).toBeInTheDocument();
        });

        it('does NOT render university row when university is absent', () => {
            render(<ProfileCard user={{ ...baseUser, university: undefined }} />);

            expect(screen.queryByText('UAD')).not.toBeInTheDocument();
            expect(screen.queryByText('Universitas')).not.toBeInTheDocument();
        });
    });

    describe('Scientific field', () => {
        it('renders scientific field code and name when provided', () => {
            render(
                <ProfileCard
                    user={{
                        ...baseUser,
                        scientific_field: { id: 1, code: 'TI', name: 'Teknik Informatika' },
                    }}
                />,
            );

            expect(screen.getByText('TI - Teknik Informatika')).toBeInTheDocument();
        });

        it('does NOT render scientific_field row when absent', () => {
            render(<ProfileCard user={{ ...baseUser, scientific_field: undefined }} />);

            expect(screen.queryByText(/TI/)).not.toBeInTheDocument();
        });
    });

    describe('Edit Profile button', () => {
        it('renders the Edit Profile link', () => {
            render(<ProfileCard user={baseUser} />);

            const link = screen.getByRole('link', { name: /Edit Profile/i });
            expect(link).toBeInTheDocument();
            expect(link).toHaveAttribute('href', '/profile/edit');
        });
    });

    describe('User name and position', () => {
        it('renders the user name', () => {
            render(<ProfileCard user={baseUser} />);

            expect(screen.getByText('Dewi Rahayu')).toBeInTheDocument();
        });

        it('renders position when provided', () => {
            render(<ProfileCard user={{ ...baseUser, position: 'Senior Researcher' }} />);

            expect(screen.getByText('Senior Researcher')).toBeInTheDocument();
        });

        it('does NOT render position when absent', () => {
            render(<ProfileCard user={{ ...baseUser, position: undefined }} />);

            expect(screen.queryByText('Senior Researcher')).not.toBeInTheDocument();
        });
    });
});
