import { useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
    ArrowLeftIcon,
    ArrowRightIcon,
    ArrowUpRightIcon,
    CalendarCheckIcon,
    CheckIcon,
    FileTextIcon,
    ImageIcon,
    ListChecksIcon,
    MapPinIcon,
    PlusIcon,
    SearchIcon,
    ShieldCheckIcon,
    StarIcon,
    StoreIcon,
} from 'lucide-react';
import { Link } from '@inertiajs/react';

/* ---------- helpers ---------- */
const src = (id: string, w = 900) =>
    id.startsWith('/') || id.startsWith('http')
        ? id
        : `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=75`;

function Img({
    id,
    alt,
    className = '',
    eager,
}: {
    id?: string | null;
    alt: string;
    className?: string;
    eager?: boolean;
}) {
    const [ok, setOk] = useState(true);
    if (!ok || !id)
        return (
            <div
                role="img"
                aria-label={alt}
                className="grid size-full place-items-center bg-[#E3EEF1] text-[#337983]/60"
            >
                <ImageIcon className="size-8" />
            </div>
        );
    return (
        <img
            src={src(id)}
            alt={alt}
            loading={eager ? 'eager' : 'lazy'}
            onError={() => setOk(false)}
            className={`size-full object-cover ${className}`}
        />
    );
}

const v = (o: Record<string, string | number>) => o as CSSProperties;
const wrap = 'mx-auto max-w-[1280px] px-4 sm:px-6';
const INK = 'text-[#1F3A43]';

/* Pill button with circular icon, like the reference */
function Pill({
    href,
    icon,
    children,
    tone = 'dark',
}: {
    href: string;
    icon: ReactNode;
    children: ReactNode;
    tone?: 'dark' | 'light' | 'teal';
}) {
    const tones = {
        dark: 'bg-[#1F3A43] text-white hover:bg-[#337983]',
        teal: 'bg-[#337983] text-white hover:bg-[#1F3A43]',
        light: 'bg-white text-[#1F3A43] hover:bg-[#EAF3F5]',
    };
    const dot = tone === 'light' ? 'bg-[#EAF3F5]' : 'bg-white text-[#1F3A43]';
    return (
        <Link
            href={href}
            className={`inline-flex items-center gap-3 rounded-full py-1.5 pr-6 pl-1.5 text-sm font-medium shadow-sm transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#337983] ${tones[tone]}`}
        >
            <span className={`grid size-9 place-items-center rounded-full ${dot}`}>
                {icon}
            </span>
            {children}
        </Link>
    );
}

function Heading({
    tag,
    lead,
    accent,
    note,
    light,
    center,
}: {
    tag?: string;
    lead: string;
    accent?: string;
    note?: string;
    light?: boolean;
    center?: boolean;
}) {
    return (
        <div className={`max-w-2xl ${center ? 'mx-auto text-center' : ''}`}>
            {tag && (
                <p className={`text-sm ${light ? 'text-white/60' : 'text-[#64748B]'}`}>
                    ({tag})
                </p>
            )}
            <h2
                className={`mt-3 text-3xl leading-[1.1] font-medium tracking-[-0.03em] text-balance sm:text-5xl ${light ? 'text-white' : INK}`}
            >
                {accent && <span className="n-serif">{accent} </span>}
                {lead}
            </h2>
            {note && (
                <p className={`mt-4 text-base leading-relaxed sm:text-lg ${light ? 'text-white/65' : 'text-[#64748B]'}`}>
                    {note}
                </p>
            )}
        </div>
    );
}

