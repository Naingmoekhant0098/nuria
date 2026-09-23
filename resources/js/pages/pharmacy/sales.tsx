import { usePage } from '@inertiajs/react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

type Sale = {
    id: number;
    sale_type: string;
    total: string;
    payment_method: string;
    payment_status: string;
    created_at: string;
    items: {
        id: number;
        description: string;
        quantity: number;
        line_total: string;
    }[];
    reservation?: { patient?: { first_name: string; last_name: string } };
};

export default function SalesIndex() {
    const { sales } = usePage<{ sales: { data: Sale[] } }>().props;

    return (
        <main className="min-h-screen bg-black p-6 text-white">
            <div className="mx-auto max-w-7xl">
                <h1 className="text-2xl font-bold">Clinic Sales</h1>
                <p className="mt-1 text-sm text-gray-400">
                    Every completed checkout creates one clinic-scoped sale
                    record.
                </p>
                <div className="mt-6 overflow-x-auto ">
                    <Table>
                        <TableHeader className="bg-neutral-950">
                            <TableRow className="border-neutral-800 hover:bg-transparent">
                                {[
                                    'Sale #',
                                    'Patient',
                                    'Type',
                                    'Items',
                                    'Payment',
                                    'Status',
                                    'Total',
                                    'Date',
                                ].map((header) => (
                                    <TableHead
                                        className="text-xs font-semibold tracking-wider text-gray-400 uppercase"
                                        key={header}
                                    >
                                        {header}
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sales.data.length ? (
                                sales.data.map((sale) => (
                                    <TableRow
                                        className="border-neutral-800 hover:bg-neutral-800/50"
                                        key={sale.id}
                                    >
                                        <TableCell className="font-medium text-indigo-400">
                                            #{sale.id}
                                        </TableCell>
                                        <TableCell className="text-gray-300">
                                            {sale.reservation?.patient
                                                ? `${sale.reservation.patient.first_name} ${sale.reservation.patient.last_name}`
                                                : 'External / Walk-in'}
                                        </TableCell>
                                        <TableCell className="text-gray-300 capitalize">
                                            {sale.sale_type}
                                        </TableCell>
                                        <TableCell className="min-w-56 text-gray-300">
                                            <p className="font-medium text-white">
                                                {sale.items.length}{' '}
                                                {sale.items.length === 1
                                                    ? 'item'
                                                    : 'items'}
                                            </p>
                                            <ul className="mt-1 space-y-1 text-xs text-gray-400">
                                                {sale.items.map((item) => (
                                                    <li key={item.id}>
                                                        {item.description} ×{' '}
                                                        {item.quantity} —{' '}
                                                        {item.line_total} MMK
                                                    </li>
                                                ))}
                                            </ul>
                                        </TableCell>
                                        <TableCell className="text-gray-300">
                                            {sale.payment_method}
                                        </TableCell>
                                        <TableCell className="text-emerald-400">
                                            {sale.payment_status}
                                        </TableCell>
                                        <TableCell className="font-medium text-white">
                                            {sale.total} MMK
                                        </TableCell>
                                        <TableCell className="text-gray-400">
                                            {new Date(
                                                sale.created_at,
                                            ).toLocaleString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                                hour: 'numeric',
                                                minute: '2-digit',
                                                hour12: true,
                                            })}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        className="py-10 text-center text-gray-500"
                                        colSpan={8}
                                    >
                                        No sales recorded for this clinic.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </main>
    );
}
