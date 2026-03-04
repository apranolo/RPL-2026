import { LucideIcon } from 'lucide-react';
import type { Config } from 'ziggy-js';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
    items?: NavItem[];
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    ziggy: Config & { location: string };
    sidebarOpen: boolean;
    flash?: {
        success?: string;
        error?: string;
    };
    [key: string]: unknown;
}

export interface Role {
    id: number;
    name: string;
    display_name: string;
    description: string;
}

export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
    role: Role;
    roles?: Role[]; // Multi-role support
    university_id?: number;
    university?: {
        id: number;
        name: string;
        short_name?: string;
    };
    avatar_url?: string;
    avatar?: string;
    phone?: string;
    position?: string;
    is_reviewer?: boolean;
    scientific_field?: ScientificField;
    scientific_field_id?: number;
    initials?: string;
    approval_status?: 'pending' | 'approved' | 'rejected';
    last_login_at?: string;
    created_at?: string;
}

export interface University {
    id: number;
    code: string;
    ptm_code?: string;
    name: string;
    short_name?: string;
    address?: string;
    city?: string;
    province?: string;
    postal_code?: string;
    phone?: string;
    email?: string;
    website?: string;
    logo_url?: string;
    accreditation_status?: string;
    cluster?: string;
    profile_description?: string;
    is_active: boolean;
    users_count?: number;
    journals_count?: number;
    full_address?: string;
    created_at?: string;
    updated_at?: string;
}

export type PageProps<T extends Record<string, unknown> = Record<string, unknown>> = T & {
    auth: {
        user: User;
    };
};

// Journal related types
export interface ScientificField {
    id: number;
    name: string;
    code: string;
}

export interface Article {
    id: number;
    journal_id: number;
    oai_identifier: string;
    oai_datestamp: string;
    oai_set?: string | null;
    title: string;
    abstract?: string | null;
    authors?: string[] | null;
    authors_list?: string;
    keywords?: string[] | null;
    doi?: string | null;
    doi_url?: string | null;
    publication_date: string;
    volume?: string | null;
    issue?: string | null;
    volume_issue?: string | null;
    pages?: string | null;
    article_url?: string | null;
    pdf_url?: string | null;
    google_scholar_url?: string;
    last_harvested_at?: string | null;
    created_at: string;
    updated_at: string;
}

export interface OaiHarvestingLog {
    id: number;
    journal_id: number;
    harvested_at: string;
    records_found: number;
    records_imported: number;
    status: 'success' | 'partial' | 'failed';
    error_message?: string | null;
}

