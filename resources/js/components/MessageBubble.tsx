interface MessageBubbleProps {
    message: {
        id: number;
        message: string;
        attachment?: string | null;
        created_at: string;
        user?: {
            id: number;
            name: string;
        };
    };
}

export default function MessageBubble({
    message,
}: MessageBubbleProps) {
    return (
        <div className="rounded-lg border border-sidebar-border/70 bg-card p-4">
            <div className="mb-2 flex items-center justify-between">
                <span className="font-semibold">
                    {message.user?.name ?? 'Unknown User'}
                </span>

                <span className="text-xs text-muted-foreground">
                    {new Date(message.created_at).toLocaleString()}
                </span>
            </div>

            <p className="whitespace-pre-wrap text-sm">
                {message.message}
            </p>

            {message.attachment && (
                <a
                    href={message.attachment}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-block text-sm text-blue-600 hover:underline"
                >
                    📎 Lihat Attachment
                </a>
            )}
        </div>
    );
}