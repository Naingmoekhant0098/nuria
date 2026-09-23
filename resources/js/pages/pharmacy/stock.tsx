import { usePage } from '@inertiajs/react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
 
type Batch = {
    id: number;
    batch_number: string;
    expiry_date: string;
    quantity: number;
    drug: { name: string };
};

type MedicalStock = {
    medical_product_id: number;
    quantity: number;
    sale_price: string;
    is_active: boolean;
    product: { name: string };
};

export default function StockIndex() {
    const { batches, medicalStock } = usePage<{
        batches: Batch[];
        medicalStock: MedicalStock[];
    }>().props;


    const formatDateTime = (
        value?: string | null
    ): string => {
        if (!value) {
            return '-';
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return value;
        }

        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: '2-digit',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
    };


    
    return (
        <main className="min-h-screen bg-black p-6 text-white">
            <div className="mx-auto max-w-7xl space-y-8">
                <div>
                    <h1 className="text-2xl font-bold">Clinic Stock</h1>
                    <p className="mt-1 text-sm text-gray-400">
                        Drug batches use base units. Expiry dates help staff
                        follow FEFO.
                    </p>
                </div>
                <StockTable
                    title="Drug Batches"
                    headers={[
                        'Drug',
                        'Batch Number',
                        'Expiry Date',
                        'Base Units',
                    ]}
                    rows={batches.map((batch) => [
                        batch.drug.name,
                        batch.batch_number,
                        formatDateTime(batch.expiry_date),
                        batch.quantity,
                    ])}
                />
                <StockTable
                    title="Medical Product Stock"
                    headers={['Product', 'Quantity', 'Sale Price', 'Status']}
                    rows={medicalStock.map((stock) => [
                        stock.product.name,
                        stock.quantity,
                        `${stock.sale_price} MMK`,
                        stock.is_active ? 'Enabled' : 'Disabled',
                    ])}
                />
            </div>
        </main>
    );
}

function StockTable({
    title,
    headers,
    rows,
}: {
    title: string;
    headers: string[];
    rows: (string | number)[][];
}) {
    return (
        <section>
            <h2 className="mb-3 text-lg font-semibold">{title}</h2>
            <div className="overflow-x-auto ">
                <Table>
                    <TableHeader className="bg-neutral-950">
                        <TableRow className="border-neutral-800 hover:bg-transparent">
                            {headers.map((header) => (
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
                        {rows.length ? (
                            rows.map((row, index) => (
                                <TableRow
                                    className="border-neutral-800 hover:bg-neutral-800/50"
                                    key={index}
                                >
                                    {row.map((value, cell) => (
                                        <TableCell
                                            className="text-gray-300"
                                            key={cell}
                                        >
                                            {value}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    className="py-10 text-center text-gray-500"
                                    colSpan={headers.length}
                                >
                                    No stock found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </section>
    );
}
