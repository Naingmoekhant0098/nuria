import type { OrdersProps } from '@/pages/admin/orders';
import OrdersIndex from '@/pages/admin/orders';

export default function ClinicOrdersIndex(props: OrdersProps) {
    return (
        <OrdersIndex
            {...props}
            canManage
            updateUrl="/clinic/orders"
            listUrl="/clinic/orders"
        />
    );
}
