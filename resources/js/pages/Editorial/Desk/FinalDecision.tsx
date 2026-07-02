import { useState } from "react";
import { router } from "@inertiajs/react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
    assessmentId: number;
}

export default function FinalDecision({ assessmentId }: Props) {

    const [decision, setDecision] =
        useState<"accepted" | "rejected">("accepted");

    const [note, setNote] = useState("");

    const submit = () => {
    console.log({
        decision,
        note,
    });
};

    return (
        <Card>

            <CardHeader>
                <CardTitle>
                    Final Editorial Decision
                </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">

                <div>

                    <label className="font-medium block mb-2">
                        Decision
                    </label>

                    <select
                        className="border rounded w-full p-2"
                        value={decision}
                        onChange={(e) =>
                            setDecision(
                                e.target.value as
                                    | "accepted"
                                    | "rejected"
                            )
                        }
                    >
                        <option value="accepted">
                            Accept
                        </option>

                        <option value="rejected">
                            Reject
                        </option>

                    </select>

                </div>

                <div>

                    <label className="font-medium block mb-2">
                        Editorial Note
                    </label>

                    <textarea
                        rows={6}
                        value={note}
                        onChange={(e) =>
                            setNote(e.target.value)
                        }
                        className="border rounded w-full p-3"
                        placeholder="Minimal 50 karakter..."
                    />

                    <small className="text-gray-500">
                        {note.length}/50 karakter minimum
                    </small>

                </div>

                <Button
                    onClick={submit}
                    disabled={note.length < 50}
                >
                    Submit Final Decision
                </Button>

            </CardContent>

        </Card>
    );
}