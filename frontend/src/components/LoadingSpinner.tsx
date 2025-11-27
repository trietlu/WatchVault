export default function LoadingSpinner() {
    return (
        <div className="flex items-center justify-center py-16">
            <div className="relative">
                {/* Outer ring */}
                <div className="w-16 h-16 rounded-full border-4 border-light-grey"></div>

                {/* Spinning ring */}
                <div className="absolute top-0 left-0 w-16 h-16 rounded-full border-4 border-transparent border-t-capital-blue animate-spin"></div>
            </div>
        </div>
    );
}
