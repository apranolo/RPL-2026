export interface AccreditationTemplate {
    id: number;
    name: string;
    description: string | null;
    version: string | null;
    type: 'akreditasi' | 'indeksasi';
    is_active: boolean;
    effective_date: string | null;
    categories_count?: number;
    sub_categories_count?: number;
    indicators_count?: number;
    essay_questions_count?: number;
    created_at: string;
    updated_at: string;
}

export interface EvaluationCategory {
    id: number;
    template_id: number;
    code: string;
    name: string;
    description: string | null;
    weight: number;
    display_order: number;
    is_active: boolean;
    sub_categories: EvaluationSubCategory[];
    essay_questions: EssayQuestion[];
}

export interface EvaluationSubCategory {
    id: number;
    category_id: number;
    code: string;
    name: string;
    description: string | null;
    display_order: number;
    is_active: boolean;
    indicators: EvaluationIndicator[];
}

export interface EvaluationIndicator {
    id: number;
    sub_category_id: number | null;
    code: string;
    question: string;
    description: string | null;
    weight: number;
    answer_type: 'boolean' | 'scale' | 'text';
    requires_attachment: boolean;
    sort_order: number;
    is_active: boolean;
}

export interface EssayQuestion {
    id: number;
    category_id: number;
    code: string;
    question: string;
    guidance: string | null;
    max_words: number;
    is_required: boolean;
    is_active: boolean;
    display_order: number;
}

export interface PaginationLinks {
    url: string | null;
    label: string;
    active: boolean;
}

export interface PaginatedResponse<T> {
    data: T[];
    links: PaginationLinks[];
    current_page: number;
    from: number;
    last_page: number;
    path: string;
    per_page: number;
    to: number;
    total: number;
}
