import { AdminOrderTable } from '../../widgets/admin-order-table/ui/AdminOrderTable';
import { AdminLayout } from '../../widgets/admin-layout/ui/AdminLayout';

export const OrdersPage = () => {
  return (
    <AdminLayout title="Orders Registry">
      <div className="space-y-6">
        <div className="mb-6">
          <h3 className="text-2xl font-black text-gray-900 tracking-tighter uppercase">System Transactions</h3>
          <p className="text-gray-500 text-sm">Monitor and track every delivery happening in real-time.</p>
        </div>
        <AdminOrderTable />
      </div>
    </AdminLayout>
  );
};