export interface Journal {
    id: number;
    title: string;
    issn: string;
    e_issn?: string;
    url?: string;
    oai_pmh_url?: string;
    cover_image_url?: string;
    cover_image?: string;
    publisher?: string;
    frequency?: 'monthly' | 'bimonthly' | 'quarterly' | 'semiannually' | 'annually';
    frequency_label?: string;
    first_published_year?: number;
    editor_in_chief?: string;
    email?: string;
    about?: string;
    scope?: string;
    // SINTA details
    sinta_rank?: string | null;
    sinta_rank_label?: string;
    // Accreditation details
    accreditation_start_year?: number | null;
    accreditation_end_year?: number | null;
    accreditation_sk_number?: string | null;
    accreditation_sk_date?: string | null;
    accreditation_label?: string;
    // Indexation
    indexed_in?: string[];
    indexation_labels?: string[];
    // Relations
    university_id: number;
    user_id: number;
    scientific_field_id?: number;
    university: University;
    user?: User;
    scientific_field?: ScientificField;
    articles?: Article[];
    articles_count?: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

// Assessment related types
export interface EvaluationCategory {
    id: number;
    name: string;
}

export interface EvaluationSubCategory {
    id: number;
    category_id: number;
    name: string;
    category?: EvaluationCategory;
}

export interface EvaluationIndicator {
    id: number;
    sub_category_id: number;
    question: string;
    answer_type: 'boolean' | 'scale' | 'text';
    requires_attachment: boolean;
    weight: number;
    sub_category?: EvaluationSubCategory;
}

export interface AssessmentAttachment {
    id: number;
    file_name: string;
    file_path: string;
    file_size: number;
    mime_type: string;
}

export interface AssessmentResponse {
    id: number;
    journal_assessment_id: number;
    evaluation_indicator_id: number;
    answer_boolean?: boolean;
    answer_scale?: number;
    answer_text?: string;
    score: number;
    notes?: string;
    evaluation_indicator?: EvaluationIndicator;
    attachments?: AssessmentAttachment[];
}

export interface AssessmentIssue {
    id: number;
    journal_assessment_id: number;
    title: string;
    description: string;
    category: 'editorial' | 'technical' | 'content_quality' | 'management';
    priority: 'high' | 'medium' | 'low';
    display_order: number;
    created_at: string;
    updated_at: string;
}

export interface AssessmentJournalMetadata {
    id: number;
    journal_assessment_id: number;
    volume: string;
    number: string;
    year: number;
    month: number;
    url_issue?: string;
    jumlah_negara_editor: number;
    jumlah_institusi_editor: number;
    jumlah_negara_reviewer: number;
    jumlah_institusi_reviewer: number;
    jumlah_negara_author?: number;
    jumlah_institusi_author?: number;
    display_order: number;
    created_at: string;
    updated_at: string;
    // Computed attributes
    month_name?: string;
    issue_identifier?: string;
}

export interface JournalAssessment {
    id: number;
    journal_id: number;
    user_id: number;
    pembinaan_registration_id?: number;
    assessment_date: string;
    period?: string;
    status: 'draft' | 'submitted' | 'reviewed' | 'in_review' | 'approved_by_lppm';
    submitted_at?: string;
    reviewed_at?: string;
    reviewed_by?: number;
    reviewer_id?: number;
    assigned_at?: string;
    // Phase 2: Admin Kampus approval fields
    admin_kampus_approved_by?: number;
    admin_kampus_approved_at?: string;
    admin_kampus_approval_notes?: string;
    // Phase 3: Journal metadata aggregate fields
    kategori_diusulkan?: string;
    jumlah_editor?: number;
    jumlah_reviewer?: number;
    jumlah_author?: number;
    jumlah_institusi_editor?: number;
    jumlah_institusi_reviewer?: number;
    jumlah_institusi_author?: number;
    total_score?: number;
    max_score?: number;
    percentage?: number;
    notes?: string; // Column: general notes text field
    admin_notes?: string;
    created_at: string;
    updated_at: string;
    journal: Journal;
    user: User;
    reviewer?: User;
    admin_kampus_approver?: User; // Phase 2: Admin Kampus who approved
    responses?: AssessmentResponse[];
    issues?: AssessmentIssue[];
    journalMetadata?: AssessmentJournalMetadata[]; // Phase 3: Journal issue metadata
    assessmentNotes?: AssessmentNote[]; // Phase 3: Timeline notes (relationship, renamed to avoid column conflict)
}

// Phase 2: Assessment Note for timeline
export interface AssessmentNote {
    id: number;
    journal_assessment_id: number;
    user_id: number;
    author_role: string;
    note_type: 'submission' | 'approval' | 'rejection' | 'review' | 'general';
    content: string;
    created_at: string;
    updated_at: string;
    user: User;
}

// Pagination types
export interface PaginatedData<T> {
    data: T[];
    current_page: number;
    from: number;
    to: number;
    last_page: number;
    per_page: number;
    total: number;
    prev_page_url?: string | null;
    next_page_url?: string | null;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
}

// Pembinaan (v1.1) types
export interface AccreditationTemplate {
    id: number;
    name: string;
    type: string;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface Pembinaan {
    id: number;
    name: string;
    description?: string;
    category: 'akreditasi' | 'indeksasi';
    status: 'draft' | 'active' | 'closed';
    accreditation_template_id?: number;
    accreditation_template?: AccreditationTemplate;
    registration_start: string;
    registration_end: string;
    assessment_start: string;
    assessment_end: string;
    quota?: number;
    registrations_count?: number;
    pending_registrations_count?: number;
    approved_registrations_count?: number;
    creator?: User;
    created_at: string;
    updated_at?: string;
    deleted_at?: string;
}

export interface PembinaanRegistration {
    id: number;
    pembinaan_id: number;
    journal_id: number;
    user_id: number;
    status: 'pending' | 'approved' | 'rejected';
    review_status?: 'menunggu_reviewer' | 'sedang_direview' | 'review_selesai' | 'ditolak'; // Phase 2
    registered_at: string;
    reviewed_at?: string;
    reviewed_by?: number;
    rejection_reason?: string;
    supporting_document?: string; // Optional supporting document path
    supporting_document_url?: string; // Download URL for supporting document
    supporting_document_filename?: string; // Filename of supporting document
    pembinaan?: Pembinaan;
    journal?: Journal;
    user?: User;
    reviewer?: User;
    assessment?: JournalAssessment;
    attachments?: PembinaanRegistrationAttachment[];
    reviews?: PembinaanReview[];
    reviewer_assignments?: ReviewerAssignment[];
    attachments_count?: number;
    reviews_count?: number;
    created_at?: string;
    updated_at?: string;
}

export interface PembinaanRegistrationAttachment {
    id: number;
    registration_id: number;
    file_name: string;
    file_path: string;
    file_type: string;
    file_size?: number;
    document_type?: string;
    uploaded_by: number;
    uploader?: User;
    created_at?: string;
}

export interface PembinaanReview {
    id: number;
    registration_id: number;
    reviewer_id: number;
    score?: number;
    feedback?: string;
    recommendation?: string;
    reviewed_at: string;
    registration?: PembinaanRegistration;
    reviewer?: User;
    created_at?: string;
}

export interface ReviewerAssignment {
    id: number;
    reviewer_id: number;
    registration_id: number;
    assigned_by: number;
    assigned_at: string;
    status: 'assigned' | 'in_progress' | 'completed';
    reviewer?: User;
    registration?: PembinaanRegistration;
    assigner?: User;
    created_at?: string;
    updated_at?: string;
}

// Journal Statistics types for Dashboard
export interface IndexationStatistic {
    name: string;
    count: number;
    percentage: number;
}

export interface AccreditationStatistic {
    sinta_rank: string | null;
    label: string;
    count: number;
    percentage: number;
}

export interface ScientificFieldStatistic {
    id: number;
    name: string;
    count: number;
    percentage: number;
}

export interface JournalStatistics {
    totals: {
        total_journals: number;
        /**
         * Count of Scopus-indexed journals only
         * Note: "Indexed" in this system specifically means Scopus indexation
         * (as per meeting notes 02 Feb 2026)
         */
        indexed_journals: number;
        sinta_journals: number;
        non_sinta_journals: number;
    };
    by_indexation: IndexationStatistic[];
    by_accreditation: AccreditationStatistic[];
    by_scientific_field: ScientificFieldStatistic[];
}
