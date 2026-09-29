import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
    CalendarIcon,
    CheckCircle2Icon,
    ClockIcon,
    DownloadIcon,
    ImageIcon,
    LanguagesIcon,
    MapPinIcon,
    PrinterIcon,
    StarIcon,
    StethoscopeIcon,
    XIcon,
} from 'lucide-react';
import { useForm } from '@inertiajs/react';

/* ============ ROUTES (adjust to your web.php or use Ziggy route()) ============ */
const routes = {
    reserve: '/reservations', // POST
};

/* ============ TYPES (match your models / controller props) ============ */
type Schedule = {
    id: number;
    day_of_week: string;
    start_time: string;
    end_time: string;
    /** Max patients (tokens) for this session. New column on doctor_clinic_schedules. */
    max_patients: number;
}; // doctor_clinic_schedules
type Service = {
    id: number;
    name: string;
    price: number;
    duration_minutes?: number;
}; // clinic_services
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
};
/** Sent back by the controller after a successful booking (flash / prop). */
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
type Props = {
    doctor: Doctor;
    clinic: Clinic;
    schedules: Schedule[];
    services: Service[];
    /**
     * Booked patient count per session and date, keyed "YYYY-MM-DD|scheduleId".
     * Build in the controller: reservations grouped by appointment_date + schedule_id.
     */
    sessionCounts?: Record<string, number>;
    /** Set only on the response right after a booking succeeds. */
    reservation?: Reservation | null;
};

/* ============ HELPERS ============ */
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
                className="grid size-full place-items-center bg-[#F0E6EE] text-[#B0357F]/60"
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

const DAYS = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
];
const DAY_ORDER = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
];

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
const money = (n: number | string) =>
    `$${Number(n).toFixed(Number.isInteger(Number(n)) ? 0 : 2)}`;
const longDate = (iso: string) =>
    fromISO(iso).toLocaleDateString('en-US', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });

const BOOKING_WINDOW_DAYS = 21;

/** Live state of one session on one date: how many tokens are taken, left, and whether it can be booked. */
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

