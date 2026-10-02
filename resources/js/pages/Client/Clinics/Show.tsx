import {
    useEffect,
    useMemo,
    useRef,
    useState,
    type FormEvent,
    type ReactNode,
} from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
    CalendarIcon,
    CheckCircle2Icon,
    ClockIcon,
    DownloadIcon,
    Hospital,
    ImageIcon,
    LanguagesIcon,
    MapPinIcon,
    PrinterIcon,
    StarIcon,
    StethoscopeIcon,
    UserIcon,
    XIcon,
} from 'lucide-react';
import { Link, useForm, usePage } from '@inertiajs/react';

/* ============ ROUTES (adjust to your web.php or use Ziggy route()) ============ */
const routes = {
    reserve: '/reservations', // POST
    review: '/reviews', // POST
    login: '/login',
};

const css = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,400&display=swap');
.n-serif{font-family:'Playfair Display',Georgia,serif;font-style:italic;font-weight:400;letter-spacing:-.02em}
.n-scroll{scrollbar-width:none}.n-scroll::-webkit-scrollbar{display:none}
`;
const card =
    'rounded-[1.5rem] bg-white shadow-[0_1px_2px_rgba(31,58,67,0.06)] sm:rounded-[1.75rem]';

/* ============ TYPES ============ */
type Schedule = {
    id: number;
    day_of_week: string;
    start_time: string;
    end_time: string;
    max_patients: number;
};
type Service = {
    id: number;
    name: string;
    price: number;
    duration_minutes?: number;
};
type Clinic = {
    id: number;
    name: string;
    address: string;
    region?: string;
    products?: string[];
};
type Doctor = {
    id: string;
    first_name: string;
    middle_name?: string | null;
    last_name: string;
    specialization: { name: string };
    photo?: string;
    rating?: number;
    reviews?: number;
    languages?: string[];
    about?: string;
    gender?: string;
    age?: number | null;
};
type Reservation = {
    appointment_code: string;
    token_number: number;
    status: string;
    appointment_date: string; // YYYY-MM-DD
    session_start: string; // HH:mm:ss
    session_end: string;
    doctor_name: string;
    specialization?: string;
    clinic_name: string;
    clinic_address?: string;
    service_name: string;
    amount: number | string;
    patient_name?: string;
    remarks?: string | null;
    created_at?: string;
};
type Review = {
    id: number;
    rating: number;
    comment?: string | null;
    patient_name?: string | null;
    created_at?: string | null;
    patient?: { first_name?: string; last_name?: string } | null;
};
type Props = {
    doctor: Doctor;
    clinic: Clinic;
    schedules: Schedule[];
    services: Service[];
    /** Booked token counts keyed by `${YYYY-MM-DD}|${schedule_id}` */
    sessionCounts?: Record<string, number>;
    reservation?: Reservation | null;
    reviews?: Review[];
};

/* ============ DATE + FORMAT HELPERS ============ */
const DAYS = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
];
const DAY_ORDER = [...DAYS.slice(1), DAYS[0]]; // Monday first
const BOOKING_WINDOW_DAYS = 21;

// Stable references so memo hooks don't re-run when the props are missing
const NO_COUNTS: Record<string, number> = {};
const NO_REVIEWS: Review[] = [];

const scheduleDayName = (value: string | number) => {
    if (/^\d+$/.test(String(value))) return DAYS[Number(value) % 7];
    return (
        DAYS.find((day) => day.toLowerCase() === String(value).toLowerCase()) ??
        String(value)
    );
};
const pad = (n: number) => String(n).padStart(2, '0');
const toISO = (d: Date) =>
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fromISO = (iso: string) => {
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y, m - 1, d);
};
const toMin = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
};
const label12 = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    return `${h % 12 || 12}:${pad(m)} ${h >= 12 ? 'pm' : 'am'}`;
};
const money = (n: number | string) => `${Number(n).toLocaleString()} MMK`;
const longDate = (iso: string) =>
    fromISO(iso).toLocaleDateString('en-US', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });

/** Live state of one session on one date. */
function sessionState(
    s: Schedule,
    iso: string,
    counts: Record<string, number>,
    now: Date,
) {
    const booked = counts[`${iso}|${s.id}`] ?? 0;
    const left = Math.max(s.max_patients - booked, 0);
    const ended =
        toISO(now) === iso &&
        toMin(s.end_time) <= now.getHours() * 60 + now.getMinutes();
    return { booked, left, full: left === 0, ended, open: left > 0 && !ended };
}

/* ============ IMAGES ============ */
const src = (id: string, w = 900) =>
    id.startsWith('/') || id.startsWith('http')
        ? id
        : `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=75`;

function Img({
    id,
    alt,
    className = '',
}: {
    id?: string;
    alt: string;
    className?: string;
}) {
    const [ok, setOk] = useState(Boolean(id));
    useEffect(() => setOk(Boolean(id)), [id]);
    if (!ok || !id)
        return (
            <div
                role="img"
                aria-label={alt}
                className="grid size-full place-items-center bg-[#E3EEF1] text-main/60"
            >
                <ImageIcon className="size-8" />
            </div>
        );
    return (
        <img
            src={src(id)}
            alt={alt}
            onError={() => setOk(false)}
            className={`size-full object-cover ${className}`}
        />
    );
}

/* ============ RECEIPT (client-side file, no extra packages) ============ */
const esc = (v: unknown) =>
    String(v ?? '').replace(
        /[&<>"']/g,
        (c) =>
            ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;',
            })[c]!,
    );

function buildReceiptHtml(r: Reservation) {
    const row = (k: string, v: unknown) =>
        v ? `<tr><th>${esc(k)}</th><td>${esc(v)}</td></tr>` : '';
    return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Receipt ${esc(r.appointment_code)}</title>
<style>
*{box-sizing:border-box}
body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#1F3A43;margin:0;padding:16px;background:#fff}
.box{max-width:560px;margin:0 auto;border:1px solid #e2e8f0;border-radius:20px;padding:20px}
h1{font-size:22px;margin:0 0 4px}.muted{color:#64748B;font-size:14px;margin:0}
.token{margin:24px 0;padding:20px;border-radius:16px;background:#EAF3F5;text-align:center}
.token b{display:block;font-size:44px;line-height:1.1;color:#337983}.token span{font-size:13px;color:#64748B}
table{width:100%;border-collapse:collapse;font-size:14px}th,td{padding:10px 0;border-top:1px solid #e2e8f0;text-align:left;vertical-align:top;overflow-wrap:anywhere}
th{width:38%;padding-right:12px;color:#64748B;font-weight:500}.total td,.total th{font-size:16px;font-weight:700;color:#1F3A43}
.foot{margin-top:24px;font-size:12px;color:#64748B}
@media(min-width:600px){body{padding:32px}.box{padding:32px}}
@media print{body{padding:0}.box{border:0}}
</style></head><body><div class="box">
<h1>Appointment receipt</h1><p class="muted">${esc(r.clinic_name)}</p>
<div class="token"><span>Your token number</span><b>#${esc(r.token_number)}</b><span>Code ${esc(r.appointment_code)}</span></div>
<table>
${row('Patient', r.patient_name)}
${row('Doctor', r.doctor_name)}
${row('Specialty', r.specialization)}
${row('Clinic', r.clinic_name)}
${row('Address', r.clinic_address)}
${row('Date', longDate(r.appointment_date))}
${row('Session', `${label12(r.session_start)} – ${label12(r.session_end)}`)}
${row('Service', r.service_name)}
${row('Visit type', 'In clinic')}
${row('Status', r.status)}
${row('Notes', r.remarks)}
<tr class="total"><th>Amount</th><td>${esc(money(r.amount))}</td></tr>
</table>
<p class="foot">Show this token at the clinic reception. Please arrive during your session hours.${r.created_at ? ` Booked on ${esc(r.created_at)}.` : ''}</p>
</div></body></html>`;
}

