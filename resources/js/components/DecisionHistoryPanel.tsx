import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DecisionHistory {
    id: number;
    decision: 'accepted' | 'rejected';
    note: string;
    editor: string;
    created_at: string;
}

interface Props {
    histories?: DecisionHistory[];
}

export default function DecisionHistoryPanel({ histories = [] }: Props) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Editorial Decision History</CardTitle>
            </CardHeader>

            <CardContent>
                {histories.length === 0 ? (
                    <div className="py-8 text-center text-sm text-muted-foreground">Belum ada riwayat keputusan editorial.</div>
                ) : (
                    <div className="space-y-6">
                        {histories.map((history) => (
                            <div key={history.id} className="relative border-l-2 border-primary pl-5">
                                <div className="absolute top-2 -left-[7px] h-3 w-3 rounded-full bg-primary" />

                                <div className="flex items-center justify-between">
                                    <h4 className="font-semibold">{history.editor}</h4>

                                    <span
                                        className={`rounded-full px-3 py-1 text-xs ${
                                            history.decision === 'accepted' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                        }`}
                                    >
                                        {history.decision.toUpperCase()}
                                    </span>
                                </div>

                                <p className="mt-2 text-sm leading-relaxed">{history.note}</p>

                                <p className="mt-2 text-xs text-muted-foreground">{history.created_at}</p>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
