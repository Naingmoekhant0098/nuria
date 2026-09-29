'use client';


import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ImageIcon, Link, MapPinIcon, SearchIcon, SlidersHorizontalIcon, StarIcon, VideoIcon, XIcon } from 'lucide-react';
 

/* ============ IMAGES (same approach as the home page) ============ */
const src = (id: string, w = 800) => (id.startsWith('/') || id.startsWith('http') ? id : `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=75`);
function Img({ id, alt, className = '' }: { id: string; alt: string; className?: string }) {
    const [ok, setOk] = useState(true);
    if (!ok) return <div role="img" aria-label={alt} className="grid size-full place-items-center bg-[#F0E6EE] text-[#B0357F]/60"><ImageIcon className="size-8" /></div>;
    return <img src={src(id)} alt={alt} loading="lazy" onError={() => setOk(false)} className={`size-full object-cover ${className}`} />;
}
const photos = ['photo-1559839734-2b71ea197ec2', 'photo-1622253692010-333f2da6031d', 'photo-1594824476967-48c8b964273f', 'photo-1537368910025-700350fe46c7', 'photo-1582750433449-648ed127bb54', 'photo-1612349317150-e413f6a5b16d'];

/* ============ DUMMY DATA ============ */
const clinicInfo: Record<string, { region: string; products: string[] }> = {
    'Harbour Family Clinic': { region: 'Central district', products: ['Digital thermometer', 'Blood pressure monitor'] },
    'Little Steps Pediatrics': { region: 'Riverside', products: ['Digital thermometer', 'First-aid kit'] },
    'Bright Smile Dental': { region: 'North quarter', products: ['First-aid kit'] },
    'Calm Ground Practice': { region: 'Old town', products: [] },
    'Park Street Medical': { region: 'Central district', products: ['Blood pressure monitor', 'Pulse oximeter'] },
    "Eastside Women's Clinic": { region: 'East coast', products: ['Digital thermometer', 'Pulse oximeter'] },
};
type Doctor = { id: string; name: string; spec: string; clinic: string; region: string; products: string[]; price: number; rating: number; reviews: number; next: string; days: number; gender: string; langs: string[]; services: string[]; video: boolean; img: string };
const mk = (n: number, name: string, spec: string, clinic: string, price: number, rating: number, reviews: number, next: string, days: number, gender: string, langs: string[], services: string[], video: boolean): Doctor => ({
    id: name.toLowerCase().replace(/[^a-z]+/g, '-'), name, spec, clinic, region: clinicInfo[clinic].region, products: clinicInfo[clinic].products,
    price, rating, reviews, next, days, gender, langs, services, video, img: photos[n % photos.length],
});
const doctors: Doctor[] = [
    mk(0, 'Dr. Aisha Rahman', 'Family medicine', 'Harbour Family Clinic', 60, 4.9, 214, 'Today, 4:30 pm', 0, 'Female', ['English', 'Malay'], ['General consultation', 'Vaccination', 'Lab tests'], true),
    mk(1, 'Dr. Daniel Tan', 'Pediatrics', 'Little Steps Pediatrics', 75, 4.8, 178, 'Tomorrow, 9:00 am', 1, 'Male', ['English', 'Mandarin'], ['Child health', 'Vaccination'], false),
    mk(2, 'Dr. Priya Nair', 'Dental', 'Bright Smile Dental', 90, 4.8, 132, 'Today, 6:00 pm', 0, 'Female', ['English', 'Tamil'], ['Dental care'], false),
    mk(3, 'Dr. Marcus Lee', 'Mental health', 'Calm Ground Practice', 120, 4.9, 96, 'Thu, 11:15 am', 3, 'Male', ['English'], ['Counselling'], true),
    mk(4, 'Dr. Sofia Alvarez', 'Family medicine', 'Park Street Medical', 55, 4.7, 240, 'Tomorrow, 2:00 pm', 1, 'Female', ['English', 'Spanish'], ['General consultation', 'Lab tests'], true),
    mk(5, 'Dr. Wei Chen', 'Pediatrics', 'Little Steps Pediatrics', 70, 4.9, 151, 'Fri, 10:30 am', 4, 'Male', ['English', 'Mandarin'], ['Child health', 'Vaccination', 'General consultation'], false),
    mk(6, 'Dr. Hannah Okafor', "Women's health", "Eastside Women's Clinic", 95, 4.8, 120, 'Today, 5:15 pm', 0, 'Female', ['English'], ['General consultation', 'Lab tests'], true),
    mk(7, 'Dr. Rajiv Menon', 'Family medicine', 'Harbour Family Clinic', 50, 4.6, 305, 'Tomorrow, 11:00 am', 1, 'Male', ['English', 'Tamil', 'Hindi'], ['General consultation', 'Vaccination'], false),
    mk(8, 'Dr. Elena Petrova', 'Dental', 'Bright Smile Dental', 110, 4.9, 88, 'Sat, 9:30 am', 5, 'Female', ['English', 'Russian'], ['Dental care'], false),
    mk(9, 'Dr. Samuel Ong', 'Mental health', 'Calm Ground Practice', 100, 4.7, 74, 'Tomorrow, 4:00 pm', 1, 'Male', ['English', 'Mandarin'], ['Counselling'], true),
    mk(10, 'Dr. Mei Lin', "Women's health", "Eastside Women's Clinic", 85, 4.7, 167, 'Fri, 1:45 pm', 4, 'Female', ['English', 'Mandarin'], ['General consultation', 'Vaccination'], true),
    mk(11, 'Dr. Omar Haddad', 'Family medicine', 'Park Street Medical', 65, 4.8, 190, 'Today, 7:15 pm', 0, 'Male', ['English', 'Arabic'], ['General consultation', 'Lab tests', 'Vaccination'], false),
];
const uniq = (f: (d: Doctor) => string[]) => [...new Set(doctors.flatMap(f))].sort();
const options = {
    specs: uniq((d) => [d.spec]), clinics: uniq((d) => [d.clinic]), regions: uniq((d) => [d.region]),
    services: uniq((d) => d.services), products: uniq((d) => d.products), genders: uniq((d) => [d.gender]), langs: uniq((d) => d.langs),
};
const PRICE_MIN = 40, PRICE_MAX = 150;
const navLinks = [['Services', '/#services'], ['Doctors', '/doctors'], ['Clinics', '/#clinics'], ['Products', '/#products'], ['FAQ', '/#faq']];

