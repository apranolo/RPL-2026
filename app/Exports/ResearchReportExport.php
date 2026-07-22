<?php
namespace App\Exports;
use Illuminate\Contracts\View\View;
use Maatwebsite\Excel\Concerns\FromView;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
class ResearchReportExport implements FromView, ShouldAutoSize, WithStyles
{
    protected $filters;
    public function __construct(array $filters = [])
    {
        $this->filters = $filters;
    }
    public function view(): View
    {
        // Rekap penelitian = data proposal penelitian dari dosen pengusul
        $query = \App\Models\Proposal::with(['user.university']);

        if (!empty($this->filters['tahun'])) {
            $query->whereIn('tahun_pelaksanaan', $this->filters['tahun']);
        }

        if (!empty($this->filters['status'])) {
            $query->whereIn('status_proposal', $this->filters['status']);
        }
        $data = $query->get()->map(function ($proposal) {
            return (object)[
                'id' => $proposal->id,
                'judul' => $proposal->judul_penelitian,
                'peneliti' => $proposal->user ? $proposal->user->name : '-',
                'universitas' => $proposal->user && $proposal->user->university ? $proposal->user->university->name : '-',
                'tahun' => $proposal->tahun_pelaksanaan ?: '-',
                'status' => $proposal->status_label
            ];
        });
        return view('exports.research_report', [
            'data' => $data
        ]);
    }
    public function styles(Worksheet $sheet)
    {
        return [
            1    => ['font' => ['bold' => true]],
        ];
    }
}
