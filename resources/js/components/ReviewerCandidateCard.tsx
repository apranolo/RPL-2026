import React from 'react';
import { User, BookOpen, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
    processing = false
}: ReviewerCandidateCardProps) {
    return (
        <div className="flex flex-col p-5 border border-border rounded-lg shadow-sm bg-card text-card-foreground">
            <div className="mb-4">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <User className="h-5 w-5 text-muted-foreground" />
                    {name}
                </h3>
                <p className="text-sm font-normal text-muted-foreground mt-1 pl-7">
                    {institution}
                </p>
            </div>

            <div className="mb-4 flex-grow pl-7">
                <h4 className="text-sm font-semibold text-foreground mb-2">Keahlian:</h4>
                <div className="flex flex-wrap gap-2">
                    {skills.map((skill, index) => (
                        <span 
                            key={index} 
                            className="px-2 py-1 bg-slate-100 text-slate-800 border border-slate-200 text-xs font-normal rounded-lg"
                        >
                            {skill}
                        </span>
                    ))}
                </div>
            </div>

            <div className="flex items-center justify-between mb-5 p-3 bg-slate-50 border border-slate-100 rounded-lg ml-7">
                <div className="text-center flex flex-col items-center w-1/2">
                    <span className="flex items-center gap-1 text-xl font-bold text-foreground">
                        <CheckCircle className="h-4 w-4 text-emerald-600" />
                        {completedReviews}
                    </span>
                    <span className="text-xs text-muted-foreground font-normal">Selesai</span>
                </div>
                <div className="text-center flex flex-col items-center border-l border-border w-1/2">
                    <span className="flex items-center gap-1 text-xl font-bold text-foreground">
                        <BookOpen className="h-4 w-4 text-amber-600" />
                        {activeReviews}
                    </span>
                    <span className="text-xs text-muted-foreground font-normal">Aktif</span>
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