function downloadReceipt(r: Reservation) {
    const blob = new Blob([buildReceiptHtml(r)], {
        type: 'text/html;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${r.appointment_code}.html`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Opens the print dialog so the user can "Save as PDF". */
function printReceipt(r: Reservation) {
    const frame = document.createElement('iframe');
    frame.setAttribute('aria-hidden', 'true');
    frame.style.cssText =
        'position:fixed;right:0;bottom:0;width:0;height:0;border:0';
    frame.srcdoc = buildReceiptHtml(r);
    frame.onload = () => {
        frame.contentWindow?.focus();
        frame.contentWindow?.print();
        setTimeout(() => frame.remove(), 60000);
    };
    document.body.appendChild(frame);
}

/* ============ SMALL UI PIECES ============ */
function Card({
    title,
    icon,
    children,
}: {
    title: string;
    icon?: ReactNode;
    children: ReactNode;
}) {
    const id = `c-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
    return (
        <section aria-labelledby={id} className={`${card} p-5 sm:p-7`}>
            <h2
                id={id}
                className="mb-5 flex items-center gap-2.5 text-lg font-medium tracking-tight sm:text-xl"
            >
                {icon && (
                    <span className="grid size-8 place-items-center rounded-full bg-[#EAF3F5] text-main">
                        {icon}
                    </span>
                )}
                {title}
            </h2>
            {children}
        </section>
    );
}

function Step({
    n,
    title,
    children,
}: {
    n: number;
    title: string;
    children: ReactNode;
}) {
    return (
        <div className="border-t border-slate-100 py-4 first:border-0 first:pt-0 sm:py-5">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                <span className="grid size-5 shrink-0 place-items-center rounded-full bg-primary text-[11px] text-white">
                    {n}
                </span>
                {title}
            </h3>
            {children}
        </div>
    );
}

function FieldError({
    message,
    className = 'mt-2',
}: {
    message?: string;
    className?: string;
}) {
    if (!message) return null;
    return (
        <p role="alert" className={`${className} text-sm text-red-600`}>
            {message}
        </p>
    );
}

function ReservationModal({
    r,
    onClose,
}: {
    r: Reservation;
    onClose: () => void;
}) {
    const reduce = useReducedMotion();

    useEffect(() => {
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
        window.addEventListener('keydown', onKey);
        return () => {
            document.body.style.overflow = prev;
            window.removeEventListener('keydown', onKey);
        };
    }, [onClose]);

    const rows: [string, string | undefined][] = [
        ['Patient', r.patient_name],
        ['Doctor', r.doctor_name],
        ['Clinic', r.clinic_name],
        ['Date', longDate(r.appointment_date)],
        ['Session', `${label12(r.session_start)} – ${label12(r.session_end)}`],
        ['Service', r.service_name],
        ['Visit type', 'In clinic'],
        ['Status', r.status],
    ];

    return (
        <div className="fixed inset-0 z-[10002] flex h-dvh items-end justify-center sm:items-center sm:p-4">
            <motion.div
                initial={reduce ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
                role="dialog"
                aria-modal="true"
                aria-labelledby="booking-title"
                initial={reduce ? false : { opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="relative max-h-[92dvh] w-full max-w-md overflow-y-auto overscroll-contain rounded-t-[1.75rem] bg-white p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] text-ink shadow-xl sm:rounded-[1.75rem] sm:p-6"
            >
                <button
                    type="button"
                    aria-label="Close"
                    onClick={onClose}
                    className="absolute top-3 right-3 grid size-10 place-items-center rounded-full border border-slate-200 hover:border-main sm:top-4 sm:right-4 sm:size-9"
                >
                    <XIcon className="size-4" />
                </button>

                <div className="flex items-center gap-3 pr-12">
                    <span className="grid size-10 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-700">
                        <CheckCircle2Icon className="size-5" />
                    </span>
                    <div className="min-w-0">
                        <h2
                            id="booking-title"
                            className="text-lg font-medium tracking-tight sm:text-xl"
                        >
                            Booking confirmed
                        </h2>
                        <p className="truncate text-sm text-[#64748B]">
                            Code {r.appointment_code}
                        </p>
                    </div>
                </div>

                <div className="mt-5 rounded-2xl bg-gradient-to-b from-white to-[#E6F0F3] py-4 text-center ring-1 ring-slate-100 sm:py-5">
                    <p className="text-sm text-[#64748B]">Your token number</p>
                    <p className="text-5xl leading-tight font-semibold tracking-tight text-main">
                        #{r.token_number}
                    </p>
                    <p className="mt-1 text-xs text-[#64748B]">
                        Show this at the clinic reception
                    </p>
                </div>

                <dl className="mt-5 divide-y divide-slate-100 text-sm">
                    {rows
                        .filter(([, v]) => v)
                        .map(([k, v]) => (
                            <div
                                key={k}
                                className="flex justify-between gap-4 py-2.5 first:pt-0"
                            >
                                <dt className="shrink-0 text-[#64748B]">{k}</dt>
                                <dd className="min-w-0 text-right font-medium break-words">
                                    {v}
                                </dd>
                            </div>
                        ))}
                    <div className="flex items-baseline justify-between gap-4 py-2.5 last:pb-0">
                        <dt className="text-[#64748B]">Amount</dt>
                        <dd className="text-lg font-semibold">
                            {money(r.amount)}
                        </dd>
                    </div>
                </dl>

                <div className="mt-5 grid gap-2 sm:grid-cols-2">
                    <button
                        type="button"
                        onClick={() => downloadReceipt(r)}
                        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-medium text-white transition hover:bg-main"
                    >
                        <DownloadIcon className="size-4" />
                        Download receipt
                    </button>
                    <button
                        type="button"
                        onClick={() => printReceipt(r)}
                        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-slate-300 bg-white py-3 text-sm font-medium transition hover:border-main"
                    >
                        <PrinterIcon className="size-4" />
                        Print or save PDF
                    </button>
                </div>
                <button
                    type="button"
                    autoFocus
                    onClick={onClose}
                    className="mt-2 min-h-12 w-full rounded-full py-3 text-sm font-medium text-[#64748B] transition hover:text-ink"
                >
                    Done
                </button>
            </motion.div>
        </div>
    );
}

/* ============ PAGE ============ */
export default function DoctorDetailPage({
    doctor,
    clinic,
    schedules,
    services,
    sessionCounts = NO_COUNTS,
    reservation,
    reviews = NO_REVIEWS,
}: Props) {
    const { auth } = usePage<{ auth: { user: { id: string } | null } }>().props;
    const reduce = useReducedMotion();
    const fullName = `Dr. ${doctor.first_name} ${doctor.middle_name ? doctor.middle_name + ' ' : ''}${doctor.last_name}`;

    const form = useForm({
        doctor_id: doctor.id,
        clinic_id: clinic.id,
        service_id: services[0]?.id ?? 0,
        schedule_id: 0,
        appointment_type: 'in_clinic', // video visits are not offered
        appointment_date: '',
        remarks: '',
    });
    const { data, setData, errors, processing } = form;
    const reviewForm = useForm({
        clinic_id: clinic.id,
        doctor_id: doctor.id,
        rating: 5,
        comment: '',
    });

    const [modalOpen, setModalOpen] = useState(Boolean(reservation));
    useEffect(() => {
        if (reservation) setModalOpen(true);
    }, [reservation]);

    const service = services.find((s) => s.id === data.service_id);

    /* Mobile: floating "Book" bar that scrolls to the form, hidden while the form is on screen */
    const bookingRef = useRef<HTMLElement>(null);
    const [formInView, setFormInView] = useState(false);
    useEffect(() => {
        const el = bookingRef.current;
        if (!el || typeof IntersectionObserver === 'undefined') return;
        const io = new IntersectionObserver(
            ([e]) => setFormInView(e.isIntersecting),
            { threshold: 0.1 },
        );
        io.observe(el);
        return () => io.disconnect();
    }, []);
    const scrollToBooking = () =>
        bookingRef.current?.scrollIntoView({
            behavior: reduce ? 'auto' : 'smooth',
            block: 'start',
        });

    // Days in the booking window that have at least one session; flag days with no open session
    const days = useMemo(() => {
        const out: { iso: string; date: Date; full: boolean }[] = [];
        const now = new Date();
        for (let i = 0; i < BOOKING_WINDOW_DAYS; i++) {
            const date = new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate() + i,
            );
            const iso = toISO(date);
            const day = schedules.filter(
                (s) => scheduleDayName(s.day_of_week) === DAYS[date.getDay()],
            );
            if (!day.length) continue;
            const states = day.map((s) =>
                sessionState(s, iso, sessionCounts, now),
            );
            if (states.every((s) => s.ended)) continue; // today, all sessions over
            out.push({ iso, date, full: !states.some((s) => s.open) });
        }
        return out;
    }, [schedules, sessionCounts]);

    // Sessions on the selected date, with live token counts
    const sessions = useMemo(() => {
        if (!data.appointment_date) return [];
        const now = new Date();
        const dow = DAYS[fromISO(data.appointment_date).getDay()];
        return schedules
            .filter((s) => scheduleDayName(s.day_of_week) === dow)
            .sort((a, b) => toMin(a.start_time) - toMin(b.start_time))
            .map((s) => ({
                ...s,
                ...sessionState(s, data.appointment_date, sessionCounts, now),
            }));
    }, [data.appointment_date, schedules, sessionCounts]);

    // Default to the first day that still has room
    useEffect(() => {
        if (!data.appointment_date && days.length)
            setData(
                'appointment_date',
                (days.find((d) => !d.full) ?? days[0]).iso,
            );
    }, [days]); // eslint-disable-line react-hooks/exhaustive-deps

    // Clear the chosen session when the date changes, or if it filled up after a refresh
    useEffect(() => {
        setData('schedule_id', 0);
    }, [data.appointment_date]); // eslint-disable-line react-hooks/exhaustive-deps
    useEffect(() => {
        if (
            data.schedule_id &&
            !sessions.find((s) => s.id === data.schedule_id)?.open
        )
            setData('schedule_id', 0);
    }, [sessions]); // eslint-disable-line react-hooks/exhaustive-deps

    // Auto-pick the first open session
    useEffect(() => {
        if (!data.schedule_id) {
            const first = sessions.find((s) => s.open);
            if (first) setData('schedule_id', first.id);
        }
    }, [sessions, data.schedule_id]); // eslint-disable-line react-hooks/exhaustive-deps

    const picked = sessions.find((s) => s.id === data.schedule_id && s.open);
    const ready = Boolean(service && data.appointment_date && picked);

    const submit = (e: FormEvent) => {
        e.preventDefault();
        if (!ready) return;
        form.post(routes.reserve, {
            preserveScroll: true,
            onSuccess: () =>
                setData((p) => ({ ...p, schedule_id: 0, remarks: '' })),
        });
    };

    const weekly = DAY_ORDER.map((day) => ({
        day,
        rows: schedules
            .filter((s) => scheduleDayName(s.day_of_week) === day)
            .sort((a, b) => toMin(a.start_time) - toMin(b.start_time)),
    }));
    const reviewer = (r: Review) =>
        r.patient_name ||
        [r.patient?.first_name, r.patient?.last_name]
            .filter(Boolean)
            .join(' ') ||
        'Patient';
    const reviewError = Object.values(reviewForm.errors)[0];

    return (
        <main className="min-h-screen overflow-x-clip bg-[#F7F9FA] text-ink">
            <style dangerouslySetInnerHTML={{ __html: css }} />

            {/* ===== Profile hero ===== */}
            <section className="bg-gradient-to-b from-white via-[#EAF3F5] to-[#CFE2E8] pt-24 pb-24 sm:pt-28 sm:pb-28">
                <div className="mx-auto max-w-[1280px] px-3 sm:px-6">
                    <Link
                        href="/doctors"
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-ink/70 transition hover:text-main"
                    >
                        ← All doctors
                    </Link>
                    <div className="mt-5 grid items-center gap-6 sm:grid-cols-[240px_1fr] sm:gap-10 lg:grid-cols-[280px_1fr]">
                        <div className="mx-auto aspect-[4/5] w-full max-w-[280px] overflow-hidden rounded-[2rem] bg-white shadow-[0_24px_60px_rgba(31,58,67,0.18)] sm:mx-0 sm:rounded-t-[8rem]">
                            <Img
                                id={doctor.photo}
                                alt={`Portrait of ${fullName}`}
                                className="object-top"
                            />
                        </div>
                        <div className="min-w-0 text-center sm:text-left">
                            <p className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-1.5 text-sm font-medium backdrop-blur">
                                <StethoscopeIcon className="size-4 text-main" />
                                {doctor.specialization.name}
                            </p>
                            <h1 className="mt-4 text-4xl leading-[1.05] font-medium tracking-[-0.04em] text-balance break-words sm:text-5xl lg:text-6xl">
                                <span className="n-serif">Dr.</span>{' '}
                                {fullName.replace(/^Dr\.\s*/, '')}
                            </h1>
                            <ul className="mt-6 flex flex-wrap justify-center gap-2.5 text-sm sm:justify-start">
                                {doctor.rating != null && (
                                    <li className="flex items-center gap-1.5 rounded-full bg-white px-4 py-2 shadow-sm">
                                        <StarIcon className="size-4 fill-amber-400 text-amber-400" />
                                        <span className="font-semibold">
                                            {doctor.rating.toFixed(1)}
                                        </span>
                                        <span className="text-[#64748B]">
                                            ({doctor.reviews ?? 0} reviews)
                                        </span>
                                    </li>
                                )}
                                {doctor.gender && (
                                    <li className="flex items-center gap-1.5 rounded-full bg-white px-4 py-2 shadow-sm">
                                        <UserIcon className="size-4 shrink-0 text-main" />
                                        <span className="font-medium capitalize">
                                            {doctor.gender}
                                        </span>
                                    </li>
                                )}
                                {doctor.age != null && (
                                    <li className="flex items-center gap-1.5 rounded-full bg-white px-4 py-2 shadow-sm">
                                        <CalendarIcon className="size-4 shrink-0 text-main" />
                                        <span className="font-medium">
                                            {doctor.age} years old
                                        </span>
                                    </li>
                                )}
                                <li className="flex items-center gap-1.5 rounded-full bg-white px-4 py-2 shadow-sm">
                                    <Hospital className="size-4 shrink-0 text-main" />
                                    <span className="font-medium">
                                        {clinic.name}
                                    </span>
                                </li>
                                {doctor.languages &&
                                    doctor.languages.length > 0 && (
                                        <li className="flex items-center gap-1.5 rounded-full bg-white px-4 py-2 shadow-sm">
                                            <LanguagesIcon className="size-4 shrink-0 text-main" />
                                            {doctor.languages.join(', ')}
                                        </li>
                                    )}
                            </ul>
                            <div className="mt-3 flex items-center justify-center gap-2 sm:justify-start">
                                <MapPinIcon className="size-4 shrink-0 text-main" />
                                <p className="text-sm text-ink/65">
                                    {clinic.address}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <div className="mx-auto -mt-14 max-w-[1280px] px-3 pb-28 sm:-mt-16 sm:px-6 sm:pb-24">
                <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_410px] lg:gap-6">
                    {/* ===== LEFT: doctor information ===== */}
                    <div className="min-w-0 space-y-4">
                        {doctor.about && (
                            <Card title="About">
                                <p className="max-w-prose leading-relaxed text-[#3B3F4A]">
                                    {doctor.about}
                                </p>
                            </Card>
                        )}

                        <Card
                            title="Services and fees"
                            icon={<StethoscopeIcon className="size-4" />}
                        >
                            <ul className="divide-y divide-slate-100">
                                {services.map((s) => (
                                    <li
                                        key={s.id}
                                        className="flex items-center justify-between gap-4 py-3 text-sm first:pt-0 last:pb-0"
                                    >
                                        <span className="min-w-0">
                                            <span className="font-medium">
                                                {s.name}
                                            </span>
                                            {s.duration_minutes && (
                                                <span className="ml-2 whitespace-nowrap text-[#64748B]">
                                                    {s.duration_minutes} min
                                                </span>
                                            )}
                                        </span>
                                        <span className="shrink-0 font-semibold">
                                            {money(s.price)}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </Card>

                        <Card
                            title="Weekly sessions"
                            icon={<ClockIcon className="size-4" />}
                        >
                            <dl className="divide-y divide-slate-100 text-sm">
                                {weekly.map(({ day, rows }) => (
                                    <div
                                        key={day}
                                        className="flex justify-between gap-4 py-2.5 first:pt-0 last:pb-0"
                                    >
                                        <dt className="shrink-0 font-medium">
                                            {day}
                                        </dt>
                                        <dd
                                            className={
                                                rows.length
                                                    ? 'min-w-0 text-right text-[#3B3F4A]'
                                                    : 'text-[#94A3B8]'
                                            }
                                        >
                                            {rows.length
                                                ? rows.map((r) => (
                                                      <div key={r.id}>
                                                          {label12(
                                                              r.start_time,
                                                          )}{' '}
                                                          –{' '}
                                                          {label12(r.end_time)}
                                                          <span className="block text-xs text-[#64748B] sm:ml-2 sm:inline sm:text-sm">
                                                              up to{' '}
                                                              {r.max_patients}{' '}
                                                              patients
                                                          </span>
                                                      </div>
                                                  ))
                                                : 'Not available'}
                                        </dd>
                                    </div>
                                ))}
                            </dl>
                        </Card>

                        {clinic.products && clinic.products.length > 0 && (
                            <Card title="Sold at this clinic">
                                <ul className="flex flex-wrap gap-2">
                                    {clinic.products.map((p) => (
                                        <li
                                            key={p}
                                            className="rounded-full bg-[#EAF3F5] px-3.5 py-1.5 text-sm font-medium text-ink"
                                        >
                                            {p}
                                        </li>
                                    ))}
                                </ul>
                            </Card>
                        )}

                        <Card
                            title="Patient reviews"
                            icon={<StarIcon className="size-4" />}
                        >
                            <div className="mb-5 rounded-2xl bg-[#F2F7F8] p-4">
                                {auth.user ? (
                                    <form
                                        onSubmit={(e) => {
                                            e.preventDefault();
                                            reviewForm.post(routes.review, {
                                                preserveScroll: true,
                                                onSuccess: () =>
                                                    reviewForm.reset('comment'),
                                            });
                                        }}
                                        className="space-y-3"
                                    >
                                        <p className="text-sm font-semibold">
                                            Share your experience
                                        </p>
                                        <div
                                            className="flex items-center gap-1"
                                            role="radiogroup"
                                            aria-label="Rating"
                                        >
                                            {[1, 2, 3, 4, 5].map((n) => (
                                                <button
                                                    key={n}
                                                    type="button"
                                                    role="radio"
                                                    aria-checked={
                                                        reviewForm.data
                                                            .rating === n
                                                    }
                                                    aria-label={`${n} star${n === 1 ? '' : 's'}`}
                                                    onClick={() =>
                                                        reviewForm.setData(
                                                            'rating',
                                                            n,
                                                        )
                                                    }
                                                    className="rounded p-0.5"
                                                >
                                                    <StarIcon
                                                        className={`size-6 ${n <= reviewForm.data.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                        <textarea
                                            value={reviewForm.data.comment}
                                            onChange={(e) =>
                                                reviewForm.setData(
                                                    'comment',
                                                    e.target.value,
                                                )
                                            }
                                            rows={3}
                                            maxLength={2000}
                                            aria-label="Your review"
                                            placeholder="Tell other patients about your visit"
                                            className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base outline-none placeholder:text-[#94A3B8] focus:border-main sm:text-sm"
                                        />
                                        {reviewError && (
                                            <p
                                                role="alert"
                                                className="text-xs text-rose-600"
                                            >
                                                {reviewError}
                                            </p>
                                        )}
                                        <button
                                            type="submit"
                                            disabled={reviewForm.processing}
                                            className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-white transition hover:bg-main disabled:opacity-50"
                                        >
                                            {reviewForm.processing
                                                ? 'Sending…'
                                                : 'Send review'}
                                        </button>
                                    </form>
                                ) : (
                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                        <div>
                                            <p className="text-sm font-semibold">
                                                Want to share your experience?
                                            </p>
                                            <p className="mt-1 text-xs text-[#64748B]">
                                                Sign in as a patient to write a
                                                review.
                                            </p>
                                        </div>
                                        <Link
                                            href={routes.login}
                                            className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-white transition hover:bg-main"
                                        >
                                            Sign in
                                        </Link>
                                    </div>
                                )}
                            </div>

                            {reviews.length === 0 ? (
                                <p className="text-sm text-[#64748B]">
                                    No reviews yet. Be the first patient to
                                    share your experience after a visit.
                                </p>
                            ) : (
                                <ul className="space-y-3">
                                    {reviews.map((review) => (
                                        <li
                                            key={review.id}
                                            className="rounded-2xl border border-slate-100 p-4"
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="grid size-10 shrink-0 place-items-center rounded-full bg-[#EAF3F5] text-sm font-semibold text-main">
                                                    {reviewer(review)
                                                        .charAt(0)
                                                        .toUpperCase()}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                                        <p className="text-sm font-semibold">
                                                            {reviewer(review)}
                                                        </p>
                                                        {review.created_at && (
                                                            <p className="text-xs text-[#94A3B8]">
                                                                {
                                                                    review.created_at
                                                                }
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div
                                                        className="mt-1 flex items-center gap-0.5"
                                                        aria-label={`${review.rating} out of 5 stars`}
                                                    >
                                                        {[1, 2, 3, 4, 5].map(
                                                            (star) => (
                                                                <StarIcon
                                                                    key={star}
                                                                    className={`size-3.5 ${star <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`}
                                                                />
                                                            ),
                                                        )}
                                                        <span className="ml-1 text-xs font-semibold text-[#64748B]">
                                                            {review.rating}.0
                                                        </span>
                                                    </div>
                                                    {review.comment && (
                                                        <p className="mt-3 text-sm leading-6 text-[#3B3F4A]">
                                                            {review.comment}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </Card>
                    </div>

                    {/* ===== RIGHT: reservation ===== */}
                    <aside
                        ref={bookingRef}
                        id="booking"
                        aria-label="Book an appointment"
                        className="min-w-0 scroll-mt-20 lg:sticky lg:top-24"
                    >
                        <form
                            onSubmit={submit}
                            className={`${card} overflow-hidden`}
                        >
                            <div className="bg-primary px-5 py-5 text-white sm:px-6">
                                <h2 className="text-xl font-medium tracking-tight">
                                    Book an{' '}
                                    <span className="n-serif">appointment</span>
                                </h2>
                                <p className="mt-1 text-sm text-white/70">
                                    In-clinic visit. You'll get a token number
                                    for your session.
                                </p>
                            </div>

                            <div className="p-4 sm:p-6">
                                <Step n={1} title="Choose a service">
                                    <div className="space-y-2">
                                        {services.map((s) => (
                                            <label
                                                key={s.id}
                                                className={`flex min-h-12 cursor-pointer items-center justify-between gap-3 rounded-2xl border px-3.5 py-3 text-sm transition sm:px-4 ${data.service_id === s.id ? 'border-main bg-[#EAF3F5]' : 'border-slate-200 hover:border-main'}`}
                                            >
                                                <span className="flex min-w-0 items-center gap-2.5">
                                                    <input
                                                        type="radio"
                                                        name="service"
                                                        checked={
                                                            data.service_id ===
                                                            s.id
                                                        }
                                                        onChange={() =>
                                                            setData(
                                                                'service_id',
                                                                s.id,
                                                            )
                                                        }
                                                        className="size-4 shrink-0 accent-main"
                                                    />
                                                    <span className="min-w-0">
                                                        {s.name}
                                                    </span>
                                                </span>
                                                <span className="shrink-0 font-semibold">
                                                    {money(s.price)}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                    <FieldError message={errors.service_id} />
                                </Step>

                                <Step n={2} title="Pick a date">
                                    {days.length === 0 ? (
                                        <p className="text-sm text-[#64748B]">
                                            No dates open in the next{' '}
                                            {BOOKING_WINDOW_DAYS} days.
                                        </p>
                                    ) : (
                                        <div
                                            role="radiogroup"
                                            aria-label="Appointment date"
                                            className="n-scroll -mx-4 flex snap-x snap-proximity gap-2 overflow-x-auto overscroll-x-contain px-4 pb-2 sm:-mx-1 sm:px-1"
                                        >
                                            {days.map(({ iso, date, full }) => {
                                                const active =
                                                    data.appointment_date ===
                                                    iso;
                                                const sub = active
                                                    ? 'text-white/70'
                                                    : 'text-[#64748B]';
                                                return (
                                                    <button
                                                        key={iso}
                                                        type="button"
                                                        role="radio"
                                                        aria-checked={active}
                                                        onClick={() =>
                                                            setData(
                                                                'appointment_date',
                                                                iso,
                                                            )
                                                        }
                                                        className={`w-16 shrink-0 snap-start rounded-2xl border py-2.5 text-center transition ${active ? 'border-primary bg-primary text-white' : full ? 'border-slate-200 bg-slate-50 text-[#94A3B8] hover:border-slate-300' : 'border-slate-200 bg-white hover:border-main'}`}
                                                    >
                                                        <span
                                                            className={`block text-xs ${sub}`}
                                                        >
                                                            {date.toLocaleDateString(
                                                                'en-US',
                                                                {
                                                                    weekday:
                                                                        'short',
                                                                },
                                                            )}
                                                        </span>
                                                        <span className="block text-lg leading-tight font-semibold">
                                                            {date.getDate()}
                                                        </span>
                                                        <span
                                                            className={`block text-xs ${sub}`}
                                                        >
                                                            {full
                                                                ? 'Full'
                                                                : date.toLocaleDateString(
                                                                      'en-US',
                                                                      {
                                                                          month: 'short',
                                                                      },
                                                                  )}
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                    <FieldError
                                        message={errors.appointment_date}
                                    />
                                </Step>

                                <Step n={3} title="Choose a session">
                                    {sessions.length === 0 ? (
                                        <p className="text-sm text-[#64748B]">
                                            Pick a date to see sessions.
                                        </p>
                                    ) : (
                                        <div
                                            role="radiogroup"
                                            aria-label="Session"
                                            className="space-y-2"
                                        >
                                            {sessions.map((s) => {
                                                const active =
                                                    data.schedule_id === s.id;
                                                const pct = s.max_patients
                                                    ? Math.min(
                                                          100,
                                                          Math.round(
                                                              (s.booked /
                                                                  s.max_patients) *
                                                                  100,
                                                          ),
                                                      )
                                                    : 100;
                                                return (
                                                    <button
                                                        key={s.id}
                                                        type="button"
                                                        role="radio"
                                                        aria-checked={active}
                                                        disabled={!s.open}
                                                        onClick={() =>
                                                            setData(
                                                                'schedule_id',
                                                                s.id,
                                                            )
                                                        }
                                                        className={`w-full rounded-2xl border px-3.5 py-3 text-left text-sm transition sm:px-4 ${active ? 'border-main bg-[#EAF3F5]' : s.open ? 'border-slate-200 hover:border-main' : 'cursor-not-allowed border-slate-200 bg-slate-50 text-[#94A3B8]'}`}
                                                    >
                                                        <span className="flex items-center justify-between gap-3">
                                                            <span className="font-medium">
                                                                {label12(
                                                                    s.start_time,
                                                                )}{' '}
                                                                –{' '}
                                                                {label12(
                                                                    s.end_time,
                                                                )}
                                                            </span>
                                                            <span
                                                                className={`shrink-0 text-xs font-medium ${s.open ? 'text-emerald-700' : 'text-[#94A3B8]'}`}
                                                            >
                                                                {s.ended
                                                                    ? 'Ended'
                                                                    : s.full
                                                                      ? 'Full'
                                                                      : `${s.left} left`}
                                                            </span>
                                                        </span>
                                                        <span
                                                            aria-hidden
                                                            className="mt-2 block h-1.5 overflow-hidden rounded-full bg-slate-200"
                                                        >
                                                            <span
                                                                className={`block h-full rounded-full ${s.open ? 'bg-main' : 'bg-slate-400'}`}
                                                                style={{
                                                                    width: `${pct}%`,
                                                                }}
                                                            />
                                                        </span>
                                                        <span className="mt-1.5 block text-xs text-[#64748B]">
                                                            {s.booked} of{' '}
                                                            {s.max_patients}{' '}
                                                            tokens taken.{' '}
                                                            {s.open
                                                                ? `Next token is #${s.booked + 1}.`
                                                                : s.full &&
                                                                    !s.ended
                                                                  ? 'Choose another session or date.'
                                                                  : ''}
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                    <FieldError message={errors.schedule_id} />
                                </Step>

                                <Step
                                    n={4}
                                    title="Notes for the doctor (optional)"
                                >
                                    <textarea
                                        aria-label="Remarks"
                                        rows={3}
                                        maxLength={500}
                                        value={data.remarks}
                                        onChange={(e) =>
                                            setData('remarks', e.target.value)
                                        }
                                        placeholder="Symptoms, questions, or anything the doctor should know"
                                        className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base outline-none placeholder:text-[#94A3B8] focus:border-main sm:text-sm"
                                    />
                                    <FieldError
                                        message={errors.remarks}
                                        className="mt-1"
                                    />
                                </Step>

                                {/* Summary */}
                                <div className="mt-1 rounded-2xl bg-gradient-to-b from-white to-[#E6F0F3] p-4 text-sm ring-1 ring-slate-100">
                                    <div className="flex items-start gap-2 font-medium">
                                        <CalendarIcon className="mt-0.5 size-4 shrink-0 text-main" />
                                        <span className="min-w-0">
                                            {ready && picked
                                                ? `${longDate(data.appointment_date)}, ${label12(picked.start_time)} – ${label12(picked.end_time)}`
                                                : 'Select a date and session'}
                                        </span>
                                    </div>
                                    {ready && picked && (
                                        <p className="mt-1.5 pl-6 text-xs text-[#64748B]">
                                            Estimated token #{picked.booked + 1}
                                            . The final number is assigned when
                                            you confirm.
                                        </p>
                                    )}
                                    <div className="mt-3 flex items-baseline justify-between gap-3 border-t border-slate-200/70 pt-3">
                                        <span className="min-w-0 text-[#64748B]">
                                            {service?.name ?? 'Service'}
                                        </span>
                                        <span className="shrink-0 text-lg font-semibold">
                                            {service
                                                ? money(service.price)
                                                : '—'}
                                        </span>
                                    </div>
                                </div>

                                <FieldError
                                    message={errors.doctor_id}
                                    className="mt-3"
                                />

                                {!auth.user ? (
                                    <Link
                                        href={routes.login}
                                        className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-sm font-medium text-white transition hover:bg-main"
                                    >
                                        <CheckCircle2Icon className="size-4" />
                                        Sign in to book
                                    </Link>
                                ) : (
                                    <button
                                        type="submit"
                                        disabled={!ready || processing}
                                        className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-sm font-medium text-white transition hover:bg-main disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-primary"
                                    >
                                        <CheckCircle2Icon className="size-4" />
                                        {processing
                                            ? 'Booking…'
                                            : 'Confirm booking'}
                                    </button>
                                )}
                            </div>
                        </form>
                    </aside>
                </div>
            </div>

            {/* Mobile floating book bar (hidden on desktop, and while the form is visible) */}
            {!formInView && !modalOpen && (
                <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur lg:hidden">
                    <div className="mx-auto flex max-w-[1280px] items-center gap-3">
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-xs text-[#64748B]">
                                {service?.name ?? 'Appointment'}
                            </p>
                            <p className="text-base font-semibold">
                                {service ? money(service.price) : '—'}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={scrollToBooking}
                            className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-medium text-white transition hover:bg-main"
                        >
                            <CalendarIcon className="size-4" />
                            Book now
                        </button>
                    </div>
                </div>
            )}

            {modalOpen && reservation && (
                <ReservationModal
                    r={reservation}
                    onClose={() => setModalOpen(false)}
                />
            )}
        </main>
    );
}
