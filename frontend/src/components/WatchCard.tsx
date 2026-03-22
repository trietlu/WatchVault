import Link from 'next/link';
import { Watch as WatchIcon, ArrowRight } from 'lucide-react';

interface WatchCardProps {
    id: number;
    brand: string;
    model: string;
    serialNumberHash: string;
}

export default function WatchCard({ id, brand, model, serialNumberHash }: WatchCardProps) {
    return (
        <Link
            href={`/watches/${id}`}
            className="group block card-premium hover-lift"
        >
            <div className="mb-5 flex items-center justify-between">
                <span className="badge-premium">Passport</span>
                <span className="text-xs uppercase tracking-[0.24em] text-[color:var(--muted)]">Collection</span>
            </div>

            <div className="relative mb-5 flex h-52 items-center justify-center overflow-hidden rounded-[24px] border border-[color:var(--line)] bg-[color:var(--surface-strong)]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#ffffff_0%,#ffffff00_52%)]" />
                <WatchIcon className="relative h-16 w-16 text-[color:var(--accent-strong)] opacity-60 transition-opacity group-hover:opacity-90" />
            </div>

            <div className="space-y-3">
                <h3 className="text-[color:var(--ink)] transition-colors group-hover:text-[color:var(--accent-strong)]">
                    {brand}
                </h3>
                <p className="text-lg text-[color:var(--muted)]">{model}</p>

                <div className="border-t border-[color:var(--line)] pt-4">
                    <span className="text-xs uppercase tracking-[0.24em] text-[color:var(--muted)]">Serial Hash</span>
                    <p className="mt-2 truncate font-mono text-sm text-[color:var(--ink)]">
                        {serialNumberHash.substring(0, 16)}...
                    </p>
                </div>

                <div className="flex items-center gap-2 pt-2 text-[color:var(--accent-strong)] transition-all group-hover:gap-3">
                    <span className="text-sm font-semibold uppercase tracking-[0.18em]">Open Passport</span>
                    <ArrowRight className="h-4 w-4" />
                </div>
            </div>
        </Link>
    );
}
