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
    available_drug_units: number;
    expiring_drug_units: number;
    expired_drug_units: number;
    medical_product_units: number;
};

type DrugStock = {
    name: string;
    strength: string | null;
    available_quantity: number;
    expiring_quantity: number;
    expired_quantity: number;
};

type MedicalStock = {
    name: string;
    quantity: number;
    sale_price: string;
    is_active: boolean;
};

export default function StockReport() {
    const { summary, drugStock, medicalStock } = usePage<{
        summary: Summary;
        drugStock: DrugStock[];
        medicalStock: MedicalStock[];
    }>().props;

    return (
        <main className="min-h-screen bg-black p-8 text-gray-100">
            <div className="mx-auto max-w-7xl space-y-6">
                <header>
                    <h1 className="text-xl font-extrabold tracking-tight text-white">
                        Stock Report
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Current stock levels, expiry exposure, and clinical
                        supplies.
                    </p>
                </header>

                <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <SummaryCard
                        label="Available drug units"
                        value={summary.available_drug_units}
                    />
                    <SummaryCard
                        label="Expiring in 30 days"
                        value={summary.expiring_drug_units}
                        tone="text-amber-400"
                    />
                    <SummaryCard
                        label="Expired units"
                        value={summary.expired_drug_units}
                        tone="text-rose-400"
                    />
                    <SummaryCard
                        label="Medical product units"
                        value={summary.medical_product_units}
                    />
                </section>

                <ReportTable
                    title="Drug stock by product"
                    headers={[
                        'Drug',
                        'Available',
                        'Expiring in 30 days',
                        'Expired',
                    ]}
                    emptyMessage="No drug stock found."
                >
                    {drugStock.map((stock) => (
                        <TableRow key={`${stock.name}-${stock.strength ?? ''}`}>
                            <TableCell className="font-medium text-white">
                                {stock.name}
                                {stock.strength ? ` (${stock.strength})` : ''}
                            </TableCell>
                            <TableCell>{stock.available_quantity}</TableCell>
                            <TableCell className="text-amber-400">
                                {stock.expiring_quantity}
                            </TableCell>
                            <TableCell className="text-rose-400">
                                {stock.expired_quantity}
                            </TableCell>
                        </TableRow>
                    ))}
                </ReportTable>

                <ReportTable
                    title="Medical product stock"
                    headers={['Product', 'Quantity', 'Sale price', 'Status']}
                    emptyMessage="No medical product stock found."
                >
                    {medicalStock.map((stock) => (
                        <TableRow key={stock.name}>
                            <TableCell className="font-medium text-white">
                                {stock.name}
                            </TableCell>
                            <TableCell>{stock.quantity}</TableCell>
                            <TableCell>{stock.sale_price} MMK</TableCell>
                            <TableCell
                                className={
                                    stock.is_active
                                        ? 'text-emerald-400'
                                        : 'text-gray-500'
                                }
                            >
                                {stock.is_active ? 'Active' : 'Inactive'}
                            </TableCell>
                        </TableRow>
                    ))}
                </ReportTable>
            </div>
        </main>
    );
}

function SummaryCard({
    label,
    value,
    tone = 'text-white',
}: {
    label: string;
    value: number;
    tone?: string;
}) {
    return (
        <Card className="border-neutral-800 bg-neutral-900 py-0">
            <CardHeader className="px-5 pt-5">
                <CardTitle className="text-sm font-medium text-gray-400">
                    {label}
                </CardTitle>
            </CardHeader>
            <CardContent className={`px-5 pb-5 text-3xl font-bold ${tone}`}>
                {value.toLocaleString()}
            </CardContent>
        </Card>
    );
}

function ReportTable({
    title,
    headers,
    emptyMessage,
    children,
}: {
    title: string;
    headers: string[];
    emptyMessage: string;
    children: ReactNode;
}) {
    const hasRows = Array.isArray(children) && children.length > 0;

    return (
        <section>
            <h2 className="mb-3 text-lg font-semibold">{title}</h2>
            <div className="overflow-x-auto  [&_tbody_tr]:border-neutral-800 [&_tbody_tr]:hover:bg-neutral-800/50 [&_td]:text-gray-300 [&_th]:text-xs [&_th]:font-semibold [&_th]:tracking-wider [&_th]:text-gray-400 [&_th]:uppercase [&_thead]:bg-neutral-950 [&_thead_tr]:border-neutral-800 [&_thead_tr]:hover:bg-transparent">
                <Table cardGrid={false}>
                    <TableHeader className="bg-neutral-950">
                        <TableRow>
                            {headers.map((header) => (
                                <TableHead key={header}>{header}</TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {hasRows ? (
                            children
                        ) : (
                            <TableRow>
                                <TableCell
                                    className="py-10 text-center text-gray-500"
                                    colSpan={headers.length}
                                >
                                    {emptyMessage}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </section>
    );
}
