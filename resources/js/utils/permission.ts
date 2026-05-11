/**
 * Menu Access Validation Helper for Sidebar
 * Validates user permissions to display menu items
 */

interface MenuItem {
    id: string;
    label: string;
    route?: string;
    requiredPermission?: string | string[];
    requiredRole?: string | string[];
    icon?: string;
    children?: MenuItem[];
}

interface AccessCheckParams {
    menu: MenuItem;
    userPermissions?: string[];
    userRole?: string;
    userRoles?: string[];
}

/**
 * Check if user has access to a menu item
 * Validates both permissions and roles for sidebar menu visibility
 * @param menu - Menu item configuration
 * @param userPermissions - List of user permissions
 * @param userRole - Current user role
 * @param userRoles - List of user roles
 * @returns true if user can access the menu, false otherwise
 * @example
 * canAccess({
 *   menu: journalsMenu,
 *   userPermissions: ['view-journals', 'edit-journals'],
 *   userRole: 'admin-kampus'
 * })
 */

export function canAccess({ menu, userPermissions = [], userRole, userRoles = [] }: AccessCheckParams): boolean {
    // If no permission or role requirement, always show
    if (!menu.requiredPermission && !menu.requiredRole) {
        return true;
    }

    // Check super admin - can access everything
    if (userRole === 'super-admin' || userRoles.includes('super-admin')) {
        return true;
    }

    // Check if user has required role
    if (menu.requiredRole) {
        const requiredRoles = Array.isArray(menu.requiredRole) ? menu.requiredRole : [menu.requiredRole];

        const hasRequiredRole = requiredRoles.some((role) => userRole === role || userRoles.includes(role));

        if (!hasRequiredRole) {
            return false;
        }
    }

    // Check if user has required permission
    if (menu.requiredPermission) {
        const requiredPermissions = Array.isArray(menu.requiredPermission) ? menu.requiredPermission : [menu.requiredPermission];

        const hasRequiredPermission = requiredPermissions.some(
            (permission) =>
                userPermissions.includes('*') || // Wildcard permission
                userPermissions.includes(permission),
        );

        if (!hasRequiredPermission) {
            return false;
        }
    }

    return true;
}
