import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
    ChevronDownIcon,
    ImageIcon,
    MapIcon,
    MapPinIcon,
    SearchIcon,
    SlidersHorizontalIcon,
    StarIcon,
    VideoIcon,
    XIcon,
} from 'lucide-react';
import { createPortal } from 'react-dom';
import { Link, router, usePage } from '@inertiajs/react';
import 'leaflet/dist/leaflet.css';

/* ============ HELPERS + ROUTES ============ */
const slug = (s: string) =>
    s
        .toLowerCase()
        .replace(/['’]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

const routes = {
    doctor: (clinic: string, doctor: string) =>
        `/clinics/${clinic}/doctors/${doctor}`,
    doctorAvailability: (clinic: string, doctor: string) =>
        `/clinics/${clinic}/doctors/${doctor}/availability`,
};

const css = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,400&display=swap');
.n-serif{font-family:'Playfair Display',Georgia,serif;font-style:italic;font-weight:400;letter-spacing:-.02em}
.n-scroll{scrollbar-width:none}.n-scroll::-webkit-scrollbar{display:none}
`;

/* ============ IMAGES ============ */
const src = (id: string, w = 800) =>
    id.startsWith('/') || id.startsWith('http')
        ? id
        : `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=75`;

function Img({ id, alt, className = '' }: { id: string; alt: string; className?: string }) {
    const [ok, setOk] = useState(true);
    useEffect(() => setOk(true), [id]);
    if (!ok || !id)
        return (
            <div role="img" aria-label={alt} className="grid size-full place-items-center bg-[#E3EEF1] text-main/60">
                <ImageIcon className="size-8" />
            </div>
        );
    return (
        <img src={src(id)} alt={alt} loading="lazy" onError={() => setOk(false)} className={`size-full object-cover ${className}`} />
    );
}

/* ============ TYPES ============ */
type Doctor = {
    id: string;
    clinicSlug: string;
    name: string;
    spec: string;
    experience_years?: number | null;
    clinic: string;
    region: string;
    lat?: number | string | null;
    lng?: number | string | null;
    products: string[];
    price: number;
    rating: number;
    reviews: number;
    next: string;
    days: number;
    gender: string;
    age?: number | null;
    langs: string[];
    services: string[];
    video: boolean;
    img: string;
    clinicImg?: string | null;
    clinics: { id: number; name: string }[];
};

const PRICE_MIN = 30000,
    PRICE_MAX = 1500000000;
const GENDERS = ['Female', 'Male', 'Other'];
const AGES = ['18–25', '26–35', '36–45', '46+'];

/* ============ FILTER LOGIC ============ */
type ListKey = 'specs' | 'clinics' | 'regions' | 'services' | 'products' | 'genders' | 'ages' | 'langs';
type F = Record<ListKey, string[]> & {
    q: string;
    maxPrice: number;
    avail: 'any' | 'today' | 'soon';
    minRating: number;
    video: boolean;
};
const initial: F = {
    q: '',
    specs: [],
    clinics: [],
    regions: [],
    services: [],
    products: [],
    genders: [],
    ages: [],
    langs: [],
    maxPrice: PRICE_MAX,
    avail: 'any',
    minRating: 0,
    video: false,
};

type ServerKey = 'q' | 'specialty' | 'service' | 'clinic';
const SERVER_KEYS: ServerKey[] = ['q', 'specialty', 'service', 'clinic'];

const SERVER_KEY: Partial<Record<keyof F, ServerKey>> = {
    q: 'q',
    specs: 'specialty',
    services: 'service',
    clinics: 'clinic',
};

const URL_KEYS: Record<ServerKey, string[]> = {
    q: ['q'],
    specialty: ['specialty', 'specialty_id'],
    service: ['service', 'service_id'],
    clinic: ['clinic', 'clinic_id'],
};

function genderGroup(g?: string | null): string {
    const s = (g ?? '').trim().toLowerCase();
    if (s.startsWith('f')) return 'Female';
    if (s === 'male' || s === 'm') return 'Male';
    return 'Other';
}
function ageGroup(age?: number | null): string | null {
    if (age == null) return null;
    if (age <= 25) return '18–25';
    if (age <= 35) return '26–35';
    if (age <= 45) return '36–45';
    return '46+';
}

const pick: Record<ListKey, (d: Doctor) => string[]> = {
    specs: (d) => [d.spec],
    clinics: (d) => [d.clinic],
    regions: (d) => [d.region],
    services: (d) => d.services,
    products: (d) => d.products,
    genders: (d) => [genderGroup(d.gender)],
    ages: (d) => {
        const a = ageGroup(d.age);
        return a ? [a] : [];
    },
    langs: (d) => d.langs,
};

function matches(d: Doctor, f: F, skip?: ListKey) {
    const q = f.q.trim().toLowerCase();
    if (q && !d.name.toLowerCase().includes(q)) return false;
    for (const k of Object.keys(pick) as ListKey[])
        if (k !== skip && f[k].length && !pick[k](d).some((v) => f[k].includes(v))) return false;
    if (f.maxPrice < PRICE_MAX && d.price > f.maxPrice) return false;
    if (d.rating < f.minRating) return false;
    if (f.avail === 'today' && d.days > 0) return false;
    if (f.avail === 'soon' && d.days > 2) return false;
    if (f.video && !d.video) return false;
    return true;
}
const sorts: [string, string][] = [
    ['recommended', 'Recommended'],
    ['rating', 'Highest rated'],
    ['price-asc', 'Price: low to high'],
    ['price-desc', 'Price: high to low'],
    ['soonest', 'Earliest available'],
];
const toggle = (list: string[], v: string) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

type MapClinic = { name: string; region: string; lat: number; lng: number; doctors: number; img?: string | null };
const DEFAULT_CENTER: [number, number] = [16.78, 96.16];

function MapModal({
    clinics,
    onClose,
    onPick,
}: {
    clinics: MapClinic[];
    onClose: () => void;
    onPick: (clinic: string) => void;
}) {
    const box = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let map: import('leaflet').Map | undefined;
        let cancelled = false;

        (async () => {
            const L = (await import('leaflet')).default;
            if (cancelled || !box.current) return;

            map = L.map(box.current, { scrollWheelZoom: true }).setView(DEFAULT_CENTER, 12);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            }).addTo(map);

            const icon = L.divIcon({
                className: '',
                html: '<div style="width:28px;height:28px;border-radius:50% 50% 50% 0;background:#337983;transform:rotate(-45deg);border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.35)"></div>',
                iconSize: [28, 28],
                iconAnchor: [14, 28],
                popupAnchor: [0, -28],
            });

            clinics.forEach((c) => {
                const el = document.createElement('div');
                el.style.cssText = 'width:220px';
                if (c.img) {
                    const img = document.createElement('img');
                    img.src = c.img;
                    img.alt = c.name;
                    img.loading = 'lazy';
                    img.style.cssText =
                        'display:block;width:100%;height:110px;object-fit:cover;border-radius:12px;margin-bottom:8px;background:#E3EEF1';
                    img.onerror = () => img.remove();
                    el.append(img);
                }
                const title = document.createElement('strong');
                title.textContent = c.name;
                const meta = document.createElement('div');
                meta.style.cssText = 'margin:4px 0 8px;color:#64748B;font-size:13px';
                meta.textContent = `${c.region} · ${c.doctors} ${c.doctors === 1 ? 'doctor' : 'doctors'}`;
                const btn = document.createElement('button');
                btn.textContent = 'Show doctors here';
                btn.style.cssText =
                    'background:#1F3A43;color:#fff;border-radius:999px;padding:6px 14px;font-size:13px;font-weight:500;cursor:pointer';
                btn.onclick = () => onPick(c.name);
                el.append(title, meta, btn);
                L.marker([c.lat, c.lng], { icon, title: c.name }).addTo(map!).bindPopup(el, { minWidth: 220, maxWidth: 260 });
            });

            if (clinics.length > 1)
                map.fitBounds(L.latLngBounds(clinics.map((c) => [c.lat, c.lng] as [number, number])), { padding: [50, 50] });
            else if (clinics.length === 1) map.setView([clinics[0].lat, clinics[0].lng], 15);
        })();

        return () => {
            cancelled = true;
            map?.remove();
        };
    }, [clinics]);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [onClose]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10003] isolate flex items-center justify-center bg-black/40 p-3 backdrop-blur-sm sm:p-6"
            onClick={onClose}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-label="Clinic map"
                onClick={(e) => e.stopPropagation()}
                className="flex h-full max-h-[760px] w-full max-w-5xl flex-col overflow-hidden rounded-[1.75rem] bg-white"
            >
                <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                    <div>
                        <h2 className="text-lg font-medium tracking-tight">Clinics on map</h2>
                        <p className="text-xs text-[#64748B]">
                            {clinics.length} {clinics.length === 1 ? 'clinic' : 'clinics'} match your current filters
                        </p>
                    </div>
                    <button aria-label="Close map" onClick={onClose} className="grid size-9 place-items-center rounded-full border border-slate-200 hover:bg-slate-50">
                        <XIcon className="size-4" />
                    </button>
                </div>
                <div className="relative flex-1">
                    <div ref={box} className="absolute inset-0" />
                    {clinics.length === 0 && (
                        <div className="pointer-events-none absolute inset-x-0 top-4 z-[1000] mx-auto w-fit rounded-full bg-white px-4 py-2 text-sm shadow">
                            No clinics with a location match these filters
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

/* ============ SMALL UI PIECES ============ */
function Group({ title, children }: { title: string; children: ReactNode }) {
    const id = `g-${slug(title)}`;
    return (
        <div role="group" aria-labelledby={id} className="border-t border-slate-100 py-5 first:border-0 first:pt-0">
            <h3 id={id} className="mb-3 text-sm font-semibold">
                {title}
            </h3>
            {children}
        </div>
    );
}

function Check({ label, count, checked, onChange }: { label: string; count: number; checked: boolean; onChange: () => void }) {
    const off = count === 0 && !checked;
    return (
        <label className={`flex cursor-pointer items-center justify-between gap-3 py-1.5 text-sm ${off ? 'opacity-40' : ''}`}>
            <span className="flex items-center gap-2.5">
                <input type="checkbox" checked={checked} onChange={onChange} className="size-4 rounded accent-primary" />
                {label}
            </span>
            <span className="text-xs text-[#94A3B8]">{count}</span>
        </label>
    );
}

/** Native select with a custom arrow. One value, empty string means "all". */
function Select({
    label,
    value,
    onChange,
    allLabel,
    options,
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    allLabel: string;
    options: { v: string; n: number }[];
}) {
    return (
        <div className="relative">
            <select
                aria-label={label}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full cursor-pointer appearance-none rounded-2xl border border-slate-200 bg-white py-3 pr-10 pl-4 text-sm font-medium outline-none transition focus:border-main"
            >
                <option value="">{allLabel}</option>
                {options.map((o) => (
                    <option key={o.v} value={o.v} disabled={o.n === 0 && o.v !== value}>
                        {o.v} ({o.n})
                    </option>
                ))}
            </select>
            <ChevronDownIcon className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-[#64748B]" aria-hidden />
        </div>
    );
}

/** Multi-select toggle chips with a live count. */
function ChipGroup({
    items,
    selected,
    count,
    onToggle,
}: {
    items: string[];
    selected: string[];
    count: (v: string) => number;
    onToggle: (v: string) => void;
}) {
    return (
        <div className="flex flex-wrap gap-2">
            {items.map((v) => {
                const on = selected.includes(v);
                const n = count(v);
                return (
                    <button
                        key={v}
                        type="button"
                        aria-pressed={on}
                        disabled={n === 0 && !on}
                        onClick={() => onToggle(v)}
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-40 ${on ? 'border-primary bg-primary text-white' : 'border-slate-200 bg-white hover:border-main'}`}
                    >
                        {v}
                        <span className={`text-xs ${on ? 'text-white/70' : 'text-[#94A3B8]'}`}>{n}</span>
                    </button>
                );
            })}
        </div>
    );
}

