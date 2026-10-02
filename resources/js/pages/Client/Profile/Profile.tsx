import { Head, Link, useForm } from '@inertiajs/react';
import {
    CalendarDaysIcon,
    CheckCircle2Icon,
    ChevronRightIcon,
    Clock3Icon,
    ImagePlusIcon,
    LayoutDashboardIcon,
    LogOutIcon,
    PackageIcon,
    PencilIcon,
    SettingsIcon,
    ShieldCheckIcon,
    ShoppingBagIcon,
    StarIcon,
    UserRoundIcon,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useState } from 'react';

type Patient = {
    id?: string;
    first_name: string;
    middle_name?: string | null;
    last_name: string;
    email: string;
    contact_number?: string | null;
    complete_address?: string | null;
    region?: string | null;
    gender?: string | null;
    birthdate?: string | null;
    photo_url?: string | null;
    nrc_number?: string | null;
    nrc?: {
        nrc_state_id: number;
        nrc_township_id: number;
        nrc_type_id: number;
    } | null;
};
type NrcState = {
    id: number;
    name: string;
    townships: { id: number; name: string }[];
};
type NrcType = { id: number; name: string };
type Person = {
    first_name: string;
    middle_name?: string | null;
    last_name: string;
};
type Booking = {
    id: number;
    appointment_code?: string | null;
    appointment_at?: string | null;
    status: string;
    clinic?: { clinic_name: string } | null;
    doctor?: Person | null;
    service?: { service_name: string } | null;
};
type Order = {
    id: number;
    total: string | number;
    order_status?: string | null;
    payment_status?: string | null;
    created_at: string;
    clinic?: { clinic_name: string } | null;
};
type Review = {
    id: number;
    rating: number;
    comment?: string | null;
    created_at: string;
    clinic?: { clinic_name: string } | null;
    doctor?: Person | null;
};
type Tab =
    'overview' | 'profile' | 'bookings' | 'orders' | 'reviews' | 'settings';

const tabs: { key: Tab; label: string; icon: LucideIcon }[] = [
    { key: 'overview', label: 'Overview', icon: LayoutDashboardIcon },
    { key: 'bookings', label: 'Bookings', icon: CalendarDaysIcon },
    { key: 'orders', label: 'Orders', icon: PackageIcon },
    { key: 'reviews', label: 'My reviews', icon: StarIcon },
    { key: 'profile', label: 'Profile', icon: UserRoundIcon },
    { key: 'settings', label: 'Settings', icon: SettingsIcon },
];
const dateLabel = (value?: string | null, time = false) => {
    if (!value) return 'Date to be confirmed';
    const date = new Date(value);
    return Number.isNaN(date.getTime())
        ? value
        : date.toLocaleDateString(undefined, {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              ...(time ? { hour: 'numeric', minute: '2-digit' } : {}),
          });
};
const personName = (person?: Person | null) =>
    person
        ? [person.first_name, person.middle_name, person.last_name]
              .filter(Boolean)
              .join(' ')
        : 'Doctor';
const statusClass = (status?: string | null) =>
    ['completed', 'delivered', 'paid', 'confirmed'].includes(
        status?.toLowerCase() ?? '',
    )
        ? 'bg-emerald-50 text-emerald-700'
        : ['cancelled', 'failed', 'refunded'].includes(
                status?.toLowerCase() ?? '',
            )
          ? 'bg-rose-50 text-rose-700'
          : 'bg-amber-50 text-amber-700';

