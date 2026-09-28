import { Head, Link } from '@inertiajs/react';

type Clinic = {
    id: number;
    clinic_name: string;
    doctors_count: number;
};

type Doctor = {
    id: string;
    first_name: string;
    last_name: string;
    photo_url?: string | null;
    specialization?: { name: string } | null;
    clinics: { id: number; clinic_name: string }[];
};

type Service = {
    id: number;
    service_name: string;
    service_description?: string | null;
    amount: number | string;
    clinic: { id: number; clinic_name: string };
    doctor: { id: string; first_name: string; last_name: string };
};

type Props = {
    clinics: Clinic[];
    doctors: Doctor[];
    services: Service[];
};

export default function Home({ clinics, doctors, services }: Props) {
    
    return (
        <>
            <Head>
                <title>Find a Clinic | Medical Care</title>

                <meta
                    name="description"
                    content="Find clinics, doctors and medical services and book your appointment online."
                />
            </Head>

            <main className="mx-auto max-w-7xl space-y-14 px-4 py-12 sm:px-6 lg:py-16">
                <section className="rounded-3xl bg-gradient-to-br from-teal-800 to-cyan-700 px-6 py-12 text-white sm:px-10 lg:px-14">
                    <p className="text-sm font-semibold tracking-[0.18em] text-teal-100 uppercase">
                        Patient care, made simple
                    </p>
                    <h1 className="mt-3 max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
                        Find the right clinic and doctor
                    </h1>

                    <p>
                        Search clinics, doctors and medical services and book
                        your appointment online.
                    </p>

                    <Link
                        className="mt-7 inline-flex rounded-lg bg-white px-5 py-3 font-semibold text-teal-800 shadow-sm hover:bg-teal-50"
                        href="/clinics"
                    >
                        Find a Clinic
                    </Link>
                </section>

                <section>
                    <div className="mb-5 flex items-end justify-between">
                        <div>
                            <p className="text-sm font-semibold tracking-wider text-teal-700 uppercase">
                                Care near you
                            </p>
                            <h2 className="mt-1 text-2xl font-semibold">
                                Featured clinics
                            </h2>
                        </div>
                        <Link
                            className="text-sm font-semibold text-teal-700 hover:underline"
                            href="/clinics"
                        >
                            Browse all clinics
                        </Link>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {clinics.map((clinic) => (
                            <article
                                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                                key={clinic.id}
                            >
                                <h3 className="text-lg font-semibold">
                                    {clinic.clinic_name}
                                </h3>

                                <p className="mt-2 text-sm text-slate-600">
                                    {clinic.doctors_count} doctors
                                </p>

                                <Link
                                    className="mt-4 inline-flex text-sm font-semibold text-teal-700 hover:underline"
                                    href={`/clinics/${clinic.id}`}
                                >
                                    View Clinic
                                </Link>
                            </article>
                        ))}
                    </div>
                </section>

                <section>
                    <div className="mb-5">
                        <p className="text-sm font-semibold tracking-wider text-teal-700 uppercase">
                            Meet the care team
                        </p>
                        <h2 className="mt-1 text-2xl font-semibold">Doctors</h2>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {doctors.map((doctor) => (
                            <article
                                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                                key={doctor.id}
                            >
                                {doctor.photo_url ? (
                                    <img
                                        src={doctor.photo_url}
                                        alt={`Dr. ${doctor.first_name} ${doctor.last_name}`}
                                        className="mb-4 aspect-[4/3] w-full rounded-xl object-cover"
                                    />
                                ) : (
                                    <div className="mb-4 flex aspect-[4/3] w-full items-center justify-center rounded-xl bg-teal-50 text-4xl font-semibold text-teal-800">
                                        {doctor.first_name[0]}
                                        {doctor.last_name[0]}
                                    </div>
                                )}
                                <h3 className="font-semibold">
                                    Dr. {doctor.first_name} {doctor.last_name}
                                </h3>
                                <p className="mt-1 text-sm text-slate-600">
                                    {doctor.specialization?.name ??
                                        'General practice'}
                                </p>
                                {doctor.clinics[0] && (
                                    <Link
                                        className="mt-4 inline-flex text-sm font-semibold text-teal-700 hover:underline"
                                        href={`/clinics/${doctor.clinics[0].id}/doctors/${doctor.id}`}
                                    >
                                        View profile at{' '}
                                        {doctor.clinics[0].clinic_name}
                                    </Link>
                                )}
                            </article>
                        ))}
                    </div>
                </section>

                <section>
                    <div className="mb-5">
                        <p className="text-sm font-semibold tracking-wider text-teal-700 uppercase">
                            Available care
                        </p>
                        <h2 className="mt-1 text-2xl font-semibold">
                            Services
                        </h2>
                        <p className="mt-2 text-slate-600">
                            Services are listed once, even when offered by
                            multiple doctors.
                        </p>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {services.map((service) => (
                            <article
                                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                                key={service.id}
                            >
                                <h3 className="font-semibold">
                                    {service.service_name}
                                </h3>
                                {service.service_description && (
                                    <p className="mt-2 text-sm text-slate-600">
                                        {service.service_description}
                                    </p>
                                )}
                                <p className="mt-3 text-sm font-semibold text-teal-800">
                                    {Number(service.amount).toLocaleString()}{' '}
                                    MMK
                                </p>
                                <Link
                                    className="mt-3 inline-flex text-sm font-semibold text-teal-700 hover:underline"
                                    href={`/clinics/${service.clinic.id}/doctors/${service.doctor.id}`}
                                >
                                    {service.clinic.clinic_name} · Dr.{' '}
                                    {service.doctor.first_name}{' '}
                                    {service.doctor.last_name}
                                </Link>
                            </article>
                        ))}
                    </div>
                </section>
            </main>
        </>
    );
}
