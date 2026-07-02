import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DecisionHistory {
    id: number;
    decision: "accepted" | "rejected";
    note: string;
    editor: string;
    created_at: string;
}

interface Props {
    histories?: DecisionHistory[];
}

export default function DecisionHistoryPanel({
    histories = [],
}: Props) {
    return (
        <Card>

            <CardHeader>
                <CardTitle>
                    Editorial Decision History
                </CardTitle>
            </CardHeader>

            <CardContent>

                {histories.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                        Belum ada riwayat keputusan editorial.
                    </div>
                ) : (
                    <div className="space-y-6">

                        {histories.map((history) => (

                            <div
                                key={history.id}
                                className="relative border-l-2 border-primary pl-5"
                            >

                                <div className="absolute w-3 h-3 rounded-full bg-primary -left-[7px] top-2" />

                                <div className="flex justify-between items-center">

                                    <h4 className="font-semibold">
                                        {history.editor}
                                    </h4>

                                    <span
                                        className={`text-xs px-3 py-1 rounded-full ${
                                            history.decision === "accepted"
                                                ? "bg-green-100 text-green-700"
                                                : "bg-red-100 text-red-700"
                                        }`}
                                    >
                                        {history.decision.toUpperCase()}
                                    </span>

                                </div>

                                <p className="mt-2 text-sm leading-relaxed">
                                    {history.note}
                                </p>

                                <p className="mt-2 text-xs text-muted-foreground">
                                    {history.created_at}
                                </p>

                            </div>

                        ))}

                    </div>
                )}

            </CardContent>

        </Card>
    );
}