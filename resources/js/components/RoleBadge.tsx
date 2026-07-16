import React from 'react';

interface RoleBadgeProps {
    roleName: 'Author' | 'Editor' | 'SectionEditor' | 'Reviewer' | 'Copyeditor' | 'ProductionEditor' | 'Admin' | string;
}

export default function RoleBadge({ roleName }: RoleBadgeProps) {
    const getBadgeStyle = (role: string) => {
        switch (role) {
            case 'Admin':
            case 'Super Admin':
                return 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900';
            case 'Editor':
            case 'SectionEditor':
                return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400';
            case 'Reviewer':
                return 'bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400';
            case 'Author':
                return 'bg-sky-100 text-sky-800 dark:bg-sky-950/30 dark:text-sky-400';
            case 'Copyeditor':
            case 'ProductionEditor':
                return 'bg-purple-100 text-purple-800 dark:bg-purple-950/30 dark:text-purple-400';
            default:
                return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400';
        }
    };

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium tracking-wide ${getBadgeStyle(roleName)}`}>
            {roleName}
        </span>
    );
}
