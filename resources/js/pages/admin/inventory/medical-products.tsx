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
import { MedicalProductDrawer } from './components/medical-product-drawer';
import type { MedicalProduct } from './components/medical-product-drawer';

type Props = {
    medicalProducts: MedicalProduct[];
    flash?: { success?: string };
};

export default function MedicalProducts() {
    const { medicalProducts, flash } = usePage<Props>().props;
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] =
        useState<MedicalProduct | null>(null);

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
    }, [flash]);

    const createProduct = () => {
        setSelectedProduct(null);
        setDrawerOpen(true);
    };

    const editProduct = (product: MedicalProduct) => {
        setSelectedProduct(product);
        setDrawerOpen(true);
    };

    const deleteProduct = (product: MedicalProduct) => {
        if (
            window.confirm(
                `Delete ${product.name} from the medical product catalog?`,
            )
        ) {
            router.delete(`/admin/inventory/medical-products/${product.id}`, {
                onError: (errors) =>
                    toast.error(
                        errors.medical_product ??
                            'Unable to delete this product.',
                    ),
            });
        }
    };

    return (
        <>
            <Head title="Medical products" />
            <main className="flex flex-1 flex-col gap-6 p-6">
                <header className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-semibold">
                            Medical products
                        </h1>
                        <p className="text-muted-foreground">
                            Manage medical supplies and product categories.
                        </p>
                    </div>
                    <Button type="button" onClick={createProduct}>
                        <Plus className="mr-2 size-4" />
                        Add medical product
                    </Button>
                </header>
                <div className="overflow-x-auto rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Product</TableHead>
                                <TableHead>Image</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>SKU</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {medicalProducts.map((product) => (
                                <TableRow key={product.id}>
                                    <TableCell className="font-medium">
                                        {product.name}
                                    </TableCell>
                                    <TableCell>
                                        {product.image_url ? (
                                            <img
                                                src={product.image_url}
                                                alt={`${product.name} image`}
                                                className="size-12 rounded-md border object-cover"
                                            />
                                        ) : (
                                            '—'
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {product.category.name}
                                    </TableCell>
                                    <TableCell>{product.sku ?? '—'}</TableCell>
                                    <TableCell>
                                        {product.is_active
                                            ? 'Active'
                                            : 'Inactive'}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() =>
                                                    editProduct(product)
                                                }
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                onClick={() =>
                                                    deleteProduct(product)
                                                }
                                            >
                                                Delete
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {medicalProducts.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        className="py-10 text-center text-muted-foreground"
                                    >
                                        No medical products in the catalog.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </main>
            <MedicalProductDrawer
                open={drawerOpen}
                onOpenChange={setDrawerOpen}
                product={selectedProduct}
            />
        </>
    );
}
