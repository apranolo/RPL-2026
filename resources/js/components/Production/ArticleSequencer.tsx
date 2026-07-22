import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, FileText } from 'lucide-react';

export interface Galley {
    id: number;
    id_submission: number;
    id_issue: number | null;
    file_path: string;
    file_extension: 'pdf' | 'html' | 'xml';
    doi: string | null;
    pages: string | null;
    sequence: number;
    file_url?: string | null;
}

export interface Submission {
    id: number;
    title: string;
    status: string;
    author?: {
        id: number;
        name: string;
    } | null;
}

interface ArticleSequencerProps {
    articles: (Submission & { galley: Galley })[];
    onOrderChange: (orderedIds: number[]) => void;
}

interface SortableItemProps {
    article: Submission & { galley: Galley };
}

function SortableItem({ article }: SortableItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: article.galley.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 'auto',
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`flex items-center gap-4 p-4 mb-3 rounded-xl border bg-card transition-all duration-200 ${
                isDragging
                    ? 'shadow-2xl border-emerald-500 scale-[1.02] bg-emerald-50/50 dark:bg-emerald-950/20'
                    : 'shadow-sm hover:shadow-md hover:border-gray-300 dark:hover:border-gray-700'
            }`}
        >
            {/* Drag Handle */}
            <div
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing p-1.5 rounded hover:bg-muted text-muted-foreground transition-colors"
                title="Seret untuk memindahkan"
            >
                <GripVertical size={20} />
            </div>

            {/* Icon */}
            <div className="flex-shrink-0 p-2.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                <FileText size={20} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground truncate pr-4">
                    {article.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                    Penulis: {article.author?.name || 'Unknown Author'}
                </p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-muted-foreground">
                    {article.galley.pages && (
                        <span>Halaman: {article.galley.pages}</span>
                    )}
                    {article.galley.doi && (
                        <span className="font-mono text-emerald-600 dark:text-emerald-400">
                            DOI: {article.galley.doi}
                        </span>
                    )}
                    {article.galley.file_extension && (
                        <span className="uppercase px-1.5 py-0.5 rounded text-[10px] font-bold bg-muted">
                            {article.galley.file_extension}
                        </span>
                    )}
                </div>
            </div>

            {/* Action/View Link */}
            {article.galley.file_url && (
                <div className="flex-shrink-0">
                    <a
                        href={article.galley.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 hover:underline"
                    >
                        Lihat Berkas
                    </a>
                </div>
            )}
        </div>
    );
}

export default function ArticleSequencer({
    articles,
    onOrderChange,
}: ArticleSequencerProps) {
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // Avoid triggering drag on simple clicks
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = articles.findIndex((a) => a.galley.id === active.id);
            const newIndex = articles.findIndex((a) => a.galley.id === over.id);

            const newArticles = arrayMove(articles, oldIndex, newIndex);
            const orderedIds = newArticles.map((a) => a.galley.id);
            onOrderChange(orderedIds);
        }
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
        >
            <SortableContext
                items={articles.map((a) => a.galley.id)}
                strategy={verticalListSortingStrategy}
            >
                <div className="space-y-1">
                    {articles.map((article) => (
                        <SortableItem key={article.galley.id} article={article} />
                    ))}
                </div>
            </SortableContext>
        </DndContext>
    );
}
