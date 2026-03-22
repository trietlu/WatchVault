export default function LoadingSpinner() {
    return (
        <div className="flex items-center justify-center py-16">
            <div className="relative">
                <div className="h-16 w-16 rounded-full border-4 border-[color:var(--surface-strong)]"></div>
                <div className="absolute left-0 top-0 h-16 w-16 animate-spin rounded-full border-4 border-transparent border-t-[color:var(--accent-strong)]"></div>
            </div>
        </div>
    );
}
