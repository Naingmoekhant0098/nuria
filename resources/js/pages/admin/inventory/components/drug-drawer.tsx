import { useForm } from '@inertiajs/react';
import { useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
} from '@/components/ui/drawer';
import { Field, StatusField } from './catalog-form-fields';

export type DrugUnit = {
    unit_name: string;
    conversion_quantity: number;
    sale_price: string;
    is_default: boolean;
};

export type Drug = {
    id: number;
    name: string;
    strength: string | null;
    sku: string | null;
    image_url: string | null;
    is_active: boolean;
    category: { name: string };
    form: { name: string };
    manufacturer: { name: string } | null;
    units: DrugUnit[];
};

type DrugFormData = {
    name: string;
    category: string;
    form: string;
    manufacturer: string;
    strength: string;
    sku: string;
    unit_name: string;
    conversion_quantity: number;
    sale_price: number;
    is_active: boolean;
    image: File | null;
    remove_image: boolean;
    _method: 'PUT' | null;
};

const emptyDrug: DrugFormData = {
    name: '',
    category: '',
    form: '',
    manufacturer: '',
    strength: '',
    sku: '',
    unit_name: '',
    conversion_quantity: 1,
    sale_price: 0,
    is_active: true,
    image: null,
    remove_image: false,
    _method: null,
};

