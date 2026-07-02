import { describe, expect, it } from 'vitest';
import { canAccess } from '../permission';

describe('canAccess', () => {
    describe('Tanpa Batasan Akses', () => {
        it('mengizinkan akses jika menu tidak memiliki requiredPermission atau requiredRole', () => {
            const menu = { id: 'dashboard', label: 'Dashboard' };
            expect(canAccess({ menu })).toBe(true);
        });
    });

    describe('Super Admin Access', () => {
        it('mengizinkan akses Super Admin dari userRole ke semua menu', () => {
            const menu = { id: 'admin-settings', label: 'Settings', requiredRole: 'Admin' };
            expect(canAccess({ menu, userRole: 'Super Admin' })).toBe(true);
        });

        it('mengizinkan akses Super Admin dari userRoles ke semua menu', () => {
            const menu = { id: 'admin-settings', label: 'Settings', requiredPermission: 'edit-settings' };
            expect(canAccess({ menu, userRoles: ['Super Admin'] })).toBe(true);
        });
    });

    describe('Pengecekan Peran (Role)', () => {
        it('mengizinkan akses jika user memiliki role yang sesuai (string)', () => {
            const menu = { id: 'editor-zone', label: 'Editor Zone', requiredRole: 'Editor' };
            expect(canAccess({ menu, userRole: 'Editor' })).toBe(true);
            expect(canAccess({ menu, userRoles: ['Editor'] })).toBe(true);
        });

        it('mengizinkan akses jika user memiliki salah satu role yang sesuai (array)', () => {
            const menu = { id: 'special-zone', label: 'Special Zone', requiredRole: ['Editor', 'Reviewer'] };
            expect(canAccess({ menu, userRole: 'Reviewer' })).toBe(true);
            expect(canAccess({ menu, userRoles: ['Editor'] })).toBe(true);
        });

        it('menolak akses jika user tidak memiliki role yang sesuai', () => {
            const menu = { id: 'editor-zone', label: 'Editor Zone', requiredRole: 'Editor' };
            expect(canAccess({ menu, userRole: 'Reviewer' })).toBe(false);
            expect(canAccess({ menu, userRoles: ['Reviewer', 'Author'] })).toBe(false);
        });
    });

    describe('Pengecekan Izin (Permission)', () => {
        it('mengizinkan akses jika user memiliki permission yang sesuai (string)', () => {
            const menu = { id: 'edit-post', label: 'Edit Post', requiredPermission: 'edit-post' };
            expect(canAccess({ menu, userPermissions: ['edit-post'] })).toBe(true);
        });

        it('mengizinkan akses jika user memiliki salah satu permission yang sesuai (array)', () => {
            const menu = { id: 'post-actions', label: 'Post Actions', requiredPermission: ['edit-post', 'delete-post'] };
            expect(canAccess({ menu, userPermissions: ['delete-post'] })).toBe(true);
        });

        it('mengizinkan akses jika user memiliki permission wildcard (*)', () => {
            const menu = { id: 'secret-settings', label: 'Secret Settings', requiredPermission: 'view-secret' };
            expect(canAccess({ menu, userPermissions: ['*'] })).toBe(true);
        });

        it('menolak akses jika user tidak memiliki permission yang sesuai', () => {
            const menu = { id: 'edit-post', label: 'Edit Post', requiredPermission: 'edit-post' };
            expect(canAccess({ menu, userPermissions: ['view-post'] })).toBe(false);
        });
    });

    describe('Kombinasi Role dan Permission', () => {
        it('mengizinkan akses jika memenuhi kedua syarat role dan permission', () => {
            const menu = {
                id: 'super-action',
                label: 'Super Action',
                requiredRole: 'Editor',
                requiredPermission: 'publish-post',
            };
            expect(canAccess({ menu, userRole: 'Editor', userPermissions: ['publish-post'] })).toBe(true);
        });

        it('menolak akses jika role sesuai tapi permission tidak sesuai', () => {
            const menu = {
                id: 'super-action',
                label: 'Super Action',
                requiredRole: 'Editor',
                requiredPermission: 'publish-post',
            };
            expect(canAccess({ menu, userRole: 'Editor', userPermissions: ['view-post'] })).toBe(false);
        });

        it('menolak akses jika permission sesuai tapi role tidak sesuai', () => {
            const menu = {
                id: 'super-action',
                label: 'Super Action',
                requiredRole: 'Editor',
                requiredPermission: 'publish-post',
            };
            expect(canAccess({ menu, userRole: 'Reviewer', userPermissions: ['publish-post'] })).toBe(false);
        });
    });
});
