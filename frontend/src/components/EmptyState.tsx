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
            {/* Icon */}
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-capital-blue/10 mb-6">
                {icon || <Sparkles className="w-10 h-10 text-capital-blue" />}
            </div>

            {/* Title */}
            <h3 className="text-2xl font-bold text-black mb-3">
                {title}
            </h3>

            {/* Description */}
            <p className="text-text-grey text-lg mb-8 max-w-md mx-auto">
                {description}
            </p>

            {/* Action Button */}
            {actionLabel && actionHref && (
                <Link href={actionHref} className="btn-primary inline-block">
                    {actionLabel}
                </Link>
            )}
        </div>
    );
}
