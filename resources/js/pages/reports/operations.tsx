import { usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

type Summary = {
    sales_count: number;
    sales_total: string;
    month_sales_total: string;
    reservations_count: number;
    consultations_count: number;
};
type Status = { status: string; total: number };
type Item = { description: string; quantity: number; total: string };
type Sale = {
    id: number;
    sale_type: string;
    total: string;
    payment_method: string;
    payment_status: string;
    created_at: string;
};

export default function OperationsReport() {
    const { summary, reservationStatuses, topItems, recentSales } = usePage<{
        summary: Summary;
        reservationStatuses: Status[];
        topItems: Item[];
        recentSales: Sale[];
    }>().props;

    return (
        <main className="min-h-screen bg-black p-8 text-gray-100">
            <div className="mx-auto max-w-7xl space-y-6">
                <header>
                    <h1 className="text-xl font-extrabold tracking-tight text-white">
                        Operations Report
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Sales, appointments, consultations, and the most-used
                        items.
                    </p>
                </header>
                <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                    <Metric
                        label="Sales"
                        value={summary.sales_count.toLocaleString()}
                    />
                    <Metric
                        label="All-time sales"
                        value={`${summary.sales_total} MMK`}
                    />
                    <Metric
                        label="This month"
                        value={`${summary.month_sales_total} MMK`}
                    />
                    <Metric
                        label="Reservations"
                        value={summary.reservations_count.toLocaleString()}
                    />
                    <Metric
                        label="Consultations"
                        value={summary.consultations_count.toLocaleString()}
                    />
                </section>
                <section className="grid gap-6 lg:grid-cols-2">
                    <Panel title="Reservations by status">
                        <Table cardGrid={false}>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">
                                        Total
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {reservationStatuses.length ? (
                                    reservationStatuses.map((status) => (
                                        <TableRow key={status.status}>
                                            <TableCell>
                                                {status.status}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {status.total}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <EmptyRow
                                        colSpan={2}
                                        message="No reservations found."
                                    />
                                )}
                            </TableBody>
                        </Table>
                    </Panel>
                    <Panel title="Top sold items">
                        <Table cardGrid={false}>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Item</TableHead>
                                    <TableHead className="text-right">
                                        Quantity
                                    </TableHead>
                                    <TableHead className="text-right">
                                        Total
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {topItems.length ? (
                                    topItems.map((item) => (
                                        <TableRow key={item.description}>
                                            <TableCell>
                                                {item.description}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {item.quantity}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {item.total} MMK
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <EmptyRow
                                        colSpan={3}
                                        message="No sales items found."
                                    />
                                )}
                            </TableBody>
                        </Table>
                    </Panel>
                </section>
                <Panel title="Recent sales">
                    <Table cardGrid={false}>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Sale</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Payment</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">
                                    Total
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {recentSales.length ? (
                                recentSales.map((sale) => (
                                    <TableRow key={sale.id}>
                                        <TableCell>#{sale.id}</TableCell>
                                        <TableCell className="capitalize">
                                            {sale.sale_type}
                                        </TableCell>
                                        <TableCell>
                                            {sale.payment_method}
                                        </TableCell>
                                        <TableCell>
                                            {sale.payment_status}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {sale.total} MMK
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <EmptyRow
                                    colSpan={5}
                                    message="No sales found."
                                />
                            )}
                        </TableBody>
                    </Table>
                </Panel>
            </div>
        </main>
    );
}

function Metric({ label, value }: { label: string; value: string }) {
    return (
        <Card className="border-neutral-800 bg-neutral-900 py-0">
            <CardHeader className="px-5 pt-5">
                <CardTitle className="text-sm font-medium text-gray-400">
                    {label}
                </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5 text-2xl font-bold">
                {value}
            </CardContent>
        </Card>
    );
}
function Panel({ title, children }: { title: string; children: ReactNode }) {
    return (
        <section>
            <h2 className="mb-3 text-lg font-semibold">{title}</h2>
            <div className="overflow-x-auto  [&_tbody_tr]:border-neutral-800 [&_tbody_tr]:hover:bg-neutral-800/50 [&_td]:text-gray-300 [&_th]:text-xs [&_th]:font-semibold [&_th]:tracking-wider [&_th]:text-gray-400 [&_th]:uppercase [&_thead]:bg-neutral-950 [&_thead_tr]:border-neutral-800 [&_thead_tr]:hover:bg-transparent">
                {children}
            </div>
        </section>
    );
}
function EmptyRow({ colSpan, message }: { colSpan: number; message: string }) {
    return (
        <TableRow>
            <TableCell
                className="py-10 text-center text-gray-500"
                colSpan={colSpan}
            >
                {message}
            </TableCell>
        </TableRow>
    );
}
