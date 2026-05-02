import { AdminStatsGrid } from '../../widgets/admin-stats/ui/AdminStatsGrid';
import { AdminLayout } from '../../widgets/admin-layout/ui/AdminLayout';

export const AdminPage = () => {
  return (
    <AdminLayout title="System Dashboard">
      <div className="space-y-6">
        <div>
          <h3 className="text-2xl font-black text-gray-900 tracking-tighter uppercase">Overview</h3>
          <p className="text-gray-500 text-sm">Real-time system performance and delivery metrics.</p>
        </div>
        <AdminStatsGrid />
      </div>
    </AdminLayout>
  );
};
