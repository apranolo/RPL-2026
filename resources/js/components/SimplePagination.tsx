import { Link } from '@inertiajs/react';

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface Props {
    links: PaginationLink[];
}

export default function SimplePagination({ links }: Props) {
    if (links.length <= 3) return null; // Only prev, next and 1 page

    return (
        <div className="-mb-1 flex flex-wrap">
            {links.map((link, key) =>
                link.url === null ? (
                    <div
                        key={key}
                        className="mr-1 mb-1 rounded border px-4 py-3 text-sm leading-4 text-gray-400"
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                ) : (
                    <Link
                        key={key}
                        className={`mr-1 mb-1 rounded border px-4 py-3 text-sm leading-4 hover:bg-white focus:border-indigo-500 focus:text-indigo-500 ${link.active ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-white text-gray-700'}`}
                        href={link.url}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                ),
            )}
        </div>
    );
}
