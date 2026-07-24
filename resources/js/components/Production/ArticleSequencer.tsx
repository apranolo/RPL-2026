import { closestCenter, DndContext, DragEndEvent, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FileText, GripVertical } from 'lucide-react';

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
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: article.galley.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 'auto',
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`mb-3 flex items-center gap-4 rounded-xl border bg-card p-4 transition-all duration-200 ${
                isDragging
                    ? 'scale-[1.02] border-emerald-500 bg-emerald-50/50 shadow-2xl dark:bg-emerald-950/20'
                    : 'shadow-sm hover:border-gray-300 hover:shadow-md dark:hover:border-gray-700'
            }`}
        >
            {/* Drag Handle */}
            <div
                {...attributes}
                {...listeners}
                className="cursor-grab rounded p-1.5 text-muted-foreground transition-colors hover:bg-muted active:cursor-grabbing"
                title="Seret untuk memindahkan"
            >
                <GripVertical size={20} />
            </div>

            {/* Icon */}
            <div className="flex-shrink-0 rounded-lg bg-emerald-100 p-2.5 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                <FileText size={20} />
            </div>

            {/* Content */}
            <div className="min-w-0 flex-1">
                <h3 className="truncate pr-4 font-semibold text-foreground">{article.title}</h3>
                <p className="text-sm text-muted-foreground">Penulis: {article.author?.name || 'Unknown Author'}</p>
                <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    {article.galley.pages && <span>Halaman: {article.galley.pages}</span>}
                    {article.galley.doi && <span className="font-mono text-emerald-600 dark:text-emerald-400">DOI: {article.galley.doi}</span>}
                    {article.galley.file_extension && (
                        <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-bold uppercase">{article.galley.file_extension}</span>
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
                        className="text-xs font-medium text-emerald-600 hover:text-emerald-700 hover:underline dark:text-emerald-400 dark:hover:text-emerald-300"
                    >
                        Lihat Berkas
                    </a>
                </div>
            )}
        </div>
    );
}

export default function ArticleSequencer({ articles, onOrderChange }: ArticleSequencerProps) {
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // Avoid triggering drag on simple clicks
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
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
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={articles.map((a) => a.galley.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-1">
                    {articles.map((article) => (
                        <SortableItem key={article.galley.id} article={article} />
                    ))}
                </div>
            </SortableContext>
        </DndContext>
    );
}
