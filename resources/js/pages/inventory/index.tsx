import { usePage } from '@inertiajs/react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

type DrugStock = {
    drug: { name: string; strength?: string };
    is_active: boolean;
    available_base_quantity: number;
};

export default function DrugsIndex() {
    const { drugStock } = usePage<{ drugStock: DrugStock[] }>().props;

    return (
        <main className="min-h-screen bg-black p-6 text-white">
            <div className="mx-auto max-w-7xl">
                <h1 className="text-2xl font-bold">Clinic Drugs</h1>
                <p className="mt-1 text-sm text-gray-400">
                    Drugs enabled for this clinic and their available base-unit
                    quantity.
                </p>
                <div className="mt-6 overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-neutral-950">
                            <TableRow className="border-neutral-800 hover:bg-transparent">
                                <TableHead className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
                                    Drug
                                </TableHead>
                                <TableHead className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
                                     Base Units
                                </TableHead>
                                <TableHead className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
                                    Status
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {drugStock.length ? (
                                drugStock.map((stock) => (
                                    <TableRow
                                        className="border-neutral-800 hover:bg-neutral-800/50"
                                        key={stock.drug.name}
                                    >
                                        <TableCell className="font-medium text-white">
                                            {stock.drug.name}{' '}
                                            {stock.drug.strength}
                                        </TableCell>
                                        <TableCell className="text-gray-300">
                                            {stock.available_base_quantity}
                                        </TableCell>
                                        <TableCell>
                                            <span
                                                className={
                                                    stock.is_active
                                                        ? 'text-emerald-400'
                                                        : 'text-red-400'
                                                }
                                            >
                                                {stock.is_active
                                                    ? 'Enabled'
                                                    : 'Disabled'}
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        className="py-10 text-center text-gray-500"
                                        colSpan={3}
                                    >
                                        No clinic drugs found.
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
