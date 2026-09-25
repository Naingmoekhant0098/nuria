import { Head } from '@inertiajs/react';
import { DateField } from '../reports';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

type Clinic = { id: number; clinic_name: string };
type Page<T> = { data: T[]; links: Array<{ url: string | null; label: string; active: boolean }> };
type Batch = { id: number; clinic: Clinic; drug: { name: string; strength: string | null }; batch_number: string; expiry_date: string; quantity: number };
type Props = { clinics: Clinic[]; filters: { clinic_id?: number; expiry_from?: string; expiry_to?: string }; drugUnitTotal: number; batches: Page<Batch> };

export default function DrugStockReport({ clinics, filters, drugUnitTotal, batches }: Props) {
    return <><Head title="Drug stock by clinic" /><main className="flex flex-1 flex-col gap-6 p-6">
        <header><h1 className="text-2xl font-semibold">Drug stock by clinic</h1><p className="text-muted-foreground">Filter clinic batches by expiry date.</p></header>
        <form method="get" action="/admin/inventory/reports/drugs" className="flex flex-wrap items-end gap-3 rounded-lg border p-4">
            <label className="grid gap-2 text-sm">Clinic<select name="clinic_id" defaultValue={filters.clinic_id ?? ''} className="h-10 min-w-48 rounded-md border bg-background px-3"><option value="">All clinics</option>{clinics.map((clinic) => <option key={clinic.id} value={clinic.id}>{clinic.clinic_name}</option>)}</select></label>
            <DateField label="Expiry from" name="expiry_from" value={filters.expiry_from ?? ''} /><DateField label="Expiry to" name="expiry_to" value={filters.expiry_to ?? ''} /><Button type="submit">Apply filters</Button>
        </form>
        <p className="text-sm text-muted-foreground">Total base units in filtered batches: <strong className="text-foreground">{drugUnitTotal.toLocaleString()}</strong></p>
        <div className="overflow-x-auto rounded-lg border"><Table><TableHeader><TableRow>{['Clinic', 'Drug', 'Batch', 'Expiry', 'Base units'].map((heading) => <TableHead key={heading}>{heading}</TableHead>)}</TableRow></TableHeader><TableBody>
            {batches.data.map((batch) => <TableRow key={batch.id}><TableCell>{batch.clinic.clinic_name}</TableCell><TableCell>{batch.drug.name}{batch.drug.strength ? ` · ${batch.drug.strength}` : ''}</TableCell><TableCell>{batch.batch_number}</TableCell><TableCell>{batch.expiry_date}</TableCell><TableCell>{batch.quantity.toLocaleString()}</TableCell></TableRow>)}
            {batches.data.length === 0 && <TableRow><TableCell colSpan={5} className="py-8 text-center text-muted-foreground">No drug stock found.</TableCell></TableRow>}
        </TableBody></Table></div><Pagination links={batches.links} />
    </main></>;
}

function Pagination({ links }: { links: Page<unknown>['links'] }) { return <nav className="flex flex-wrap gap-2">{links.map((link, index) => <a key={`${link.label}-${index}`} href={link.url ?? undefined} aria-disabled={!link.url} className={`rounded-md border px-3 py-2 text-sm ${link.active ? 'bg-primary text-primary-foreground' : ''} ${!link.url ? 'pointer-events-none opacity-50' : ''}`} dangerouslySetInnerHTML={{ __html: link.label }} />)}</nav>; }