/* ============ FILTER LOGIC ============ */
type ListKey = 'specs' | 'clinics' | 'regions' | 'services' | 'products' | 'genders' | 'langs';
type F = Record<ListKey, string[]> & { q: string; maxPrice: number; avail: 'any' | 'today' | 'soon'; minRating: number; video: boolean };
const initial: F = { q: '', specs: [], clinics: [], regions: [], services: [], products: [], genders: [], langs: [], maxPrice: PRICE_MAX, avail: 'any', minRating: 0, video: false };
const pick: Record<ListKey, (d: Doctor) => string[]> = {
    specs: (d) => [d.spec], clinics: (d) => [d.clinic], regions: (d) => [d.region], services: (d) => d.services,
    products: (d) => d.products, genders: (d) => [d.gender], langs: (d) => d.langs,
};
/** `skip` ignores one group so option counts show what you'd get if you ticked that option. */
function matches(d: Doctor, f: F, skip?: ListKey) {
    if (f.q && !d.name.toLowerCase().includes(f.q.trim().toLowerCase())) return false;
    for (const k of Object.keys(pick) as ListKey[]) if (k !== skip && f[k].length && !pick[k](d).some((v) => f[k].includes(v))) return false;
    if (d.price > f.maxPrice || d.rating < f.minRating) return false;
    if (f.avail === 'today' && d.days > 0) return false;
    if (f.avail === 'soon' && d.days > 2) return false;
    if (f.video && !d.video) return false;
    return true;
}
const sorts = [['recommended', 'Recommended'], ['rating', 'Highest rated'], ['price-asc', 'Price: low to high'], ['price-desc', 'Price: high to low'], ['soonest', 'Earliest available']];
const toggle = (list: string[], v: string) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

