import { Link } from '@inertiajs/react';
import { ArrowUpRightIcon, HeartPulseIcon } from 'lucide-react';

type FooterLink = {
    label: string;
    href: string;
    /** true for real Inertia routes, false for in-page anchors like /#faq */
    inertia?: boolean;
};

const columns: { title: string; links: FooterLink[] }[] = [
    {
        title: 'For patients',
        links: [
            { label: 'Find a clinic', href: '/clinics', inertia: true },
            { label: 'Find a doctor', href: '/doctors', inertia: true },
            { label: 'Book an appointment', href: '/clinics', inertia: true },
            { label: 'Health products', href: '/shop', inertia: true },
        ],
    },
    {
        title: 'For clinics',
        links: [
            { label: 'List your clinic', href: '/register/clinic', inertia: true },
            { label: 'Clinic sign in', href: '/login', inertia: true },
            { label: 'How verification works', href: '/#faq' },
        ],
    },
    {
        title: 'Nuria Health',
        links: [
            { label: 'Services', href: '/#services' },
            { label: 'FAQ', href: '/#faq' },
            { label: 'Contact us', href: '/contact', inertia: true },
        ],
    },
];

const linkClass =
    'text-white/70 transition hover:text-white focus-visible:rounded focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white';

export default function Footer() {
    return (
        <footer className="mt-24 px-3 pb-3 sm:px-4 sm:pb-4">
            <div className="relative mx-auto max-w-[1360px] overflow-hidden rounded-[2rem] bg-[#1F3A40] text-white sm:rounded-[2.5rem]">
                {/* soft teal glow, echoing the hero gradient */}
                <div
                    aria-hidden
                    className="pointer-events-none absolute -top-40 -right-24 size-[28rem] rounded-full bg-[#337983]/40 blur-3xl"
                />

                <div className="relative mx-auto max-w-[1180px] px-5 pt-14 pb-8 sm:px-8 sm:pt-16">
                    {/* CTA row */}
                    <div className="flex flex-col gap-8 border-b border-white/10 pb-12 lg:flex-row lg:items-end lg:justify-between">
                        <h2 className="max-w-xl text-3xl leading-[1.1] font-medium tracking-[-0.03em] sm:text-5xl">
                            Care from verified clinics,{' '}
                            <span
                                style={{
                                    fontFamily:
                                        "'Playfair Display', Georgia, serif",
                                }}
                                className="font-normal italic"
                            >
                                close to you
                            </span>
                        </h2>
                        <div className="flex flex-wrap gap-3">
                            <Link
                                href="/clinics"
                                className="inline-flex items-center gap-2 rounded-full bg-white py-1.5 pr-5 pl-1.5 text-sm font-medium text-[#1F3A40] transition hover:bg-[#E7F1F1] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                            >
                                <span className="grid size-8 place-items-center rounded-full bg-[#1F3A40] text-white">
                                    <ArrowUpRightIcon className="size-4" />
                                </span>
                                Find a clinic
                            </Link>
                            <Link
                                href="/register/clinic"
                                className="inline-flex items-center rounded-full border border-white/25 px-5 py-3 text-sm font-medium text-white transition hover:border-white hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                            >
                                List your clinic
                            </Link>
                        </div>
                    </div>

                    {/* Brand + links */}
                    <div className="grid gap-12 pt-12 lg:grid-cols-[1.2fr_2fr]">
                        <div>
                            <Link
                                href="/"
                                className="flex w-fit items-center gap-2 text-lg font-semibold tracking-tight"
                            >
                                <span className="grid size-8 place-items-center rounded-full bg-[#337983] text-white">
                                    <HeartPulseIcon className="size-4" />
                                </span>
                                nuria
                            </Link>
                            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/70">
                                Clinics, doctors and health products in one
                                place. Every clinic is checked before it is
                                listed.
                            </p>
                        </div>

                        <nav
                            aria-label="Footer"
                            className="grid grid-cols-2 gap-8 text-sm sm:grid-cols-3"
                        >
                            {columns.map((col) => (
                                <div key={col.title}>
                                    <h3 className="mb-4 text-sm font-medium text-white">
                                        {col.title}
                                    </h3>
                                    <ul className="space-y-3">
                                        {col.links.map((l) => (
                                            <li key={l.label}>
                                                {l.inertia ? (
                                                    <Link
                                                        href={l.href}
                                                        className={linkClass}
                                                    >
                                                        {l.label}
                                                    </Link>
                                                ) : (
                                                    <a
                                                        href={l.href}
                                                        className={linkClass}
                                                    >
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
                        style={{
                            fontFamily: "'Playfair Display', Georgia, serif",
                        }}
                        className="mt-14 text-center text-[clamp(4rem,19vw,14rem)] leading-[0.85] font-normal tracking-tight text-white/[0.06] italic select-none"
                    >
                        Nuria
                    </p>

                    <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-5 text-xs text-white/60 sm:flex-row">
                        <p>
                            © {new Date().getFullYear()} Nuria Health. All
                            rights reserved.
                        </p>
                        <ul className="flex gap-5">
                            <li>
                                <Link
                                    href="/privacy"
                                    className="transition hover:text-white"
                                >
                                    Privacy
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/terms"
                                    className="transition hover:text-white"
                                >
                                    Terms
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </footer>
    );
}
