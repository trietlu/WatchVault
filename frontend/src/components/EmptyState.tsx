import Link from 'next/link';
import { Sparkles } from 'lucide-react';

interface EmptyStateProps {
    icon?: React.ReactNode;
    title: string;
    description: string;
    actionLabel?: string;
    actionHref?: string;
}

export default function EmptyState({
    icon,
    title,
    description,
    actionLabel,
    actionHref,
}: EmptyStateProps) {
    return (
        <div className="card-premium text-center py-16 px-8">
            <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-[color:var(--surface-strong)]">
                {icon || <Sparkles className="h-10 w-10 text-[color:var(--accent-strong)]" />}
            </div>

            <h3 className="text-[color:var(--ink)]">
                {title}
            </h3>

            <p className="mx-auto mb-8 mt-4 max-w-md text-lg text-[color:var(--muted)]">
                {description}
            </p>

            {actionLabel && actionHref && (
                <Link href={actionHref} className="btn-primary inline-flex">
                    {actionLabel}
                </Link>
            )}
        </div>
    );
}