/* ============ SMALL UI PIECES ============ */
function Group({ title, children }: { title: string; children: React.ReactNode }) {
    return <fieldset className="border-t border-slate-200 py-5 first:border-0 first:pt-0"><legend className="mb-3 text-sm font-semibold">{title}</legend>{children}</fieldset>;
}
function Check({ label, count, checked, onChange }: { label: string; count: number; checked: boolean; onChange: () => void }) {
    const off = count === 0 && !checked;
    return (
        <label className={`flex cursor-pointer items-center justify-between gap-3 py-1.5 text-sm ${off ? 'opacity-40' : ''}`}>
            <span className="flex items-center gap-2.5"><input type="checkbox" checked={checked} onChange={onChange} className="size-4 rounded accent-[#B0357F]" />{label}</span>
            <span className="text-xs text-[#94A3B8]">{count}</span>
        </label>
    );
}
function Pills<T extends string | number>({ value, onChange, items }: { value: T; onChange: (v: T) => void; items: [T, string][] }) {
    return (
        <div className="flex flex-wrap gap-2">
            {items.map(([v, l]) => (
                <button key={String(v)} type="button" aria-pressed={value === v} onClick={() => onChange(v)}
                    className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${value === v ? 'border-[#0F1115] bg-[#0F1115] text-white' : 'border-slate-300 bg-white text-[#3B3F4A] hover:border-[#B0357F]'}`}>{l}</button>
            ))}
        </div>
    );
}

function DoctorCard({ d }: { d: Doctor }) {
    return (
        <div className="group">
            <Link href={`/doctors/${d.id}`} className="relative block aspect-[4/3] overflow-hidden rounded-[1.5rem] bg-slate-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B0357F]">
                <Img id={d.img} alt={`Portrait of ${d.name}`} className="object-top transition duration-700 group-hover:scale-105" />
                <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold backdrop-blur"><StarIcon className="size-3 fill-amber-400 text-amber-400" />{d.rating.toFixed(1)}<span className="font-normal text-[#64748B]">({d.reviews})</span></span>
                {d.video && <span className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium backdrop-blur"><VideoIcon className="size-3.5 text-[#B0357F]" />Video visit</span>}
            </Link>
            <div className="mt-4 flex items-start justify-between gap-4">
                <div className="min-w-0">
                    <h3 className="text-lg font-medium tracking-tight"><Link href={`/doctors/${d.id}`} className="hover:text-[#B0357F]">{d.name}</Link></h3>
                    <p className="text-sm text-[#64748B]">{d.spec}, {d.clinic}</p>
                    <p className="mt-1 flex items-center gap-1 text-sm text-[#64748B]"><MapPinIcon className="size-3.5" />{d.region}</p>
                    <p className="mt-2 flex items-center gap-2 text-sm font-medium text-emerald-700"><span className="size-2 rounded-full bg-emerald-500" />Next: {d.next}</p>
                </div>
                <div className="shrink-0 text-right">
                    <p className="text-lg font-semibold">${d.price}</p>
                    <p className="mb-2 text-xs text-[#64748B]">per visit</p>
                    <Link href={`/doctors/${d.id}`} className="inline-block rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium transition hover:border-[#B0357F] hover:bg-[#B0357F] hover:text-white">Book</Link>
                </div>
            </div>
        </div>
    );
}

/* ============ PAGE ============ */
export default function DoctorsPage() {
    const reduce = useReducedMotion();
    const [f, setF] = useState<F>(initial);
    const [sort, setSort] = useState('recommended');
    const [drawer, setDrawer] = useState(false);
    const set = <K extends keyof F>(k: K, v: F[K]) => setF((p) => ({ ...p, [k]: v }));

    useEffect(() => {
        document.body.style.overflow = drawer ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [drawer]);

    const results = useMemo(() => {
        const r = doctors.filter((d) => matches(d, f));
        const by: Record<string, (a: Doctor, b: Doctor) => number> = {
            rating: (a, b) => b.rating - a.rating || b.reviews - a.reviews, 'price-asc': (a, b) => a.price - b.price,
            'price-desc': (a, b) => b.price - a.price, soonest: (a, b) => a.days - b.days,
        };
        return by[sort] ? [...r].sort(by[sort]) : r;
    }, [f, sort]);
    const count = (k: ListKey, v: string) => doctors.filter((d) => matches(d, f, k) && pick[k](d).includes(v)).length;

    // Active filter chips
    const chips: { label: string; clear: () => void }[] = [];
    if (f.q) chips.push({ label: `"${f.q}"`, clear: () => set('q', '') });
    (Object.keys(pick) as ListKey[]).forEach((k) => f[k].forEach((v) => chips.push({ label: v, clear: () => set(k, f[k].filter((x) => x !== v)) })));
    if (f.maxPrice < PRICE_MAX) chips.push({ label: `Up to $${f.maxPrice}`, clear: () => set('maxPrice', PRICE_MAX) });
    if (f.avail !== 'any') chips.push({ label: f.avail === 'today' ? 'Available today' : 'Next 2 days', clear: () => set('avail', 'any') });
    if (f.minRating) chips.push({ label: `${f.minRating.toFixed(1)}+ rating`, clear: () => set('minRating', 0) });
    if (f.video) chips.push({ label: 'Video visit', clear: () => set('video', false) });
    const reset = () => setF(initial);

    const list = (k: ListKey, title: string, hint?: string) => (
        <Group title={title}>
            {hint && <p className="-mt-1 mb-2 text-xs text-[#64748B]">{hint}</p>}
            {options[k].map((v) => <Check key={v} label={v} count={count(k, v)} checked={f[k].includes(v)} onChange={() => set(k, toggle(f[k], v))} />)}
        </Group>
    );

    const panel = (
        <div>
            <Group title="Doctor name">
                <div className="flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 focus-within:border-[#B0357F]">
                    <SearchIcon className="size-4 shrink-0 text-[#64748B]" aria-hidden />
                    <input type="search" aria-label="Search by doctor name" value={f.q} onChange={(e) => set('q', e.target.value)} placeholder="Search by name" className="min-w-0 flex-1 bg-transparent py-2.5 text-sm outline-none placeholder:text-[#94A3B8]" />
                </div>
            </Group>
            {list('specs', 'Specialty')}
            {list('clinics', 'Clinic')}
            {list('regions', 'Region')}
            {list('services', 'Services')}
            {list('products', 'Medical products', 'Sold at the doctor’s clinic')}
            <Group title="Consultation fee">
                <div className="flex items-baseline justify-between text-sm"><span className="text-[#64748B]">Up to</span><span className="font-semibold">${f.maxPrice}</span></div>
                <input type="range" aria-label="Maximum consultation fee" min={PRICE_MIN} max={PRICE_MAX} step={5} value={f.maxPrice} onChange={(e) => set('maxPrice', Number(e.target.value))} className="mt-2 w-full accent-[#B0357F]" />
                <div className="flex justify-between text-xs text-[#94A3B8]"><span>${PRICE_MIN}</span><span>${PRICE_MAX}+</span></div>
            </Group>
            <Group title="Availability"><Pills value={f.avail} onChange={(v) => set('avail', v)} items={[['any', 'Any time'], ['today', 'Today'], ['soon', 'Next 2 days']]} /></Group>
            <Group title="Minimum rating"><Pills value={f.minRating} onChange={(v) => set('minRating', v)} items={[[0, 'Any'], [4, '4.0+'], [4.5, '4.5+'], [4.8, '4.8+']]} /></Group>
            {list('genders', 'Doctor gender')}
            {list('langs', 'Languages spoken')}
            <Group title="Visit type">
                <label className="flex cursor-pointer items-center justify-between text-sm">
                    <span className="flex items-center gap-2.5"><VideoIcon className="size-4 text-[#B0357F]" />Video visit available</span>
                    <input type="checkbox" checked={f.video} onChange={(e) => set('video', e.target.checked)} className="size-4 accent-[#B0357F]" />
                </label>
            </Group>
        </div>
    );

    return (
        <main className="min-h-screen bg-[#F6F3F7] text-[#0F1115]">
           

            <div className="mx-auto max-w-[1280px] px-4 pb-24 pt-28 sm:px-6">
                <p className="text-sm text-[#64748B]"><Link href="/" className="hover:text-[#B0357F]">Home</Link> / Doctors</p>
                <h1 className="mt-3 text-4xl font-medium tracking-[-0.04em] sm:text-5xl">Find a doctor</h1>
                <p className="mt-3 max-w-xl text-[#64748B]">Filter by clinic, region, services and price to find the right doctor and book online.</p>

                <div className="mt-10 grid gap-8 lg:grid-cols-[300px_1fr] lg:gap-10">
                    {/* Filters: sidebar on desktop */}
                    <aside aria-label="Filters" className="hidden lg:block">
                        <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto rounded-[1.5rem] bg-white p-6">
                            <div className="mb-5 flex items-center justify-between">
                                <h2 className="text-lg font-medium tracking-tight">Filters</h2>
                                {chips.length > 0 && <button onClick={reset} className="text-sm font-medium text-[#B0357F] hover:underline">Clear all</button>}
                            </div>
                            {panel}
                        </div>
                    </aside>

                    {/* Results */}
                    <section aria-label="Doctors">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <p aria-live="polite" className="text-sm font-medium"><span className="text-lg font-semibold">{results.length}</span> {results.length === 1 ? 'doctor' : 'doctors'} found</p>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setDrawer(true)} className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium lg:hidden">
                                    <SlidersHorizontalIcon className="size-4" />Filters{chips.length > 0 && <span className="grid size-5 place-items-center rounded-full bg-[#B0357F] text-[11px] text-white">{chips.length}</span>}
                                </button>
                                <label className="flex items-center gap-2 text-sm text-[#64748B]">
                                    <span className="sr-only sm:not-sr-only">Sort by</span>
                                    <select value={sort} onChange={(e) => setSort(e.target.value)} className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-[#0F1115] outline-none focus:border-[#B0357F]">
                                        {sorts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                                    </select>
                                </label>
                            </div>
                        </div>

                        {chips.length > 0 && (
                            <ul className="mt-4 flex flex-wrap items-center gap-2">
                                {chips.map((c) => (
                                    <li key={c.label}><button onClick={c.clear} aria-label={`Remove filter ${c.label}`} className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-sm font-medium transition hover:bg-[#F0E6EE]">{c.label}<XIcon className="size-3.5 text-[#64748B]" /></button></li>
                                ))}
                                <li><button onClick={reset} className="px-2 text-sm font-medium text-[#B0357F] hover:underline">Clear all</button></li>
                            </ul>
                        )}

                        {results.length > 0 ? (
                            <ul className="mt-6 grid gap-x-6 gap-y-10 sm:grid-cols-2">
                                <AnimatePresence mode="popLayout" initial={false}>
                                    {results.map((d) => (
                                        <motion.li key={d.id} layout={!reduce}
                                            initial={reduce ? false : { opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={reduce ? undefined : { opacity: 0, scale: 0.96 }}
                                            transition={{ duration: 0.25 }}>
                                            <DoctorCard d={d} />
                                        </motion.li>
                                    ))}
                                </AnimatePresence>
                            </ul>
                        ) : (
                            <div className="mt-6 rounded-[1.5rem] bg-white px-6 py-16 text-center">
                                <span className="mx-auto grid size-12 place-items-center rounded-full bg-[#F0E6EE] text-[#B0357F]"><SearchIcon className="size-5" /></span>
                                <h2 className="mt-4 text-xl font-medium tracking-tight">No doctors match these filters</h2>
                                <p className="mx-auto mt-2 max-w-sm text-sm text-[#64748B]">Try removing a filter, raising the maximum fee, or searching a different name.</p>
                                <button onClick={reset} className="mt-6 rounded-full bg-[#0F1115] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#B0357F]">Clear all filters</button>
                            </div>
                        )}
                    </section>
                </div>
            </div>

            {/* Filters: drawer on mobile */}
            <AnimatePresence>
                {drawer && (
                    <>
                        <motion.div key="bd" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDrawer(false)} className="fixed inset-0 z-[10001] bg-black/30 backdrop-blur-sm lg:hidden" />
                        <motion.aside key="dr" role="dialog" aria-modal="true" aria-label="Filters" initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', stiffness: 400, damping: 40 }}
                            className="fixed inset-y-0 left-0 z-[10002] flex w-[90%] max-w-sm flex-col bg-white lg:hidden">
                            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                                <h2 className="text-lg font-medium tracking-tight">Filters</h2>
                                <div className="flex items-center gap-3">
                                    {chips.length > 0 && <button onClick={reset} className="text-sm font-medium text-[#B0357F]">Clear all</button>}
                                    <button aria-label="Close filters" onClick={() => setDrawer(false)} className="grid size-9 place-items-center rounded-full border border-slate-200"><XIcon className="size-4" /></button>
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto px-5 py-5">{panel}</div>
                            <div className="border-t border-slate-200 p-4">
                                <button onClick={() => setDrawer(false)} className="w-full rounded-full bg-[#0F1115] py-3 text-sm font-medium text-white">Show {results.length} {results.length === 1 ? 'doctor' : 'doctors'}</button>
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </main>
    );
}
