/**
 * @file ExportButtons.tsx
 * @description Komponen tombol ekspor dropdown untuk mencetak Laporan Proposal Riset & Luaran.
 *              Mendukung ekspor ke format PDF (server-side via DOMPDF) dan XLS/CSV (client-side).
 * @module Modul 6 — Laporan Proposal Riset & Luaran
 * @author Chyntya Khuni K. (2300018135)
 * @version 1.1.0
 * @since 2026-07-16
 */

import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Download, FileSpreadsheet, FileText, Loader2 } from 'lucide-react';
import { useState } from 'react';

/**
 * Represents a single proposal row for XLS/CSV export.
 */
interface ExportProposalData {
    title: string;
    dosen_name?: string;
    fakultas?: string;
    skema_penelitian?: string;
    status?: string;
    dana?: number | null;
}

interface ExportFilters {
    research_schema_id?: number;
    status?: string;
    year?: number;
}

interface ExportButtonsProps {
    /** Optional filters to pass to the PDF export route */
    filters?: ExportFilters;
    /** Proposal data for client-side XLS/CSV export */
    data?: ExportProposalData[];
    /** Custom class name for the trigger button */
    className?: string;
}

/**
 * ExportButtons — Group of export buttons (PDF & XLS) displayed as a dropdown.
 *
 * - PDF: Opens a new tab pointing to the server-side PDF generation route
 * - XLS: Generates a CSV file client-side (opens natively in Excel) from provided data
 */
export default function ExportButtons({ filters = {}, data = [], className = '' }: ExportButtonsProps) {
    const [isExportingPdf, setIsExportingPdf] = useState(false);
    const [isExportingXls, setIsExportingXls] = useState(false);

    /**
     * Download PDF via server-side DOMPDF route.
     */
    const handleExportPdf = () => {
        setIsExportingPdf(true);

        // Build query string from filters
        const params = new URLSearchParams();
        if (filters.research_schema_id) params.set('research_schema_id', String(filters.research_schema_id));
        if (filters.status) params.set('status', filters.status);
        if (filters.year) params.set('year', String(filters.year));

        const queryString = params.toString();
        const url = `/admin/reports/export-pdf${queryString ? `?${queryString}` : ''}`;

        // Open in new tab for download
        window.open(url, '_blank');

        // Reset loading state after a short delay
        setTimeout(() => setIsExportingPdf(false), 2000);
    };

    /**
     * Generate and download XLS (CSV format) client-side.
     * CSV files with .xls extension open natively in Excel.
     */
    const handleExportXls = () => {
        if (data.length === 0) return;

        setIsExportingXls(true);

        try {
            // CSV header
            const headers = ['No', 'Judul Proposal', 'Nama Dosen', 'Fakultas', 'Skema Penelitian', 'Status Proposal', 'Nominal Dana (Rp)'];

            // CSV rows
            const rows = data.map((proposal, index) => [
                index + 1,
                escapeCsvField(proposal.title),
                escapeCsvField(proposal.dosen_name ?? '-'),
                escapeCsvField(proposal.fakultas ?? '-'),
                escapeCsvField(proposal.skema_penelitian ?? '-'),
                escapeCsvField(formatStatus(proposal.status)),
                proposal.dana != null ? formatCurrency(proposal.dana) : '-',
            ]);

            // Assemble CSV content with BOM for Excel UTF-8 compatibility
            const BOM = '\uFEFF';
            const csvContent = BOM + [headers.join(';'), ...rows.map((row) => row.join(';'))].join('\r\n');

            // Create and trigger download
            const blob = new Blob([csvContent], { type: 'application/vnd.ms-excel;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `Laporan_Proposal_Riset_${formatDate()}.xls`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } finally {
            setTimeout(() => setIsExportingXls(false), 1000);
        }
    };

    const isExporting = isExportingPdf || isExportingXls;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className={`gap-2 ${className}`} disabled={isExporting} id="export-buttons-trigger">
                    {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                    Export
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Pilih Format</DropdownMenuLabel>
                <DropdownMenuSeparator />

                {/* PDF Export */}
                <DropdownMenuItem onClick={handleExportPdf} disabled={isExportingPdf} className="cursor-pointer gap-2" id="export-pdf-btn">
                    {isExportingPdf ? <Loader2 className="h-4 w-4 animate-spin text-red-500" /> : <FileText className="h-4 w-4 text-red-500" />}
                    <div>
                        <div className="font-medium">Download PDF</div>
                        <div className="text-xs text-muted-foreground">Laporan lengkap</div>
                    </div>
                </DropdownMenuItem>

                {/* XLS/CSV Export */}
                <DropdownMenuItem
                    onClick={handleExportXls}
                    disabled={isExportingXls || data.length === 0}
                    className="cursor-pointer gap-2"
                    id="export-xls-btn"
                >
                    {isExportingXls ? (
                        <Loader2 className="h-4 w-4 animate-spin text-green-600" />
                    ) : (
                        <FileSpreadsheet className="h-4 w-4 text-green-600" />
                    )}
                    <div>
                        <div className="font-medium">Download XLS</div>
                        <div className="text-xs text-muted-foreground">{data.length > 0 ? `${data.length} baris data` : 'Tidak ada data'}</div>
                    </div>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

/*
|--------------------------------------------------------------------------
| Helper Functions
|--------------------------------------------------------------------------
*/

/**
 * Escape a CSV field value — wrap in quotes if it contains separator, quotes, or newlines.
 */
function escapeCsvField(value: string): string {
    if (value.includes(';') || value.includes('"') || value.includes('\n')) {
        return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
}

/**
 * Format proposal status to human-readable Indonesian label.
 */
function formatStatus(status?: string): string {
    const statusLabels: Record<string, string> = {
        draft: 'Draft',
        submitted: 'Diajukan',
        approved: 'Disetujui',
        rejected: 'Ditolak',
    };
    return statusLabels[status ?? ''] ?? status ?? '-';
}

/**
 * Format number as Indonesian Rupiah currency string (without Rp prefix).
 */
function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

/**
 * Format current date as YYYY-MM-DD for filenames.
 */
function formatDate(): string {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}
