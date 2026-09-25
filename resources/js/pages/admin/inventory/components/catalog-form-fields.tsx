import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function Field({ label, id, value, onChange, error, type = 'text', min, required = false }: {
    label: string;
    id: string;
    value: string;
    onChange: (value: string) => void;
    error?: string;
    type?: string;
    min?: number;
    required?: boolean;
}) {
    return (
        <div className="grid content-start gap-2">
            <Label htmlFor={id}>{label}</Label>
            <Input id={id} type={type} min={min} value={value} onChange={(event) => onChange(event.target.value)} required={required} />
            <InputError message={error} />
        </div>
    );
}

export function StatusField({ id, value, onChange }: { id: string; value: boolean; onChange: (value: boolean) => void }) {
    return (
        <div className="grid content-start gap-2">
            <Label htmlFor={id}>Status</Label>
            <select id={id} className="h-10 rounded-md border bg-background px-3 text-sm" value={value ? '1' : '0'} onChange={(event) => onChange(event.target.value === '1')}>
                <option value="1">Active</option>
                <option value="0">Inactive</option>
            </select>
        </div>
    );
}