const css = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,400;1,500&display=swap');
.n-serif{font-family:'Playfair Display',Georgia,serif;font-style:italic;font-weight:400;letter-spacing:-.02em}
.n-in{opacity:0;transform:translateY(12px);animation:n-in 700ms cubic-bezier(.2,.8,.2,1) var(--d,0ms) forwards}
.n-hero{background:linear-gradient(180deg,#fff 0%,#EAF3F5 55%,#CFE2E8 100%)}
.n-card{background:linear-gradient(180deg,#fff 0%,#E6F0F3 100%)}
.n-scroll{scrollbar-width:none}.n-scroll::-webkit-scrollbar{display:none}
@keyframes n-in{to{opacity:1;transform:none}}
@media (prefers-reduced-motion:reduce){.n-in{animation:none!important;opacity:1;transform:none}}
`;

/* ---------- static content ---------- */
const HERO_DOCTOR = 'photo-1559839734-2b71ea197ec2';
const stats = [
    { n: '5k+', l: 'Verified doctors' },
    { n: '100%', l: 'Licence-checked clinics' },
    { n: '12+', l: 'Specialties' },
]; // TODO: replace with real counts from the controller if you want them live
const steps = [
    { t: 'Search by need or area', d: 'Filter by specialty and location. Every clinic has passed our licence check.', Icon: SearchIcon },
    { t: 'Compare doctors', d: 'Read profiles, ratings and next available times side by side.', Icon: ListChecksIcon },
    { t: 'Book in a minute', d: "Pick a slot and confirm. We'll remind you before your visit.", Icon: CalendarCheckIcon },
];
const faqs = [
    { q: 'How do you verify clinics?', a: "We check each clinic's operating licence and each doctor's registration before they're listed, and re-check them every year." },
    { q: 'Does it cost anything to book?', a: 'Booking through Nuria is free. You pay the clinic directly for your consultation.' },
    { q: 'Can I cancel or reschedule?', a: 'Yes. Use the link in your confirmation message. Some clinics set their own cut-off times.' },
    { q: 'How do medicine orders work?', a: 'Add items to your cart and check out once. Prescription-only medicines need an uploaded prescription. Delivery and returns are shown before you pay.' },
];

/* ---------- types (unchanged, from ClientClinicController@home) ---------- */
type ClinicCard = { id: number; name: string; area: string; tags: string; rating: string | null; status: string | null; image: string | null };
type DoctorCard = { id: number; name: string; spec: string; clinic: string; clinic_id: number | null; next: string; rating: string | null; image: string | null };
type ServiceCard = { id: number; name: string; note: string; image: string | null; big: boolean };
type ProductCard = { id: number; name: string; cat: string; price: number; rating: string | null; image: string | null };
type HomeProps = {
    clinics: ClinicCard[];
    doctors: DoctorCard[];
    services: ServiceCard[];
    products: ProductCard[];
    specialties: string[];
};

const doctorHref = (d: DoctorCard) =>
    d.clinic_id ? `/clinics/${d.clinic_id}/doctors/${d.id}` : '/doctors';

/* ============ PAGE ============ */
export default function NuriaHome({ clinics, doctors, services, products, specialties }: HomeProps) {
    const reduce = useReducedMotion();
    const [tab, setTab] = useState('All');
    const [open, setOpen] = useState(0);
    const [cart, setCart] = useState<number[]>([]);
    const rail = useRef<HTMLUListElement>(null);
    const tabs = ['All', ...specialties];
    const shown = doctors.filter((d) => tab === 'All' || d.spec === tab);
    const toggle = (id: number) =>
        setCart((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]));
    const scroll = (dir: number) =>
        rail.current?.scrollBy({ left: dir * 320, behavior: reduce ? 'auto' : 'smooth' });

    return (
        <main className="bg-white text-[#1F3A43]">
            <style dangerouslySetInnerHTML={{ __html: css }} />

            {/* ===== HERO ===== */}
            <section aria-labelledby="hero-title" className="n-hero relative overflow-hidden pt-32 lg:pt-36">
                <div className={`${wrap} grid items-end gap-10 lg:grid-cols-[1.05fr_1fr]`}>
                    <div className="pb-12 lg:pb-20">
                        <h1
                            id="hero-title"
                            className="n-in text-[2.7rem] leading-[1.05] font-medium tracking-[-0.04em] text-balance sm:text-6xl lg:text-[4.4rem]"
                        >
                            Your health deserves the <span className="n-serif">right</span>{' '}
                            <span className="n-serif">doctor</span>
                        </h1>
                        <p className="n-in mt-6 max-w-md text-base leading-relaxed text-[#1F3A43]/75 sm:text-lg" style={v({ '--d': '150ms' })}>
                            Find verified clinics, book qualified doctors, and order medicines, all in one place.
                        </p>

                        <form
                            action="/doctors"
                            method="get"
                            role="search"
                            className="n-in mt-8 flex max-w-lg items-center gap-2 rounded-full bg-white p-1.5 pl-5 shadow-[0_12px_30px_rgba(31,58,67,0.12)] focus-within:ring-2 focus-within:ring-[#337983]"
                            style={v({ '--d': '250ms' })}
                        >
                            <SearchIcon className="size-5 shrink-0 text-[#64748B]" aria-hidden />
                            <label htmlFor="q" className="sr-only">Search doctors, clinics or services</label>
                            <input
                                id="q"
                                name="q"
                                placeholder="Search a doctor, clinic or medicine"
                                className="min-w-0 flex-1 bg-transparent py-2.5 text-sm outline-none placeholder:text-[#94A3B8] sm:text-base"
                            />
                            <button type="submit" className="shrink-0 rounded-full bg-[#1F3A43] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#337983]">
                                Find a doctor
                            </button>
                        </form>

                        {specialties.length > 0 && (
                            <ul className="n-in mt-5 flex max-w-lg flex-wrap gap-2" style={v({ '--d': '350ms' })}>
                                {specialties.slice(0, 6).map((c) => (
                                    <li key={c}>
                                        <Link
                                            href={`/doctors?specialty=${encodeURIComponent(c)}`}
                                            className="block rounded-full bg-white/70 px-4 py-1.5 text-sm font-medium backdrop-blur transition hover:bg-white hover:text-[#337983]"
                                        >
                                            {c}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}

                        <div className="n-in mt-10 grid max-w-lg grid-cols-[1fr_auto_1fr] gap-5" style={v({ '--d': '450ms' })}>
                            <div>
                                <h3 className="font-medium">Book online</h3>
                                <p className="mt-1 text-sm text-[#1F3A43]/65">See real availability and confirm in a minute.</p>
                            </div>
                            <span className="w-px bg-[#1F3A43]/15" />
                            <div>
                                <h3 className="font-medium">Order medicines</h3>
                                <p className="mt-1 text-sm text-[#1F3A43]/65">Upload a prescription and get delivery.</p>
                            </div>
                        </div>
                    </div>

                    {/* Doctor image with floating cards */}
                    <div className="relative mx-auto h-[420px] w-full max-w-md sm:h-[520px] lg:h-[600px] lg:max-w-none">
                        <motion.div
                            className="absolute inset-x-6 bottom-0 top-4 overflow-hidden rounded-t-[10rem]"
                            initial={reduce ? false : { opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ type: 'spring', stiffness: 70, damping: 16, delay: 0.2 }}
                        >
                            <Img id={HERO_DOCTOR} alt="A smiling doctor" className="object-top" eager />
                        </motion.div>

                        <motion.div
                            className="absolute top-24 right-0 flex items-center gap-3 rounded-2xl bg-white/90 px-4 py-3 shadow-lg backdrop-blur"
                            initial={reduce ? false : { opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.8, type: 'spring', stiffness: 80 }}
                        >
                            <span className="grid size-9 place-items-center rounded-full bg-[#337983]/10 text-[#337983]">
                                <ShieldCheckIcon className="size-5" />
                            </span>
                            <p className="text-xs leading-snug">Every clinic and doctor<br />is licence-checked</p>
                        </motion.div>

                        <motion.div
                            className="absolute bottom-40 left-0 max-w-[230px] rounded-2xl bg-white/90 p-4 shadow-lg backdrop-blur"
                            initial={reduce ? false : { opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 1, type: 'spring', stiffness: 80 }}
                        >
                            <div className="flex -space-x-2">
                                {doctors.slice(0, 3).map((d) => (
                                    <span key={d.id} className="size-8 overflow-hidden rounded-full border-2 border-white bg-slate-200">
                                        <Img id={d.image} alt="" />
                                    </span>
                                ))}
                                <span className="grid size-8 place-items-center rounded-full border-2 border-white bg-[#337983] text-[10px] font-semibold text-white">
                                    {doctors.length > 3 ? `${doctors.length}+` : 'New'}
                                </span>
                            </div>
                            <p className="mt-2 text-xs leading-snug text-[#1F3A43]/80">Doctors with open slots you can book today.</p>
                        </motion.div>

                        {shown[0] && (
                            <motion.div
                                className="absolute right-0 bottom-6 flex w-[250px] items-center gap-3 rounded-2xl bg-white/90 p-3 shadow-lg backdrop-blur"
                                initial={reduce ? false : { opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1.2, type: 'spring', stiffness: 80 }}
                            >
                                <span className="size-14 shrink-0 overflow-hidden rounded-xl bg-slate-200">
                                    <Img id={shown[0].image} alt="" className="object-top" />
                                </span>
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-medium">{shown[0].name}</p>
                                    <p className="truncate text-xs text-[#64748B]">{shown[0].spec}</p>
                                    <p className="mt-1 text-xs font-medium text-emerald-700">Next: {shown[0].next}</p>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>
            </section>

            {/* ===== ABOUT / TRUST ===== */}
            <section className={`${wrap} py-20 sm:py-28`}>
                <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
                    <div>
                        <p className="text-sm text-[#64748B]">(About Nuria)</p>
                        <p className="mt-4 text-2xl leading-snug font-medium tracking-tight text-balance sm:text-4xl">
                            One marketplace for clinics, doctors and pharmacies. Every partner is checked, so you can book and buy with confidence.
                        </p>
                        <div className="mt-8 flex flex-wrap gap-3">
                            <Pill href="/clinics" icon={<ArrowUpRightIcon className="size-4" />}>Browse clinics</Pill>
                            <Pill href="/partner" tone="light" icon={<StoreIcon className="size-4" />}>Sell on Nuria</Pill>
                        </div>
                    </div>
                    <div className="grid h-[420px] grid-cols-2 grid-rows-[1fr_1fr] gap-3 sm:h-[460px]">
                        <div className="n-card rounded-3xl p-6">
                            <p className="text-5xl font-medium tracking-tight sm:text-6xl">{stats[0].n}</p>
                            <p className="mt-2 text-sm text-[#64748B]">{stats[0].l}</p>
                        </div>
                        <div className="row-span-1 overflow-hidden rounded-3xl bg-slate-200">
                            <Img id="photo-1576091160399-112ba8d25d1d" alt="Doctor talking with a patient" />
                        </div>
                        <div className="flex flex-col justify-between rounded-3xl bg-[#1F3A43] p-6 text-white">
                            <p className="text-5xl font-medium tracking-tight sm:text-6xl">{stats[1].n}</p>
                            <p className="text-sm text-white/65">{stats[1].l}</p>
                        </div>
                        <div className="flex flex-col justify-between rounded-3xl bg-[#0F1115] p-6 text-white">
                            <p className="text-5xl font-medium tracking-tight sm:text-6xl">{stats[2].n}</p>
                            <p className="text-sm text-white/65">{stats[2].l}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== SERVICES ===== */}
            {services.length > 0 && (
                <section id="services" className="scroll-mt-20 bg-[#F7F9FA] py-20 sm:py-28">
                    <div className={wrap}>
                        <Heading center tag="Services" accent="Find your" lead="care, whatever the need" note="Pick a service and we'll show the clinics and doctors who provide it." />
                        <div className="mt-12 grid auto-rows-[220px] gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {services.map((s) => (
                                <Link
                                    key={s.id}
                                    href={`/doctors?service=${encodeURIComponent(s.name)}`}
                                    className={`group relative isolate overflow-hidden rounded-[1.75rem] bg-slate-200 ${s.big ? 'sm:col-span-2 lg:row-span-2' : ''}`}
                                >
                                    <Img id={s.image} alt={`${s.name}: care in progress`} className="transition duration-700 group-hover:scale-105" />
                                    <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-[#1F3A43]/85 via-[#1F3A43]/15 to-transparent" />
                                    <span className="absolute top-4 right-4 grid size-9 place-items-center rounded-full bg-white text-[#1F3A43] transition group-hover:bg-[#337983] group-hover:text-white">
                                        <ArrowUpRightIcon className="size-4" />
                                    </span>
                                    <span className="absolute inset-x-0 bottom-0 p-6 text-white">
                                        <span className="block text-xl font-medium tracking-tight">{s.name}</span>
                                        {s.note && <span className="mt-1 block max-w-sm text-sm leading-relaxed text-white/75">{s.note}</span>}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* ===== DOCTORS (dark) ===== */}
            {doctors.length > 0 && (
                <section id="doctors" className="scroll-mt-20 bg-[#1F3A43] py-20 text-white sm:py-28">
                    <div className={wrap}>
                        <div className="flex flex-wrap items-end justify-between gap-6">
                            <Heading light tag="Our doctors" accent="Meet" lead="doctors you can book today" note="Qualified, registered and rated by real patients." />
                            <div className="flex gap-2">
                                <button onClick={() => scroll(-1)} aria-label="Previous doctors" className="grid size-11 place-items-center rounded-full bg-white text-[#1F3A43] transition hover:bg-[#EAF3F5]">
                                    <ArrowLeftIcon className="size-5" />
                                </button>
                                <button onClick={() => scroll(1)} aria-label="Next doctors" className="grid size-11 place-items-center rounded-full bg-[#337983] text-white transition hover:bg-[#3f8f9b]">
                                    <ArrowRightIcon className="size-5" />
                                </button>
                            </div>
                        </div>

                        <div role="group" aria-label="Filter by specialty" className="mt-8 flex flex-wrap gap-2">
                            {tabs.map((t) => (
                                <button
                                    key={t}
                                    aria-pressed={tab === t}
                                    onClick={() => setTab(t)}
                                    className={`rounded-full px-4 py-2 text-sm font-medium transition ${tab === t ? 'bg-white text-[#1F3A43]' : 'bg-white/10 text-white hover:bg-white/20'}`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>

                        <ul key={tab} ref={rail} className="n-scroll -mx-4 mt-10 flex snap-x gap-5 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
                            {shown.map((d, i) => (
                                <li key={d.id} className="n-in group w-[270px] shrink-0 snap-start" style={v({ '--d': `${i * 60}ms` })}>
                                    <div className="rounded-[1.75rem] bg-white p-3 text-[#1F3A43]">
                                        <Link href={doctorHref(d)} className="relative block aspect-[4/5] overflow-hidden rounded-[1.25rem] bg-slate-200">
                                            <Img id={d.image} alt={`Portrait of ${d.name}`} className="object-top transition duration-700 group-hover:scale-105" />
                                            {d.rating && (
                                                <span className="absolute top-3 left-3 flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold backdrop-blur">
                                                    <StarIcon className="size-3 fill-amber-400 text-amber-400" />
                                                    {d.rating}
                                                </span>
                                            )}
                                        </Link>
                                        <div className="px-2 pt-4 pb-1">
                                            <h3 className="text-lg font-medium tracking-tight">{d.name}</h3>
                                            <p className="text-sm text-[#64748B]">{d.spec}{d.clinic && `, ${d.clinic}`}</p>
                                            <div className="mt-4 flex items-center justify-between gap-3">
                                                <p className="flex items-center gap-2 text-xs font-medium text-emerald-700">
                                                    <span className="size-2 rounded-full bg-emerald-500" />
                                                    {d.next}
                                                </p>
                                                <Link href={doctorHref(d)} className="rounded-full bg-[#1F3A43] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#337983]">
                                                    Book
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                        {shown.length === 0 && <p className="mt-10 text-white/65">No doctors listed for this specialty yet.</p>}

                        <div className="mt-10">
                            <Pill href="/doctors" tone="teal" icon={<ArrowUpRightIcon className="size-4" />}>See all doctors</Pill>
                        </div>
                    </div>
                </section>
            )}

            {/* ===== CLINICS ===== */}
            {clinics.length > 0 && (
                <section id="clinics" className={`${wrap} scroll-mt-20 py-20 sm:py-28`}>
                    <div className="flex flex-wrap items-end justify-between gap-6">
                        <Heading tag="Clinics" accent="Clinics" lead="patients rate highly" />
                        <Pill href="/clinics" tone="light" icon={<ArrowUpRightIcon className="size-4" />}>See all clinics</Pill>
                    </div>
                    <ul className="mt-10 grid gap-6 lg:grid-cols-3">
                        {clinics.map((c) => (
                            <li key={c.id}>
                                <Link href={`/doctors?clinic_id=${c.id}`} className="n-card group block rounded-[1.75rem] p-3">
                                    <div className="relative aspect-[16/11] overflow-hidden rounded-[1.4rem] bg-slate-200">
                                        <Img id={c.image} alt={`Inside ${c.name}`} className="transition duration-700 group-hover:scale-105" />
                                        {c.status && (
                                            <span className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-emerald-700 backdrop-blur">
                                                <span className="size-2 rounded-full bg-emerald-500" />
                                                {c.status}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-start justify-between gap-4 px-3 pt-4 pb-3">
                                        <div>
                                            <h3 className="text-xl font-medium tracking-tight">{c.name}</h3>
                                            {c.area && (
                                                <p className="mt-1 flex items-center gap-1 text-sm text-[#64748B]">
                                                    <MapPinIcon className="size-3.5" />
                                                    {c.area}
                                                </p>
                                            )}
                                            {c.tags && (
                                                <p className="mt-3 flex flex-wrap gap-1.5">
                                                    {c.tags.split(',').map((t) => (
                                                        <span key={t} className="rounded-full bg-white px-3 py-1 text-xs">{t.trim()}</span>
                                                    ))}
                                                </p>
                                            )}
                                        </div>
                                        {c.rating && (
                                            <span className="flex shrink-0 items-center gap-1 text-sm font-semibold">
                                                <StarIcon className="size-4 fill-amber-400 text-amber-400" />
                                                {c.rating}
                                            </span>
                                        )}
                                    </div>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            {/* ===== MEDICINES & PRODUCTS ===== */}
            {products.length > 0 && (
                <section id="products" className="scroll-mt-20 bg-[#F7F9FA] py-20 sm:py-28">
                    <div className={wrap}>
                        <div className="flex flex-wrap items-end justify-between gap-6">
                            <Heading tag="Pharmacy" accent="Medicines" lead="and health products for home" note="Everyday essentials from verified pharmacies, delivered to your door." />
                            <div className="flex flex-wrap gap-3">
                                <Pill href="/shop?rx=1" tone="light" icon={<FileTextIcon className="size-4" />}>Upload prescription</Pill>
                                <Pill href="/shop" icon={<ArrowUpRightIcon className="size-4" />}>Shop all</Pill>
                            </div>
                        </div>
                        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                            {products.map((p) => {
                                const added = cart.includes(p.id);
                                return (
                                    <li key={p.id} className="group flex flex-col rounded-[1.5rem] bg-white p-3">
                                        <div className="aspect-square overflow-hidden rounded-[1.1rem] bg-slate-100">
                                            <Img id={p.image} alt={p.name} className="transition duration-700 group-hover:scale-105" />
                                        </div>
                                        <div className="flex flex-1 flex-col px-2 pt-4 pb-2">
                                            {p.cat && <p className="text-xs text-[#64748B]">{p.cat}</p>}
                                            <h3 className="mt-1 text-base leading-snug font-medium tracking-tight">{p.name}</h3>
                                            {p.rating && (
                                                <p className="mt-1 flex items-center gap-1 text-sm text-[#64748B]">
                                                    <StarIcon className="size-3.5 fill-amber-400 text-amber-400" />
                                                    {p.rating}
                                                </p>
                                            )}
                                            <div className="mt-auto flex items-center justify-between gap-2 pt-4">
                                                <span className="text-base font-semibold">{p.price.toFixed(2)} MMK</span>
                                                <button
                                                    onClick={() => toggle(p.id)}
                                                    aria-pressed={added}
                                                    className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition ${added ? 'bg-emerald-50 text-emerald-700' : 'bg-[#1F3A43] text-white hover:bg-[#337983]'}`}
                                                >
                                                    {added ? (<><CheckIcon className="size-4" />Added</>) : 'Add to cart'}
                                                </button>
                                            </div>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </section>
            )}

            {/* ===== HOW IT WORKS ===== */}
            <section id="how" className={`${wrap} py-20 sm:py-28`}>
                <Heading center tag="How it works" accent="Book care" lead="in three steps" note="No calls, no waiting on hold." />
                <ol className="mt-12 grid gap-5 md:grid-cols-3">
                    {steps.map(({ t, d, Icon }, i) => (
                        <li key={t} className="n-card flex min-h-[260px] flex-col justify-between rounded-[1.75rem] p-7">
                            <span className="grid size-12 place-items-center rounded-full bg-[#337983] text-white">
                                <Icon className="size-5" />
                            </span>
                            <div>
                                <p className="text-sm text-[#64748B]">Step {i + 1}</p>
                                <h3 className="mt-1 text-xl font-medium tracking-tight">{t}</h3>
                                <p className="mt-2 text-[#1F3A43]/70">{d}</p>
                            </div>
                        </li>
                    ))}
                </ol>
            </section>

            {/* ===== FAQ ===== */}
            <section id="faq" className={`${wrap} grid scroll-mt-20 gap-12 pb-20 sm:pb-28 lg:grid-cols-[1fr_1.4fr]`}>
                <div>
                    <Heading tag="FAQ" accent="Good" lead="information, made simple" />
                    <div className="mt-8 hidden aspect-[4/3] max-w-sm overflow-hidden rounded-[1.75rem] bg-slate-200 lg:block">
                        <Img id="photo-1612349317150-e413f6a5b16d" alt="Friendly doctor" className="object-top" />
                    </div>
                </div>
                <div className="divide-y divide-slate-200 border-y border-slate-200 self-start">
                    {faqs.map((f, i) => (
                        <div key={f.q}>
                            <h3>
                                <button
                                    aria-expanded={open === i}
                                    onClick={() => setOpen(open === i ? -1 : i)}
                                    className="flex w-full items-center justify-between gap-6 py-6 text-left text-lg font-medium tracking-tight"
                                >
                                    {f.q}
                                    <PlusIcon className={`size-5 shrink-0 text-[#337983] transition-transform duration-300 ${open === i ? 'rotate-45' : ''}`} />
                                </button>
                            </h3>
                            <div className={`grid transition-[grid-template-rows] duration-300 ease-out ${open === i ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                                <p className="overflow-hidden pr-10 text-[#64748B]">
                                    <span className="block pb-6">{f.a}</span>
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ===== CTA (patients + vendors) ===== */}
            <section className="px-4 pb-24 sm:px-6">
                <div className="mx-auto grid max-w-[1280px] gap-4 lg:grid-cols-2">
                    <div className="rounded-[2rem] bg-[#337983] p-8 text-white sm:p-12">
                        <h2 className="text-3xl leading-[1.1] font-medium tracking-[-0.03em] text-balance sm:text-4xl">
                            Your next appointment is <span className="n-serif">a few taps</span> away.
                        </h2>
                        <p className="mt-4 max-w-md text-white/80">Find a verified clinic near you and book online.</p>
                        <div className="mt-8"><Pill href="/clinics" tone="light" icon={<ArrowUpRightIcon className="size-4" />}>Find a clinic</Pill></div>
                    </div>
                    <div className="rounded-[2rem] bg-[#1F3A43] p-8 text-white sm:p-12">
                        <h2 className="text-3xl leading-[1.1] font-medium tracking-[-0.03em] text-balance sm:text-4xl">
                            Run a clinic or pharmacy? <span className="n-serif">Join Nuria.</span>
                        </h2>
                        <p className="mt-4 max-w-md text-white/70">List your doctors, manage bookings and sell products to patients in one dashboard.</p>
                        <div className="mt-8"><Pill href="/partner" tone="teal" icon={<StoreIcon className="size-4" />}>Become a partner</Pill></div>
                    </div>
                </div>
            </section>
        </main>
    );
}
