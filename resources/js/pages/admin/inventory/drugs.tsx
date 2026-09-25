import { Head, router, usePage } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { DrugDrawer } from './components/drug-drawer';
import type { Drug } from './components/drug-drawer';

type Props = {
    drugs: Drug[];
    flash?: { success?: string };
};

export default function Drugs() {
    const { drugs, flash } = usePage<Props>().props;
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedDrug, setSelectedDrug] = useState<Drug | null>(null);

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
    }, [flash]);

    const createDrug = () => {
        setSelectedDrug(null);
        setDrawerOpen(true);
    };

    const editDrug = (drug: Drug) => {
        setSelectedDrug(drug);
        setDrawerOpen(true);
    };

    const deleteDrug = (drug: Drug) => {
        if (window.confirm(`Delete ${drug.name} from the drug catalog?`)) {
            router.delete(`/admin/inventory/drugs/${drug.id}`, {
                onError: (errors) =>
                    toast.error(errors.drug ?? 'Unable to delete this drug.'),
            });
        }
    };

    return (
        <>
            <Head title="Drugs" />
            <main className="flex flex-1 flex-col gap-6 p-6">
                <header className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-semibold">Drugs</h1>
                        <p className="text-muted-foreground">
                            Manage drug details, categories, forms, and sale
                            units.
                        </p>
                    </div>
                    <Button type="button" onClick={createDrug}>
                        <Plus className="mr-2 size-4" />
                        Add drug
                    </Button>
                </header>
                <div className="overflow-x-auto rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Drug</TableHead>
                                <TableHead>Image</TableHead>
                                <TableHead>Category / form</TableHead>
                                <TableHead>Manufacturer</TableHead>
                                <TableHead>Default unit</TableHead>
                                <TableHead>SKU</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {drugs.map((drug) => {
                                const unit =
                                    drug.units.find(
                                        (item) => item.is_default,
                                    ) ?? drug.units[0];

                                return (
                                    <TableRow key={drug.id}>
                                        <TableCell className="font-medium">
                                            {drug.name}
                                            {drug.strength
                                                ? ` · ${drug.strength}`
                                                : ''}
                                        </TableCell>
                                        <TableCell>
                                            {drug.image_url ? (
                                                <img
                                                    src={drug.image_url}
                                                    alt={`${drug.name} image`}
                                                    className="size-12 rounded-md border object-cover"
                                                />
                                            ) : (
                                                '—'
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {drug.category.name} ·{' '}
                                            {drug.form.name}
                                        </TableCell>
                                        <TableCell>
                                            {drug.manufacturer?.name ?? '—'}
                                        </TableCell>
                                        <TableCell>
                                            {unit
                                                ? `${unit.unit_name} (${unit.sale_price})`
                                                : '—'}
                                        </TableCell>
                                        <TableCell>{drug.sku ?? '—'}</TableCell>
                                        <TableCell>
                                            {drug.is_active
                                                ? 'Active'
                                                : 'Inactive'}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() =>
                                                        editDrug(drug)
                                                    }
                                                >
                                                    Edit
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() =>
                                                        deleteDrug(drug)
                                                    }
                                                >
                                                    Delete
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                            {drugs.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={8}
                                        className="py-10 text-center text-muted-foreground"
                                    >
                                        No drugs in the catalog.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </main>
            <DrugDrawer
                open={drawerOpen}
                onOpenChange={setDrawerOpen}
                drug={selectedDrug}
            />
        </>
    );
}
