import { useAdminStats } from '../../../entities/admin/api/adminApi';
import { OrderStatus } from '../../../shared/api/types';

export const AdminStatsGrid = () => {
  const { data, isLoading, isError } = useAdminStats();

  if (isLoading) return <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
    {[1, 2, 3].map(i => <div key={i} className="h-32 bg-gray-200 rounded-xl" />)}
  </div>;

  if (isError || !data) return null;

  const statusConfig: Record<OrderStatus, { label: string; color: string }> = {
    [OrderStatus.CREATED]: { label: 'Created', color: 'bg-blue-500' },
    [OrderStatus.CONFIRMED]: { label: 'Confirmed', color: 'bg-cyan-500' },
    [OrderStatus.ASSIGNED]: { label: 'Assigned', color: 'bg-indigo-500' },
    [OrderStatus.PICKED_UP]: { label: 'Picked Up', color: 'bg-yellow-500' },
    [OrderStatus.IN_TRANSIT]: { label: 'In Transit', color: 'bg-orange-500' },
    [OrderStatus.DELIVERED]: { label: 'Delivered', color: 'bg-green-500' },
    [OrderStatus.CANCELLED]: { label: 'Cancelled', color: 'bg-red-500' },
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Revenue Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500">Total Revenue</p>
          <p className="text-3xl font-bold text-green-600 mt-1">${data.totalRevenue.toFixed(2)}</p>
          <div className="mt-4 h-1 w-full bg-green-100 rounded-full overflow-hidden">
            <div className="h-full bg-green-500 w-2/3" />
          </div>
        </div>

        {/* Orders Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500">Total Orders</p>
          <p className="text-3xl font-bold text-blue-600 mt-1">{data.totalOrders}</p>
          <div className="mt-4 h-1 w-full bg-blue-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 w-4/5" />
          </div>
        </div>

        {/* Couriers Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500">Active Couriers</p>
          <p className="text-3xl font-bold text-indigo-600 mt-1">{data.activeCouriers}</p>
          <div className="mt-4 h-1 w-full bg-indigo-100 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 w-1/2" />
          </div>
        </div>
      </div>

      {/* Status Distribution */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 mb-6">Orders by Status</h3>
        <div className="space-y-4">
          {Object.entries(statusConfig).map(([status, config]) => {
            const count = data.ordersByStatus[status as OrderStatus] || 0;
            const percentage = data.totalOrders > 0 ? (count / data.totalOrders) * 100 : 0;
            
            return (
              <div key={status}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700">{config.label}</span>
                  <span className="text-gray-500">{count} orders ({percentage.toFixed(1)}%)</span>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${config.color} transition-all duration-500`} 
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
