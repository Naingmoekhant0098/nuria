import { useForm } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import React, { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { store, update } from '@/routes/clinic/service-names';

interface ServiceNameDialogProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    serviceName?: {
        id: number;
        name: string;
        image_url?: string | null;
    } | null;
}

export default function ServiceNameDialog({
    open,
    onOpenChange,
    serviceName = null,
}: ServiceNameDialogProps) {
    const isEdit = Boolean(serviceName);
    const [createOpen, setCreateOpen] = useState(false);
    const form = useForm<{
        name: string;
        image: File | null;
        remove_image: boolean;
    }>({
        name: serviceName?.name ?? '',
        image: null,
        remove_image: false,
    });

    useEffect(() => {
        form.setData('name', serviceName?.name ?? '');
        form.setData('image', null);
        form.setData('remove_image', false);
    }, [serviceName]);

    const submit = (event: React.FormEvent) => {
        event.preventDefault();

        if (serviceName) {
            form.transform((data) => ({ ...data, _method: 'patch' }));
            form.post(update.url(serviceName.id), {
                preserveScroll: true,
                forceFormData: true,
                onSuccess: () => onOpenChange?.(false),
            });

            return;
        }

        form.post(store.url(), {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                form.reset();
                setCreateOpen(false);
            },
        });
    };

    const content = (
        <form onSubmit={submit} className="space-y-5">
            <div className="space-y-2">
                <Label htmlFor="service-name">Service</Label>
                <Input
                    id="service-name"
                    value={form.data.name}
                    onChange={(event) =>
                        form.setData('name', event.target.value)
                    }
                    placeholder="e.g. General consultation"
                    className="border-neutral-800 bg-neutral-950 text-white"
                    autoFocus
                />
                {form.errors.name && (
                    <p className="text-xs text-red-400">{form.errors.name}</p>
                )}
            </div>
            <div className="space-y-2">
                <Label htmlFor="service-image">Service image</Label>
                <Input
                    id="service-image"
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={(event) =>
                        form.setData('image', event.target.files?.[0] ?? null)
                    }
                    className="border-neutral-800 bg-neutral-950 text-white file:mr-3 file:border-0 file:bg-neutral-800 file:px-3 file:py-1 file:text-white"
                />
                {serviceName?.image_url && (
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                        <img
                            src={serviceName.image_url}
                            alt={serviceName.name}
                            className="size-12 rounded-md object-cover"
                        />
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={form.data.remove_image}
                                onChange={(event) =>
                                    form.setData(
                                        'remove_image',
                                        event.target.checked,
                                    )
                                }
                            />
                            Remove current image
                        </label>
                    </div>
                )}
                {form.errors.image && (
                    <p className="text-xs text-red-400">{form.errors.image}</p>
                )}
            </div>
            <DialogFooter>
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange?.(false)}
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    disabled={form.processing}
                    className="bg-main text-white"
                >
                    {form.processing
                        ? 'Saving...'
                        : isEdit
                          ? 'Update name'
                          : 'Create name'}
                </Button>
            </DialogFooter>
        </form>
    );

    if (isEdit) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="border-neutral-800 bg-neutral-900 text-white">
                    <DialogHeader>
                        <DialogTitle>Edit service</DialogTitle>
                    </DialogHeader>
                    {content}
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
                <Button className="bg-main text-white hover:bg-main/90">
                    <Plus className="size-4" />
                    Create service
                </Button>
            </DialogTrigger>
            <DialogContent className="border-neutral-800 bg-neutral-900 text-white">
                <DialogHeader>
                    <DialogTitle>Create service</DialogTitle>
                </DialogHeader>
                {content}
            </DialogContent>
        </Dialog>
    );
}
