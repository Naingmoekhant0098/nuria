import { Link } from '@inertiajs/react';
import { ArrowUpRightIcon, AsteriskIcon } from 'lucide-react';

type FooterLink = { label: string; href: string; inertia?: boolean };

const columns: { title: string; links: FooterLink[] }[] = [
    {
        title: 'Explore',
        links: [
            { label: 'Doctors', href: '/#doctors' },
            { label: 'Clinics', href: '/#clinics' },
            { label: 'Services', href: '/#services' },
            { label: 'Products', href: '/#products' },
        ],
    },
    {
        title: 'Book',
        links: [
            { label: 'Find a clinic', href: '/clinics', inertia: true },
            { label: 'Appointment', href: '/clinics', inertia: true },
        ],
    },
    {
        title: 'Healthcare',
        links: [
            { label: 'Our doctors', href: '/#doctors' },
            { label: 'Medical services', href: '/#services' },
            { label: 'Medical products', href: '/#products' },
        ],
    },
];

const linkClass =
    'text-slate-600 transition hover:text-[#1F2A7A] focus-visible:rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F2A7A]';

export default function Footer() {
    return (
        <footer className="relative mt-24 overflow-hidden rounded-t-[2.5rem] bg-[#F4F2FA] text-[#0F1115]">
            {/* soft top glow */}
            <div
                aria-hidden
                className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#B8B6EC] to-transparent"
            />

            <div className="mx-auto max-w-[1180px] px-4 pb-8 pt-16 sm:px-6">
                <div className="grid gap-12 lg:grid-cols-[1.3fr_2fr]">
                    {/* Brand */}
                    <div>
                        <Link href="/" className="flex w-fit items-center gap-2 text-lg font-semibold">
                            <AsteriskIcon className="size-5 text-[#1F2A7A]" /> Nuria Health
                        </Link>
                        <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-600">
                            Quality healthcare made simple. Find clinics, doctors, services and healthcare products in one
                            place.
                        </p>
                        <Link
                            href="/clinics"
                            className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#1F2A7A] px-5 py-3 text-xs font-medium text-white transition hover:bg-[#161f5c] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F2A7A]"
                        >
                            Book an appointment <ArrowUpRightIcon className="size-3.5" />
                        </Link>
                    </div>

                    {/* Link columns */}
                    <nav aria-label="Footer" className="grid grid-cols-2 gap-8 text-sm sm:grid-cols-3">
                        {columns.map((col) => (
                            <div key={col.title}>
                                <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-[#1F2A7A]">
                                    {col.title}
                                </h3>
                                <ul className="space-y-3">
                                    {col.links.map((l) => (
                                        <li key={l.label}>
                                            {l.inertia ? (
                                                <Link href={l.href} className={linkClass}>
                                                    {l.label}
                                                </Link>
                                            ) : (
                                                <a href={l.href} className={linkClass}>
                                                    {l.label}
                                                </a>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </nav>
                </div>

                {/* Wordmark */}
                <p
                    aria-hidden
                    className="mt-14 select-none bg-gradient-to-r from-[#C4C2F0] via-[#F0CFDB] to-[#F7DCCF] bg-clip-text text-center text-[clamp(4rem,19vw,14rem)] font-bold leading-[0.85] tracking-tight text-transparent"
                >
                    Nuria
                </p>

                <div className="mt-8 flex flex-col items-center justify-between gap-2 border-t border-[#DDD9EE] pt-5 text-xs text-slate-500 sm:flex-row">
                    <p>© {new Date().getFullYear()} Nuria Health. All rights reserved.</p>
                    <p>Made for better access to care.</p>
                </div>
            </div>
        </footer>
    );
}