/* ============ SAMPLE DATA (used only when props are missing, for previewing) ============ */
const sampleSchedules: Schedule[] = [
    {
        id: 1,
        day_of_week: 'Monday',
        start_time: '09:00:00',
        end_time: '12:00:00',
        max_patients: 20,
    },
    {
        id: 2,
        day_of_week: 'Monday',
        start_time: '14:00:00',
        end_time: '17:00:00',
        max_patients: 15,
    },
    {
        id: 3,
        day_of_week: 'Wednesday',
        start_time: '09:00:00',
        end_time: '13:00:00',
        max_patients: 20,
    },
    {
        id: 4,
        day_of_week: 'Friday',
        start_time: '10:00:00',
        end_time: '16:00:00',
        max_patients: 25,
    },
    {
        id: 5,
        day_of_week: 'Saturday',
        start_time: '09:00:00',
        end_time: '12:00:00',
        max_patients: 12,
    },
];
function makeSampleCounts(schedules: Schedule[]) {
    const out: Record<string, number> = {};
    const t = new Date();
    for (let i = 0; i < BOOKING_WINDOW_DAYS; i++) {
        const d = new Date(t.getFullYear(), t.getMonth(), t.getDate() + i);
        schedules
            .filter((s) => s.day_of_week === DAYS[d.getDay()])
            .forEach(
                (s) =>
                    (out[`${toISO(d)}|${s.id}`] =
                        (i * 7 + s.id * 5) % (s.max_patients + 1)),
            );
    }
    return out;
}
const sample: Props = {
    doctor: {
        id: 'dr-aisha-rahman',
        first_name: 'Aisha',
        last_name: 'Rahman',
        specialization: { name: 'Family medicine' },
        photo: 'photo-1559839734-2b71ea197ec2',
        rating: 4.9,
        reviews: 214,
        languages: ['English', 'Malay'],
        about: 'Dr. Rahman provides everyday care for adults and families, including check-ups, vaccinations and long-term condition management.',
    },
    clinic: {
        id: 1,
        name: 'Harbour Family Clinic',
        address: '12 Harbour Road, Central district',
        region: 'Central district',
        products: ['Digital thermometer', 'Blood pressure monitor'],
    },
    schedules: sampleSchedules,
    services: [
        {
            id: 1,
            name: 'General consultation',
            price: 60,
            duration_minutes: 30,
        },
        { id: 2, name: 'Vaccination', price: 45, duration_minutes: 15 },
        { id: 3, name: 'Lab tests', price: 80, duration_minutes: 30 },
    ],
    sessionCounts: makeSampleCounts(sampleSchedules),
};

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
body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#0F1115;margin:0;padding:16px;background:#fff}
.box{max-width:560px;margin:0 auto;border:1px solid #e2e8f0;border-radius:16px;padding:20px}
h1{font-size:22px;margin:0 0 4px}.muted{color:#64748B;font-size:14px;margin:0}
.token{margin:24px 0;padding:20px;border-radius:12px;background:#F6F3F7;text-align:center}
.token b{display:block;font-size:44px;line-height:1.1;color:#B0357F}.token span{font-size:13px;color:#64748B}
table{width:100%;border-collapse:collapse;font-size:14px}th,td{padding:10px 0;border-top:1px solid #e2e8f0;text-align:left;vertical-align:top;overflow-wrap:anywhere}
th{width:38%;padding-right:12px;color:#64748B;font-weight:500}.total td,.total th{font-size:16px;font-weight:700;color:#0F1115}
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

/** Opens the browser print dialog for the receipt, so the user can "Save as PDF". */
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
    icon?: React.ReactNode;
    children: React.ReactNode;
}) {
    const id = `c-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
    return (
        <section
            aria-labelledby={id}
            className="rounded-[1.25rem] bg-white p-4 sm:rounded-[1.5rem] sm:p-6"
        >
            <h2
                id={id}
                className="mb-4 flex items-center gap-2 text-base font-medium tracking-tight sm:text-lg"
            >
                {icon}
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
    children: React.ReactNode;
}) {
    return (
        <div className="border-t border-slate-200 py-4 first:border-0 first:pt-0 sm:py-5">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                <span className="grid size-5 shrink-0 place-items-center rounded-full bg-[#0F1115] text-[11px] text-white">
                    {n}
                </span>
                {title}
            </h3>
            {children}
        </div>
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
        // Bottom sheet on phones, centred dialog from sm up
        <div className="fixed inset-0 z-[10002] flex items-end justify-center sm:items-center sm:p-4">
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
                className="relative max-h-[92dvh] w-full max-w-md overflow-y-auto overscroll-contain rounded-t-[1.5rem] bg-white p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-xl sm:rounded-[1.5rem] sm:p-6"
            >
                <button
                    type="button"
                    aria-label="Close"
                    onClick={onClose}
                    className="absolute top-3 right-3 grid size-10 place-items-center rounded-full border border-slate-200 hover:border-[#B0357F] sm:top-4 sm:right-4 sm:size-9"
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

                <div className="mt-5 rounded-2xl bg-[#F6F3F7] py-4 text-center sm:py-5">
                    <p className="text-sm text-[#64748B]">Your token number</p>
                    <p className="text-5xl leading-tight font-semibold tracking-tight text-[#B0357F]">
                        #{r.token_number}
                    </p>
                    <p className="mt-1 text-xs text-[#64748B]">
                        Show this at the clinic reception
                    </p>
                </div>

                <dl className="mt-5 divide-y divide-slate-200 text-sm">
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
                        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#0F1115] py-3 text-sm font-medium text-white transition hover:bg-[#B0357F]"
                    >
                        <DownloadIcon className="size-4" />
                        Download receipt
                    </button>
                    <button
                        type="button"
                        onClick={() => printReceipt(r)}
                        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-slate-300 bg-white py-3 text-sm font-medium transition hover:border-[#B0357F]"
                    >
                        <PrinterIcon className="size-4" />
                        Print or save PDF
                    </button>
                </div>
                <button
                    type="button"
                    autoFocus
                    onClick={onClose}
                    className="mt-2 min-h-12 w-full rounded-full py-3 text-sm font-medium text-[#64748B] transition hover:text-[#0F1115]"
                >
                    Done
                </button>
            </motion.div>
        </div>
    );
}

/* ============ PAGE ============ */
export default function DoctorDetailPage(props: Partial<Props>) {
    const {
        doctor,
        clinic,
        schedules,
        services,
        sessionCounts = {},
        reservation,
    } = { ...sample, ...props } as Props;
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
                (s) => s.day_of_week === DAYS[date.getDay()],
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
            .filter((s) => s.day_of_week === dow)
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

    const picked = sessions.find((s) => s.id === data.schedule_id && s.open);
    const ready = Boolean(service && data.appointment_date && picked);

    const submit = (e: React.FormEvent) => {
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
            .filter((s) => s.day_of_week === day)
            .sort((a, b) => toMin(a.start_time) - toMin(b.start_time)),
    }));

    return (
        <main className="min-h-screen overflow-x-clip text-[#0F1115]">
            <div className="mx-auto max-w-[1280px] px-3 pt-20 pb-28 sm:px-6 sm:pt-22 sm:pb-24">
                <div className="mt-4 grid items-start gap-3 sm:mt-8 sm:gap-4 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-6">
                    {/* ===== LEFT: doctor information ===== */}
                    <div className="min-w-0 space-y-3 sm:space-y-4">
                        <section className="overflow-hidden rounded-[1.25rem] bg-white sm:rounded-[1.5rem]">
                            <div className="grid sm:grid-cols-[220px_1fr] md:grid-cols-[260px_1fr]">
                                <div className="aspect-[16/11] sm:aspect-auto sm:min-h-[280px]">
                                    <Img
                                        id={doctor.photo}
                                        alt={`Portrait of ${fullName}`}
                                        className="object-top"
                                    />
                                </div>
                                <div className="min-w-0 p-4 sm:p-6">
                                    <h1 className="text-2xl font-medium tracking-[-0.03em] break-words sm:text-3xl md:text-4xl">
                                        {fullName}
                                    </h1>
                                    <p className="mt-1 text-[#64748B]">
                                        {doctor.specialization.name}
                                    </p>
                                    <ul className="mt-4 space-y-2.5 text-sm sm:mt-5">
                                        {doctor.rating != null && (
                                            <li className="flex items-center gap-2">
                                                <StarIcon className="size-4 fill-amber-400 text-amber-400" />
                                                <span className="font-semibold">
                                                    {doctor.rating.toFixed(1)}
                                                </span>
                                                <span className="text-[#64748B]">
                                                    ({doctor.reviews ?? 0}{' '}
                                                    reviews)
                                                </span>
                                            </li>
                                        )}
                                        <li className="flex items-start gap-2 text-[#3B3F4A]">
                                            <MapPinIcon className="mt-0.5 size-4 shrink-0 text-[#B0357F]" />
                                            <span className="min-w-0">
                                                <span className="font-medium">
                                                    {clinic.name}
                                                </span>
                                                <br />
                                                <span className="text-[#64748B]">
                                                    {clinic.address}
                                                </span>
                                            </span>
                                        </li>
                                        {doctor.languages &&
                                            doctor.languages.length > 0 && (
                                                <li className="flex items-center gap-2 text-[#3B3F4A]">
                                                    <LanguagesIcon className="size-4 shrink-0 text-[#B0357F]" />
                                                    {doctor.languages.join(
                                                        ', ',
                                                    )}
                                                </li>
                                            )}
                                    </ul>
                                </div>
                            </div>
                        </section>

                        {doctor.about && (
                            <Card title="About">
                                <p className="max-w-prose leading-relaxed text-[#3B3F4A]">
                                    {doctor.about}
                                </p>
                            </Card>
                        )}

                        <Card
                            title="Services and fees"
                            icon={
                                <StethoscopeIcon className="size-5 text-[#B0357F]" />
                            }
                        >
                            <ul className="divide-y divide-slate-200">
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
                            icon={
                                <ClockIcon className="size-5 text-[#B0357F]" />
                            }
                        >
                            <dl className="divide-y divide-slate-200 text-sm">
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
                                            className="rounded-full bg-[#F0E6EE] px-3.5 py-1.5 text-sm font-medium text-[#8A2A65]"
                                        >
                                            {p}
                                        </li>
                                    ))}
                                </ul>
                            </Card>
                        )}
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
                            className="rounded-[1.25rem] bg-white p-4 sm:rounded-[1.5rem] sm:p-6"
                        >
                            <h2 className="mb-1 text-lg font-medium tracking-tight sm:text-xl">
                                Book an appointment
                            </h2>
                            <p className="mb-5 text-sm text-[#64748B]">
                                In-clinic visit. You'll get a token number for
                                your session.
                            </p>

                            <Step n={1} title="Choose a service">
                                <div className="space-y-2">
                                    {services.map((s) => (
                                        <label
                                            key={s.id}
                                            className={`flex min-h-12 cursor-pointer items-center justify-between gap-3 rounded-2xl border px-3.5 py-3 text-sm transition sm:px-4 ${data.service_id === s.id ? 'border-[#B0357F] bg-[#F0E6EE]/50' : 'border-slate-300 hover:border-[#B0357F]'}`}
                                        >
                                            <span className="flex min-w-0 items-center gap-2.5">
                                                <input
                                                    type="radio"
                                                    name="service"
                                                    checked={
                                                        data.service_id === s.id
                                                    }
                                                    onChange={() =>
                                                        setData(
                                                            'service_id',
                                                            s.id,
                                                        )
                                                    }
                                                    className="size-4 shrink-0 accent-[#B0357F]"
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
                                {errors.service_id && (
                                    <p
                                        role="alert"
                                        className="mt-2 text-sm text-red-600"
                                    >
                                        {errors.service_id}
                                    </p>
                                )}
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
                                        className="-mx-4 flex snap-x snap-proximity [scrollbar-width:thin] gap-2 overflow-x-auto overscroll-x-contain px-4 pb-2 sm:-mx-1 sm:px-1"
                                    >
                                        {days.map(({ iso, date, full }) => {
                                            const active =
                                                data.appointment_date === iso;
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
                                                    className={`w-16 shrink-0 snap-start rounded-2xl border py-2.5 text-center transition ${active ? 'border-[#0F1115] bg-[#0F1115] text-white' : full ? 'border-slate-200 bg-slate-50 text-[#94A3B8] hover:border-slate-300' : 'border-slate-300 bg-white hover:border-[#B0357F]'}`}
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
                                {errors.appointment_date && (
                                    <p
                                        role="alert"
                                        className="mt-2 text-sm text-red-600"
                                    >
                                        {errors.appointment_date}
                                    </p>
                                )}
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
                                                    className={`w-full rounded-2xl border px-3.5 py-3 text-left text-sm transition sm:px-4 ${active ? 'border-[#B0357F] bg-[#F0E6EE]/50' : s.open ? 'border-slate-300 hover:border-[#B0357F]' : 'cursor-not-allowed border-slate-200 bg-slate-50 text-[#94A3B8]'}`}
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
                                                            className={`block h-full rounded-full ${s.open ? 'bg-[#B0357F]' : 'bg-slate-400'}`}
                                                            style={{
                                                                width: `${pct}%`,
                                                            }}
                                                        />
                                                    </span>
                                                    <span className="mt-1.5 block text-xs text-[#64748B]">
                                                        {s.booked} of{' '}
                                                        {s.max_patients} tokens
                                                        taken.{' '}
                                                        {s.open
                                                            ? `Next token is #${s.booked + 1}.`
                                                            : s.full && !s.ended
                                                              ? 'Choose another session or date.'
                                                              : ''}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                                {errors.schedule_id && (
                                    <p
                                        role="alert"
                                        className="mt-2 text-sm text-red-600"
                                    >
                                        {errors.schedule_id}
                                    </p>
                                )}
                            </Step>

                            <Step n={4} title="Notes for the doctor (optional)">
                                <textarea
                                    aria-label="Remarks"
                                    rows={3}
                                    maxLength={500}
                                    value={data.remarks}
                                    onChange={(e) =>
                                        setData('remarks', e.target.value)
                                    }
                                    placeholder="Symptoms, questions, or anything the doctor should know"
                                    // text-base on phones stops iOS Safari zooming in on focus
                                    className="w-full resize-none rounded-2xl border border-slate-300 bg-white px-4 py-3 text-base outline-none placeholder:text-[#94A3B8] focus:border-[#B0357F] sm:text-sm"
                                />
                                {errors.remarks && (
                                    <p
                                        role="alert"
                                        className="mt-1 text-sm text-red-600"
                                    >
                                        {errors.remarks}
                                    </p>
                                )}
                            </Step>

                            {/* Summary */}
                            <div className="mt-1 rounded-2xl bg-[#F6F3F7] p-4 text-sm">
                                <div className="flex items-start gap-2 font-medium">
                                    <CalendarIcon className="mt-0.5 size-4 shrink-0 text-[#B0357F]" />
                                    <span className="min-w-0">
                                        {ready && picked
                                            ? `${longDate(data.appointment_date)}, ${label12(picked.start_time)} – ${label12(picked.end_time)}`
                                            : 'Select a date and session'}
                                    </span>
                                </div>
                                {ready && picked && (
                                    <p className="mt-1.5 pl-6 text-xs text-[#64748B]">
                                        Estimated token #{picked.booked + 1}.
                                        The final number is assigned when you
                                        confirm.
                                    </p>
                                )}
                                <div className="mt-3 flex items-baseline justify-between gap-3 border-t border-slate-200 pt-3">
                                    <span className="min-w-0 text-[#64748B]">
                                        {service?.name ?? 'Service'}
                                    </span>
                                    <span className="shrink-0 text-lg font-semibold">
                                        {service ? money(service.price) : '—'}
                                    </span>
                                </div>
                            </div>

                            {errors.doctor_id && (
                                <p
                                    role="alert"
                                    className="mt-3 text-sm text-red-600"
                                >
                                    {errors.doctor_id}
                                </p>
                            )}

                            <button
                                type="submit"
                                disabled={!ready || processing}
                                className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#0F1115] py-3.5 text-sm font-medium text-white transition hover:bg-[#B0357F] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-[#0F1115]"
                            >
                                <CheckCircle2Icon className="size-4" />
                                {processing ? 'Booking…' : 'Confirm booking'}
                            </button>
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
                            className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-[#0F1115] px-6 text-sm font-medium text-white transition hover:bg-[#B0357F]"
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
