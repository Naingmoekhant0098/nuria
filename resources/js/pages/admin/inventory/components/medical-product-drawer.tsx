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

export type MedicalProduct = {
    id: number;
    name: string;
    sku: string | null;
    image_url: string | null;
    is_active: boolean;
    category: { name: string };
};

type MedicalProductFormData = {
    name: string;
    category: string;
    sku: string;
    is_active: boolean;
    image: File | null;
    remove_image: boolean;
    _method: 'PUT' | null;
};

const emptyProduct: MedicalProductFormData = {
    name: '',
    category: '',
    sku: '',
    is_active: true,
    image: null,
    remove_image: false,
    _method: null,
};

export function MedicalProductDrawer({
    open,
    onOpenChange,
    product,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    product: MedicalProduct | null;
}) {
    const form = useForm<MedicalProductFormData>(emptyProduct);
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

        form.setData(
            product
                ? {
                      name: product.name,
                      category: product.category.name,
                      sku: product.sku ?? '',
                      is_active: product.is_active,
                      image: null,
                      remove_image: false,
                      _method: 'PUT',
                  }
                : emptyProduct,
        );
    }, [product, open]);

    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const options = {
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
                onOpenChange(false);
            },
        };

        if (product) {
            form.post(
                `/admin/inventory/medical-products/${product.id}`,
                options,
            );
        } else {
            form.post('/admin/inventory/medical-products', options);
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
                        {product
                            ? 'Edit medical product'
                            : 'Create medical product'}
                    </DrawerTitle>
                </DrawerHeader>
                <form
                    onSubmit={submit}
                    className="flex min-h-0 flex-1 flex-col"
                >
                    <div className="grid flex-1 content-start gap-4 overflow-y-auto p-6">
                        <Field
                            label="Product name"
                            id="medical-product-name"
                            value={form.data.name}
                            onChange={(value) => form.setData('name', value)}
                            error={form.errors.name}
                            required
                        />
                        <Field
                            label="Category"
                            id="medical-product-category"
                            value={form.data.category}
                            onChange={(value) =>
                                form.setData('category', value)
                            }
                            error={form.errors.category}
                            required
                        />
                        <Field
                            label="SKU"
                            id="medical-product-sku"
                            value={form.data.sku}
                            onChange={(value) => form.setData('sku', value)}
                            error={form.errors.sku}
                        />
                        <label
                            className="grid gap-2 text-sm"
                            htmlFor="medical-product-image"
                        >
                            Product image
                            {(selectedImagePreview ||
                                (product?.image_url &&
                                    !form.data.remove_image)) && (
                                <img
                                    src={
                                        selectedImagePreview ??
                                        product?.image_url ??
                                        ''
                                    }
                                    alt={`${product?.name ?? 'Selected product'} image preview`}
                                    className="size-24 rounded-md border object-cover"
                                />
                            )}
                            <input
                                id="medical-product-image"
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
                            {product?.image_url &&
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
                        <StatusField
                            id="medical-product-status"
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
                            {product ? 'Save changes' : 'Create product'}
                        </Button>
                    </div>
                </form>
            </DrawerContent>
        </Drawer>
    );
}
