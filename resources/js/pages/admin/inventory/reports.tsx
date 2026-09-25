import { Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

type ReportProps = {
    filters: { start_date?: string; end_date?: string };
    summary: Array<{ item_type: 'drug' | 'medical_product'; net_quantity: number }>;
};

export default function InventoryReports({ filters, summary }: ReportProps) {
    const totalFor = (type: 'drug' | 'medical_product') => Number(summary.find((row) => row.item_type === type)?.net_quantity ?? 0);

    return (
        <>
            <Head title="Inventory summary" />
            <main className="flex flex-1 flex-col gap-6 p-6">
                <header>
                    <h1 className="text-2xl font-semibold">Inventory summary</h1>
                    <p className="text-muted-foreground">Review inventory quantities recorded in stock movements.</p>
                </header>
                <form method="get" action="/admin/inventory/reports" className="flex flex-wrap items-end gap-3 rounded-lg border p-4">
                    <DateField label="From" name="start_date" value={filters.start_date ?? ''} />
                    <DateField label="To" name="end_date" value={filters.end_date ?? ''} />
                    <Button type="submit">Apply filters</Button>
                </form>
                <section className="space-y-3"><h2 className="text-lg font-semibold">Movement totals</h2><div className="rounded-lg border"><Table><TableHeader><TableRow><TableHead>Item type</TableHead><TableHead>Total quantity moved</TableHead></TableRow></TableHeader><TableBody><TableRow><TableCell>Drugs</TableCell><TableCell>{totalFor('drug').toLocaleString()}</TableCell></TableRow><TableRow><TableCell>Medical products</TableCell><TableCell>{totalFor('medical_product').toLocaleString()}</TableCell></TableRow></TableBody></Table></div></section>
            </main>
        </>
    );
}

export function DateField({ label, name, value }: { label: string; name: string; value: string }) {
    return <label className="grid gap-2 text-sm">{label}<input className="h-10 rounded-md border bg-background px-3" type="date" name={name} defaultValue={value} /></label>;
}