function Status({ value }: { value?: string | null }) {
    return (
        <span
            className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusClass(value)}`}
        >
            {value || 'Pending'}
        </span>
    );
}
function Empty({
    icon: Icon,
    title,
    text,
    action,
}: {
    icon: typeof CalendarDaysIcon;
    title: string;
    text: string;
    action?: React.ReactNode;
}) {
    return (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center">
            <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-[#F2F7F7] text-[#337983]">
                <Icon className="size-5" />
            </span>
            <h3 className="mt-4 text-base font-semibold">{title}</h3>
            <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
                {text}
            </p>
            {action}
        </div>
    );
}
function Heading({
    eyebrow,
    title,
    action,
}: {
    eyebrow?: string;
    title: string;
    action?: React.ReactNode;
}) {
    return (
        <div className="mb-4 flex items-end justify-between gap-4">
            <div>
                {eyebrow && (
                    <p className="text-[11px] font-bold tracking-[0.18em] text-[#337983] uppercase">
                        {eyebrow}
                    </p>
                )}
                <h2 className="mt-1 text-xl font-semibold tracking-tight">
                    {title}
                </h2>
            </div>
            {action}
        </div>
    );
}
function BookingRow({ booking }: { booking: Booking }) {
    return (
        <Link
            href={`/reservations/${booking.id}`}
            className="group flex items-center gap-4 border-b border-slate-100 px-1 py-4 last:border-0"
        >
            <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#F2F7F7] text-[#337983]">
                <CalendarDaysIcon className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-semibold">
                        {booking.service?.service_name || 'Medical appointment'}
                    </p>
                    <Status value={booking.status} />
                </div>
                <p className="mt-1 truncate text-xs text-slate-500">
                    {personName(booking.doctor)} ·{' '}
                    {booking.clinic?.clinic_name || 'Clinic'}
                </p>
                <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                    <Clock3Icon className="size-3.5" />{' '}
                    {dateLabel(booking.appointment_at, true)}
                </p>
            </div>
            <ChevronRightIcon className="size-4 shrink-0 text-slate-300 transition group-hover:text-[#337983]" />
        </Link>
    );
}
function OrderRow({ order }: { order: Order }) {
    return (
        <Link
            href={`/shop/orders/${order.id}`}
            className="group flex items-center gap-4 border-b border-slate-100 px-1 py-4 last:border-0"
        >
            <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#F7F3F7] text-[#B0357F]">
                <PackageIcon className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold">Order #{order.id}</p>
                    <Status value={order.order_status} />
                </div>
                <p className="mt-1 truncate text-xs text-slate-500">
                    {order.clinic?.clinic_name || 'Nuria shop'} ·{' '}
                    {dateLabel(order.created_at)}
                </p>
            </div>
            <div className="text-right">
                <p className="text-sm font-semibold">
                    {Number(order.total).toLocaleString()} MMK
                </p>
                <p className="mt-1 text-[11px] text-slate-400">
                    {order.payment_status || 'Payment pending'}
                </p>
            </div>
            <ChevronRightIcon className="size-4 shrink-0 text-slate-300" />
        </Link>
    );
}
function ReviewCard({ review }: { review: Review }) {
    return (
        <article className="rounded-2xl border border-slate-100 bg-white p-5">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-sm font-semibold">
                        {personName(review.doctor)}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                        {review.clinic?.clinic_name || 'Clinic'} ·{' '}
                        {dateLabel(review.created_at)}
                    </p>
                </div>
                <div className="flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                    <StarIcon className="size-3.5 fill-amber-400 text-amber-400" />{' '}
                    {review.rating}/5
                </div>
            </div>
            {review.comment && (
                <p className="mt-4 text-sm leading-6 text-slate-600">
                    “{review.comment}”
                </p>
            )}
        </article>
    );
}

export default function Profile({
    patient,
    nrcStates,
    nrcTypes,
    bookings,
    orders,
    reviews,
    stats,
}: {
    patient: Patient;
    nrcStates: NrcState[];
    nrcTypes: NrcType[];
    bookings: Booking[];
    orders: Order[];
    reviews: Review[];
    stats: { bookings: number; orders: number; reviews: number };
}) {
    const [activeTab, setActiveTab] = useState<Tab>('overview');
    const [settings, setSettings] = useState({
        reminders: true,
        updates: true,
        marketing: false,
    });
    const form = useForm({
        first_name: patient.first_name ?? '',
        middle_name: patient.middle_name ?? '',
        last_name: patient.last_name ?? '',
        email: patient.email ?? '',
        contact_number: patient.contact_number ?? '',
        complete_address: patient.complete_address ?? '',
        region: patient.region ?? '',
        gender: patient.gender ?? '',
        birthdate: patient.birthdate?.substring(0, 10) ?? '',
        password: '',
        photo: null as File | null,
        nrc_state_id: patient.nrc?.nrc_state_id?.toString() ?? '',
        nrc_township_id: patient.nrc?.nrc_township_id?.toString() ?? '',
        nrc_type_id: patient.nrc?.nrc_type_id?.toString() ?? '',
        nrc_number: patient.nrc_number ?? '',
    });
    const selectedState = nrcStates.find(
        (state) => state.id.toString() === form.data.nrc_state_id,
    );
    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        form.patch('/profile', {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => form.reset('password', 'photo'),
        });
    };
    const linkAll = (tab: Tab) => (
        <button
            type="button"
            onClick={() => setActiveTab(tab)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#337983]"
        >
            View all <ChevronRightIcon className="size-4" />
        </button>
    );

    return (
        <>
            <Head title="My dashboard" />
            <main className="min-h-screen bg-[#F8F7F9] px-4 pt-28 pb-20 sm:px-6 sm:pt-32">
                <div className="mx-auto max-w-6xl">
                    <header className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="text-[11px] font-bold tracking-[0.18em] text-[#337983] uppercase">
                                Patient portal
                            </p>
                            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#102B30]">
                                Your healthcare dashboard
                            </h1>
                            <p className="mt-1 text-sm text-slate-500">
                                Appointments, orders and reviews at a glance.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setActiveTab('profile')}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#337983] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#24616A] sm:w-auto sm:justify-start"
                        >
                            <PencilIcon className="size-4" /> Edit profile
                        </button>
                    </header>
                    <div className="mt-6 grid gap-6 lg:grid-cols-[236px_minmax(0,1fr)] lg:items-start">
                        <aside className="rounded-3xl border border-slate-200 bg-white p-3 shadow-sm lg:sticky lg:top-28">
                            <div className="hidden border-b border-slate-100 px-3 pb-4 lg:block">
                                <p className="text-[11px] font-bold tracking-[0.18em] text-[#337983] uppercase">
                                    Account menu
                                </p>
                                {/* <p className="mt-1 truncate text-sm font-semibold text-[#102B30]">
                                    {patient.email}
                                </p> */}
                            </div>
                            <nav
                                className="flex gap-1 overflow-x-auto lg:mt-3 lg:block"
                                aria-label="Profile sections"
                            >
                                {tabs.map(({ key, label, icon: Icon }) => (
                                    <button
                                        key={key}
                                        type="button"
                                        onClick={() => setActiveTab(key)}
                                        className={`flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition lg:mb-1 lg:w-full ${activeTab === key ? 'bg-[#102B30] text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-[#102B30]'}`}
                                    >
                                        <Icon className="size-4" />
                                        {label}
                                    </button>
                                ))}
                            </nav>
                            <div className="mt-3 hidden border-t border-slate-100 pt-3 lg:block">
                                <Link
                                    href="/logout"
                                    method="post"
                                    as="button"
                                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-500 transition hover:bg-rose-50 hover:text-rose-600"
                                >
                                    <LogOutIcon className="size-4" /> Sign out
                                </Link>
                            </div>
                        </aside>
                        <div className="min-w-0">
                            {activeTab === 'overview' && (
                                <div className="mt-7 grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
                                    <div className="space-y-6">
                                        <section>
                                            <Heading
                                                eyebrow="Your care"
                                                title="Recent bookings"
                                                action={linkAll('bookings')}
                                            />
                                            <div className="rounded-3xl bg-white  shadow-sm">
                                                {bookings.length ? (
                                                    bookings
                                                        .slice(0, 3)
                                                        .map((booking) => (
                                                            <BookingRow
                                                                key={booking.id}
                                                                booking={
                                                                    booking
                                                                }
                                                            />
                                                        ))
                                                ) : (
                                                    <Empty
                                                        icon={CalendarDaysIcon}
                                                        title="No bookings yet"
                                                        text="Your appointments will appear here after you book a doctor."
                                                        action={
                                                            <Link
                                                                href="/clinics"
                                                                className="mt-4 inline-flex rounded-full bg-[#337983] px-4 py-2 text-xs font-semibold text-white"
                                                            >
                                                                Find a clinic
                                                            </Link>
                                                        }
                                                    />
                                                )}
                                            </div>
                                        </section>
                                        <section>
                                            <Heading
                                                eyebrow="Your shopping"
                                                title="Recent orders"
                                                action={linkAll('orders')}
                                            />
                                            <div className="rounded-3xl bg-white   shadow-sm">
                                                {orders.length ? (
                                                    orders
                                                        .slice(0, 3)
                                                        .map((order) => (
                                                            <OrderRow
                                                                key={order.id}
                                                                order={order}
                                                            />
                                                        ))
                                                ) : (
                                                    <Empty
                                                        icon={ShoppingBagIcon}
                                                        title="No orders yet"
                                                        text="Medical products and medicines you order will be listed here."
                                                        action={
                                                            <Link
                                                                href="/shop"
                                                                className="mt-4 inline-flex rounded-full bg-[#337983] px-4 py-2 text-xs font-semibold text-white"
                                                            >
                                                                Browse products
                                                            </Link>
                                                        }
                                                    />
                                                )}
                                            </div>
                                        </section>
                                    </div>
                                    <aside className="space-y-6">
                                        <section className="rounded-3xl bg-white p-6 shadow-sm">
                                            <Heading
                                                eyebrow="At a glance"
                                                title="Account summary"
                                            />
                                            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                                                {(
                                                    [
                                                        [
                                                            CalendarDaysIcon,
                                                            stats.bookings,
                                                            'Bookings',
                                                        ],
                                                        [
                                                            PackageIcon,
                                                            stats.orders,
                                                            'Orders',
                                                        ],
                                                        [
                                                            StarIcon,
                                                            stats.reviews,
                                                            'Reviews',
                                                        ],
                                                    ] as [
                                                        LucideIcon,
                                                        number,
                                                        string,
                                                    ][]
                                                ).map(
                                                    ([Icon, count, label]) => (
                                                        <div
                                                            key={
                                                                label as string
                                                            }
                                                            className="rounded-2xl bg-[#F8F7F9] p-3"
                                                        >
                                                            <Icon className="size-4 text-[#337983]" />
                                                            <p className="mt-3 text-xl font-semibold">
                                                                {
                                                                    count as number
                                                                }
                                                            </p>
                                                            <p className="mt-0.5 text-[11px] text-slate-500">
                                                                {
                                                                    label as string
                                                                }
                                                            </p>
                                                        </div>
                                                    ),
                                                )}
                                            </div>
                                        </section>
                                        <section className="rounded-3xl bg-[#E8F4F3] p-6">
                                            <ShieldCheckIcon className="size-5 text-[#337983]" />
                                            <h3 className="mt-4 text-base font-semibold text-[#102B30]">
                                                Your health details
                                            </h3>
                                            <p className="mt-1 text-sm leading-6 text-[#4E7273]">
                                                Keep your profile current so
                                                clinics can prepare for your
                                                visit.
                                            </p>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setActiveTab('profile')
                                                }
                                                className="mt-4 text-sm font-semibold text-[#337983]"
                                            >
                                                Review details{' '}
                                                <span aria-hidden>→</span>
                                            </button>
                                        </section>
                                    </aside>
                                </div>
                            )}

                            {activeTab === 'profile' && (
                                <section className="mt-7 rounded-3xl bg-white p-6 shadow-sm sm:p-8">
                                    <Heading
                                        eyebrow="Personal information"
                                        title="My details"
                                    />
                                    <form
                                        onSubmit={submit}
                                        className="mt-6 space-y-6"
                                    >
                                        <div className="flex flex-wrap items-center gap-5 rounded-2xl bg-[#F8F7F9] p-4">
                                            <div className="relative grid size-20 shrink-0 place-items-center overflow-hidden rounded-2xl bg-[#DDF1F0] text-2xl font-semibold text-[#337983]">
                                                {patient.photo_url ? (
                                                    <img
                                                        src={patient.photo_url}
                                                        alt="Profile"
                                                        className="size-full object-cover"
                                                    />
                                                ) : (
                                                    patient.first_name
                                                        .charAt(0)
                                                        .toUpperCase()
                                                )}
                                                <label
                                                    htmlFor="photo"
                                                    className="absolute right-1 bottom-1 grid size-7 cursor-pointer place-items-center rounded-lg bg-[#102B30] text-white shadow-sm"
                                                >
                                                    <ImagePlusIcon className="size-3.5" />
                                                    <span className="sr-only">
                                                        Upload profile image
                                                    </span>
                                                </label>
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-[#102B30]">
                                                    Profile image
                                                </p>
                                                <p className="mt-1 text-xs text-slate-500">
                                                    Use a clear image, up to 2
                                                    MB.
                                                </p>
                                                <input
                                                    id="photo"
                                                    type="file"
                                                    accept="image/*"
                                                    className="sr-only"
                                                    onChange={(event) =>
                                                        form.setData(
                                                            'photo',
                                                            event.target
                                                                .files?.[0] ??
                                                                null,
                                                        )
                                                    }
                                                />
                                                {form.data.photo && (
                                                    <p className="mt-1 text-xs font-medium text-[#337983]">
                                                        {form.data.photo.name}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="grid gap-5 sm:grid-cols-3">
                                            {(
                                                [
                                                    [
                                                        'first_name',
                                                        'First name',
                                                    ],
                                                    [
                                                        'middle_name',
                                                        'Middle name',
                                                    ],
                                                    ['last_name', 'Last name'],
                                                ] as const
                                            ).map(([field, label]) => (
                                                <div key={field}>
                                                    <label
                                                        htmlFor={field}
                                                        className="mb-2 block text-sm font-medium"
                                                    >
                                                        {label}
                                                    </label>
                                                    <input
                                                        id={field}
                                                        value={form.data[field]}
                                                        onChange={(event) =>
                                                            form.setData(
                                                                field,
                                                                event.target
                                                                    .value,
                                                            )
                                                        }
                                                        required={
                                                            field !==
                                                            'middle_name'
                                                        }
                                                        className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[#337983]"
                                                    />
                                                    {form.errors[field] && (
                                                        <p className="mt-1 text-xs text-rose-600">
                                                            {form.errors[field]}
                                                        </p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                        <div className="grid gap-5 sm:grid-cols-2">
                                            {(
                                                [
                                                    [
                                                        'email',
                                                        'Email address',
                                                        'email',
                                                    ],
                                                    [
                                                        'contact_number',
                                                        'Phone number',
                                                        'tel',
                                                    ],
                                                    [
                                                        'birthdate',
                                                        'Birthdate',
                                                        'date',
                                                    ],
                                                    [
                                                        'region',
                                                        'Region',
                                                        'text',
                                                    ],
                                                ] as const
                                            ).map(([field, label, type]) => (
                                                <div key={field}>
                                                    <label
                                                        htmlFor={field}
                                                        className="mb-2 block text-sm font-medium"
                                                    >
                                                        {label}
                                                    </label>
                                                    <input
                                                        id={field}
                                                        type={type}
                                                        value={form.data[field]}
                                                        onChange={(event) =>
                                                            form.setData(
                                                                field,
                                                                event.target
                                                                    .value,
                                                            )
                                                        }
                                                        className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[#337983]"
                                                    />
                                                    {form.errors[field] && (
                                                        <p className="mt-1 text-xs text-rose-600">
                                                            {form.errors[field]}
                                                        </p>
                                                    )}
                                                </div>
                                            ))}
                                            <div>
                                                <label
                                                    htmlFor="gender"
                                                    className="mb-2 block text-sm font-medium"
                                                >
                                                    Gender
                                                </label>
                                                <select
                                                    id="gender"
                                                    value={form.data.gender}
                                                    onChange={(event) =>
                                                        form.setData(
                                                            'gender',
                                                            event.target.value,
                                                        )
                                                    }
                                                    className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[#337983]"
                                                >
                                                    <option value="">
                                                        Select gender
                                                    </option>
                                                    <option value="Male">
                                                        Male
                                                    </option>
                                                    <option value="Female">
                                                        Female
                                                    </option>
                                                    <option value="Other">
                                                        Other
                                                    </option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="rounded-2xl border border-slate-100 p-4">
                                            <p className="text-sm font-semibold text-[#102B30]">
                                                National registration card
                                            </p>
                                            <p className="mt-1 text-xs text-slate-500">
                                                Keep your NRC details up to date
                                                for clinic records.
                                            </p>
                                            <div className="mt-4 grid gap-4 sm:grid-cols-3">
                                                <select
                                                    value={
                                                        form.data.nrc_state_id
                                                    }
                                                    onChange={(event) =>
                                                        form.setData(
                                                            'nrc_state_id',
                                                            event.target.value,
                                                        )
                                                    }
                                                    className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#337983]"
                                                >
                                                    <option value="">
                                                        State / division
                                                    </option>
                                                    {nrcStates.map((state) => (
                                                        <option
                                                            key={state.id}
                                                            value={state.id}
                                                        >
                                                            {state.name}
                                                        </option>
                                                    ))}
                                                </select>
                                                <select
                                                    value={
                                                        form.data
                                                            .nrc_township_id
                                                    }
                                                    onChange={(event) =>
                                                        form.setData(
                                                            'nrc_township_id',
                                                            event.target.value,
                                                        )
                                                    }
                                                    disabled={!selectedState}
                                                    className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#337983] disabled:bg-slate-50"
                                                >
                                                    <option value="">
                                                        Township
                                                    </option>
                                                    {selectedState?.townships.map(
                                                        (township) => (
                                                            <option
                                                                key={
                                                                    township.id
                                                                }
                                                                value={
                                                                    township.id
                                                                }
                                                            >
                                                                {township.name}
                                                            </option>
                                                        ),
                                                    )}
                                                </select>
                                                <select
                                                    value={
                                                        form.data.nrc_type_id
                                                    }
                                                    onChange={(event) =>
                                                        form.setData(
                                                            'nrc_type_id',
                                                            event.target.value,
                                                        )
                                                    }
                                                    className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#337983]"
                                                >
                                                    <option value="">
                                                        Type
                                                    </option>
                                                    {nrcTypes.map((type) => (
                                                        <option
                                                            key={type.id}
                                                            value={type.id}
                                                        >
                                                            {type.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <input
                                                value={form.data.nrc_number}
                                                onChange={(event) =>
                                                    form.setData(
                                                        'nrc_number',
                                                        event.target.value,
                                                    )
                                                }
                                                placeholder="NRC number"
                                                className="mt-4 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[#337983]"
                                            />
                                        </div>
                                        <div>
                                            <label
                                                htmlFor="complete_address"
                                                className="mb-2 block text-sm font-medium"
                                            >
                                                Address
                                            </label>
                                            <textarea
                                                id="complete_address"
                                                rows={3}
                                                value={
                                                    form.data.complete_address
                                                }
                                                onChange={(event) =>
                                                    form.setData(
                                                        'complete_address',
                                                        event.target.value,
                                                    )
                                                }
                                                className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-[#337983]"
                                            />
                                        </div>
                                        <div className="border-t border-slate-100 pt-6">
                                            <p className="text-sm font-semibold">
                                                Security
                                            </p>
                                            <p className="mt-1 text-xs text-slate-500">
                                                Leave blank to keep your current
                                                password.
                                            </p>
                                            <input
                                                type="password"
                                                value={form.data.password}
                                                onChange={(event) =>
                                                    form.setData(
                                                        'password',
                                                        event.target.value,
                                                    )
                                                }
                                                placeholder="New password"
                                                className="mt-3 h-11 w-full max-w-md rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[#337983]"
                                            />
                                        </div>
                                        <div className="flex flex-wrap items-center gap-4">
                                            <button
                                                type="submit"
                                                disabled={form.processing}
                                                className="rounded-full bg-[#337983] px-5 py-3 text-sm font-semibold text-white hover:bg-[#24616A] disabled:opacity-60"
                                            >
                                                {form.processing
                                                    ? 'Saving…'
                                                    : 'Save changes'}
                                            </button>
                                            {form.recentlySuccessful && (
                                                <span className="flex items-center gap-1.5 text-sm text-emerald-600">
                                                    <CheckCircle2Icon className="size-4" />{' '}
                                                    Saved
                                                </span>
                                            )}
                                        </div>
                                    </form>
                                </section>
                            )}

                            {activeTab === 'bookings' && (
                                <section className="mt-7">
                                    <Heading
                                        eyebrow="Your care"
                                        title="All bookings"
                                        action={
                                            <Link
                                                href="/clinics"
                                                className="rounded-full bg-[#337983] px-4 py-2.5 text-xs font-semibold text-white"
                                            >
                                                Book a doctor
                                            </Link>
                                        }
                                    />
                                    {bookings.length ? (
                                        <div className="rounded-3xl bg-white px-5 shadow-sm">
                                            {bookings.map((booking) => (
                                                <BookingRow
                                                    key={booking.id}
                                                    booking={booking}
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        <Empty
                                            icon={CalendarDaysIcon}
                                            title="No bookings yet"
                                            text="Find a clinic and book your first appointment."
                                        />
                                    )}
                                </section>
                            )}
                            {activeTab === 'orders' && (
                                <section className="mt-7">
                                    <Heading
                                        eyebrow="Your shopping"
                                        title="Order history"
                                        action={
                                            <Link
                                                href="/shop"
                                                className="rounded-full bg-[#337983] px-4 py-2.5 text-xs font-semibold text-white"
                                            >
                                                Shop products
                                            </Link>
                                        }
                                    />
                                    {orders.length ? (
                                        <div className="rounded-3xl bg-white px-5 shadow-sm">
                                            {orders.map((order) => (
                                                <OrderRow
                                                    key={order.id}
                                                    order={order}
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        <Empty
                                            icon={ShoppingBagIcon}
                                            title="No orders yet"
                                            text="Your medical product orders will appear here."
                                        />
                                    )}
                                </section>
                            )}
                            {activeTab === 'reviews' && (
                                <section className="mt-7">
                                    <Heading
                                        eyebrow="Your voice"
                                        title="Reviews you posted"
                                    />
                                    {reviews.length ? (
                                        <div className="grid gap-4 md:grid-cols-2">
                                            {reviews.map((review) => (
                                                <ReviewCard
                                                    key={review.id}
                                                    review={review}
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        <Empty
                                            icon={StarIcon}
                                            title="No reviews yet"
                                            text="After a visit, share your experience from the doctor detail page."
                                        />
                                    )}
                                </section>
                            )}
                            {activeTab === 'settings' && (
                                <section className="mt-7 rounded-3xl bg-white p-6 shadow-sm sm:p-8">
                                    <Heading
                                        eyebrow="Preferences"
                                        title="Settings"
                                    />
                                    <div className="divide-y divide-slate-100 rounded-2xl border border-slate-100">
                                        <SettingRow
                                            title="Appointment reminders"
                                            description="Get reminders before your upcoming bookings."
                                            checked={settings.reminders}
                                            onChange={(checked) =>
                                                setSettings({
                                                    ...settings,
                                                    reminders: checked,
                                                })
                                            }
                                        />
                                        <SettingRow
                                            title="Booking and order updates"
                                            description="Receive useful updates about your care and purchases."
                                            checked={settings.updates}
                                            onChange={(checked) =>
                                                setSettings({
                                                    ...settings,
                                                    updates: checked,
                                                })
                                            }
                                        />
                                        <SettingRow
                                            title="Health tips and offers"
                                            description="Occasional news, health tips and product offers from Nuria."
                                            checked={settings.marketing}
                                            onChange={(checked) =>
                                                setSettings({
                                                    ...settings,
                                                    marketing: checked,
                                                })
                                            }
                                        />
                                    </div>
                                    <div className="mt-5 flex items-start gap-3 rounded-2xl bg-[#E8F4F3] p-4 text-sm text-[#4E7273]">
                                        <ShieldCheckIcon className="mt-0.5 size-4 shrink-0 text-[#337983]" />
                                        <p>
                                            Your account details are private and
                                            only shared with clinics involved in
                                            your care.
                                        </p>
                                    </div>
                                </section>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}

function SettingRow({
    title,
    description,
    checked,
    onChange,
}: {
    title: string;
    description: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
}) {
    return (
        <label className="flex cursor-pointer items-center justify-between gap-4 p-4 sm:p-5">
            <span>
                <span className="block text-sm font-semibold text-[#0F1115]">
                    {title}
                </span>
                <span className="mt-1 block text-xs leading-5 text-slate-500">
                    {description}
                </span>
            </span>
            <input
                type="checkbox"
                checked={checked}
                onChange={(event) => onChange(event.target.checked)}
                className="size-5 shrink-0 rounded accent-[#337983]"
            />
        </label>
    );
}
