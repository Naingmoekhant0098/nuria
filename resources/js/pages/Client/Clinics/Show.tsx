import { Head, Link } from '@inertiajs/react';

type Clinic = {
    id: number;
    clinic_name: string;
    complete_address: string;
};

type Props = {
    clinic: Clinic;
};

export default function Show({ clinic }: Props) {
    return (
        <>
            <Head>
                <title>{clinic.clinic_name} | Clinic</title>

                <meta
                    name="description"
                    content={`View ${clinic.clinic_name}, doctors and medical services.`}
                />
            </Head>

            <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
                <Link
                    className="text-sm font-medium text-teal-700 hover:underline"
                    href="/clinics"
                >
                    ← All clinics
                </Link>
                <section className="mt-5 rounded-3xl border bg-white p-7 shadow-sm sm:p-10">
                    <p className="text-sm font-semibold tracking-wider text-teal-700 uppercase">
                        Clinic
                    </p>
                    <h1 className="mt-2 text-3xl font-bold tracking-tight">
                        {clinic.clinic_name}
                    </h1>

                    <p className="mt-3 text-slate-600">
                        {clinic.complete_address}
                    </p>

                    <div className="mt-7 flex flex-wrap gap-3">
                        <Link
                            className="rounded-lg bg-teal-700 px-5 py-3 font-semibold text-white hover:bg-teal-800"
                            href={`/clinics/${clinic.id}/doctors`}
                        >
                            View Doctors
                        </Link>
                    </div>
                </section>
            </main>
        </>
    );
}
