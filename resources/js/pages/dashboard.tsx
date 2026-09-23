import { Head, router, usePage } from '@inertiajs/react';
import {
    Activity,
    CalendarDays,
    ChevronDown,
    Package,
    Users,
} from 'lucide-react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { dashboard } from '@/routes';

type Trend = {
    label: string;
    revenue: number;
    reservations: number;
    consultations: number;
};
type Reservation = {
    id: number;
    appointment_code: string;
    status: string;
    created_at: string;
    patient: { first_name: string; last_name: string };
    doctor: { first_name: string; last_name: string };
};
type Status = { status: string; total: number };
type Stock = { name: string; quantity: number; unit: string };

export default function Dashboard() {
    const {
        clinic,
        filters,
        summary,
        trends,
        reservationStatuses,
        recentReservations,
        lowStock,
    } = usePage<{
        clinic: { name: string };
        filters: { period: string; start_date: string; end_date: string };
        summary: {
            revenue: number;
            reservations: number;
            patients: number;
            consultations: number;
        };
        trends: Trend[];
        reservationStatuses: Status[];
        recentReservations: Reservation[];
        lowStock: Stock[];
    }>().props;
    const [startDate, setStartDate] = useState(filters.start_date);
    const [endDate, setEndDate] = useState(filters.end_date);
    const totalStatuses = reservationStatuses.reduce(
        (sum, item) => sum + item.total,
        0,
    );
    const currency = new Intl.NumberFormat('en-US', {
        maximumFractionDigits: 0,
    });

    function changePeriod(period: string) {
        router.get(
            dashboard.url(),
            { period },
            { preserveState: true, preserveScroll: true },
        );
    }

    function applyCustomRange(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        router.get(
            dashboard.url(),
            { period: 'custom', start_date: startDate, end_date: endDate },
            { preserveState: true, preserveScroll: true },
        );
    }

    return (
        <>
            <Head title="Dashboard" />
            <main className="min-h-full w-full min-w-0 bg-muted/30 px-4 py-6 sm:px-6 lg:px-8">
                <div className="mx-auto w-full max-w-7xl min-w-0 space-y-6">
                    <header className="flex min-w-0 flex-col justify-between gap-4 md:flex-row md:items-end">
                        <div className="min-w-0">
                            <p className="text-sm font-medium text-primary">
                                {clinic.name}
                            </p>
                            <h1 className="mt-1 text-2xl font-semibold tracking-tight">
                                Dashboard
                            </h1>
                            <p className="mt-1 text-sm text-muted-foreground">
                                A clear view of appointments, revenue, and
                                clinic operations.
                            </p>
                        </div>
                        <div className="flex w-full min-w-0 flex-wrap items-center gap-2 md:w-auto md:justify-end">
                            <div className="flex rounded-lg border bg-background p-1">
                                {['daily', 'weekly', 'monthly'].map(
                                    (period) => (
                                        <button
                                            key={period}
                                            onClick={() => changePeriod(period)}
                                            className={`rounded-md px-3 py-1.5 text-sm capitalize transition ${filters.period === period ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}
                                        >
                                            {period}
                                        </button>
                                    ),
                                )}
                            </div>
                            <form
                                onSubmit={applyCustomRange}
                                className="flex w-full min-w-0 items-center gap-1 rounded-lg border bg-background p-1.5 sm:w-auto sm:gap-2"
                            >
                                <input
                                    aria-label="Start date"
                                    type="date"
                                    value={startDate}
                                    onChange={(event) =>
                                        setStartDate(event.target.value)
                                    }
                                    className="min-w-0 flex-1 bg-transparent px-1 text-xs outline-none sm:w-[132px] sm:flex-none"
                                />
                                <span className="text-muted-foreground">–</span>
                                <input
                                    aria-label="End date"
                                    type="date"
                                    value={endDate}
                                    onChange={(event) =>
                                        setEndDate(event.target.value)
                                    }
                                    className="min-w-0 flex-1 bg-transparent px-1 text-xs outline-none sm:w-[132px] sm:flex-none"
                                />
                                <button
                                    type="submit"
                                    className={`rounded-md px-3 py-1.5 text-sm transition ${filters.period === 'custom' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/70'}`}
                                >
                                    Apply
                                </button>
                            </form>
                        </div>
                    </header>

                    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <MetricCard
                            label="Revenue"
                            value={`${currency.format(summary.revenue)} MMK`}
                            detail="For selected period"
                            icon={<Activity className="size-4" />}
                            accent="text-emerald-600"
                        />
                        <MetricCard
                            label="Reservations"
                            value={summary.reservations.toLocaleString()}
                            detail="Appointments booked"
                            icon={<CalendarDays className="size-4" />}
                            accent="text-blue-600"
                        />
                        <MetricCard
                            label="Patients"
                            value={summary.patients.toLocaleString()}
                            detail="Unique patients seen"
                            icon={<Users className="size-4" />}
                            accent="text-violet-600"
                        />
                        <MetricCard
                            label="Consultations"
                            value={summary.consultations.toLocaleString()}
                            detail="Completed consultations"
                            icon={<Activity className="size-4" />}
                            accent="text-amber-600"
                        />
                    </section>

                    <section className="grid gap-4 xl:grid-cols-3">
                        <TrendCard
                            title="Revenue trend"
                            subtitle="Sales total · MMK"
                            data={trends}
                            valueKey="revenue"
                            color="#10b981"
                            format={(value) => currency.format(value)}
                        />
                        <TrendCard
                            title="Reservations trend"
                            subtitle="Bookings created"
                            data={trends}
                            valueKey="reservations"
                            color="#3b82f6"
                        />
                        <TrendCard
                            title="Consultations trend"
                            subtitle="Consultations recorded"
                            data={trends}
                            valueKey="consultations"
                            color="#8b5cf6"
                        />
                    </section>

                    <section className="grid gap-4 xl:grid-cols-3">
                        <Card className="xl:col-span-1">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base">
                                    Reservation status
                                </CardTitle>
                                <p className="text-sm text-muted-foreground">
                                    Selected period · {totalStatuses} total
                                </p>
                            </CardHeader>
                            <CardContent>
                                {totalStatuses === 0 ? (
                                    <EmptyState message="No reservations in this period." />
                                ) : (
                                    <div className="flex flex-col items-center gap-5 py-3 sm:flex-row xl:flex-col 2xl:flex-row">
                                        <div
                                            className="size-40 shrink-0 rounded-full"
                                            style={{
                                                background: pieGradient(
                                                    reservationStatuses,
                                                    totalStatuses,
                                                ),
                                            }}
                                            role="img"
                                            aria-label="Reservations by status chart"
                                        >
                                            <div className="m-7 flex size-26 flex-col items-center justify-center rounded-full bg-card">
                                                <strong className="text-2xl">
                                                    {totalStatuses}
                                                </strong>
                                                <span className="text-xs text-muted-foreground">
                                                    reservations
                                                </span>
                                            </div>
                                        </div>
                                        <div className="w-full space-y-3">
                                            {reservationStatuses.map(
                                                (item, index) => (
                                                    <div
                                                        key={item.status}
                                                        className="flex items-center justify-between gap-3 text-sm"
                                                    >
                                                        <span className="flex items-center gap-2">
                                                            <span
                                                                className="size-2.5 rounded-full"
                                                                style={{
                                                                    backgroundColor:
                                                                        chartColors[
                                                                            index %
                                                                                chartColors.length
                                                                        ],
                                                                }}
                                                            />
                                                            {item.status}
                                                        </span>
                                                        <span className="font-medium">
                                                            {item.total}{' '}
                                                            <span className="text-muted-foreground">
                                                                (
                                                                {Math.round(
                                                                    (item.total /
                                                                        totalStatuses) *
                                                                        100,
                                                                )}
                                                                %)
                                                            </span>
                                                        </span>
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="xl:col-span-2">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base">
                                    Recent reservations
                                </CardTitle>
                                <p className="text-sm text-muted-foreground">
                                    Latest appointments for your clinic
                                </p>
                            </CardHeader>
                            <CardContent>
                                {recentReservations.length === 0 ? (
                                    <EmptyState message="No reservations have been added yet." />
                                ) : (
                                    <Table cardGrid={false}>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>
                                                    Appointment
                                                </TableHead>
                                                <TableHead>Patient</TableHead>
                                                <TableHead>Doctor</TableHead>
                                                <TableHead>Date</TableHead>
                                                <TableHead>Status</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {recentReservations.map(
                                                (reservation) => (
                                                    <TableRow
                                                        key={reservation.id}
                                                    >
                                                        <TableCell>
                                                            {
                                                                reservation.appointment_code
                                                            }
                                                        </TableCell>
                                                        <TableCell>
                                                            {
                                                                reservation
                                                                    .patient
                                                                    .first_name
                                                            }{' '}
                                                            {
                                                                reservation
                                                                    .patient
                                                                    .last_name
                                                            }
                                                        </TableCell>
                                                        <TableCell>
                                                            Dr.{' '}
                                                            {
                                                                reservation
                                                                    .doctor
                                                                    .first_name
                                                            }{' '}
                                                            {
                                                                reservation
                                                                    .doctor
                                                                    .last_name
                                                            }
                                                        </TableCell>
                                                        <TableCell>
                                                            {new Date(
                                                                reservation.created_at,
                                                            ).toLocaleDateString()}
                                                        </TableCell>
                                                        <TableCell>
                                                            {reservation.status}
                                                        </TableCell>
                                                    </TableRow>
                                                ),
                                            )}
                                        </TableBody>
                                    </Table>
                                )}
                            </CardContent>
                        </Card>
                    </section>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Package className="size-4 text-amber-600" />
                                Stock to watch
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">
                                Active items with 10 or fewer units remaining
                            </p>
                        </CardHeader>
                        <CardContent>
                            {lowStock.length === 0 ? (
                                <EmptyState message="No low stock items. Your supplies are looking good." />
                            ) : (
                                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                    {lowStock.map((item, index) => (
                                        <div
                                            key={`${item.name}-${index}`}
                                            className="flex items-center justify-between rounded-lg border bg-background px-4 py-3"
                                        >
                                            <div className="flex min-w-0 items-center gap-3">
                                                <span className="rounded-md bg-amber-500/10 p-2 text-amber-700">
                                                    <Package className="size-4" />
                                                </span>
                                                <span className="truncate text-sm font-medium">
                                                    {item.name}
                                                </span>
                                            </div>
                                            <span className="ml-3 shrink-0 text-sm font-semibold text-amber-700">
                                                {item.quantity} {item.unit}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </main>
        </>
    );
}

const chartColors = [
    '#3b82f6',
    '#10b981',
    '#f59e0b',
    '#8b5cf6',
    '#ef4444',
    '#06b6d4',
];

function MetricCard({
    label,
    value,
    detail,
    icon,
    accent,
}: {
    label: string;
    value: string;
    detail: string;
    icon: React.ReactNode;
    accent: string;
}) {
    return (
        <Card>
            <CardContent className="flex items-start justify-between p-5 py-1">
                <div>
                    <p className="text-sm text-muted-foreground">{label}</p>
                    <p className="mt-2 text-2xl font-semibold tracking-tight">
                        {value}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                        {detail}
                    </p>
                </div>
                <span className={`rounded-lg bg-muted p-2.5 ${accent}`}>
                    {icon}
                </span>
            </CardContent>
        </Card>
    );
}

function TrendCard({
    title,
    subtitle,
    data,
    valueKey,
    color,
    format = (value: number) => value.toLocaleString(),
}: {
    title: string;
    subtitle: string;
    data: Trend[];
    valueKey: 'revenue' | 'reservations' | 'consultations';
    color: string;
    format?: (value: number) => string;
}) {
    const values = data.map((item) => item[valueKey]);
    const max = Math.max(...values, 1);
    const points = values
        .map(
            (value, index) =>
                `${data.length < 2 ? 50 : 12 + (index * 76) / (data.length - 1)},${92 - (value / max) * 72}`,
        )
        .join(' ');
    const selected =
        data.length > 8
            ? data.filter(
                  (_, index) =>
                      index % Math.ceil(data.length / 6) === 0 ||
                      index === data.length - 1,
              )
            : data;

    return (
        <Card>
            <CardHeader className="pb-0">
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle className="text-base">{title}</CardTitle>
                        <p className="mt-1 text-xs text-muted-foreground">
                            {subtitle}
                        </p>
                    </div>
                    <ChevronDown className="size-4 text-muted-foreground" />
                </div>
            </CardHeader>
            <CardContent className="pt-3">
                <div className="mb-1 flex items-baseline gap-2">
                    <span className="text-2xl font-semibold">
                        {format(values.reduce((sum, value) => sum + value, 0))}
                    </span>
                    <span className="text-xs text-muted-foreground">total</span>
                </div>
                <svg
                    viewBox="0 0 100 100"
                    className="h-32 w-full overflow-visible"
                    preserveAspectRatio="none"
                    aria-label={`${title} line chart`}
                    role="img"
                >
                    <line
                        x1="0"
                        y1="20"
                        x2="100"
                        y2="20"
                        stroke="currentColor"
                        className="text-border"
                        strokeDasharray="1 2"
                    />
                    <line
                        x1="0"
                        y1="55"
                        x2="100"
                        y2="55"
                        stroke="currentColor"
                        className="text-border"
                        strokeDasharray="1 2"
                    />
                    <line
                        x1="0"
                        y1="92"
                        x2="100"
                        y2="92"
                        stroke="currentColor"
                        className="text-border"
                        strokeDasharray="1 2"
                    />
                    <polyline
                        points={points}
                        fill="none"
                        stroke={color}
                        strokeWidth="2.2"
                        vectorEffect="non-scaling-stroke"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    {values.map((value, index) => (
                        <circle
                            key={index}
                            cx={
                                data.length < 2
                                    ? 50
                                    : 12 + (index * 76) / (data.length - 1)
                            }
                            cy={92 - (value / max) * 72}
                            r="1.8"
                            fill={color}
                            vectorEffect="non-scaling-stroke"
                        >
                            <title>
                                {data[index].label}: {format(value)}
                            </title>
                        </circle>
                    ))}
                </svg>
                <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>{selected[0]?.label}</span>
                    <span>
                        {selected[Math.floor(selected.length / 2)]?.label}
                    </span>
                    <span>{selected.at(-1)?.label}</span>
                </div>
            </CardContent>
        </Card>
    );
}

function EmptyState({ message }: { message: string }) {
    return (
        <div className="flex min-h-28 items-center justify-center rounded-lg border border-dashed text-center text-sm text-muted-foreground">
            {message}
        </div>
    );
}

function pieGradient(items: Status[], total: number): string {
    let offset = 0;
    const segments = items.map((item, index) => {
        const start = offset;
        offset += (item.total / total) * 100;

        return `${chartColors[index % chartColors.length]} ${start}% ${offset}%`;
    });

    return `conic-gradient(${segments.join(', ')})`;
}

Dashboard.layout = {
    breadcrumbs: [{ title: 'Dashboard', href: dashboard() }],
};
