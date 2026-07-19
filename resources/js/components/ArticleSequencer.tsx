import React, { useState } from "react";
import axios from "axios";

import {
    DndContext,
    closestCenter,
} from "@dnd-kit/core";

import {
    SortableContext,
    useSortable,
    arrayMove,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

type Article = {
    id: number;
    title: string;
};

type Props = {
    articles: Article[];
    issueId: number;
};

function Item({ article }: { article: Article }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: article.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        padding: 10,
        margin: "5px 0",
        background: "#f2f2f2",
        cursor: "grab",
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            {article.title}
        </div>
    );
}

import { DragEndEvent } from "@dnd-kit/core";
export default function ArticleSequencer({articles, issueId}: Props) {
    const [items, setItems] = useState(articles);

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over || active.id === over.id) return;

        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);

        const newItems = arrayMove(items, oldIndex, newIndex);

        setItems(newItems);

        try {
            // kirim ke backend
            await axios.post(
                `/production/articles/${active.id}/assign-issue`,
                {
                    issue_id: issueId,
                }
            );

            // NOTE:
            // kalau mau perfect ranking,
            // backend harus support order array juga
        } catch (err) {
            alert("Gagal update issue");
        }
    };

    return (
        <DndContext
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
        >
            <SortableContext
                items={items.map((i) => i.id)}
                strategy={verticalListSortingStrategy}
            >
                {items.map((article) => (
                    <Item key={article.id} article={article} />
                ))}
            </SortableContext>
        </DndContext>
    );
}