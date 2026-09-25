import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

type TrendPoint = { label: string; value: number };
type PieValue = { label: string; value: number };
type Clinic = {
    id: number;
    clinic_name: string;
    status: string;
    doctors_count: number;
    services_count: number;
    created_at: string;
};
type Person = { first_name: string; last_name: string };
type OnlineOrder = {
    id: number;
    order_status: string;
    payment_status: string;
    total: number | string;
    created_at: string;
    clinic: { clinic_name: string };
    patient: Person | null;
};
type Props = {
    summary: Array<{ label: string; value: number; href: string }>;
    financialSummary: Array<{ label: string; amount: number | string }>;
    reservationTrend: TrendPoint[];
    revenueTrend: TrendPoint[];
    reservationStatuses: PieValue[];
    clinicStatuses: PieValue[];
    clinics: Clinic[];
    reservations: Array<{
        id: number;
        appointment_code: string;
        clinic: { clinic_name: string };
        doctor: Person;
        patient: Person;
        status: string;
        amount: number | string;
        created_at: string;
    }>;
    inventoryMovements: Array<{
        id: number;
        clinic: { clinic_name: string };
        drug: { name: string } | null;
        medical_product: { name: string } | null;
        transaction_type: string;
        quantity: number;
        reference: string | null;
        created_at: string;
    }>;
    onlineOrderSummary: {
        orders_count: number;
        paid_total: number;
        pending_payment_count: number;
    } | null;
    recentOnlineOrders: OnlineOrder[];
};

const amount = (value: number | string) =>
    `${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MMK`;

