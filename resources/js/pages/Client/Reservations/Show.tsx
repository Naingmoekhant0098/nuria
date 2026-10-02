import { Head, Link } from '@inertiajs/react';
import { toPng } from 'html-to-image';
import {
    ArrowLeftIcon,
    CheckCircle2Icon,
    DownloadIcon,
    Loader2Icon,
    MapPinIcon,
    PrinterIcon,
} from 'lucide-react';
import { useRef, useState } from 'react';

type Person = {
    first_name: string;
    middle_name?: string | null;
    last_name: string;
};

type Reservation = {
    id: number;
    appointment_code: string;
    token_number?: number | null;
    appointment_at?: string | null;
    appointment_type: string;
    status: string;
    remarks?: string | null;
    amount: string | number;
    created_at: string;
    patient?:
        | (Person & {
              id: string;
              email?: string | null;
              contact_number?: string | null;
          })
        | null;
    clinic?: { clinic_name: string; complete_address?: string | null } | null;
    doctor?: (Person & { id: string; photo_url?: string | null }) | null;
    service?: {
        service_name: string;
        amount?: string | number | null;
    } | null;
    schedule?: { start_time: string; end_time: string } | null;
    payment?: {
        payment_status?: string | null;
        payment_method?: string | null;
    } | null;
};

const fullName = (person?: Person | null) =>
    person
        ? [person.first_name, person.middle_name, person.last_name]
              .filter(Boolean)
              .join(' ')
        : '—';

const dateLabel = (value?: string | null) =>
    value
        ? new Date(value).toLocaleDateString(undefined, {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
          })
        : 'Date to be confirmed';

const timeLabel = (value?: string | null) =>
    value
        ? new Date(`1970-01-01T${value}`).toLocaleTimeString(undefined, {
              hour: 'numeric',
              minute: '2-digit',
          })
        : '—';

const money = (value: string | number) =>
    `${Number(value).toLocaleString()} MMK`;

const titleCase = (value: string) =>
    value.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase());