export function DrugDrawer({
    open,
    onOpenChange,
    drug,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    drug: Drug | null;
}) {
    const form = useForm<DrugFormData>(emptyDrug);
    const selectedImagePreview = useMemo(
        () => (form.data.image ? URL.createObjectURL(form.data.image) : null),
        [form.data.image],
    );

    useEffect(() => {
        return () => {
            if (selectedImagePreview) {
                URL.revokeObjectURL(selectedImagePreview);
            }
        };
    }, [selectedImagePreview]);

    useEffect(() => {
        if (!open) {
            return;
        }

        if (!drug) {
            form.setData(emptyDrug);

            return;
        }

        const unit =
            drug.units.find((item) => item.is_default) ?? drug.units[0];
        form.setData({
            name: drug.name,
            category: drug.category.name,
            form: drug.form.name,
            manufacturer: drug.manufacturer?.name ?? '',
            strength: drug.strength ?? '',
            sku: drug.sku ?? '',
            unit_name: unit?.unit_name ?? '',
            conversion_quantity: unit?.conversion_quantity ?? 1,
            sale_price: Number(unit?.sale_price ?? 0),
            is_active: drug.is_active,
            image: null,
            remove_image: false,
            _method: 'PUT',
        });
    }, [drug, open]);

    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const options = {
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
                onOpenChange(false);
            },
        };

        if (drug) {
            form.post(`/admin/inventory/drugs/${drug.id}`, options);
        } else {
            form.post('/admin/inventory/drugs', options);
        }
    };

    const close = (nextOpen: boolean) => {
        if (!nextOpen) {
            form.clearErrors();
            form.reset();
        }

        onOpenChange(nextOpen);
    };

    return (
        <Drawer open={open} onOpenChange={close} direction="right">
            <DrawerContent className="fixed inset-y-0 right-0 left-auto mt-0 h-full w-full rounded-none border-l sm:max-w-xl">
                <DrawerHeader className="border-b px-6 py-5">
                    <DrawerTitle>
                        {drug ? 'Edit drug' : 'Create drug'}
                    </DrawerTitle>
                </DrawerHeader>
                <form
                    onSubmit={submit}
                    className="flex min-h-0 flex-1 flex-col"
                >
                    <div className="grid flex-1 content-start gap-4 overflow-y-auto p-6 sm:grid-cols-2">
                        <Field
                            label="Drug name"
                            id="drug-name"
                            value={form.data.name}
                            onChange={(value) => form.setData('name', value)}
                            error={form.errors.name}
                            required
                        />
                        <Field
                            label="Category"
                            id="drug-category"
                            value={form.data.category}
                            onChange={(value) =>
                                form.setData('category', value)
                            }
                            error={form.errors.category}
                            required
                        />
                        <Field
                            label="Form"
                            id="drug-form"
                            value={form.data.form}
                            onChange={(value) => form.setData('form', value)}
                            error={form.errors.form}
                            required
                        />
                        <Field
                            label="Manufacturer"
                            id="drug-manufacturer"
                            value={form.data.manufacturer}
                            onChange={(value) =>
                                form.setData('manufacturer', value)
                            }
                            error={form.errors.manufacturer}
                        />
                        <Field
                            label="Strength"
                            id="drug-strength"
                            value={form.data.strength}
                            onChange={(value) =>
                                form.setData('strength', value)
                            }
                            error={form.errors.strength}
                        />
                        <Field
                            label="SKU"
                            id="drug-sku"
                            value={form.data.sku}
                            onChange={(value) => form.setData('sku', value)}
                            error={form.errors.sku}
                        />
                        <label
                            className="grid gap-2 text-sm sm:col-span-2"
                            htmlFor="drug-image"
                        >
                            Product image
                            {(selectedImagePreview ||
                                (drug?.image_url &&
                                    !form.data.remove_image)) && (
                                <img
                                    src={
                                        selectedImagePreview ??
                                        drug?.image_url ??
                                        ''
                                    }
                                    alt={`${drug?.name ?? 'Selected drug'} image preview`}
                                    className="size-24 rounded-md border object-cover"
                                />
                            )}
                            <input
                                id="drug-image"
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={(event) => {
                                    form.setData(
                                        'image',
                                        event.currentTarget.files?.[0] ?? null,
                                    );
                                    form.setData('remove_image', false);
                                }}
                                className="block w-full rounded-md border bg-background px-3 py-2 text-sm"
                            />
                            <span className="text-xs text-muted-foreground">
                                JPG, PNG, or WebP; up to 5 MB. Leave empty to
                                keep the current image.
                            </span>
                            {form.errors.image && (
                                <span className="text-sm text-destructive">
                                    {form.errors.image}
                                </span>
                            )}
                            {drug?.image_url &&
                                !form.data.remove_image &&
                                !form.data.image && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-fit"
                                        onClick={() =>
                                            form.setData('remove_image', true)
                                        }
                                    >
                                        Remove current image
                                    </Button>
                                )}
                            {form.data.remove_image && (
                                <div className="flex items-center gap-2 text-sm">
                                    <span>
                                        Current image will be removed when
                                        saved.
                                    </span>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() =>
                                            form.setData('remove_image', false)
                                        }
                                    >
                                        Undo
                                    </Button>
                                </div>
                            )}
                        </label>
                        <Field
                            label="Default unit"
                            id="drug-unit"
                            value={form.data.unit_name}
                            onChange={(value) =>
                                form.setData('unit_name', value)
                            }
                            error={form.errors.unit_name}
                            required
                        />
                        <Field
                            label="Base units per unit"
                            id="drug-conversion"
                            type="number"
                            min={1}
                            value={String(form.data.conversion_quantity)}
                            onChange={(value) =>
                                form.setData(
                                    'conversion_quantity',
                                    Number(value),
                                )
                            }
                            error={form.errors.conversion_quantity}
                            required
                        />
                        <Field
                            label="Sale price per unit"
                            id="drug-sale-price"
                            type="number"
                            min={0}
                            value={String(form.data.sale_price)}
                            onChange={(value) =>
                                form.setData('sale_price', Number(value))
                            }
                            error={form.errors.sale_price}
                            required
                        />
                        <StatusField
                            id="drug-status"
                            value={form.data.is_active}
                            onChange={(value) =>
                                form.setData('is_active', value)
                            }
                        />
                    </div>
                    <div className="flex justify-end gap-2 border-t p-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => close(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={form.processing}>
                            {drug ? 'Save changes' : 'Create drug'}
                        </Button>
                    </div>
                </form>
            </DrawerContent>
        </Drawer>
    );
}