export default function AdminDashboard({
    summary,
    financialSummary,
    reservationTrend,
    revenueTrend,
    reservationStatuses,
    clinicStatuses,
    clinics,
    reservations,
    inventoryMovements,
    onlineOrderSummary,
    recentOnlineOrders,
}: Props) {
    return (
        <>
            <Head title="Admin dashboard" />
            <main className="flex flex-1 flex-col gap-7 p-6">
                <header>
                    <h1 className="text-2xl font-semibold">Admin dashboard</h1>
                    <p className="text-muted-foreground">
                        Clinic network activity, inventory, and financial
                        overview.
                    </p>
                </header>

                <section className="space-y-3">
                    <h2 className="text-lg font-semibold">System overview</h2>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                        {summary.map((item) => (
                            <Link
                                key={item.label}
                                href={item.href}
                                className="block rounded-lg focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                            >
                                <Card className="h-full transition-colors hover:bg-muted/50">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium text-muted-foreground">
                                            {item.label}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-2xl font-semibold">
                                            {item.value.toLocaleString()}
                                        </p>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            View details
                                        </p>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </section>

                {onlineOrderSummary && (
                    <>
                        <section className="space-y-3">
                            <div className="flex items-center justify-between gap-3">
                                <h2 className="text-lg font-semibold">
                                    Online orders
                                </h2>
                                <Link
                                    href="/admin/orders"
                                    className="text-sm font-medium text-primary hover:underline"
                                >
                                    Open order report
                                </Link>
                            </div>
                            <div className="grid gap-3 sm:grid-cols-3">
                                {[
                                    [
                                        'All online orders',
                                        onlineOrderSummary.orders_count.toLocaleString(),
                                    ],
                                    [
                                        'Paid order value',
                                        amount(onlineOrderSummary.paid_total),
                                    ],
                                    [
                                        'Awaiting payment',
                                        onlineOrderSummary.pending_payment_count.toLocaleString(),
                                    ],
                                ].map(([label, value]) => (
                                    <Link
                                        key={label}
                                        href="/admin/orders"
                                        className="block rounded-lg focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                                    >
                                        <Card className="h-full transition-colors hover:bg-muted/50">
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                                    {label}
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <p className="text-2xl font-semibold">
                                                    {value}
                                                </p>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        </section>
                        <DataTable
                            title="Recent online orders"
                            headers={[
                                'Order',
                                'Date',
                                'Clinic',
                                'Patient',
                                'Order status',
                                'Payment status',
                                'Total',
                            ]}
                            rows={recentOnlineOrders.map((order) => [
                                `#${order.id}`,
                                new Date(order.created_at).toLocaleDateString(),
                                order.clinic.clinic_name,
                                order.patient
                                    ? `${order.patient.first_name} ${order.patient.last_name}`
                                    : 'Patient unavailable',
                                order.order_status,
                                order.payment_status,
                                amount(order.total),
                            ])}
                        />
                    </>
                )}

                <section className="space-y-3">
                    <h2 className="text-lg font-semibold">
                        Financial overview
                    </h2>
                    <div className="grid gap-3 sm:grid-cols-3">
                        {financialSummary.map((item) => (
                            <Card key={item.label}>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">
                                        {item.label}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-xl font-semibold">
                                        {amount(item.amount)}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>

                <div className="grid gap-4 xl:grid-cols-2">
                    <TrendChart
                        title="Reservations · last 6 months"
                        data={reservationTrend}
                        valueFormatter={(value) => value.toLocaleString()}
                    />
                    <TrendChart
                        title="Sales revenue · last 6 months"
                        data={revenueTrend}
                        valueFormatter={(value) =>
                            `${Math.round(value).toLocaleString()} MMK`
                        }
                    />
                </div>

                <div className="grid gap-4 xl:grid-cols-2">
                    <PieChart
                        title="Reservations by status"
                        data={reservationStatuses}
                    />
                    <PieChart title="Clinics by status" data={clinicStatuses} />
                </div>

                <DataTable
                    title="Recent reservations"
                    headers={[
                        'Date',
                        'Appointment',
                        'Clinic',
                        'Patient',
                        'Doctor',
                        'Status',
                        'Charge',
                    ]}
                    rows={reservations.map((reservation) => [
                        new Date(reservation.created_at).toLocaleDateString(),
                        reservation.appointment_code,
                        reservation.clinic.clinic_name,
                        `${reservation.patient.first_name} ${reservation.patient.last_name}`,
                        `${reservation.doctor.first_name} ${reservation.doctor.last_name}`,
                        reservation.status,
                        amount(reservation.amount),
                    ])}
                />
                <DataTable
                    title="Recent inventory movements"
                    headers={[
                        'Date',
                        'Clinic',
                        'Item',
                        'Movement',
                        'Quantity',
                        'Reference',
                    ]}
                    rows={inventoryMovements.map((movement) => [
                        new Date(movement.created_at).toLocaleString(),
                        movement.clinic.clinic_name,
                        movement.drug?.name ??
                            movement.medical_product?.name ??
                            'Deleted catalog item',
                        movement.transaction_type,
                        movement.quantity,
                        movement.reference ?? '—',
                    ])}
                />
                <DataTable
                    title="Recently registered clinics"
                    headers={[
                        'Clinic',
                        'Status',
                        'Doctors',
                        'Services',
                        'Registered',
                    ]}
                    rows={clinics.map((clinic) => [
                        clinic.clinic_name,
                        clinic.status,
                        clinic.doctors_count,
                        clinic.services_count,
                        new Date(clinic.created_at).toLocaleDateString(),
                    ])}
                />
            </main>
        </>
    );
}

function TrendChart({
    title,
    data,
    valueFormatter,
}: {
    title: string;
    data: TrendPoint[];
    valueFormatter: (value: number) => string;
}) {
    const width = 620;
    const height = 230;
    const padding = { top: 18, right: 20, bottom: 36, left: 54 };
    const plotWidth = width - padding.left - padding.right;
    const plotHeight = height - padding.top - padding.bottom;
    const maximum = Math.max(1, ...data.map((point) => point.value));
    const points = data.map((point, index) => ({
        ...point,
        x:
            padding.left +
            (data.length > 1
                ? (index * plotWidth) / (data.length - 1)
                : plotWidth / 2),
        y: padding.top + plotHeight - (point.value / maximum) * plotHeight,
    }));

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <svg
                        viewBox={`0 0 ${width} ${height}`}
                        role="img"
                        aria-label={title}
                        className="w-full min-w-[480px] text-muted-foreground"
                    >
                        {[0, 1, 2, 3].map((step) => {
                            const y = padding.top + (step * plotHeight) / 3;

                            return (
                                <g key={step}>
                                    <line
                                        x1={padding.left}
                                        x2={width - padding.right}
                                        y1={y}
                                        y2={y}
                                        className="stroke-border"
                                        strokeDasharray="4 5"
                                    />
                                    <text
                                        x={padding.left - 8}
                                        y={y + 4}
                                        textAnchor="end"
                                        className="fill-current text-[10px]"
                                    >
                                        {valueFormatter(
                                            (maximum * (3 - step)) / 3,
                                        )}
                                    </text>
                                </g>
                            );
                        })}
                        {points.length > 1 && (
                            <polyline
                                points={points
                                    .map((point) => `${point.x},${point.y}`)
                                    .join(' ')}
                                fill="none"
                                className="stroke-primary"
                                strokeWidth="3"
                                strokeLinejoin="round"
                                strokeLinecap="round"
                            />
                        )}
                        {points.map((point) => (
                            <g key={point.label}>
                                <circle
                                    cx={point.x}
                                    cy={point.y}
                                    r="4"
                                    className="fill-primary stroke-background"
                                    strokeWidth="2"
                                >
                                    <title>
                                        {point.label}:{' '}
                                        {valueFormatter(point.value)}
                                    </title>
                                </circle>
                                <text
                                    x={point.x}
                                    y={height - 10}
                                    textAnchor="middle"
                                    className="fill-current text-[11px]"
                                >
                                    {point.label}
                                </text>
                            </g>
                        ))}
                    </svg>
                </div>
            </CardContent>
        </Card>
    );
}

const pieColors = [
    '#2563eb',
    '#16a34a',
    '#eab308',
    '#dc2626',
    '#9333ea',
    '#0891b2',
    '#f97316',
];

function PieChart({ title, data }: { title: string; data: PieValue[] }) {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    const circumference = 2 * Math.PI * 42;
    const pieSegments = data
        .filter((item) => item.value > 0)
        .map((item, index, values) => ({
            item,
            index,
            length: (item.value / (total || 1)) * circumference,
            offset:
                (values
                    .slice(0, index)
                    .reduce(
                        (sum, previousItem) => sum + previousItem.value,
                        0,
                    ) /
                    (total || 1)) *
                circumference,
        }));

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-wrap items-center justify-center gap-6 sm:justify-start">
                    <svg
                        viewBox="0 0 120 120"
                        role="img"
                        aria-label={`${title}, ${total} total`}
                        className="size-36 shrink-0 -rotate-90"
                    >
                        <circle
                            cx="60"
                            cy="60"
                            r="42"
                            fill="none"
                            stroke="currentColor"
                            className="text-muted"
                            strokeWidth="16"
                        />
                        {pieSegments.map(({ item, index, length, offset }) => {
                            return (
                                <circle
                                    key={item.label}
                                    cx="60"
                                    cy="60"
                                    r="42"
                                    fill="none"
                                    stroke={pieColors[index % pieColors.length]}
                                    strokeWidth="16"
                                    strokeDasharray={`${length} ${circumference - length}`}
                                    strokeDashoffset={-offset}
                                >
                                    <title>
                                        {item.label}: {item.value}
                                    </title>
                                </circle>
                            );
                        })}
                    </svg>
                    <div className="min-w-40 flex-1 space-y-2">
                        {data.length ? (
                            data.map((item, index) => (
                                <div
                                    key={item.label}
                                    className="flex items-center justify-between gap-4 text-sm"
                                >
                                    <span className="flex items-center gap-2">
                                        <span
                                            className="size-2.5 rounded-sm"
                                            style={{
                                                backgroundColor:
                                                    pieColors[
                                                        index % pieColors.length
                                                    ],
                                            }}
                                        />
                                        {item.label}
                                    </span>
                                    <span className="font-medium tabular-nums">
                                        {item.value.toLocaleString()}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                No data available.
                            </p>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function DataTable({
    title,
    headers,
    rows,
}: {
    title: string;
    headers: string[];
    rows: (string | number)[][];
}) {
    return (
        <section className="space-y-3">
            <h2 className="text-lg font-semibold">{title}</h2>
            <div className="overflow-x-auto rounded-lg border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {headers.map((heading) => (
                                <TableHead key={heading}>{heading}</TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {rows.map((row, rowIndex) => (
                            <TableRow key={rowIndex}>
                                {row.map((cell, cellIndex) => (
                                    <TableCell key={cellIndex}>
                                        {cell}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                        {rows.length === 0 && (
                            <TableRow>
                                <TableCell
                                    colSpan={headers.length}
                                    className="py-8 text-center text-muted-foreground"
                                >
                                    No data available.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </section>
    );
}
