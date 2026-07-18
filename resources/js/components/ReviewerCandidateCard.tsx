import { Button } from '@/components/ui/button';
import { BookOpen, CheckCircle, User } from 'lucide-react';

interface ReviewerCandidateCardProps {
    id: number;
    name: string;
    institution: string;
    skills: string[];
    activeReviews: number;
    completedReviews: number;
    onInvite: (id: number) => void;
    processing?: boolean;
}

export default function ReviewerCandidateCard({
    id,
    name,
    institution,
    skills,
    activeReviews,
    completedReviews,
    onInvite,
    processing = false,
}: ReviewerCandidateCardProps) {
    return (
        <div className="flex flex-col rounded-lg border border-border bg-card p-5 text-card-foreground shadow-sm">
            <div className="mb-4">
                <h3 className="flex items-center gap-2 text-lg font-bold text-foreground">
                    <User className="h-5 w-5 text-muted-foreground" />
                    {name}
                </h3>
                <p className="mt-1 pl-7 text-sm font-normal text-muted-foreground">{institution}</p>
            </div>

            <div className="mb-4 flex-grow pl-7">
                <h4 className="mb-2 text-sm font-semibold text-foreground">Keahlian:</h4>
                <div className="flex flex-wrap gap-2">
                    {skills.map((skill, index) => (
                        <span key={index} className="rounded-lg border border-slate-200 bg-slate-100 px-2 py-1 text-xs font-normal text-slate-800">
                            {skill}
                        </span>
                    ))}
                </div>
            </div>

            <div className="mb-5 ml-7 flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-3">
                <div className="flex w-1/2 flex-col items-center text-center">
                    <span className="flex items-center gap-1 text-xl font-bold text-foreground">
                        <CheckCircle className="h-4 w-4 text-emerald-600" />
                        {completedReviews}
                    </span>
                    <span className="text-xs font-normal text-muted-foreground">Selesai</span>
                </div>
                <div className="flex w-1/2 flex-col items-center border-l border-border text-center">
                    <span className="flex items-center gap-1 text-xl font-bold text-foreground">
                        <BookOpen className="h-4 w-4 text-amber-600" />
                        {activeReviews}
                    </span>
                    <span className="text-xs font-normal text-muted-foreground">Aktif</span>
                </div>
            </div>

            <Button
                onClick={() => onInvite(id)}
                disabled={processing}
                className="w-full rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
            >
                {processing ? 'Mengirim Undangan...' : 'Undang Reviewer'}
            </Button>
        </div>
    );
}
