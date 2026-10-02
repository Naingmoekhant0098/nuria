import { Head, Link } from '@inertiajs/react';
import {
    ImageIcon,
    MapPinIcon,
    NavigationIcon,
    StarIcon,
    StethoscopeIcon,
    TimerIcon,
    UsersIcon,
} from 'lucide-react';

type Clinic = {
    id: number;
    name: string;
    address: string;
    image?: string | null;
    doctors_count: number;
    open_time?: string | null;
    close_time?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    status?: string;
    service_names: string[];
    rating: number;
    reviews_count: number;
};

type Service = {
    id: number;
    name: string;
    description?: string | null;
    amount: number;
    image?: string | null;
};

type Doctor = {
    id: string;
    name: string;
    specialization: string;
    experience_years?: number | null;
    photo?: string | null;
    price?: number;
    rating: number;
    reviews_count: number;
};

type Props = {
    clinic: Clinic;
    services: Service[];
    doctors: Doctor[];
    selectedServiceId: number | null;
};

export default function ClinicDetail({
    clinic,
    services,
    doctors,
    selectedServiceId,
}: Props) {
    const formatTime = (time?: string | null) => {
        if (!time) return 'Hours not available';

        const [hours, minutes] = time.substring(0, 5).split(':').map(Number);
        const date = new Date();
        date.setHours(hours, minutes, 0, 0);

        return date.toLocaleTimeString([], {
            hour: 'numeric',
            minute: '2-digit',
        });
    };

    const mapUrl =
        clinic.latitude && clinic.longitude
            ? `https://www.google.com/maps/search/?api=1&query=${clinic.latitude},${clinic.longitude}`
            : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(clinic.address)}`;

    return (
        <>
            <Head title={`${clinic.name} | Nuria`} />
            <main className="min-h-screen bg-[#F6F3F7] px-4 py-28 text-[#0F1115] sm:px-6">
                <div className="mx-auto max-w-[1280px]">
                    <p className="text-sm text-[#64748B]">
                        <Link href="/" className="hover:text-[#337983]">
                            Home
                        </Link>{' '}
                        /{' '}
                        <Link href="/clinics" className="hover:text-[#337983]">
                            Clinics
                        </Link>{' '}
                        / {clinic.name}
                    </p>

                    <section className="mt-6 overflow-hidden rounded-[2rem] border border-[#E5E7EB] bg-white shadow-sm lg:grid lg:grid-cols-[0.9fr_1.1fr]">
                        {clinic.image ? (
                            <img
                                src={clinic.image}
                                alt={clinic.name}
                                className="h-64 w-full object-cover lg:h-full lg:min-h-[28rem]"
                            />
                        ) : (
                            <div className="flex h-64 items-center justify-center bg-[#E7F1F1] text-7xl font-semibold text-[#337983] lg:h-full lg:min-h-[28rem]">
                                {clinic.name.charAt(0)}
                            </div>
                        )}
                        <div className="p-6 sm:p-8 lg:p-10">
                            <p className="text-sm text-[#64748B]">Clinic</p>
                            <h1 className="mt-2 text-3xl font-medium tracking-[-0.04em] sm:text-5xl">
                                {clinic.name}
                            </h1>
                            <p className="mt-3 text-sm text-[#64748B]">
                                {clinic.rating > 0
                                    ? `${clinic.rating.toFixed(1)} / 5 from ${clinic.reviews_count} review${clinic.reviews_count === 1 ? '' : 's'}`
                                    : 'No reviews yet'}
                            </p>
                            <div className="mt-7 divide-y divide-slate-200 border-y border-slate-200">
                                <div className="flex items-start gap-3 py-4">
                                    <TimerIcon className="mt-0.5 size-5 shrink-0 text-[#337983]" />
                                    <div>
                                        <p className="text-xs font-medium text-[#64748B]">
                                            Opening hours
                                        </p>
                                        <p className="mt-1 text-sm font-semibold text-[#0F1115]">
                                            {formatTime(clinic.open_time)} –{' '}
                                            {formatTime(clinic.close_time)}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 py-4">
                                    <UsersIcon className="mt-0.5 size-5 shrink-0 text-[#337983]" />
                                    <div>
                                        <p className="text-xs font-medium text-[#64748B]">
                                            Doctors
                                        </p>
                                        <p className="mt-1 text-sm font-semibold text-[#0F1115]">
                                            {clinic.doctors_count} doctors
                                            available
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 py-4">
                                    <MapPinIcon className="mt-0.5 size-5 shrink-0 text-[#337983]" />
                                    <div className="min-w-0">
                                        <p className="text-xs font-medium text-[#64748B]">
                                            Location
                                        </p>
                                        <p className="mt-1 text-sm leading-6 text-[#3B3F4A]">
                                            {clinic.address}
                                        </p>
                                        <a
                                            href={mapUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-[#337983] hover:underline"
                                        >
                                            <NavigationIcon className="size-3.5" />
                                            View on map
                                        </a>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-5">
                                <p className="text-sm font-medium text-[#64748B]">
                                    Services at this clinic
                                </p>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {clinic.service_names
                                        .slice(0, 5)
                                        .map((name) => (
                                            <span
                                                key={name}
                                                className="rounded-full border border-[#B9D4D5] px-3 py-1.5 text-xs font-medium text-[#337983]"
                                            >
                                                {name}
                                            </span>
                                        ))}
                                    {clinic.service_names.length > 5 && (
                                        <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-[#64748B]">
                                            +{clinic.service_names.length - 5}{' '}
                                            more
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="mt-12">
                        <div className="flex flex-wrap items-end justify-between gap-4">
                            <div>
                                <p className="text-sm font-medium tracking-[0.18em] text-[#337983] uppercase">
                                    Clinic services
                                </p>
                                <h2 className="mt-2 text-3xl font-medium tracking-tight">
                                    Choose a service
                                </h2>
                            </div>
                            {selectedServiceId && (
                                <Link
                                    href={`/clinics/${clinic.id}`}
                                    className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium hover:border-[#337983]"
                                >
                                    Show all doctors
                                </Link>
                            )}
                        </div>
                        <div className="-mx-4 mt-6 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-3 sm:-mx-6 sm:px-6 lg:-mx-0 lg:px-0">
                            {services.map((service) => (
                                <Link
                                    key={service.id}
                                    href={`/clinics/${clinic.id}?service_id=${service.id}`}
                                    className={`w-[min(76vw,17rem)] shrink-0 snap-start rounded-2xl border bg-white p-4 transition hover:border-[#337983] ${selectedServiceId === service.id ? 'border-[#337983] ring-2 ring-[#337983]/20' : 'border-transparent'}`}
                                >
                                    <div className="mb-3 aspect-[16/8] overflow-hidden rounded-xl bg-[#E3EEF1]">
                                        {service.image ? (
                                            <img src={service.image} alt={service.name} className="size-full object-cover" />
                                        ) : (
                                            <div className="grid size-full place-items-center text-[#337983]/50"><ImageIcon className="size-6" /></div>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <StethoscopeIcon className="size-5 text-[#337983]" />
                                        {selectedServiceId === service.id && (
                                            <span className="text-xs font-semibold text-[#337983]">
                                                Selected
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="mt-3 truncate text-base font-semibold">
                                        {service.name}
                                    </h3>
                                    <p className="mt-1 line-clamp-2 min-h-10 text-xs text-[#64748B]">
                                        {service.description ||
                                            'Professional care from this clinic.'}
                                    </p>
                                    <p className="mt-3 text-sm font-semibold text-[#337983]">
                                        {service.amount > 0
                                            ? `${service.amount.toLocaleString()} MMK`
                                            : 'Contact clinic'}
                                    </p>
                                </Link>
                            ))}
                        </div>
                        {services.length === 0 && (
                            <p className="mt-6 text-[#64748B]">
                                No services have been listed for this clinic
                                yet.
                            </p>
                        )}
                    </section>

                    <section className="mt-14 pb-16">
                        <p className="text-sm font-medium tracking-[0.18em] text-[#337983] uppercase">
                            {selectedServiceId
                                ? 'Doctors for this service'
                                : 'Clinic doctors'}
                        </p>
                        <h2 className="mt-2 text-3xl font-medium tracking-tight">
                            Meet the care team
                        </h2>
                        <div className="mt-6 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
                            {doctors.map((doctor) => (
                                <div key={doctor.id} className="group">
                                    <Link
                                        href={`/clinics/${clinic.id}/doctors/${doctor.id}`}
                                        className="relative block aspect-[4/3] overflow-hidden rounded-[1.5rem] bg-slate-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B0357F]"
                                    >
                                        {doctor.photo ? (
                                            <img
                                                src={doctor.photo}
                                                alt={`Portrait of ${doctor.name}`}
                                                className="size-full object-cover object-top transition duration-700 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="grid size-full place-items-center bg-[#F0E6EE] text-[#B0357F]/60">
                                                <ImageIcon className="size-9" />
                                            </div>
                                        )}
                                        <span className="absolute top-3 left-3 flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold backdrop-blur">
                                            <StarIcon className="size-3 fill-amber-400 text-amber-400" />
                                            {doctor.rating > 0
                                                ? doctor.rating.toFixed(1)
                                                : 'New'}
                                            {doctor.reviews_count > 0 && (
                                                <span className="font-normal text-[#64748B]">
                                                    ({doctor.reviews_count})
                                                </span>
                                            )}
                                        </span>
                                    </Link>
                                    <div className="mt-4 flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <h3 className="text-lg font-medium tracking-tight">
                                                <Link
                                                    href={`/clinics/${clinic.id}/doctors/${doctor.id}`}
                                                    className="hover:text-[#B0357F]"
                                                >
                                                    {doctor.name}
                                                </Link>
                                            </h3>
                                            <p className="text-sm text-[#64748B]">
                                                {doctor.specialization},{' '}
                                                {clinic.name}
                                            </p>
                                            {doctor.experience_years != null && (
                                                <p className="mt-1 text-xs text-[#64748B]">
                                                    {doctor.experience_years}{' '}
                                                    {doctor.experience_years === 1 ? 'year' : 'years'} experience
                                                </p>
                                            )}
                                            <p className="mt-1 flex items-center gap-1 text-sm text-[#64748B]">
                                                <MapPinIcon className="size-3.5" />
                                                {clinic.address}
                                            </p>
                                            <p className="mt-2 flex items-center gap-2 text-sm font-medium text-emerald-700">
                                                <span className="size-2 rounded-full bg-emerald-500" />
                                                Available at this clinic
                                            </p>
                                        </div>
                                        <div className="shrink-0 text-right">
                                            <p className="text-sm font-semibold">
                                                {doctor.price
                                                    ? `${doctor.price.toLocaleString()} MMK`
                                                    : 'Contact'}
                                            </p>
                                            <p className="mb-2 text-[11px] text-[#64748B]">
                                                per visit
                                            </p>
                                            <Link
                                                href={`/clinics/${clinic.id}/doctors/${doctor.id}/availability`}
                                                className="inline-flex rounded-full bg-[#337983] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#24616a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#337983]"
                                            >
                                                Book now
                                            </Link>
                                            <Link
                                                href={`/clinics/${clinic.id}/doctors/${doctor.id}`}
                                                className="mt-2 block text-xs font-medium text-[#64748B] hover:text-[#B0357F]"
                                            >
                                                View profile
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {doctors.length === 0 && (
                            <p className="mt-6 text-[#64748B]">
                                No doctors provide this service at the clinic
                                yet.
                            </p>
                        )}
                    </section>
                </div>
            </main>
        </>
    );
}
