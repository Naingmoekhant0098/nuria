import { Head, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

type Clinic = { id: number; clinic_name: string };
export type OrdersProps = {
    canManage?: boolean;
    updateUrl?: string;
    listUrl?: string;
    orders: {
        data: Array<{
            id: number;
            total: string;
            payment_status: string;
            payment_method: string;
            transaction_code: string | null;
            payment_image_path: string | null;
            order_status: string;
            delivery_address: string;
            delivery_contact: string;
            order_note: string | null;
            created_at: string;
            clinic: Clinic;
            patient: {
                id: string;
                first_name: string;
                last_name: string;
                email: string;
            } | null;
            items: Array<{
                id: number;
                description: string;
                quantity: number;
                unit_price: string;
                line_total: string;
            }>;
        }>;
        links: Array<{ url: string | null; label: string; active: boolean }>;
    };
    clinics: Clinic[];
    filters: {
        search?: string;
        status?: string;
        payment_status?: string;
        clinic_id?: number;
        date_from?: string;
        date_to?: string;
    };
    summary: {
        orders_count: number;
        sales_total: number;
        paid_total: number;
        pending_payments_count: number;
    };
};

const statuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
const paymentStatuses = ['Pending', 'Paid', 'Failed', 'Refunded', 'Cancelled'];

function availableStatuses(current: string): string[] {
    if (current === 'Pending') {
        return ['Processing', 'Cancelled'];
    }

    if (current === 'Processing') {
        return ['Shipped', 'Cancelled'];
    }

    if (current === 'Shipped') {
        return ['Delivered'];
    }

    return [];
}

export default function OrdersIndex({
    orders,
    clinics,
    filters,
    summary,
    canManage = false,
    updateUrl = '/admin/orders',
    listUrl = '/admin/orders',
}: OrdersProps) {
    const reportParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
            reportParams.set(key, String(value));
        }
    });

    function updateOrder(orderId: number, fields: Record<string, string>) {
        router.patch(`${updateUrl}/${orderId}`, fields, {
            preserveScroll: true,
        });
    }

    return (
        <>
            <Head title="Online order report" />
            <main className="flex flex-1 flex-col gap-6 p-6">
                <header>
                    <h1 className="text-2xl font-semibold">
                        Online order report
                    </h1>
                    <p className="text-muted-foreground">
                        Filter order activity, review payment and fulfillment
                        totals, and export the matching report as CSV.
                    </p>
                </header>
                <form
                    method="get"
                    action={listUrl}
                    className="flex flex-wrap items-end gap-3 rounded-lg border p-4"
                >
                    <Input
                        name="search"
                        placeholder="Search order or patient"
                        defaultValue={filters.search ?? ''}
                        className="w-56"
                    />
                    {!canManage && (
                        <label className="grid gap-2 text-sm">
                            Clinic
                            <select
                                name="clinic_id"
                                defaultValue={filters.clinic_id ?? ''}
                                className="h-10 min-w-44 rounded-md border bg-background px-3"
                            >
                                <option value="">All clinics</option>
                                {clinics.map((clinic) => (
                                    <option key={clinic.id} value={clinic.id}>
                                        {clinic.clinic_name}
                                    </option>
                                ))}
                            </select>
                        </label>
                    )}
                    <label className="grid gap-2 text-sm">
                        Status
                        <select
                            name="status"
                            defaultValue={filters.status ?? ''}
                            className="h-10 min-w-40 rounded-md border bg-background px-3"
                        >
                            <option value="">All statuses</option>
                            {statuses.map((status) => (
                                <option key={status}>{status}</option>
                            ))}
                        </select>
                    </label>
                    <label className="grid gap-2 text-sm">
                        Payment status
                        <select
                            name="payment_status"
                            defaultValue={filters.payment_status ?? ''}
                            className="h-10 min-w-40 rounded-md border bg-background px-3"
                        >
                            <option value="">All payment statuses</option>
                            {paymentStatuses.map((status) => (
                                <option key={status}>{status}</option>
                            ))}
                        </select>
                    </label>
                    <label className="grid gap-2 text-sm">
                        From
                        <Input
                            type="date"
                            name="date_from"
                            defaultValue={filters.date_from ?? ''}
                        />
                    </label>
                    <label className="grid gap-2 text-sm">
                        To
                        <Input
                            type="date"
                            name="date_to"
                            defaultValue={filters.date_to ?? ''}
                        />
                    </label>
                    <Button type="submit">Apply filters</Button>
                    <Button asChild type="button" variant="outline">
                        <a
                            href={`${listUrl}/report.csv?${reportParams.toString()}`}
                        >
                            Download CSV report
                        </a>
                    </Button>
                </form>
                <section
                    className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
                    aria-label="Filtered order summary"
                >
                    {[
                        ['Orders', summary.orders_count.toLocaleString()],
                        [
                            'Order value',
                            `${summary.sales_total.toLocaleString()} MMK`,
                        ],
                        [
                            'Paid value',
                            `${summary.paid_total.toLocaleString()} MMK`,
                        ],
                        [
                            'Awaiting payment',
                            summary.pending_payments_count.toLocaleString(),
                        ],
                    ].map(([label, value]) => (
                        <div key={label} className="rounded-lg border p-4">
                            <p className="text-sm text-muted-foreground">
                                {label}
                            </p>
                            <p className="mt-1 text-xl font-semibold">
                                {value}
                            </p>
                        </div>
                    ))}
                </section>
                <div className="overflow-x-auto rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                {[
                                    'Order',
                                    'Placed',
                                    'Patient',
                                    'Clinic',
                                    'Items',
                                    'Delivery',
                                    'Total',
                                    'Payment method',
                                    'Reference',
                                    'Payment status',
                                    'Order status',
                                ].map((label) => (
                                    <TableHead key={label}>{label}</TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders.data.map((order) => (
                                <TableRow key={order.id}>
                                    <TableCell className="font-medium">
                                        #{order.id}
                                    </TableCell>
                                    <TableCell>
                                        {new Date(
                                            order.created_at,
                                        ).toLocaleString()}
                                    </TableCell>
                                    <TableCell>
                                        {order.patient ? (
                                            <>
                                                {order.patient.first_name}{' '}
                                                {order.patient.last_name}
                                                <div className="text-xs text-muted-foreground">
                                                    {order.patient.email}
                                                </div>
                                            </>
                                        ) : (
                                            'Patient unavailable'
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {order.clinic.clinic_name}
                                    </TableCell>
                                    <TableCell className="min-w-48">
                                        {order.items.map((item) => (
                                            <div key={item.id}>
                                                {item.description} ×{' '}
                                                {item.quantity}
                                            </div>
                                        ))}
                                    </TableCell>
                                    <TableCell className="min-w-44">
                                        {order.delivery_address}
                                        <div className="text-xs text-muted-foreground">
                                            {order.delivery_contact}
                                        </div>
                                        {order.order_note && (
                                            <div className="mt-1 text-xs text-muted-foreground">
                                                Note: {order.order_note}
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {Number(order.total).toLocaleString()}
                                    </TableCell>
                                    <TableCell>
                                        {order.payment_method}
                                    </TableCell>
                                    <TableCell>
                                        {order.transaction_code ?? '-'}
                                        {order.payment_image_path && (
                                            <a
                                                href={`/storage/${order.payment_image_path}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="block text-xs text-blue-500 underline"
                                            >
                                                View proof
                                            </a>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {canManage ? (
                                            <select
                                                aria-label={`Order ${order.id} payment status`}
                                                value={order.payment_status}
                                                onChange={(event) =>
                                                    updateOrder(order.id, {
                                                        payment_status:
                                                            event.target.value,
                                                    })
                                                }
                                                className="h-9 rounded-md border bg-background px-2 text-sm"
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
                                        ) : (
                                            order.payment_status
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {canManage ? (
                                            <select
                                                aria-label={`Order ${order.id} status`}
                                                value={order.order_status}
                                                onChange={(event) =>
                                                    updateOrder(order.id, {
                                                        order_status:
                                                            event.target.value,
                                                    })
                                                }
                                                disabled={
                                                    availableStatuses(
                                                        order.order_status,
                                                    ).length === 0
                                                }
                                                className="h-9 rounded-md border bg-background px-2 text-sm"
                                            >
                                                <option>
                                                    {order.order_status}
                                                </option>
                                                {availableStatuses(
                                                    order.order_status,
                                                ).map((status) => (
                                                    <option key={status}>
                                                        {status}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            order.order_status
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {orders.data.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={11}
                                        className="py-8 text-center text-muted-foreground"
                                    >
                                        No online orders found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                <nav className="flex flex-wrap gap-2">
                    {orders.links.map((link, index) => (
                        <a
                            key={`${link.label}-${index}`}
                            href={link.url ?? undefined}
                            aria-disabled={!link.url}
                            className={`rounded-md border px-3 py-2 text-sm ${link.active ? 'bg-primary text-primary-foreground' : ''} ${!link.url ? 'pointer-events-none opacity-50' : ''}`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ))}
                </nav>
            </main>
        </>
    );
}
