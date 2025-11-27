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
            className="block group card-premium hover-lift"
        >
            {/* Watch Image Placeholder */}
            <div className="relative h-48 rounded-lg overflow-hidden mb-4 bg-light-grey flex items-center justify-center border border-medium-grey">
                <WatchIcon className="w-16 h-16 text-capital-blue opacity-30 group-hover:opacity-50 transition-opacity" />
            </div>

            {/* Watch Info */}
            <div className="space-y-2">
                <h3 className="text-2xl font-bold text-black group-hover:text-capital-blue transition-colors">
                    {brand}
                </h3>
                <p className="text-text-grey text-lg">{model}</p>

                {/* Serial Hash */}
                <div className="pt-2 border-t border-medium-grey">
                    <span className="text-xs text-text-grey uppercase tracking-wider">Serial Hash</span>
                    <p className="font-mono text-sm text-dark-grey truncate mt-1">
                        {serialNumberHash.substring(0, 16)}...
                    </p>
                </div>

                {/* View Details Link */}
                <div className="flex items-center gap-2 text-capital-blue pt-2 group-hover:gap-3 transition-all">
                    <span className="text-sm font-semibold">View Details</span>
                    <ArrowRight className="w-4 h-4" />
                </div>
            </div>
        </Link>
    );
}
