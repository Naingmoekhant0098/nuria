import { Link, router, usePage } from '@inertiajs/react';
import { index as paymentMethodsRoute } from '@/actions/App/Http/Controllers/PaymentMethodController';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

type Payment = {
    id: number;
    amount: string;
    payment_method: string;
    payment_status: string;
    transaction_code: string | null;
    payment_image_path: string | null;
    created_at: string;
    reservation: {
        appointment_code: string;
        patient?: { first_name: string; last_name: string };
    };
};

export default function PaymentReportIndex() {
    const { payments } = usePage<{
        payments: { data: Payment[] };
    }>().props;

    function updatePayment(paymentId: number, fields: Record<string, string>) {
        router.patch(`/clinic/payments/${paymentId}`, fields, {
            preserveScroll: true,
        });
    }

    return (
        <main className="min-h-screen bg-black p-8 text-gray-100">
            <div className="mx-auto max-w-7xl space-y-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-xl font-extrabold tracking-tight text-white">
                            Payment Transaction Report
                        </h1>
                        <p className="mt-1 text-sm text-gray-500">
                            A record of payments received for this clinic.
                        </p>
                    </div>
                    <Button
                        asChild
                        variant="outline"
                        className="border-neutral-800 bg-neutral-900"
                    >
                        <Link href={paymentMethodsRoute.url()}>
                            Payment methods
                        </Link>
                    </Button>
                </div>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-neutral-950">
                            <TableRow className="border-neutral-800 hover:bg-transparent">
                                <TableHead className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
                                    Reservation
                                </TableHead>
                                <TableHead className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
                                    Patient
                                </TableHead>
                                <TableHead className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
                                    Method
                                </TableHead>
                                <TableHead className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
                                    Transaction code
                                </TableHead>
                                <TableHead className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
                                    Status
                                </TableHead>
                                <TableHead className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
                                    Amount
                                </TableHead>
                                <TableHead className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
                                    Date
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {payments.data.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={7}
                                        className="h-24 text-center text-gray-400"
                                    >
                                        No payment transactions yet.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                payments.data.map((payment) => (
                                    <TableRow key={payment.id}>
                                        <TableCell>
                                            {
                                                payment.reservation
                                                    .appointment_code
                                            }
                                        </TableCell>
                                        <TableCell>
                                            {payment.reservation.patient
                                                ? `${payment.reservation.patient.first_name} ${payment.reservation.patient.last_name}`
                                                : '-'}
                                        </TableCell>
                                        <TableCell>
                                            {payment.payment_method}
                                        </TableCell>
                                        <TableCell>
                                            {payment.transaction_code ?? '-'}
                                            {payment.payment_image_path && (
                                                <a
                                                    href={`/storage/${payment.payment_image_path}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="block text-xs text-blue-400 underline"
                                                >
                                                    View payment image
                                                </a>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <select
                                                aria-label={`Payment ${payment.id} status`}
                                                value={payment.payment_status}
                                                onChange={(event) =>
                                                    updatePayment(payment.id, {
                                                        payment_status:
                                                            event.target.value,
                                                    })
                                                }
                                                className="h-9 rounded-md border border-neutral-700 bg-neutral-950 px-2 text-sm"
                                            >
                                                {[
                                                    'Pending',
                                                    'Paid',
                                                    'Failed',
                                                    'Refunded',
                                                    'Cancelled',
                                                ].map((status) => (
                                                    <option key={status}>
                                                        {status}
                                                    </option>
                                                ))}
                                            </select>
                                        </TableCell>
                                        <TableCell>
                                            {payment.amount} MMK
                                        </TableCell>
                                        <TableCell>
                                            {new Date(
                                                payment.created_at,
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
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </main>
    );
}
