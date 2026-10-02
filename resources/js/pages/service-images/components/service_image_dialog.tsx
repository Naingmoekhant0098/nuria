import { useForm } from '@inertiajs/react';
import { ImagePlus } from 'lucide-react';
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
import { store } from '@/routes/clinic/service-images';

interface ServiceImageOption {
    id: number;
    service_name: string;
}

interface ServiceImageDialogProps {
    services: ServiceImageOption[];
    service?: ServiceImageOption | null;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export default function ServiceImageDialog({
    services,
    service = null,
    open,
    onOpenChange,
}: ServiceImageDialogProps) {
    const [createOpen, setCreateOpen] = useState(false);
    const form = useForm<{ service_id: string; image: File | null }>({
        service_id: service ? String(service.id) : '',
        image: null,
    });

    useEffect(() => {
        form.setData({
            service_id: service ? String(service.id) : '',
            image: null,
        });
    }, [service]);

    const closeDialog = () => {
        onOpenChange?.(false);
        setCreateOpen(false);
    };

    const submit = (event: React.FormEvent) => {
        event.preventDefault();

        form.post(store.url(), {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                form.reset();
                closeDialog();
            },
        });
    };

    const content = (
        <form onSubmit={submit} className="space-y-5">
            <div className="space-y-2">
                <Label htmlFor="service-image-service">Service</Label>
                <select
                    id="service-image-service"
                    value={form.data.service_id}
                    onChange={(event) =>
                        form.setData('service_id', event.target.value)
                    }
                    className="flex h-10 w-full rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-white"
                    disabled={Boolean(service)}
                >
                    <option value="">Select service</option>
                    {services.map((item) => (
                        <option key={item.id} value={item.id}>
                            {item.service_name}
                        </option>
                    ))}
                </select>
                {form.errors.service_id && (
                    <p className="text-xs text-red-400">
                        {form.errors.service_id}
                    </p>
                )}
            </div>
            <div className="space-y-2">
                <Label htmlFor="service-image-file">Image</Label>
                <Input
                    id="service-image-file"
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={(event) =>
                        form.setData('image', event.target.files?.[0] ?? null)
                    }
                    className="border-neutral-800 bg-neutral-950 text-white file:mr-3 file:border-0 file:bg-neutral-800 file:px-3 file:py-1 file:text-white"
                />
                {form.errors.image && (
                    <p className="text-xs text-red-400">{form.errors.image}</p>
                )}
            </div>
            <DialogFooter>
                <Button type="button" variant="outline" onClick={closeDialog}>
                    Cancel
                </Button>
                <Button
                    type="submit"
                    disabled={form.processing}
                    className="bg-main text-white"
                >
                    {form.processing ? 'Uploading...' : 'Save image'}
                </Button>
            </DialogFooter>
        </form>
    );

    if (service) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="border-neutral-800 bg-neutral-900 text-white">
                    <DialogHeader>
                        <DialogTitle>Replace service image</DialogTitle>
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
                    <ImagePlus className="size-4" /> Upload image
                </Button>
            </DialogTrigger>
            <DialogContent className="border-neutral-800 bg-neutral-900 text-white">
                <DialogHeader>
                    <DialogTitle>Upload service image</DialogTitle>
                </DialogHeader>
                {content}
            </DialogContent>
        </Dialog>
    );
}
