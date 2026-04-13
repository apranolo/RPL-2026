import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { ROLE_NAMES } from '@/constants/roles';
import { type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { Award, BookOpen, BookType, Box, Building2, ClipboardList, LayoutGrid, Library, LifeBuoy, UserCheck, Users, CalendarDays } from 'lucide-react';
import AppLogo from './app-logo';

// Common navigation items shared across all roles
const commonNavItems: NavItem[] = [
    {
        title: 'Support',
        href: route('support'),
        icon: LifeBuoy,
    },
    {
        title: 'Resources',
        href: route('resources'),
        icon: Box,
    },
];

export function AppSidebar() {
    const { auth } = usePage<SharedData>().props;
    const { user } = auth;

    // Base items available to everyone
    const baseNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
            icon: LayoutGrid,
        },
    ];

    // Role-specific items
    let roleNavItems: NavItem[] = [];

    if (!user.role) {
        // Fallback for users without assigned roles - show only common items
        roleNavItems = [...commonNavItems];
    } else if (user.role.name === ROLE_NAMES.SUPER_ADMIN) {
        roleNavItems = [
            {
                title: 'Data Master',
                href: route('admin.data-master.index'),
                icon: BookType,
            },
            {
                title: 'Borang Indikator',
                href: route('admin.borang-indikator.index'),
                icon: ClipboardList,
                items: [
                    { title: 'Templates', href: route('admin.templates.index') },
                    { title: 'List View', href: route('admin.borang-indikator.list') },
                ],
            },
            {
                title: 'Universities',
                href: route('admin.universities.index'),
                icon: Building2,
            },
            {
                title: 'User Management',
                href: '#',
                icon: Users,
                items: [
                    { title: 'Admin Kampus', href: route('admin.admin-kampus.index') },
                    { title: 'Pengelola Jurnal', href: route('admin.users.index') },
                    { title: 'Reviewer', href: route('admin.reviewers.index') },
                ],
            },
            {
                title: 'Journals',
                href: route('admin.journals.index'),
                icon: Library,
            },
            {
                title: 'Pembinaan',
                href: route('admin.pembinaan.index'),
                icon: Award,
            },
            {
                title: 'Reviewer Assignment',
                href: route('dikti.assessments.index'),
                icon: UserCheck,
            },
            ...commonNavItems,
        ];
    } else if (user.role.name === ROLE_NAMES.ADMIN_KAMPUS) {
        // Build Admin Kampus menu items
        const adminKampusItems: NavItem[] = [
            {
                title: 'Pengelola Jurnal',
                href: route('admin-kampus.users.index'),
                icon: Users,
            },
            {
                title: 'Journals',
                href: route('admin-kampus.journals.index'),
                icon: Library,
            },
            {
                title: 'Agendas & Events',
                href: route('admin-kampus.events.index'),
                icon: CalendarDays,
            },
            {
                title: 'Pembinaan',
                href: '#',
                icon: Award,
                items: [
                    { title: 'Akreditasi', href: route('admin-kampus.pembinaan.akreditasi') },
                    { title: 'Indeksasi', href: route('admin-kampus.pembinaan.indeksasi') },
                ],
            },
        ];

        // Add Reviewer menu only if user has reviewer role
        if (user.roles && user.roles.some((role: { name: string }) => role.name === 'Reviewer')) {
            adminKampusItems.push({
                title: 'Reviewer',
                href: route('admin-kampus.reviewer.index'),
                icon: UserCheck,
            });
        }

        roleNavItems = [...adminKampusItems, ...commonNavItems];
    } else if (user.role.name === ROLE_NAMES.USER) {
        roleNavItems = [
            {
                title: 'Profil',
                href: route('user.profil.index'),
                icon: UserCheck,
            },
            {
                title: 'Jurnal',
                href: route('user.journals.index'),
                icon: BookOpen,
            },
            {
                title: 'Pembinaan',
                href: '#',
                icon: Award,
                items: [
                    { title: 'Akreditasi', href: route('user.pembinaan.akreditasi') },
                    { title: 'Indeksasi', href: route('user.pembinaan.indeksasi') },
                ],
            },
            ...commonNavItems,
        ];
    } else {
        // Fallback for unrecognized roles - show only common items
        roleNavItems = [...commonNavItems];
    }

    const mainNavItems = [...baseNavItems, ...roleNavItems];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
