import { Head } from '@inertiajs/react';
import { DateField } from '../reports';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

type Clinic = { id: number; clinic_name: string };
type Stock = { id: number; clinic: Clinic; product: { name: string }; quantity: number; sale_price: string; is_active: boolean; updated_at: string };
type Page<T> = { data: T[]; links: Array<{ url: string | null; label: string; active: boolean }> };
type Props = { clinics: Clinic[]; filters: { clinic_id?: number; updated_from?: string; updated_to?: string }; medicalProductUnitTotal: number; medicalStock: Page<Stock> };

export default function MedicalProductStockReport({ clinics, filters, medicalProductUnitTotal, medicalStock }: Props) {
    return <><Head title="Medical product stock by clinic" /><main className="flex flex-1 flex-col gap-6 p-6">
        <header><h1 className="text-2xl font-semibold">Medical product stock by clinic</h1><p className="text-muted-foreground">Review product quantities per clinic and filter by the last stock update date.</p></header>
        <form method="get" action="/admin/inventory/reports/medical-products" className="flex flex-wrap items-end gap-3 rounded-lg border p-4">
            <label className="grid gap-2 text-sm">Clinic<select name="clinic_id" defaultValue={filters.clinic_id ?? ''} className="h-10 min-w-48 rounded-md border bg-background px-3"><option value="">All clinics</option>{clinics.map((clinic) => <option key={clinic.id} value={clinic.id}>{clinic.clinic_name}</option>)}</select></label>
            <DateField label="Updated from" name="updated_from" value={filters.updated_from ?? ''} /><DateField label="Updated to" name="updated_to" value={filters.updated_to ?? ''} /><Button type="submit">Apply filters</Button>
        </form>
        <p className="text-sm text-muted-foreground">Total units in filtered stock records: <strong className="text-foreground">{medicalProductUnitTotal.toLocaleString()}</strong></p>
        <div className="overflow-x-auto rounded-lg border"><Table><TableHeader><TableRow>{['Clinic', 'Product', 'Quantity', 'Sale price', 'Status', 'Last updated'].map((heading) => <TableHead key={heading}>{heading}</TableHead>)}</TableRow></TableHeader><TableBody>
            {medicalStock.data.map((stock) => <TableRow key={stock.id}><TableCell>{stock.clinic.clinic_name}</TableCell><TableCell>{stock.product.name}</TableCell><TableCell>{stock.quantity.toLocaleString()}</TableCell><TableCell>{stock.sale_price}</TableCell><TableCell>{stock.is_active ? 'Active' : 'Inactive'}</TableCell><TableCell>{new Date(stock.updated_at).toLocaleDateString()}</TableCell></TableRow>)}
            {medicalStock.data.length === 0 && <TableRow><TableCell colSpan={6} className="py-8 text-center text-muted-foreground">No medical product stock found.</TableCell></TableRow>}
        </TableBody></Table></div><Pagination links={medicalStock.links} />
    </main></>;
}

function Pagination({ links }: { links: Page<unknown>['links'] }) { return <nav className="flex flex-wrap gap-2">{links.map((link, index) => <a key={`${link.label}-${index}`} href={link.url ?? undefined} aria-disabled={!link.url} className={`rounded-md border px-3 py-2 text-sm ${link.active ? 'bg-primary text-primary-foreground' : ''} ${!link.url ? 'pointer-events-none opacity-50' : ''}`} dangerouslySetInnerHTML={{ __html: link.label }} />)}</nav>; }
