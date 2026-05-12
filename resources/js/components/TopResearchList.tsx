import { useEffect, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Researcher {
    nama: string;
    nidn: string;
}

interface Research {
    id: number;
    judul: string;
    tahun: number;
    status: "aktif" | "selesai" | "pending";
    total_dana: number | null;
    jumlah_dosen: number;
    ketua: Researcher;
    anggota: Researcher[];
}

interface ApiResponse {
    success: boolean;
    message: string;
    data: Research[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const statusConfig: Record<
    Research["status"],
    { label: string; color: string; bg: string; dot: string }
> = {
    aktif: {
        label: "Aktif",
        color: "#22c55e",
        bg: "rgba(34,197,94,0.12)",
        dot: "#22c55e",
    },
    selesai: {
        label: "Selesai",
        color: "#60a5fa",
        bg: "rgba(96,165,250,0.12)",
        dot: "#60a5fa",
    },
    pending: {
        label: "Pending",
        color: "#facc15",
        bg: "rgba(250,204,21,0.12)",
        dot: "#facc15",
    },
};

// Accent colors cycling per card (mirrors the SINTA card borders in the design)
const cardAccents = [
    "#ef4444", // red
    "#f97316", // orange
    "#22c55e", // green
    "#facc15", // yellow
    "#60a5fa", // blue
];

const formatRupiah = (value: number | null): string => {
    if (value === null) return "—";
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(value);
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const SkeletonCard = ({ index }: { index: number }) => (
    <div
        style={{
            background: "rgba(255,255,255,0.04)",
            borderRadius: 16,
            padding: "24px 28px",
            borderBottom: `3px solid ${cardAccents[index % cardAccents.length]}`,
            animation: "pulse 1.6s ease-in-out infinite",
            animationDelay: `${index * 0.15}s`,
        }}
    >
        <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
            <div
                style={{
                    width: 52,
                    height: 24,
                    borderRadius: 100,
                    background: "rgba(255,255,255,0.08)",
                }}
            />
            <div
                style={{
                    width: 70,
                    height: 24,
                    borderRadius: 100,
                    background: "rgba(255,255,255,0.08)",
                }}
            />
        </div>
        <div
            style={{
                height: 20,
                borderRadius: 6,
                background: "rgba(255,255,255,0.08)",
                marginBottom: 10,
            }}
        />
        <div
            style={{
                height: 20,
                borderRadius: 6,
                background: "rgba(255,255,255,0.08)",
                width: "72%",
                marginBottom: 24,
            }}
        />
        <div style={{ display: "flex", gap: 24 }}>
            {[60, 90, 80].map((w, i) => (
                <div
                    key={i}
                    style={{
                        height: 14,
                        width: w,
                        borderRadius: 4,
                        background: "rgba(255,255,255,0.06)",
                    }}
                />
            ))}
        </div>
    </div>
);

const ResearchCard = ({
    item,
    rank,
    accent,
}: {
    item: Research;
    rank: number;
    accent: string;
}) => {
    const [hovered, setHovered] = useState(false);
    const status = statusConfig[item.status];

    return (
        <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                position: "relative",
                background: hovered
                    ? "rgba(255,255,255,0.07)"
                    : "rgba(255,255,255,0.04)",
                borderRadius: 16,
                padding: "24px 28px",
                borderBottom: `3px solid ${accent}`,
                transition: "background 0.25s ease, transform 0.25s ease, box-shadow 0.25s ease",
                transform: hovered ? "translateY(-3px)" : "translateY(0)",
                boxShadow: hovered
                    ? `0 12px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.06)`
                    : "0 2px 8px rgba(0,0,0,0.2)",
                cursor: "default",
                overflow: "hidden",
            }}
        >
            {/* Accent glow top-left corner */}
            <div
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: 120,
                    height: 60,
                    background: `radial-gradient(ellipse at 0% 0%, ${accent}22 0%, transparent 70%)`,
                    pointerEvents: "none",
                    transition: "opacity 0.3s",
                    opacity: hovered ? 1 : 0.5,
                }}
            />

            {/* Header row */}
            <div
                style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: 12,
                    marginBottom: 14,
                }}
            >
                {/* Rank badge */}
                <div
                    style={{
                        minWidth: 40,
                        height: 40,
                        borderRadius: 10,
                        background: `${accent}22`,
                        border: `1.5px solid ${accent}55`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontFamily: "'DM Mono', monospace",
                        fontWeight: 700,
                        fontSize: 15,
                        color: accent,
                        flexShrink: 0,
                    }}
                >
                    #{rank}
                </div>

                {/* Status + year badges */}
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
                    {/* Status */}
                    <span
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                            padding: "4px 10px",
                            borderRadius: 100,
                            background: status.bg,
                            fontSize: 11,
                            fontWeight: 600,
                            color: status.color,
                            letterSpacing: "0.04em",
                            textTransform: "uppercase",
                            fontFamily: "'DM Mono', monospace",
                        }}
                    >
                        <span
                            style={{
                                width: 6,
                                height: 6,
                                borderRadius: "50%",
                                background: status.dot,
                                display: "inline-block",
                                boxShadow: `0 0 6px ${status.dot}`,
                            }}
                        />
                        {status.label}
                    </span>

                    {/* Year */}
                    <span
                        style={{
                            padding: "4px 10px",
                            borderRadius: 100,
                            background: "rgba(255,255,255,0.07)",
                            fontSize: 11,
                            fontWeight: 600,
                            color: "rgba(255,255,255,0.5)",
                            fontFamily: "'DM Mono', monospace",
                        }}
                    >
                        {item.tahun}
                    </span>
                </div>
            </div>

            {/* Title */}
            <h3
                style={{
                    margin: "0 0 16px 0",
                    fontSize: 15,
                    fontWeight: 600,
                    lineHeight: 1.55,
                    color: "#f0f0f0",
                    fontFamily: "'Sora', sans-serif",
                    letterSpacing: "-0.01em",
                }}
            >
                {item.judul}
            </h3>

            {/* Divider */}
            <div
                style={{
                    height: 1,
                    background: "rgba(255,255,255,0.06)",
                    margin: "0 0 16px 0",
                }}
            />

            {/* Meta row */}
            <div
                style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "10px 28px",
                    marginBottom: 16,
                }}
            >
                {/* Ketua */}
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                    </svg>
                    <span
                        style={{
                            fontSize: 12,
                            color: "rgba(255,255,255,0.65)",
                            fontFamily: "'Sora', sans-serif",
                        }}
                    >
                        <span style={{ color: "rgba(255,255,255,0.35)", marginRight: 4 }}>Ketua:</span>
                        {item.ketua.nama}
                    </span>
                </div>

                {/* Anggota count */}
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                    <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", fontFamily: "'Sora', sans-serif" }}>
                        {item.jumlah_dosen} Dosen
                    </span>
                </div>

                {/* Dana */}
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="5" width="20" height="14" rx="2" />
                        <line x1="2" y1="10" x2="22" y2="10" />
                    </svg>
                    <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", fontFamily: "'Sora', sans-serif" }}>
                        {formatRupiah(item.total_dana)}
                    </span>
                </div>
            </div>

            {/* Anggota avatar chips */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {item.anggota.slice(0, 3).map((a, i) => {
                    const initials = a.nama
                        .split(" ")
                        .slice(-2)
                        .map((w) => w[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2);
                    return (
                        <span
                            key={i}
                            title={a.nama}
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 5,
                                padding: "3px 10px 3px 6px",
                                borderRadius: 100,
                                background: "rgba(255,255,255,0.06)",
                                border: "1px solid rgba(255,255,255,0.08)",
                                fontSize: 11,
                                color: "rgba(255,255,255,0.5)",
                                fontFamily: "'DM Mono', monospace",
                            }}
                        >
                            <span
                                style={{
                                    width: 18,
                                    height: 18,
                                    borderRadius: "50%",
                                    background: `${accent}33`,
                                    border: `1px solid ${accent}55`,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: 8,
                                    fontWeight: 700,
                                    color: accent,
                                    flexShrink: 0,
                                }}
                            >
                                {initials}
                            </span>
                            {a.nama.split(",")[0].split(" ").slice(-1)[0]}
                        </span>
                    );
                })}
                {item.anggota.length > 3 && (
                    <span
                        style={{
                            padding: "3px 10px",
                            borderRadius: 100,
                            background: "rgba(255,255,255,0.04)",
                            border: "1px solid rgba(255,255,255,0.06)",
                            fontSize: 11,
                            color: "rgba(255,255,255,0.3)",
                            fontFamily: "'DM Mono', monospace",
                        }}
                    >
                        +{item.anggota.length - 3}
                    </span>
                )}
            </div>
        </div>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function TopResearchList() {
    const [data, setData] = useState<Research[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const controller = new AbortController();
        setLoading(true);
        setError(null);

        fetch("/api/top-research", { signal: controller.signal })
            .then<ApiResponse>((res) => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json();
            })
            .then((json) => {
                if (json.success) setData(json.data);
                else throw new Error(json.message);
            })
            .catch((err) => {
                if (err.name !== "AbortError")
                    setError(err.message ?? "Gagal memuat data");
            })
            .finally(() => setLoading(false));

        return () => controller.abort();
    }, []);

    return (
        <>
            {/* Google Fonts */}
            <link
                href="https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&family=DM+Mono:wght@400;500;700&display=swap"
                rel="stylesheet"
            />

            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50%       { opacity: 0.45; }
                }
                @keyframes fadeSlideUp {
                    from { opacity: 0; transform: translateY(18px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
            `}</style>

            <section
                style={{
                    background: "#0c0c0e",
                    borderRadius: 20,
                    padding: "32px 32px 36px",
                    fontFamily: "'Sora', sans-serif",
                    maxWidth: 820,
                    margin: "0 auto",
                    boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
                }}
            >
                {/* ── Section Header ── */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: 28,
                        flexWrap: "wrap",
                        gap: 12,
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        {/* Green accent bar */}
                        <div
                            style={{
                                width: 4,
                                height: 36,
                                borderRadius: 4,
                                background:
                                    "linear-gradient(180deg, #22c55e 0%, #16a34a 100%)",
                                boxShadow: "0 0 14px rgba(34,197,94,0.5)",
                            }}
                        />
                        <div>
                            <p
                                style={{
                                    margin: 0,
                                    fontSize: 11,
                                    fontWeight: 600,
                                    color: "#22c55e",
                                    letterSpacing: "0.1em",
                                    textTransform: "uppercase",
                                    fontFamily: "'DM Mono', monospace",
                                    marginBottom: 2,
                                }}
                            >
                                Top Penelitian
                            </p>
                            <h2
                                style={{
                                    margin: 0,
                                    fontSize: 22,
                                    fontWeight: 700,
                                    color: "#f5f5f5",
                                    letterSpacing: "-0.02em",
                                }}
                            >
                                5 Penelitian Teraktif
                            </h2>
                        </div>
                    </div>

                    {/* Live indicator */}
                    {!loading && !error && (
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 7,
                                padding: "6px 14px",
                                borderRadius: 100,
                                background: "rgba(34,197,94,0.08)",
                                border: "1px solid rgba(34,197,94,0.2)",
                            }}
                        >
                            <span
                                style={{
                                    width: 7,
                                    height: 7,
                                    borderRadius: "50%",
                                    background: "#22c55e",
                                    boxShadow: "0 0 8px #22c55e",
                                    display: "inline-block",
                                    animation: "pulse 2s ease-in-out infinite",
                                }}
                            />
                            <span
                                style={{
                                    fontSize: 11,
                                    color: "#22c55e",
                                    fontWeight: 600,
                                    fontFamily: "'DM Mono', monospace",
                                    letterSpacing: "0.04em",
                                }}
                            >
                                {data.length} Aktif
                            </span>
                        </div>
                    )}
                </div>

                {/* ── Error State ── */}
                {error && (
                    <div
                        style={{
                            background: "rgba(239,68,68,0.08)",
                            border: "1px solid rgba(239,68,68,0.25)",
                            borderRadius: 12,
                            padding: "18px 22px",
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            color: "#fca5a5",
                            fontSize: 13,
                            fontFamily: "'DM Mono', monospace",
                        }}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        Gagal memuat data: {error}
                    </div>
                )}

                {/* ── Skeleton ── */}
                {loading && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {Array.from({ length: 5 }).map((_, i) => (
                            <SkeletonCard key={i} index={i} />
                        ))}
                    </div>
                )}

                {/* ── Cards ── */}
                {!loading && !error && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {data.map((item, i) => (
                            <div
                                key={item.id}
                                style={{
                                    animation: `fadeSlideUp 0.45s ease both`,
                                    animationDelay: `${i * 0.08}s`,
                                }}
                            >
                                <ResearchCard
                                    item={item}
                                    rank={i + 1}
                                    accent={cardAccents[i % cardAccents.length]}
                                />
                            </div>
                        ))}
                    </div>
                )}

                {/* ── Empty state ── */}
                {!loading && !error && data.length === 0 && (
                    <div
                        style={{
                            textAlign: "center",
                            padding: "48px 0",
                            color: "rgba(255,255,255,0.25)",
                            fontSize: 13,
                            fontFamily: "'DM Mono', monospace",
                        }}
                    >
                        Tidak ada data penelitian.
                    </div>
                )}

                {/* ── Footer ── */}
                {!loading && !error && data.length > 0 && (
                    <div
                        style={{
                            marginTop: 22,
                            paddingTop: 18,
                            borderTop: "1px solid rgba(255,255,255,0.06)",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                    >
                        <span
                            style={{
                                fontSize: 11,
                                color: "rgba(255,255,255,0.25)",
                                fontFamily: "'DM Mono', monospace",
                            }}
                        >
                            Menampilkan {data.length} dari {data.length} penelitian
                        </span>
                        <a
                            href="/penelitian"
                            style={{
                                fontSize: 12,
                                color: "#22c55e",
                                textDecoration: "none",
                                fontFamily: "'DM Mono', monospace",
                                fontWeight: 600,
                                display: "flex",
                                alignItems: "center",
                                gap: 5,
                                transition: "gap 0.2s",
                            }}
                            onMouseEnter={(e) =>
                                ((e.currentTarget as HTMLAnchorElement).style.gap = "8px")
                            }
                            onMouseLeave={(e) =>
                                ((e.currentTarget as HTMLAnchorElement).style.gap = "5px")
                            }
                        >
                            Lihat Semua
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="5" y1="12" x2="19" y2="12" />
                                <polyline points="12 5 19 12 12 19" />
                            </svg>
                        </a>
                    </div>
                )}
            </section>
        </>
    );
}