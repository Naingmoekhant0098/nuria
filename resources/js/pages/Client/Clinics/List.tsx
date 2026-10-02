import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowUpRightIcon,
    BadgeCheckIcon,
    MapPinIcon,
    SearchIcon,
    StethoscopeIcon,
    UsersIcon,
    XIcon,
} from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';

type Clinic = {
    id: number;
    clinic_name: string;
    complete_address: string;
    photo_url?: string | null;
    doctors_count: number;
    // Optional vendor fields: the page works without them, shows them when the backend sends them
    is_verified?: boolean;
    specialties?: string[];
    rating?: number | null;
};

type Props = {
    clinics: {
        data: Clinic[];
        current_page: number;
        last_page: number;
        total?: number;
        links: { url: string | null; label: string; active: boolean }[];
    };
    filters?: { q?: string; specialty?: string };
    specialties?: string[]; // e.g. ['Cardiology', 'Dermatology'] for the filter chips
};

const serif = { fontFamily: "'Playfair Display', Georgia, serif" };

export default function ClinicList({ clinics, filters, specialties = [] }: Props) {
    const [q, setQ] = useState(filters?.q ?? '');
    const activeSpecialty = filters?.specialty ?? '';
    const hasFilters = Boolean(filters?.q || activeSpecialty);

    const visit = (params: { q?: string; specialty?: string }) => {
        const query: Record<string, string> = {};
        if (params.q) query.q = params.q;
        if (params.specialty) query.specialty = params.specialty;
        router.get('/clinics', query, { preserveState: true, preserveScroll: true });
    };

    const onSearch = (e: FormEvent) => {
        e.preventDefault();
        visit({ q: q.trim(), specialty: activeSpecialty });
    };

    const clearAll = () => {
        setQ('');
        visit({});
    };

    return (
        <>
            <Head title="Find a clinic">
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link
                    rel="preconnect"
                    href="https://fonts.gstatic.com"
                    crossOrigin="anonymous"
                />
                <link
                    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Playfair+Display:ital,wght@1,400;1,500&display=swap"
                    rel="stylesheet"
                />
            </Head>

            <main className="min-h-screen bg-[#FAFAFA] font-['Inter',sans-serif] text-[#0F1115]">
                {/* Hero */}
                <section className="bg-gradient-to-b from-[#FDFDFD] via-[#EAF3F5] to-[#FAFAFA] px-4 pt-28 pb-14 sm:px-6">
                    <div className="mx-auto max-w-[1280px]">
                        <p className="text-sm text-[#64748B]">
                            <Link href="/" className="hover:text-[#337983]">
                                Home
                            </Link>{' '}
                            / Clinics
                        </p>

                        <div className="mt-6 grid items-end gap-10 lg:grid-cols-[1.2fr_1fr]">
                            <div>
                                <h1 className="text-[2.75rem] leading-[1.05] font-medium tracking-[-0.04em] text-[#1F3A40] sm:text-6xl">
                                    Find the clinic that{' '}
                                    <span
                                        style={serif}
                                        className="font-normal italic"
                                    >
                                        fits your care
                                    </span>
                                </h1>
                                <p className="mt-5 max-w-lg text-base text-[#475569]">
                                    Browse verified clinics near you, compare
                                    their doctors, and book with the one you
                                    trust.
                                </p>
                            </div>

                            {/* Trust pills, echoing the floating cards in the reference */}
                            <div className="flex flex-wrap gap-3 lg:justify-end">
                                <div className="flex items-center gap-3 rounded-2xl bg-white/90 px-4 py-3 shadow-[0_8px_30px_rgba(15,17,21,0.06)]">
                                    <span className="grid size-9 place-items-center rounded-full bg-[#E7F1F1] text-[#337983]">
                                        <BadgeCheckIcon className="size-5" />
                                    </span>
                                    <span className="text-sm leading-tight">
                                        <span className="block font-medium">
                                            Every clinic verified
                                        </span>
                                        <span className="text-xs text-[#64748B]">
                                            Licenses checked before listing
                                        </span>
                                    </span>
                                </div>
                                {typeof clinics.total === 'number' && (
                                    <div className="flex items-center gap-3 rounded-2xl bg-[#1F3A40] px-4 py-3 text-white">
                                        <span className="text-2xl font-medium tracking-tight">
                                            {clinics.total}
                                        </span>
                                        <span className="text-xs leading-tight text-white/70">
                                            clinics
                                            <br />
                                            available
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Search */}
                        <form
                            onSubmit={onSearch}
                            role="search"
                            className="mt-10 flex max-w-2xl items-center gap-2 rounded-full border border-slate-200 bg-white p-1.5 pl-5 shadow-[0_8px_30px_rgba(15,17,21,0.06)] focus-within:ring-2 focus-within:ring-[#337983]/40"
                        >
                            <SearchIcon className="size-5 shrink-0 text-[#64748B]" />
                            <input
                                name="q"
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                                placeholder="Search by clinic name or address"
                                aria-label="Search clinics"
                                className="min-w-0 flex-1 bg-transparent py-2.5 text-sm outline-none placeholder:text-slate-400"
                            />
                            <button
                                type="submit"
                                className="inline-flex items-center gap-2 rounded-full bg-[#1F3A40] py-2 pr-5 pl-2 text-sm font-medium text-white transition hover:bg-[#337983] focus-visible:ring-2 focus-visible:ring-[#337983] focus-visible:ring-offset-2 focus-visible:outline-none"
                            >
                                <span className="grid size-8 place-items-center rounded-full bg-white/15">
                                    <SearchIcon className="size-4" />
                                </span>
                                Search
                            </button>
                        </form>

                        {/* Specialty filter */}
                        {specialties.length > 0 && (
                            <div
                                className="mt-5 flex flex-wrap gap-2"
                                role="group"
                                aria-label="Filter by specialty"
                            >
                                <button
                                    type="button"
                                    onClick={() => visit({ q: filters?.q })}
                                    className={chip(!activeSpecialty)}
                                >
                                    All specialties
                                </button>
                                {specialties.map((s) => (
                                    <button
                                        key={s}
                                        type="button"
                                        onClick={() =>
                                            visit({ q: filters?.q, specialty: s })
                                        }
                                        aria-pressed={activeSpecialty === s}
                                        className={chip(activeSpecialty === s)}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                {/* Results */}
                <section className="px-4 pb-24 sm:px-6">
                    <div className="mx-auto max-w-[1280px]">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <p className="text-sm text-[#64748B]">
                                {clinics.data.length > 0
                                    ? `Showing ${clinics.data.length}${
                                          clinics.total
                                              ? ` of ${clinics.total}`
                                              : ''
                                      } clinics`
                                    : 'No results'}
                            </p>
                            {hasFilters && (
                                <button
                                    type="button"
                                    onClick={clearAll}
                                    className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-white px-3.5 py-1.5 text-sm text-[#475569] transition hover:border-[#337983] hover:text-[#337983]"
                                >
                                    <XIcon className="size-3.5" />
                                    Clear filters
                                </button>
                            )}
                        </div>

                        {clinics.data.length > 0 && (
                            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {clinics.data.map((clinic) => (
                                    <ClinicCard key={clinic.id} clinic={clinic} />
                                ))}
                            </div>
                        )}

                        {clinics.data.length === 0 && (
                            <div className="mt-8 flex flex-col items-center rounded-[2rem] bg-white px-6 py-20 text-center shadow-[0_8px_30px_rgba(15,17,21,0.04)]">
                                <span className="grid size-14 place-items-center rounded-full bg-[#E7F1F1] text-[#337983]">
                                    <StethoscopeIcon className="size-6" />
                                </span>
                                <h2 className="mt-5 text-xl font-medium tracking-tight">
                                    No clinics match your search
                                </h2>
                                <p className="mt-2 max-w-sm text-sm text-[#64748B]">
                                    Try a different name or area, or remove your
                                    filters to see every clinic.
                                </p>
                                {hasFilters && (
                                    <button
                                        type="button"
                                        onClick={clearAll}
                                        className="mt-6 rounded-full bg-[#1F3A40] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#337983]"
                                    >
                                        Show all clinics
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Pagination */}
                        {clinics.last_page > 1 && (
                            <nav
                                className="mt-12 flex flex-wrap justify-center gap-2"
                                aria-label="Clinic pages"
                            >
                                {clinics.links.map((link, i) => {
                                    const base = `rounded-full px-4 py-2 text-sm transition ${
                                        link.active
                                            ? 'bg-[#1F3A40] text-white'
                                            : 'bg-white text-[#475569] hover:bg-[#E7F1F1] hover:text-[#337983]'
                                    }`;
                                    return link.url ? (
                                        <Link
                                            key={i}
                                            href={link.url}
                                            preserveScroll
                                            className={base}
                                            aria-current={
                                                link.active ? 'page' : undefined
                                            }
                                            dangerouslySetInnerHTML={{
                                                __html: link.label,
                                            }}
                                        />
                                    ) : (
                                        <span
                                            key={i}
                                            className="rounded-full bg-white px-4 py-2 text-sm text-slate-300"
                                            dangerouslySetInnerHTML={{
                                                __html: link.label,
                                            }}
                                        />
                                    );
                                })}
                            </nav>
                        )}
                    </div>
                </section>
            </main>
        </>
    );
}

function chip(active: boolean) {
    return `rounded-full px-4 py-2 text-sm transition focus-visible:ring-2 focus-visible:ring-[#337983] focus-visible:outline-none ${
        active
            ? 'bg-[#1F3A40] text-white'
            : 'border border-slate-200 bg-white text-[#475569] hover:border-[#337983] hover:text-[#337983]'
    }`;
}

function ClinicCard({ clinic }: { clinic: Clinic }) {
    const href = `/doctors?clinic_id=${clinic.id}`;
    const tags = clinic.specialties?.slice(0, 3) ?? [];
    const extra = (clinic.specialties?.length ?? 0) - tags.length;

    return (
        <article className="group flex flex-col overflow-hidden rounded-[1.75rem] bg-white shadow-[0_8px_30px_rgba(15,17,21,0.05)] transition hover:shadow-[0_16px_40px_rgba(15,17,21,0.09)]">
            <Link
                href={href}
                className="relative block overflow-hidden"
                aria-label={`View doctors at ${clinic.clinic_name}`}
            >
                {clinic.photo_url ? (
                    <img
                        src={clinic.photo_url}
                        alt=""
                        loading="lazy"
                        className="aspect-[16/10] w-full object-cover transition duration-700 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex aspect-[16/10] items-center justify-center bg-gradient-to-br from-[#E7F1F1] to-[#D3E6EA] text-[#337983]">
                        <span
                            style={serif}
                            className="text-6xl font-normal italic"
                        >
                            {clinic.clinic_name.charAt(0)}
                        </span>
                    </div>
                )}

                {clinic.is_verified !== false && (
                    <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium text-[#1F3A40] backdrop-blur">
                        <BadgeCheckIcon className="size-4 text-[#337983]" />
                        Verified
                    </span>
                )}

                <span className="absolute right-3 bottom-3 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium text-[#1F3A40] backdrop-blur">
                    <UsersIcon className="size-3.5 text-[#337983]" />
                    {clinic.doctors_count}{' '}
                    {clinic.doctors_count === 1 ? 'doctor' : 'doctors'}
                </span>
            </Link>

            <div className="flex flex-1 flex-col p-6">
                <h2 className="text-xl font-medium tracking-tight text-[#1F3A40]">
                    {clinic.clinic_name}
                </h2>
                <p className="mt-2 flex items-start gap-1.5 text-sm text-[#64748B]">
                    <MapPinIcon className="mt-0.5 size-4 shrink-0" />
                    <span className="line-clamp-2">
                        {clinic.complete_address}
                    </span>
                </p>

                {tags.length > 0 && (
                    <ul className="mt-4 flex flex-wrap gap-1.5">
                        {tags.map((t) => (
                            <li
                                key={t}
                                className="rounded-full bg-[#F1F5F6] px-3 py-1 text-xs text-[#475569]"
                            >
                                {t}
                            </li>
                        ))}
                        {extra > 0 && (
                            <li className="rounded-full bg-[#F1F5F6] px-3 py-1 text-xs text-[#475569]">
                                +{extra}
                            </li>
                        )}
                    </ul>
                )}

                <div className="mt-auto pt-6">
                    <Link
                        href={href}
                        className="inline-flex items-center gap-2 rounded-full bg-[#1F3A40] py-1.5 pr-5 pl-1.5 text-sm font-medium text-white transition hover:bg-[#337983] focus-visible:ring-2 focus-visible:ring-[#337983] focus-visible:ring-offset-2 focus-visible:outline-none"
                    >
                        <span className="grid size-8 place-items-center rounded-full bg-white/15">
                            <ArrowUpRightIcon className="size-4" />
                        </span>
                        View doctors
                    </Link>
                </div>
            </div>
        </article>
    );
}