const statusStyle = (status: string) => {
    const s = status.toLowerCase();
    if (['cancelled', 'canceled', 'rejected', 'no_show'].includes(s))
        return { pill: 'bg-rose-50 text-rose-700', dot: 'bg-rose-500' };
    if (['pending', 'waiting'].includes(s))
        return { pill: 'bg-amber-50 text-amber-700', dot: 'bg-amber-500' };
    return { pill: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500' };
};

function Row({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="flex justify-between gap-6 py-3 text-sm">
            <dt className="shrink-0 text-[#64748B]">{label}</dt>
            <dd className="min-w-0 text-right font-medium break-words">
                {children}
            </dd>
        </div>
    );
}

export default function ReservationShow({
    reservation,
}: {
    reservation: Reservation;
}) {
    const receiptRef = useRef<HTMLDivElement>(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const status = statusStyle(reservation.status);
    const paymentText = reservation.payment?.payment_status
        ? titleCase(reservation.payment.payment_status)
        : 'Pay at the clinic';

    /** Renders the receipt card to a PNG and saves it. */
    const downloadPng = async () => {
        if (!receiptRef.current || saving) return;
        setSaving(true);
        setError('');
        try {
            const dataUrl = await toPng(receiptRef.current, {
                pixelRatio: 2,
                backgroundColor: '#F7F9FA',
                cacheBust: true,
            });
            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = `nuria-receipt-${reservation.appointment_code}.png`;
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch {
            setError(
                'We could not create the image. Use Print and choose "Save as PDF" instead.',
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <Head title={`Booking ${reservation.appointment_code}`} />
            <main className="min-h-screen bg-[#F7F9FA] px-4 pt-28 pb-20 text-[#0F1115] sm:px-6 sm:pt-32 print:bg-white print:p-0">
                <div className="mx-auto max-w-2xl">
                    {/* Actions */}
                    <div className="mb-5 flex flex-wrap items-center justify-between gap-3 print:hidden">
                        <Link
                            href="/profile"
                            className="inline-flex items-center gap-2 text-sm font-medium text-[#64748B] transition hover:text-[#337983]"
                        >
                            <ArrowLeftIcon className="size-4" />
                            Back to bookings
                        </Link>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => window.print()}
                                className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium transition hover:border-[#337983] hover:text-[#337983]"
                            >
                                <PrinterIcon className="size-4" />
                                Print
                            </button>
                            <button
                                type="button"
                                onClick={downloadPng}
                                disabled={saving}
                                className="inline-flex items-center gap-2 rounded-full bg-[#1F3A40] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#337983] disabled:opacity-60"
                            >
                                {saving ? (
                                    <Loader2Icon className="size-4 animate-spin" />
                                ) : (
                                    <DownloadIcon className="size-4" />
                                )}
                                {saving ? 'Preparing…' : 'Download PNG'}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <p
                            role="alert"
                            className="mb-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700 print:hidden"
                        >
                            {error}
                        </p>
                    )}

                    {/* Receipt (this element is what gets saved as PNG) */}
                    <div ref={receiptRef} className="bg-[#F7F9FA] print:bg-white">
                        <section className="overflow-hidden rounded-[1.75rem] bg-white shadow-[0_16px_40px_rgba(31,58,64,0.10)] print:rounded-none print:shadow-none">
                            {/* Header */}
                            <header className="bg-[#1F3A40] px-6 py-8 text-center text-white sm:px-10">
                                <p className="text-lg font-semibold tracking-tight">
                                    nuria
                                </p>
                                <h1 className="mt-4 text-3xl font-medium tracking-[-0.03em]">
                                    Appointment receipt
                                </h1>
                                <p className="mt-1.5 text-sm text-white/70">
                                    Thank you for booking with us
                                </p>
                                <span
                                    className={`mt-5 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-medium ${status.pill}`}
                                >
                                    <span
                                        className={`size-2 rounded-full ${status.dot}`}
                                    />
                                    {titleCase(reservation.status)}
                                </span>
                            </header>

                            <div className="space-y-6 px-6 py-7 sm:px-10">
                                {/* Token + codes */}
                                <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <p className="text-xs text-[#64748B]">
                                                Receipt number
                                            </p>
                                            <p className="mt-1 font-mono font-semibold">
                                                {reservation.appointment_code}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-[#64748B]">
                                                Issued
                                            </p>
                                            <p className="mt-1 font-medium">
                                                {dateLabel(
                                                    reservation.created_at,
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                    {reservation.token_number != null && (
                                        <div className="rounded-2xl bg-[#EAF3F5] px-6 py-3 text-center">
                                            <p className="text-xs text-[#64748B]">
                                                Token
                                            </p>
                                            <p className="text-4xl leading-tight font-semibold text-[#337983]">
                                                #{reservation.token_number}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Appointment */}
                                <div className="border-t border-dashed border-slate-200 pt-6">
                                    <h2 className="mb-1 text-base font-medium tracking-tight">
                                        Appointment
                                    </h2>
                                    <dl className="divide-y divide-slate-100">
                                        <Row label="Service">
                                            {reservation.service
                                                ?.service_name ?? '—'}
                                        </Row>
                                        <Row label="Doctor">
                                            Dr. {fullName(reservation.doctor)}
                                        </Row>
                                        <Row label="Date">
                                            {dateLabel(
                                                reservation.appointment_at,
                                            )}
                                        </Row>
                                        <Row label="Session">
                                            {timeLabel(
                                                reservation.schedule
                                                    ?.start_time,
                                            )}{' '}
                                            –{' '}
                                            {timeLabel(
                                                reservation.schedule?.end_time,
                                            )}
                                        </Row>
                                        <Row label="Visit type">
                                            {titleCase(
                                                reservation.appointment_type,
                                            )}
                                        </Row>
                                    </dl>
                                </div>

                                {/* Clinic + patient */}
                                <div className="grid gap-6 border-t border-dashed border-slate-200 pt-6 sm:grid-cols-2">
                                    <div>
                                        <h2 className="mb-2 text-base font-medium tracking-tight">
                                            Clinic
                                        </h2>
                                        <p className="text-sm font-medium">
                                            {reservation.clinic?.clinic_name ??
                                                '—'}
                                        </p>
                                        <p className="mt-1 flex gap-1.5 text-sm leading-6 text-[#64748B]">
                                            <MapPinIcon className="mt-1 size-4 shrink-0" />
                                            {reservation.clinic
                                                ?.complete_address ??
                                                'Address not available'}
                                        </p>
                                    </div>
                                    <div>
                                        <h2 className="mb-2 text-base font-medium tracking-tight">
                                            Patient
                                        </h2>
                                        <p className="text-sm font-medium">
                                            {fullName(reservation.patient)}
                                        </p>
                                        <p className="mt-1 text-sm text-[#64748B]">
                                            ID: {reservation.patient?.id ?? '—'}
                                        </p>
                                        {reservation.patient
                                            ?.contact_number && (
                                            <p className="text-sm text-[#64748B]">
                                                {
                                                    reservation.patient
                                                        .contact_number
                                                }
                                            </p>
                                        )}
                                        {reservation.patient?.email && (
                                            <p className="text-sm break-all text-[#64748B]">
                                                {reservation.patient.email}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {reservation.remarks && (
                                    <div className="border-t border-dashed border-slate-200 pt-6">
                                        <h2 className="mb-2 text-base font-medium tracking-tight">
                                            Notes
                                        </h2>
                                        <p className="text-sm leading-6 text-[#475569]">
                                            {reservation.remarks}
                                        </p>
                                    </div>
                                )}

                                {/* Total */}
                                <div className="flex items-end justify-between gap-5 rounded-2xl bg-[#F2F7F8] px-5 py-4">
                                    <div>
                                        <p className="text-xs text-[#64748B]">
                                            Payment
                                        </p>
                                        <p className="mt-1 text-sm font-medium">
                                            {paymentText}
                                            {reservation.payment
                                                ?.payment_method
                                                ? ` · ${titleCase(reservation.payment.payment_method)}`
                                                : ''}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-[#64748B]">
                                            Total
                                        </p>
                                        <p className="mt-1 text-2xl font-semibold tracking-tight">
                                            {money(reservation.amount)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <footer className="flex flex-col items-center gap-1 border-t border-dashed border-slate-200 bg-[#FAFCFC] px-6 py-5 text-center text-xs leading-5 text-[#64748B] sm:px-10">
                                <CheckCircle2Icon className="size-4 text-[#337983]" />
                                <p>
                                    Show this receipt at the clinic reception
                                    on the day of your visit.
                                </p>
                                <p>
                                    Keep your receipt number for future
                                    reference.
                                </p>
                            </footer>
                        </section>
                    </div>
                </div>
            </main>
        </>
    );
}