function Pills<T extends string | number>({ value, onChange, items }: { value: T; onChange: (v: T) => void; items: [T, string][] }) {
    return (
        <div className="flex flex-wrap gap-2">
            {items.map(([v, l]) => (
                <button
                    key={String(v)}
                    type="button"
                    aria-pressed={value === v}
                    onClick={() => onChange(v)}
                    className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${value === v ? 'border-primary bg-primary text-white' : 'border-slate-200 bg-white hover:border-main'}`}
                >
                    {l}
                </button>
            ))}
        </div>
    );
}

function DoctorCard({ d }: { d: Doctor }) {
    const doctorHref = routes.doctor(d.clinicSlug, d.id);
    const availabilityHref = routes.doctorAvailability(d.clinicSlug, d.id);

    return (
        <div className="group h-full rounded-[1.75rem] bg-white p-3 shadow-[0_1px_2px_rgba(31,58,67,0.06)] transition hover:shadow-[0_16px_40px_rgba(31,58,67,0.12)]">
            <Link
                href={doctorHref}
                className="relative block aspect-[4/3] overflow-hidden rounded-[1.4rem] bg-slate-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-main"
            >
                <Img id={d.img} alt={`Portrait of ${d.name}`} className="object-top transition duration-700 group-hover:scale-105" />
                <span className="absolute top-3 left-3 flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold backdrop-blur">
                    <StarIcon className="size-3 fill-amber-400 text-amber-400" />
                    {d.rating.toFixed(1)}
                    <span className="font-normal text-[#64748B]">({d.reviews})</span>
                </span>
                {d.video && (
                    <span className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium backdrop-blur">
                        <VideoIcon className="size-3.5 text-main" />
                        Video visit
                    </span>
                )}
            </Link>
            <div className="px-2 pt-4 pb-1">
                <h3 className="text-lg font-medium tracking-tight">
                    <Link href={doctorHref} className="transition hover:text-main">
                        {d.name}
                    </Link>
                </h3>
                <p className="text-sm text-[#64748B]">
                    {d.spec}
                </p>
                {d.experience_years != null && (
                    <p className="mt-1 text-xs text-[#64748B]">
                        {d.experience_years} {d.experience_years === 1 ? 'year' : 'years'} experience
                    </p>
                )}
                <p className="mt-1 flex items-center gap-1 text-sm text-main">
                    <MapPinIcon className="size-3.5" />
                  <span className=' text-xs!'>  {d.region}</span>
                </p>
                <div className="mt-4 flex items-end justify-between gap-3 border-t border-slate-100 pt-4">
                    <div>
                        <p className="flex items-center gap-2 text-xs font-medium text-emerald-700">
                            <span className="size-2 rounded-full bg-emerald-500" />
                          
                            Next: {d.next}
                        </p>
                        <p className="mt-1.5 text-lg font-semibold">
                            {d.price.toLocaleString()} MMK
                            <span className="ml-1 text-xs font-normal text-[#64748B]">per visit</span>
                        </p>
                    </div>
                    <Link
                        href={availabilityHref}
                        className="shrink-0 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-white transition hover:bg-main"
                    >
                        Book
                    </Link>
                </div>
            </div>
        </div>
    );
}

type Props = {
    doctors: Doctor[];
    filters?: { q?: string | null; specialty?: string | null; service?: string | null; clinic?: string | null };
};

export default function DoctorsPage() {
    const { doctors, filters } = usePage<Props>().props;
    const uniqueDoctors = useMemo(
        () => Array.from(new Map(doctors.map((doctor) => [String(doctor.id), doctor])).values()),
        [doctors],
    );
    const reduce = useReducedMotion();
    const [f, setF] = useState<F>(() => ({
        ...initial,
        q: filters?.q ?? '',
        specs: filters?.specialty ? [filters.specialty] : [],
        services: filters?.service ? [filters.service] : [],
        clinics: filters?.clinic ? [filters.clinic] : [],
    }));
    const [sort, setSort] = useState('recommended');
    const [drawer, setDrawer] = useState(false);
    const [mapOpen, setMapOpen] = useState(false);

    const [server, setServer] = useState<Partial<Record<ServerKey, string>>>(() => {
        const s: Partial<Record<ServerKey, string>> = {};
        SERVER_KEYS.forEach((k) => {
            const v = filters?.[k];
            if (v) s[k] = v;
        });
        return s;
    });

    const dropServer = (keys: ServerKey[]) => {
        const active = keys.filter((k) => server[k]);
        if (!active.length) return;

        setServer((s) => {
            const n = { ...s };
            active.forEach((k) => delete n[k]);
            return n;
        });

        const params = new URLSearchParams(window.location.search);
        active.forEach((k) => URL_KEYS[k].forEach((p) => params.delete(p)));

        router.get(window.location.pathname, Object.fromEntries(params), {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            only: ['doctors', 'filters'],
        });
    };

    const set = <K extends keyof F>(k: K, v: F[K]) => {
        setF((p) => ({ ...p, [k]: v }));

        const sk = SERVER_KEY[k];
        const serverValue = sk ? server[sk] : undefined;
        if (sk && serverValue) {
            const stillThere = Array.isArray(v) ? v.includes(serverValue) : v === serverValue;
            if (!stillThere) dropServer([sk]);
        }
    };

    useEffect(() => {
        document.body.style.overflow = drawer || mapOpen ? 'hidden' : '';
        const mq = window.matchMedia('(min-width: 1024px)');
        const onChange = () => mq.matches && setDrawer(false);
        const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setDrawer(false);
        mq.addEventListener('change', onChange);
        window.addEventListener('keydown', onKey);
        return () => {
            document.body.style.overflow = '';
            mq.removeEventListener('change', onChange);
            window.removeEventListener('keydown', onKey);
        };
    }, [drawer, mapOpen]);

    const uniq = (get: (d: Doctor) => string[]) => [...new Set(uniqueDoctors.flatMap(get))].filter(Boolean).sort();
    const filterOptions = useMemo(
        () => ({
            specs: uniq((d) => [d.spec]),
            clinics: uniq((d) => [d.clinic]),
            regions: uniq((d) => [d.region]),
            services: uniq((d) => d.services),
            products: uniq((d) => d.products),
            langs: uniq((d) => d.langs),
        }),
        [uniqueDoctors],
    );

    const results = useMemo(() => {
        const r = uniqueDoctors.filter((d) => matches(d, f));
        const by: Record<string, (a: Doctor, b: Doctor) => number> = {
            rating: (a, b) => b.rating - a.rating || b.reviews - a.reviews,
            'price-asc': (a, b) => a.price - b.price,
            'price-desc': (a, b) => b.price - a.price,
            soonest: (a, b) => a.days - b.days,
        };
        return by[sort] ? [...r].sort(by[sort]) : r;
    }, [uniqueDoctors, f, sort]);
    const count = (k: ListKey, v: string) => uniqueDoctors.filter((d) => matches(d, f, k) && pick[k](d).includes(v)).length;

    const mapClinics = useMemo<MapClinic[]>(() => {
        const m = new Map<string, MapClinic>();
        results.forEach((d) => {
            if (d.lat == null || d.lng == null) return;
            const lat = Number(d.lat);
            const lng = Number(d.lng);
            if (Number.isNaN(lat) || Number.isNaN(lng)) return;
            const c = m.get(d.clinic);
            if (c) c.doctors += 1;
            else m.set(d.clinic, { name: d.clinic, region: d.region, lat, lng, doctors: 1, img: d.clinicImg ?? null });
        });
        return [...m.values()];
    }, [results]);

    const chips: { key: string; label: string; clear: () => void }[] = [];
    const qTrim = f.q.trim();
    if (qTrim) chips.push({ key: 'q', label: `"${qTrim}"`, clear: () => set('q', '') });
    (Object.keys(pick) as ListKey[]).forEach((k) =>
        f[k].forEach((v) =>
            chips.push({
                key: `${k}:${v}`,
                label: v,
                clear: () =>
                    set(
                        k,
                        f[k].filter((x) => x !== v),
                    ),
            }),
        ),
    );
    if (f.maxPrice < PRICE_MAX)
        chips.push({ key: 'price', label: `Up to ${f.maxPrice.toLocaleString()} MMK`, clear: () => set('maxPrice', PRICE_MAX) });
    if (f.avail !== 'any')
        chips.push({ key: 'avail', label: f.avail === 'today' ? 'Available today' : 'Next 2 days', clear: () => set('avail', 'any') });
    if (f.minRating) chips.push({ key: 'rating', label: `${f.minRating.toFixed(1)}+ rating`, clear: () => set('minRating', 0) });
    if (f.video) chips.push({ key: 'video', label: 'Video visit', clear: () => set('video', false) });
    const reset = () => {
        setF(initial);
        dropServer(SERVER_KEYS);
    };

    const list = (k: ListKey, title: string, hint?: string) =>
        filterOptions[k as keyof typeof filterOptions]?.length ? (
            <Group title={title}>
                {hint && <p className="-mt-1 mb-2 text-xs text-[#64748B]">{hint}</p>}
                {filterOptions[k as keyof typeof filterOptions].map((v) => (
                    <Check key={v} label={v} count={count(k, v)} checked={f[k].includes(v)} onChange={() => set(k, toggle(f[k], v))} />
                ))}
            </Group>
        ) : null;

    const panel = (
        <div>
            <Group title="Clinic">
                <Select
                    label="Clinic"
                    allLabel="All clinics"
                    value={f.clinics[0] ?? ''}
                    onChange={(v) => set('clinics', v ? [v] : [])}
                    options={filterOptions.clinics.map((v) => ({ v, n: count('clinics', v) }))}
                />
            </Group>
            <Group title="Region">
                <Select
                    label="Region"
                    allLabel="All regions"
                    value={f.regions[0] ?? ''}
                    onChange={(v) => set('regions', v ? [v] : [])}
                    options={filterOptions.regions.map((v) => ({ v, n: count('regions', v) }))}
                />
            </Group>
            <Group title="Doctor gender">
                <ChipGroup items={GENDERS} selected={f.genders} count={(v) => count('genders', v)} onToggle={(v) => set('genders', toggle(f.genders, v))} />
            </Group>
            <Group title="Doctor age">
                <ChipGroup items={AGES} selected={f.ages} count={(v) => count('ages', v)} onToggle={(v) => set('ages', toggle(f.ages, v))} />
            </Group>
            {list('specs', 'Specialty')}
            {list('services', 'Services')}
            {list('products', 'Medical products', 'Sold at the doctor’s clinic')}
            <Group title="Consultation fee">
                <div className="flex items-baseline justify-between text-sm">
                    <span className="text-[#64748B]">Up to</span>
                    <span className="font-semibold">
                        {f.maxPrice >= PRICE_MAX ? `${PRICE_MAX.toLocaleString()} MMK+` : `${f.maxPrice.toLocaleString()} MMK`}
                    </span>
                </div>
                <input
                    type="range"
                    aria-label="Maximum consultation fee"
                    min={PRICE_MIN}
                    max={PRICE_MAX}
                    step={5}
                    value={f.maxPrice}
                    onChange={(e) => set('maxPrice', Number(e.target.value))}
                    className="mt-2 w-full accent-primary"
                />
                <div className="flex justify-between text-xs text-[#94A3B8]">
                    <span>{PRICE_MIN.toLocaleString()} MMK</span>
                    <span>{PRICE_MAX.toLocaleString()} MMK+</span>
                </div>
            </Group>
            <Group title="Availability">
                <Pills
                    value={f.avail}
                    onChange={(v) => set('avail', v)}
                    items={[
                        ['any', 'Any time'],
                        ['today', 'Today'],
                        ['soon', 'Next 2 days'],
                    ]}
                />
            </Group>
            <Group title="Minimum rating">
                <Pills
                    value={f.minRating}
                    onChange={(v) => set('minRating', v)}
                    items={[
                        [0, 'Any'],
                        [4, '4.0+'],
                        [4.5, '4.5+'],
                        [4.8, '4.8+'],
                    ]}
                />
            </Group>
            {list('langs', 'Languages spoken')}
            <Group title="Visit type">
                <label className="flex cursor-pointer items-center justify-between text-sm">
                    <span className="flex items-center gap-2.5">
                        <VideoIcon className="size-4 text-main" />
                        Video visit available
                    </span>
                    <input type="checkbox" checked={f.video} onChange={(e) => set('video', e.target.checked)} className="size-4 accent-primary" />
                </label>
            </Group>
        </div>
    );

    return (
        <main className="min-h-screen bg-[#F7F9FA] text-ink">
            <style dangerouslySetInnerHTML={{ __html: css }} />

            {/* ===== Hero: title + search + specialty quick filters ===== */}
            <section className="bg-gradient-to-b from-white via-[#EAF3F5] to-[#CFE2E8] pt-28 pb-10 sm:pt-32">
                <div className="mx-auto max-w-[1300px] px-4 sm:px-6">
                    <h1 className="max-w-3xl text-4xl leading-[1.05] font-medium tracking-[-0.04em] text-balance sm:text-6xl">
                        Find the <span className="n-serif">right</span> doctor
                    </h1>
                    <p className="mt-4 max-w-xl text-base text-ink/70 sm:text-lg">
                        Filter by clinic, region, services and fee, then book online in a minute.
                    </p>

                    <div className="mt-8 flex max-w-2xl items-center gap-2 rounded-full bg-white p-1.5 pl-5 shadow-[0_12px_30px_rgba(31,58,67,0.12)] focus-within:ring-2 focus-within:ring-main">
                        <SearchIcon className="size-5 shrink-0 text-[#64748B]" aria-hidden />
                        <input
                            type="search"
                            aria-label="Search by doctor name"
                            value={f.q}
                            onChange={(e) => set('q', e.target.value)}
                            placeholder="Search a doctor by name"
                            className="min-w-0 flex-1 bg-transparent py-2.5 text-sm outline-none placeholder:text-[#94A3B8] sm:text-base"
                        />
                        <button
                            onClick={() => setMapOpen(true)}
                            className="hidden shrink-0 items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-white transition hover:bg-main sm:inline-flex"
                        >
                            <MapIcon className="size-4" />
                            View map
                        </button>
                    </div>

                    {filterOptions.specs.length > 0 && (
                        <div className="n-scroll -mx-4 mt-5 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0" role="group" aria-label="Quick specialty filter">
                            {filterOptions.specs.map((s) => {
                                const on = f.specs.includes(s);
                                return (
                                    <button
                                        key={s}
                                        aria-pressed={on}
                                        onClick={() => set('specs', toggle(f.specs, s))}
                                        className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition ${on ? 'bg-primary text-white' : 'bg-white/80 hover:bg-white hover:text-main'}`}
                                    >
                                        {s}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>

            <div className="mx-auto max-w-[1300px] px-4 pt-8 pb-24 sm:px-6">
                <div className="grid gap-8 lg:grid-cols-[300px_1fr] lg:gap-10">
                    {/* Filters: full-height sticky sidebar on desktop */}
                    <aside aria-label="Filters" className="hidden lg:block">
                        <div className="sticky top-20 flex h-[calc(100dvh-6rem)] min-h-[560px] flex-col overflow-hidden rounded-[1.75rem] bg-white shadow-[0_1px_2px_rgba(31,58,67,0.06)]">
                            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                                <h2 className="text-lg font-medium tracking-tight">Filters</h2>
                                {chips.length > 0 && (
                                    <button onClick={reset} className="text-sm font-medium text-main hover:underline">
                                        Clear all
                                    </button>
                                )}
                            </div>
                            <div className="flex-1 overflow-y-auto px-6 py-5">{panel}</div>
                        </div>
                    </aside>

                    {/* Results */}
                    <section aria-label="Doctors">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <p aria-live="polite" className="text-sm font-medium">
                                <span className="text-lg font-semibold">{results.length}</span> {results.length === 1 ? 'doctor' : 'doctors'} found
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setDrawer(true)}
                                    className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-medium shadow-sm lg:hidden"
                                >
                                    <SlidersHorizontalIcon className="size-4" />
                                    Filters
                                    {chips.length > 0 && (
                                        <span className="grid size-5 place-items-center rounded-full bg-main text-[11px] text-white">{chips.length}</span>
                                    )}
                                </button>
                                <button
                                    onClick={() => setMapOpen(true)}
                                    className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-medium shadow-sm transition hover:text-main sm:hidden"
                                >
                                    <MapIcon className="size-4 text-main" />
                                    Map
                                </button>
                                <label className="flex items-center gap-2 text-sm text-[#64748B]">
                                    <span className="sr-only sm:not-sr-only">Sort by</span>
                                    <select
                                        value={sort}
                                        onChange={(e) => setSort(e.target.value)}
                                        className="rounded-full bg-white px-4 py-2.5 text-sm font-medium text-ink shadow-sm outline-none focus:ring-2 focus:ring-main"
                                    >
                                        {sorts.map(([v, l]) => (
                                            <option key={v} value={v}>
                                                {l}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                            </div>
                        </div>

                        {chips.length > 0 && (
                            <ul className="mt-4 flex flex-wrap items-center gap-2">
                                {chips.map((c) => (
                                    <li key={c.key}>
                                        <button
                                            onClick={c.clear}
                                            aria-label={`Remove filter ${c.label}`}
                                            className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-sm font-medium shadow-sm transition hover:bg-[#EAF3F5]"
                                        >
                                            {c.label}
                                            <XIcon className="size-3.5 text-[#64748B]" />
                                        </button>
                                    </li>
                                ))}
                                <li>
                                    <button onClick={reset} className="px-2 text-sm font-medium text-main hover:underline">
                                        Clear all
                                    </button>
                                </li>
                            </ul>
                        )}

                        {results.length > 0 ? (
                            <ul className="relative mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                                <AnimatePresence mode="popLayout" initial={false}>
                                    {results.map((d) => (
                                        <motion.li
                                            key={d.id}
                                            layout={!reduce}
                                            initial={reduce ? false : { opacity: 0, scale: 0.96 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={reduce ? undefined : { opacity: 0, scale: 0.96 }}
                                            transition={{ duration: 0.25 }}
                                        >
                                            <DoctorCard d={d} />
                                        </motion.li>
                                    ))}
                                </AnimatePresence>
                            </ul>
                        ) : (
                            <div className="mt-6 rounded-[1.75rem] bg-white px-6 py-16 text-center">
                                <span className="mx-auto grid size-12 place-items-center rounded-full bg-[#EAF3F5] text-main">
                                    <SearchIcon className="size-5" />
                                </span>
                                <h2 className="mt-4 text-xl font-medium tracking-tight">No doctors match these filters</h2>
                                <p className="mx-auto mt-2 max-w-sm text-sm text-[#64748B]">
                                    Try removing a filter, raising the maximum fee, or searching a different name.
                                </p>
                                <button onClick={reset} className="mt-6 rounded-full bg-primary px-6 py-3 text-sm font-medium text-white transition hover:bg-main">
                                    Clear all filters
                                </button>
                            </div>
                        )}
                    </section>
                </div>
            </div>

            {/* Map modal */}
            <AnimatePresence>
                {mapOpen && (
                    <MapModal
                        key="map"
                        clinics={mapClinics}
                        onClose={() => setMapOpen(false)}
                        onPick={(clinic) => {
                            set('clinics', [clinic]);
                            setMapOpen(false);
                        }}
                    />
                )}
            </AnimatePresence>

            {/* Filters: drawer on mobile (portal keeps it full screen height) */}
            {typeof document !== 'undefined' &&
                createPortal(
                    <AnimatePresence>
                        {drawer && (
                            <>
                                <motion.div
                                    key="bd"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onClick={() => setDrawer(false)}
                                    className="fixed inset-0 z-[10001] h-dvh bg-black/30 backdrop-blur-sm lg:hidden"
                                />
                                <motion.aside
                                    key="dr"
                                    role="dialog"
                                    aria-modal="true"
                                    aria-label="Filters"
                                    initial={{ x: '-100%' }}
                                    animate={{ x: 0 }}
                                    exit={{ x: '-100%' }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 40 }}
                                    className="fixed top-0 left-0 z-[10002] flex h-dvh w-[90%] max-w-sm flex-col bg-white lg:hidden"
                                >
                                    <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                                        <h2 className="text-lg font-medium tracking-tight">Filters</h2>
                                        <div className="flex items-center gap-3">
                                            {chips.length > 0 && (
                                                <button onClick={reset} className="text-sm font-medium text-main">
                                                    Clear all
                                                </button>
                                            )}
                                            <button aria-label="Close filters" onClick={() => setDrawer(false)} className="grid size-9 place-items-center rounded-full border border-slate-200">
                                                <XIcon className="size-4" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex-1 overflow-y-auto px-5 py-5">{panel}</div>
                                    <div className="border-t border-slate-100 p-4">
                                        <button onClick={() => setDrawer(false)} className="w-full rounded-full bg-primary py-3 text-sm font-medium text-white">
                                            Show {results.length} {results.length === 1 ? 'doctor' : 'doctors'}
                                        </button>
                                    </div>
                                </motion.aside>
                            </>
                        )}
                    </AnimatePresence>,
                    document.body,
                )}
        </main>
    );
}
