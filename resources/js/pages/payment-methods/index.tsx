import { Link, router, usePage } from '@inertiajs/react';
import { update } from '@/actions/App/Http/Controllers/PaymentMethodController';
import { index as paymentReport } from '@/actions/App/Http/Controllers/PaymentReportController';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

type PaymentMethod = {
    id: number;
    name: string;
    status: 'Active' | 'Inactive';
};

export default function PaymentMethodsIndex() {
    const { paymentMethods } = usePage<{ paymentMethods: PaymentMethod[] }>()
        .props;

    return (
        <main className="min-h-screen bg-black p-8 text-gray-100">
            <div className="mx-auto max-w-7xl space-y-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-xl font-extrabold tracking-tight text-white">
                            Payment Methods
                        </h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Cash, KBZPay, Wave Money, and Other are the available
                            payment methods. Only active methods can be selected
                            for a consultation.
                        </p>
                    </div>
                    <Button
                        asChild
                        variant="outline"
                        className="border-neutral-800 bg-neutral-900"
                    >
                        <Link href={paymentReport.url()}>
                            Transaction report
                        </Link>
                    </Button>
                </div>
                <div className="overflow-hidden ">
                    <Table>
                        <TableHeader className="bg-neutral-950">
                            <TableRow className="border-neutral-800 hover:bg-transparent">
                                <TableHead className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
                                    Method
                                </TableHead>
                                <TableHead className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
                                    Status
                                </TableHead>
                                {/* <TableHead className="text-right text-xs font-semibold tracking-wider text-gray-400 uppercase">
                                    Action
                                </TableHead> */}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paymentMethods.map((method) => (
                                <TableRow
                                    className="border-neutral-800 hover:bg-neutral-800/50"
                                    key={method.id}
                                >
                                    <TableCell className="font-medium text-gray-200">
                                        {method.name}
                                    </TableCell>
                                    <TableCell className="text-gray-300">
                                        <span
                                            className={
                                                method.status === 'Active'
                                                    ? 'text-emerald-400'
                                                    : 'text-gray-500'
                                            }
                                        >
                                            {method.status}
                                        </span>
                                    </TableCell>
                                    <TableCell className="">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() =>
                                                router.put(
                                                    update.url(method.id),
                                                    {
                                                        status:
                                                            method.status ===
                                                            'Active'
                                                                ? 'Inactive'
                                                                : 'Active',
                                                    },
                                                )
                                            }
                                        >
                                            Mark{' '}
                                            {method.status === 'Active'
                                                ? 'Inactive'
                                                : 'Active'}
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </main>
    );
}
