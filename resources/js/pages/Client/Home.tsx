import { useState, type CSSProperties } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
    ArrowUpRightIcon,
    CalendarCheckIcon,
    CheckIcon,
    HeartPulseIcon,
    ImageIcon,
    ListChecksIcon,
    MapPinIcon,
    MenuIcon,
    PlusIcon,
    SearchIcon,
    ShoppingBagIcon,
    StarIcon,
    StethoscopeIcon,
    XIcon,
} from 'lucide-react';
import { Link } from '@inertiajs/react';

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
    id: string;
    alt: string;
    className?: string;
    eager?: boolean;
}) {
    const [ok, setOk] = useState(true);
    if (!ok)
        return (
            <div
                role="img"
                aria-label={alt}
                className="grid size-full place-items-center bg-[#F0E6EE] text-[#337983]/60"
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

const chips = [
    'Family medicine',
    'Pediatrics',
    "Women's health",
    'Dental',
    'Mental health',
    'Lab tests',
];
const stack = [
    {
        id: 'photo-1594824476967-48c8b964273f',
        label: 'Pediatrics',
        sub: 'Child health visits',
        rotate: -10,
        y: 36,
        z: 1,
        hide: true,
    },
    {
        id: 'photo-1576091160399-112ba8d25d1d',
        label: 'Family medicine',
        sub: 'Check-ups and care plans',
        rotate: -5,
        y: 14,
        z: 2,
        hide: false,
    },
    {
        id: 'photo-1612349317150-e413f6a5b16d',
        label: "Women's health",
        sub: 'Screening and advice',
        rotate: 0,
        y: 0,
        z: 3,
        hide: false,
    },
    {
        id: 'photo-1579684385127-1ef15d508118',
        label: 'Lab tests',
        sub: 'Results in your account',
        rotate: 5,
        y: 14,
        z: 2,
        hide: false,
    },
    {
        id: 'photo-1622253692010-333f2da6031d',
        label: 'Mental health',
        sub: 'Talk to a professional',
        rotate: 10,
        y: 36,
        z: 1,
        hide: true,
    },
];
const services = [
    {
        name: 'General consultation',
        note: 'See a doctor for everyday health concerns and long-term conditions.',
        id: 'photo-1576091160399-112ba8d25d1d',
        big: true,
    },
    {
        name: 'Vaccination',
        note: 'Routine and travel vaccines.',
        id: 'photo-1584515933487-779824d29309',
    },
    {
        name: 'Dental care',
        note: 'Check-ups, cleaning and treatment.',
        id: 'photo-1606811841689-23dfddce3e95',
    },
    {
        name: 'Child health',
        note: 'Growth checks and pediatric care.',
        id: 'photo-1631217868264-e5b90bb7e133',
    },
    {
        name: 'Lab tests',
        note: 'Book a blood test, get results online.',
        id: 'photo-1579154204601-01588f351e67',
    },
    {
        name: 'Counselling',
        note: 'Private sessions with licensed therapists.',
        id: 'photo-1544027993-37dbfe43562a',
    },
    {
        name: 'Child health',
        note: 'Growth checks and pediatric care.',
        id: 'photo-1631217868264-e5b90bb7e133',
    },
    {
        name: 'Lab tests',
        note: 'Book a blood test, get results online.',
        id: 'photo-1579154204601-01588f351e67',
    },
    {
        name: 'Counselling',
        note: 'Private sessions with licensed therapists.',
        id: 'photo-1544027993-37dbfe43562a',
    },
];
const tabs = [
    'All',
    'Family medicine',
    'Pediatrics',
    'Dental',
    'Mental health',
];
const doctors = [
    {
        name: 'Dr. Aisha Rahman',
        spec: 'Family medicine',
        clinic: 'Harbour Family Clinic',
        next: 'Today, 4:30 pm',
        rating: '4.9',
        id: 'photo-1559839734-2b71ea197ec2',
    },
    {
        name: 'Dr. Daniel Tan',
        spec: 'Pediatrics',
        clinic: 'Little Steps Pediatrics',
        next: 'Tomorrow, 9:00 am',
        rating: '4.8',
        id: 'photo-1622253692010-333f2da6031d',
    },
    {
        name: 'Dr. Priya Nair',
        spec: 'Dental',
        clinic: 'Bright Smile Dental',
        next: 'Today, 6:00 pm',
        rating: '4.8',
        id: 'photo-1594824476967-48c8b964273f',
    },
    {
        name: 'Dr. Marcus Lee',
        spec: 'Mental health',
        clinic: 'Calm Ground Practice',
        next: 'Thu, 11:15 am',
        rating: '4.9',
        id: 'photo-1537368910025-700350fe46c7',
    },
    {
        name: 'Dr. Sofia Alvarez',
        spec: 'Family medicine',
        clinic: 'Park Street Medical',
        next: 'Tomorrow, 2:00 pm',
        rating: '4.7',
        id: 'photo-1582750433449-648ed127bb54',
    },
    {
        name: 'Dr. Wei Chen',
        spec: 'Pediatrics',
        clinic: 'Little Steps Pediatrics',
        next: 'Fri, 10:30 am',
        rating: '4.9',
        id: 'photo-1612349317150-e413f6a5b16d',
    },
];
const clinics = [
    {
        name: 'Harbour Family Clinic',
        area: 'Central district',
        tags: 'Family medicine, vaccinations',
        rating: '4.9',
        status: 'Open until 9 pm',
        id: 'photo-1538108149393-fbbd81895907',
    },
    {
        name: 'Little Steps Pediatrics',
        area: 'Riverside',
        tags: 'Pediatrics, child development',
        rating: '4.8',
        status: 'Open until 6 pm',
        id: 'photo-1519494026892-80bbd2d6fd0d',
    },
    {
        name: 'Bright Smile Dental',
        area: 'North quarter',
        tags: 'Dental, orthodontics',
        rating: '4.8',
        status: 'Open until 8 pm',
        id: 'photo-1586773860418-d37222d8fce3',
    },
];
const products = [
    {
        name: 'Digital thermometer',
        cat: 'Home monitoring',
        price: 14.9,
        rating: '4.7',
        id: 'photo-1584362917165-526a968579e8',
    },
    {
        name: 'Upper-arm blood pressure monitor',
        cat: 'Home monitoring',
        price: 39,
        rating: '4.8',
        id: 'photo-1628771065518-0d82f1938462',
    },
    {
        name: 'Fingertip pulse oximeter',
        cat: 'Home monitoring',
        price: 24.5,
        rating: '4.6',
        id: 'photo-1583324113626-70df0f4deaab',
    },
    {
        name: 'Family first-aid kit',
        cat: 'First aid',
        price: 19.9,
        rating: '4.9',
        id: 'photo-1603398938378-e54eab446dde',
    },
];
const steps = [
    {
        t: 'Search by need or area',
        d: 'Filter by specialty and location. Every clinic listed has passed our licence check.',
        Icon: SearchIcon,
    },
    {
        t: 'Compare doctors',
        d: 'Read profiles, patient ratings and next available times side by side.',
        Icon: ListChecksIcon,
    },
    {
        t: 'Book in a minute',
        d: "Pick a slot and confirm. We'll remind you before your visit.",
        Icon: CalendarCheckIcon,
    },
];
const faqs = [
    {
        q: 'How do you verify clinics?',
        a: "We check each clinic's operating licence and each doctor's registration before they're listed, and re-check them every year.",
    },
    {
        q: 'Does it cost anything to book?',
        a: 'Booking through Nuria is free. You pay the clinic directly for your consultation.',
    },
    {
        q: 'Can I cancel or reschedule?',
        a: 'Yes. Use the link in your confirmation message. Some clinics set their own cut-off times.',
    },
    {
        q: 'How do product orders work?',
        a: 'Add items to your cart and check out once. Delivery times and returns are shown before you pay.',
    },
];
const links = [
    ['Services', '#services'],
    ['Doctors', '#doctors'],
    ['Clinics', '#clinics'],
    ['Products', '#products'],
    ['FAQ', '#faq'],
];

const css = `
.n-line{display:block;transform:translateY(108%);animation:n-rise 900ms cubic-bezier(.2,.8,.2,1) var(--d,0ms) forwards}
.n-in{opacity:0;transform:translateY(12px);animation:n-in 700ms cubic-bezier(.2,.8,.2,1) var(--d,0ms) forwards}
.n-glow{animation:n-glow 12s ease-in-out infinite}
@keyframes n-rise{to{transform:none}}
@keyframes n-in{to{opacity:1;transform:none}}
@keyframes n-glow{0%,100%{opacity:.75;transform:translateX(-50%) scale(1)}50%{opacity:1;transform:translateX(-50%) scale(1.08)}}
@media (prefers-reduced-motion:reduce){.n-line,.n-in,.n-glow{animation:none!important;opacity:1;transform:none}}
`;
const v = (o: Record<string, string | number>) => o as CSSProperties;
const btnDark =
    'group inline-flex items-center justify-center gap-2 rounded-full bg-[#0F1115] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#337983] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F1115]';
const wrap = 'mx-auto max-w-[1280px] px-4 sm:px-6';

function Heading({
    title,
    note,
    light,
}: {
    title: string;
    note?: string;
    light?: boolean;
}) {
    return (
        <div className="max-w-2xl">
            <h2
                className={`text-3xl leading-[1.08] font-medium tracking-[-0.035em] text-balance sm:text-5xl ${light ? 'text-white' : 'text-[#0F1115]'}`}
            >
                {title}
            </h2>
            {note && (
                <p
                    className={`mt-4 text-base leading-relaxed sm:text-lg ${light ? 'text-white/65' : 'text-[#64748B]'}`}
                >
                    {note}
                </p>
            )}
        </div>
    );
}

/* ============ PAGE ============ */
export default function NuriaHome() {
    const reduce = useReducedMotion();
    const [menu, setMenu] = useState(false);
    const [tab, setTab] = useState('All');
    const [open, setOpen] = useState(0);
    const [cart, setCart] = useState<string[]>([]);
    const mid = (stack.length - 1) / 2;
    const shown = doctors.filter((d) => tab === 'All' || d.spec === tab);
    const toggle = (n: string) =>
        setCart((c) => (c.includes(n) ? c.filter((x) => x !== n) : [...c, n]));

    return (
        <main className="bg-white text-[#0F1115]">
            <style dangerouslySetInnerHTML={{ __html: css }} />

            <section aria-labelledby="hero-title" className="relative pt-36">
                <div className={`${wrap} relative text-center`}>
                    <p className="n-in inline-flex items-center gap-2.5 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-medium text-[#3B3F4A] shadow-sm backdrop-blur">
                        <span className="grid size-6 place-items-center rounded-full bg-[#337983]/10 text-[#337983]">
                            <StethoscopeIcon className="size-3.5" />
                        </span>
                        Verified clinics, doctors and health products
                    </p>
                    <h1
                        id="hero-title"
                        className="mx-auto mt-8 max-w-4xl text-[2.6rem] leading-[1.04] font-medium tracking-[-0.045em] text-balance sm:text-6xl lg:text-[5.2rem]"
                    >
                        <span className="block overflow-hidden pb-[0.12em]">
                            <span
                                className="n-line"
                                style={v({ '--d': '100ms' })}
                            >
                                Find trusted care
                            </span>
                        </span>
                        <span className="block overflow-hidden pb-[0.12em]">
                            <span
                                className="n-line"
                                style={v({ '--d': '220ms' })}
                            >
                                at every age and stage.
                            </span>
                        </span>
                    </h1>
                    <p
                        className="n-in mx-auto mt-6 max-w-2xl text-base leading-relaxed text-[#64748B] sm:text-lg"
                        style={v({ '--d': '450ms' })}
                    >
                        Discover verified clinics, meet qualified doctors, and
                        book your appointment online, all in one place.
                    </p>

                    {/* Search: the primary task */}
                    <form
                        action="/clinics"
                        method="get"
                        role="search"
                        className="n-in mx-auto mt-8 flex max-w-xl items-center gap-2 rounded-full border border-slate-200 bg-white p-1.5 pl-5 shadow-[0_12px_30px_rgba(15,17,21,0.08)] focus-within:border-[#337983]"
                        style={v({ '--d': '550ms' })}
                    >
                        <SearchIcon
                            className="size-5 shrink-0 text-[#64748B]"
                            aria-hidden
                        />
                        <label htmlFor="q" className="sr-only">
                            Search doctors, clinics or services
                        </label>
                        <input
                            id="q"
                            name="q"
                            placeholder="Search a doctor, clinic or service"
                            className="min-w-0 flex-1 bg-transparent py-2.5 text-sm outline-none placeholder:text-[#94A3B8] sm:text-base"
                        />
                        <button type="submit" className={`${btnDark} shrink-0`}>
                            Search
                        </button>
                    </form>
                    <ul
                        className="n-in mx-auto mt-5 flex max-w-3xl flex-wrap justify-center gap-2"
                        style={v({ '--d': '650ms' })}
                    >
                        {chips.map((c) => (
                            <li key={c}>
                                <Link
                                    href={`/clinics?specialty=${encodeURIComponent(c)}`}
                                    className="block rounded-full border border-slate-200 bg-white px-4 py-1.5 text-sm font-medium text-[#3B3F4A] transition hover:border-[#337983]/50 hover:text-[#337983]"
                                >
                                    {c}
                                </Link>
                            </li>
                        ))}
                    </ul>

                    <div className="mx-auto flex max-w-6xl justify-center px-2 pt-14 pb-6 sm:pt-16">
                        {stack.map((c, i) => (
                            <motion.div
                                key={c.id}
                                className={`relative mx-[-1.2rem] w-36 shrink-0 sm:mx-[-1.9rem] sm:w-48 lg:w-60 ${c.hide ? 'hidden sm:block' : ''}`}
                                style={{ zIndex: c.z }}
                                initial={
                                    reduce
                                        ? false
                                        : {
                                              opacity: 0,
                                              y: 90,
                                              x: (mid - i) * 100,
                                              rotate: 0,
                                              scale: 0.86,
                                          }
                                }
                                animate={{
                                    opacity: 1,
                                    y: c.y,
                                    x: 0,
                                    rotate: c.rotate,
                                    scale: 1,
                                }}
                                transition={{
                                    type: 'spring',
                                    stiffness: 80,
                                    damping: 15,
                                    delay: 0.75 + Math.abs(i - mid) * 0.12,
                                }}
                                whileHover={{
                                    rotate: 0,
                                    scale: 1.06,
                                    y: -36,
                                    zIndex: 30,
                                    transition: {
                                        type: 'spring',
                                        stiffness: 200,
                                    },
                                }}
                            >
                                <Link
                                    href={`/clinics?specialty=${encodeURIComponent(c.label)}`}
                                    className="relative block aspect-[3/4] overflow-hidden rounded-3xl border border-white/70 bg-white shadow-[0_24px_60px_rgba(15,17,21,0.18)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#337983]"
                                >
                                    <Img
                                        id={c.id}
                                        alt={`${c.label}: a professional at work`}
                                        className="object-top"
                                        eager={i === 2}
                                    />
                                    <span className="absolute inset-x-3 bottom-3 rounded-2xl bg-white/90 px-3 py-2 text-left backdrop-blur">
                                        <span className="block text-sm font-semibold">
                                            {c.label}
                                        </span>
                                        <span className="block text-xs text-[#64748B]">
                                            {c.sub}
                                        </span>
                                    </span>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Services */}
            <section
                id="services"
                className={`${wrap} scroll-mt-20 py-24 sm:py-32`}
            >
                <Heading
                    title="Services for every need"
                    note="Start with what you need help with. We'll show the clinics and doctors who provide it."
                />
                <div className="mt-12 grid auto-rows-[220px] gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {services.map((s) => (
                        <Link
                            key={s.name}
                            href={`/clinics?service=${encodeURIComponent(s.name)}`}
                            className={`group relative isolate overflow-hidden rounded-[1.75rem] bg-slate-200 ${s.big ? 'sm:col-span-2 lg:row-span-2' : ''}`}
                        >
                            <Img
                                id={s.id}
                                alt={`${s.name}: care in progress`}
                                className="transition duration-700 group-hover:scale-105"
                            />
                            <span
                                aria-hidden
                                className="absolute inset-0 bg-gradient-to-t from-[#0F1115]/85 via-[#0F1115]/20 to-transparent"
                            />
                            <span className="absolute inset-x-0 bottom-0 p-6 text-white">
                                <span className="flex items-center justify-between gap-3 text-xl font-medium tracking-tight">
                                    {s.name}
                                    <ArrowUpRightIcon className="size-5 shrink-0 opacity-70 transition duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:opacity-100" />
                                </span>
                                <span className="mt-1 block max-w-sm text-sm leading-relaxed text-white/75">
                                    {s.note}
                                </span>
                            </span>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Doctors */}
            <section
                id="doctors"
                className="scroll-mt-20 bg-[#F6F3F7] py-24 sm:py-32"
            >
                <div className={wrap}>
                    <div className="flex flex-wrap items-end justify-between gap-6">
                        <Heading
                            title="Meet doctors you can book today"
                            note="Qualified, registered and rated by real patients."
                        />
                        <div
                            role="group"
                            aria-label="Filter by specialty"
                            className="flex flex-wrap gap-2"
                        >
                            {tabs.map((t) => (
                                <button
                                    key={t}
                                    aria-pressed={tab === t}
                                    onClick={() => setTab(t)}
                                    className={`rounded-full border px-4 py-2 text-sm font-medium transition ${tab === t ? 'border-[#0F1115] bg-[#0F1115] text-white' : 'border-slate-300 bg-white text-[#3B3F4A] hover:border-[#337983]'}`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>
                    <ul
                        key={tab}
                        className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
                    >
                        {shown.map((d, i) => (
                            <li
                                key={d.name}
                                className="n-in group"
                                style={v({ '--d': `${i * 70}ms` })}
                            >
                                <div className="relative aspect-[4/3] overflow-hidden rounded-[1.5rem] bg-slate-200">
                                    <Img
                                        id={d.id}
                                        alt={`Portrait of ${d.name}`}
                                        className="object-top transition duration-700 group-hover:scale-105"
                                    />
                                    <span className="absolute top-3 left-3 flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold backdrop-blur">
                                        <StarIcon className="size-3 fill-amber-400 text-amber-400" />
                                        {d.rating}
                                    </span>
                                </div>
                                <div className="mt-4 flex items-start justify-between gap-4">
                                    <div>
                                        <h3 className="text-lg font-medium tracking-tight">
                                            {d.name}
                                        </h3>
                                        <p className="text-sm text-[#64748B]">
                                            {d.spec}, {d.clinic}
                                        </p>
                                        <p className="mt-2 flex items-center gap-2 text-sm font-medium text-emerald-700">
                                            <span className="size-2 rounded-full bg-emerald-500" />
                                            Next: {d.next}
                                        </p>
                                    </div>
                                    <Link
                                        href="/clinics"
                                        className="shrink-0 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium transition hover:border-[#337983] hover:bg-[#337983] hover:text-white"
                                    >
                                        Book
                                    </Link>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            {/* Clinics */}
            <section
                id="clinics"
                className={`${wrap} scroll-mt-20 py-24 sm:py-32`}
            >
                <div className="flex flex-wrap items-end justify-between gap-6">
                    <Heading title="Clinics patients rate highly" />
                    <Link
                        href="/clinics"
                        className="inline-flex items-center gap-2 text-sm font-medium underline-offset-4 hover:text-[#337983] hover:underline"
                    >
                        See all clinics <ArrowUpRightIcon className="size-4" />
                    </Link>
                </div>
                <ul className="mt-10 grid gap-6 lg:grid-cols-3">
                    {clinics.map((c) => (
                        <li key={c.name}>
                            <Link href="/clinics" className="group block">
                                <div className="relative aspect-[16/11] overflow-hidden rounded-[1.75rem] bg-slate-200">
                                    <Img
                                        id={c.id}
                                        alt={`Inside ${c.name}`}
                                        className="transition duration-700 group-hover:scale-105"
                                    />
                                    <span className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-emerald-700 backdrop-blur">
                                        <span className="size-2 rounded-full bg-emerald-500" />
                                        {c.status}
                                    </span>
                                </div>
                                <div className="mt-4 flex items-start justify-between gap-4">
                                    <div>
                                        <h3 className="text-xl font-medium tracking-tight">
                                            {c.name}
                                        </h3>
                                        <p className="mt-1 flex items-center gap-1 text-sm text-[#64748B]">
                                            <MapPinIcon className="size-3.5" />
                                            {c.area}
                                        </p>
                                        <p className="mt-1 text-sm text-[#3B3F4A]">
                                            {c.tags}
                                        </p>
                                    </div>
                                    <span className="flex shrink-0 items-center gap-1 text-sm font-semibold">
                                        <StarIcon className="size-4 fill-amber-400 text-amber-400" />
                                        {c.rating}
                                    </span>
                                </div>
                            </Link>
                        </li>
                    ))}
                </ul>
            </section>

            {/* Medical products */}
            <section
                id="products"
                className="scroll-mt-20 bg-[#F6F3F7] py-24 sm:py-32"
            >
                <div className={wrap}>
                    <div className="flex flex-wrap items-end justify-between gap-6">
                        <Heading
                            title="Health products for home"
                            note="Everyday monitoring and first-aid essentials, delivered to your door."
                        />
                        <Link
                            href="/products"
                            className="inline-flex items-center gap-2 text-sm font-medium underline-offset-4 hover:text-[#337983] hover:underline"
                        >
                            Shop all products{' '}
                            <ArrowUpRightIcon className="size-4" />
                        </Link>
                    </div>
                    <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        {products.map((p) => {
                            const added = cart.includes(p.name);
                            return (
                                <li
                                    key={p.name}
                                    className="group flex flex-col rounded-[1.5rem] bg-white p-3"
                                >
                                    <div className="aspect-square overflow-hidden rounded-[1.1rem] bg-slate-100">
                                        <Img
                                            id={p.id}
                                            alt={p.name}
                                            className="transition duration-700 group-hover:scale-105"
                                        />
                                    </div>
                                    <div className="flex flex-1 flex-col px-2 pt-4 pb-2">
                                        <p className="text-xs text-[#64748B]">
                                            {p.cat}
                                        </p>
                                        <h3 className="mt-1 text-base leading-snug font-medium tracking-tight">
                                            {p.name}
                                        </h3>
                                        <p className="mt-1 flex items-center gap-1 text-sm text-[#64748B]">
                                            <StarIcon className="size-3.5 fill-amber-400 text-amber-400" />
                                            {p.rating}
                                        </p>
                                        <div className="mt-auto flex items-center justify-between pt-4">
                                            <span className="text-lg font-semibold">
                                                ${p.price.toFixed(2)}
                                            </span>
                                            <button
                                                onClick={() => toggle(p.name)}
                                                aria-pressed={added}
                                                className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition ${added ? 'bg-emerald-50 text-emerald-700' : 'bg-[#0F1115] text-white hover:bg-[#337983]'}`}
                                            >
                                                {added ? (
                                                    <>
                                                        <CheckIcon className="size-4" />
                                                        Added
                                                    </>
                                                ) : (
                                                    'Add to cart'
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </section>

            {/* How it works */}
            <section
                id="how"
                className="bg-[#0F1115] py-24 text-white sm:py-32"
            >
                <div className={`${wrap} grid gap-14 lg:grid-cols-[1fr_1.2fr]`}>
                    <Heading
                        light
                        title="Book care in three steps"
                        note="No calls, no waiting on hold. You see real availability and confirm right away."
                    />
                    <ol className="relative space-y-10 before:absolute before:top-6 before:bottom-6 before:left-6 before:w-px before:bg-white/15">
                        {steps.map(({ t, d, Icon }, i) => (
                            <li key={t} className="relative flex gap-6">
                                <span className="relative z-10 grid size-12 shrink-0 place-items-center rounded-full bg-[#337983]">
                                    <Icon className="size-5" />
                                </span>
                                <div>
                                    <p className="text-sm text-white/50">
                                        Step {i + 1}
                                    </p>
                                    <h3 className="text-xl font-medium tracking-tight">
                                        {t}
                                    </h3>
                                    <p className="mt-2 max-w-md text-white/65">
                                        {d}
                                    </p>
                                </div>
                            </li>
                        ))}
                    </ol>
                </div>
            </section>

            {/* FAQ */}
            <section
                id="faq"
                className={`${wrap} grid scroll-mt-20 gap-12 py-24 sm:py-32 lg:grid-cols-[1fr_1.4fr]`}
            >
                <Heading title="Questions, answered" />
                <div className="divide-y divide-slate-200 border-y border-slate-200">
                    {faqs.map((f, i) => (
                        <div key={f.q}>
                            <h3>
                                <button
                                    aria-expanded={open === i}
                                    onClick={() => setOpen(open === i ? -1 : i)}
                                    className="flex w-full items-center justify-between gap-6 py-6 text-left text-lg font-medium tracking-tight"
                                >
                                    {f.q}
                                    <PlusIcon
                                        className={`size-5 shrink-0 text-[#337983] transition-transform duration-300 ${open === i ? 'rotate-45' : ''}`}
                                    />
                                </button>
                            </h3>
                            <div
                                className={`grid transition-[grid-template-rows] duration-300 ease-out ${open === i ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
                            >
                                <p className="overflow-hidden pr-10 text-[#64748B]">
                                    <span className="block pb-6">{f.a}</span>
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section className="px-4 pb-24 sm:px-6">
                <div className="relative mx-auto max-w-[1280px] overflow-hidden rounded-[2rem] bg-[#337983] px-6 py-16 text-center text-white sm:py-24">
                    <div
                        aria-hidden
                        className="pointer-events-none absolute -top-32 left-1/2 h-72 w-[600px] -translate-x-1/2 rounded-full bg-white/15 blur-3xl"
                    />
                    <h2 className="relative mx-auto max-w-3xl text-3xl leading-[1.08] font-medium tracking-[-0.035em] text-balance sm:text-5xl">
                        Your next appointment is a few taps away.
                    </h2>
                    <p className="relative mx-auto mt-4 max-w-xl text-white/80">
                        Find a verified clinic near you and book online.
                    </p>
                    <Link
                        href="/clinics"
                        className="group relative mt-8 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-medium text-[#0F1115] transition hover:bg-[#0F1115] hover:text-white"
                    >
                        Find a clinic{' '}
                        <ArrowUpRightIcon className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-slate-200">
                <div
                    className={`${wrap} flex flex-wrap items-center justify-between gap-6 py-10 text-sm text-[#64748B]`}
                >
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-base font-semibold text-[#0F1115]"
                    >
                        <span className="grid size-7 place-items-center rounded-lg bg-[#337983] text-white">
                            <HeartPulseIcon className="size-4" />
                        </span>
                        nuria
                    </Link>
                    <nav aria-label="Footer" className="flex flex-wrap gap-6">
                        {links.map(([l, h]) => (
                            <a
                                key={h}
                                href={h}
                                className="hover:text-[#337983]"
                            >
                                {l}
                            </a>
                        ))}
                        <Link href="/privacy" className="hover:text-[#337983]">
                            Privacy
                        </Link>
                        <Link href="/terms" className="hover:text-[#337983]">
                            Terms
                        </Link>
                    </nav>
                    <p>© {new Date().getFullYear()} Nuria Health</p>
                </div>
            </footer>
        </main>
    );
}
