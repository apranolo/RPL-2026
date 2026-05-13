import { render, RenderOptions } from '@testing-library/react';
import { ReactElement, ReactNode } from 'react';
import { vi } from 'vitest';

/**
 * Mock Inertia router for testing
 */
export const mockInertiaRouter = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    reload: vi.fn(),
    visit: vi.fn(),
    replace: vi.fn(),
    remember: vi.fn(),
    restore: vi.fn(),
    on: vi.fn(),
};

/**
 * Mock next-themes ThemeProvider for testing
 */
export function MockThemeProvider({ children, theme = 'light' }: { children: ReactNode; theme?: 'light' | 'dark' }) {
    return (
        <div data-theme={theme} style={{ colorScheme: theme }}>
            {children}
        </div>
    );
}

/**
 * Custom render function that wraps components with necessary providers
 */
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
    theme?: 'light' | 'dark';
}

export function renderWithProviders(ui: ReactElement, options?: CustomRenderOptions) {
    const { theme = 'light', ...renderOptions } = options || {};

    function Wrapper({ children }: { children: ReactNode }) {
        return <MockThemeProvider theme={theme}>{children}</MockThemeProvider>;
    }

    return render(ui, { wrapper: Wrapper, ...renderOptions });
}

/**
 * Create mock statistics data for testing
 */
export function createMockStatistics(overrides = {}) {
    return {
        totals: {
            total_journals: 100,
            indexed_journals: 45,
            sinta_journals: 60,
            non_sinta_journals: 40,
        },
        by_indexation: [
            { name: 'Scopus', count: 45, percentage: 45.0 },
            { name: 'Google Scholar', count: 80, percentage: 80.0 },
            { name: 'DOAJ', count: 30, percentage: 30.0 },
            { name: 'Web of Science', count: 20, percentage: 20.0 },
        ],
        by_accreditation: [
            { sinta_rank: null, label: 'Non-Sinta', count: 40, percentage: 40.0 },
            { sinta_rank: '1', label: 'SINTA 1', count: 10, percentage: 10.0 },
            { sinta_rank: '2', label: 'SINTA 2', count: 15, percentage: 15.0 },
            { sinta_rank: '3', label: 'SINTA 3', count: 20, percentage: 20.0 },
            { sinta_rank: '4', label: 'SINTA 4', count: 10, percentage: 10.0 },
            { sinta_rank: '5', label: 'SINTA 5', count: 3, percentage: 3.0 },
            { sinta_rank: '6', label: 'SINTA 6', count: 2, percentage: 2.0 },
        ],
        by_scientific_field: [
            { id: 1, name: 'Teknik', count: 30, percentage: 30.0 },
            { id: 2, name: 'Kesehatan', count: 25, percentage: 25.0 },
            { id: 3, name: 'Ekonomi', count: 20, percentage: 20.0 },
            { id: 4, name: 'Sosial', count: 15, percentage: 15.0 },
            { id: 5, name: 'Sains', count: 10, percentage: 10.0 },
        ],
        ...overrides,
    };
}

/**
 * Create empty statistics data for testing
 */
export function createEmptyStatistics() {
    return {
        totals: {
            total_journals: 0,
            indexed_journals: 0,
            sinta_journals: 0,
            non_sinta_journals: 0,
        },
        by_indexation: [],
        by_accreditation: [],
        by_scientific_field: [],
    };
}

// Re-export everything from @testing-library/react
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
