import Image from 'next/image';
import Link from 'next/link';

export default function Footer() {
    const footerColumns = [
        {
            title: 'Resources',
            links: [
                { href: '/register', label: 'Create Account' },
                { href: '/#passport-proof', label: 'Security Model' },
                { href: '/about', label: 'About Us' },
            ],
        },
    ];

    return (
        <footer className="mt-10 bg-[color:var(--footer)] text-[color:var(--footer-foreground)]">
            <div className="mx-auto grid max-w-7xl gap-6 px-6 py-7 md:grid-cols-[minmax(0,1fr)_200px] md:items-start">
                <div className="space-y-3">
                    <div>
                        <Image
                            src="/watchvault_logo.svg"
                            alt="WatchVault"
                            width={210}
                            height={62}
                            className="h-8 w-auto brightness-0 invert"
                        />
                        <h2 className="mt-2 font-editorial text-3xl leading-none text-[color:var(--surface)]">
                            Digital passports for luxury watches.
                        </h2>
                    </div>
                    <p className="max-w-none text-sm leading-5 text-[color:var(--footer-muted)] md:whitespace-nowrap">
                        Secure provenance, service history, ownership transfers, and public passport links in one place.
                    </p>
                </div>

                <div className="grid gap-4 md:justify-self-end">
                    {footerColumns.map((column) => (
                        <div key={column.title}>
                            <h3 className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--surface)]">
                                {column.title}
                            </h3>
                            <div className="mt-3 space-y-2">
                                {column.links.map((link) => (
                                    <Link
                                        key={link.href + link.label}
                                        href={link.href}
                                        className="block text-xs text-[color:var(--footer-muted)] transition-colors hover:text-[color:var(--surface)]"
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="border-t border-white/10" />
        </footer>
    );
}
