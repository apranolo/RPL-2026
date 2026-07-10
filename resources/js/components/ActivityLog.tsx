import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';

interface User {
    id: number;
    name: string;
    email: string;
}

interface Loggable {
    id: number;
    // other properties depending on the polymorphic model
}

interface ActivityLogItem {
    id: number;
    user?: User;
    action: string;
    description: string;
    created_at: string;
    loggable?: Loggable;
}

interface ActivityLogProps {
    logs: ActivityLogItem[];
    title?: string;
}

export default function ActivityLog({ logs, title = "Activity Stream" }: ActivityLogProps) {
    if (!logs || logs.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
                <p className="text-sm text-gray-500">No recent activity found.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
            <div className="flow-root">
                <ul role="list" className="-mb-8">
                    {logs.map((log, logIdx) => (
                        <li key={log.id}>
                            <div className="relative pb-8">
                                {logIdx !== logs.length - 1 ? (
                                    <span
                                        className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                                        aria-hidden="true"
                                    />
                                ) : null}
                                <div className="relative flex space-x-3">
                                    <div>
                                        <span className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center ring-8 ring-white">
                                            <svg
                                                className="h-4 w-4 text-blue-600"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                                aria-hidden="true"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                                />
                                            </svg>
                                        </span>
                                    </div>
                                    <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                                        <div>
                                            <p className="text-sm text-gray-500">
                                                {log.user ? (
                                                    <span className="font-medium text-gray-900">
                                                        {log.user.name}
                                                    </span>
                                                ) : (
                                                    <span className="font-medium text-gray-900">System</span>
                                                )}{' '}
                                                {log.action} <span className="text-gray-900">{log.description}</span>
                                            </p>
                                        </div>
                                        <div className="whitespace-nowrap text-right text-sm text-gray-500">
                                            <time dateTime={log.created_at}>
                                                {formatDistanceToNow(new Date(log.created_at), { addSuffix: true, locale: id })}
                                            </time>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
