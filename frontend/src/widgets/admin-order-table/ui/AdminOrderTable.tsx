import { useState } from 'react';
import dayjs from 'dayjs';
import { useAllOrders } from '../../../entities/admin/api/adminApi';
import { OrderStatus } from '../../../shared/api/types';

export const AdminOrderTable = () => {
  const [page, setPage] = useState(0);
  const size = 10;
  const { data, isLoading, isError } = useAllOrders(page, size);

  if (isLoading) return <div className="animate-pulse space-y-4">
    {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-12 bg-gray-100 rounded" />)}
  </div>;

  if (isError || !data) return <div className="text-red-500">Error loading orders.</div>;

  const getStatusBadge = (status: OrderStatus) => {
    const colors: Record<OrderStatus, string> = {
      [OrderStatus.CREATED]: 'bg-blue-100 text-blue-700',
      [OrderStatus.COURIER_ASSIGNED]: 'bg-indigo-100 text-indigo-700',
      [OrderStatus.PICKED_UP]: 'bg-yellow-100 text-yellow-700',
      [OrderStatus.DELIVERING]: 'bg-orange-100 text-orange-700',
      [OrderStatus.DELIVERED]: 'bg-green-100 text-green-700',
      [OrderStatus.CANCELLED]: 'bg-red-100 text-red-700',
    };
    return <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${colors[status]}`}>{status}</span>;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">ID</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Client</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Price</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {data.content.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm font-mono text-gray-400">#{order.id.substring(0, 8)}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{order.clientEmail || 'N/A'}</td>
                <td className="px-6 py-4">{getStatusBadge(order.status)}</td>
                <td className="px-6 py-4 text-sm font-bold text-gray-900">${order.price.toFixed(2)}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{dayjs(order.createdAt).format('DD.MM.YYYY HH:mm')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
        <span className="text-sm text-gray-500">
          Showing {data.number * data.size + 1} to {Math.min((data.number + 1) * data.size, data.totalElements)} of {data.totalElements}
        </span>
        <div className="flex space-x-2">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-3 py-1 border rounded bg-white text-sm disabled:opacity-50"
          >
            Prev
          </button>
          <button
            onClick={() => setPage(p => Math.min(data.totalPages - 1, p + 1))}
            disabled={page >= data.totalPages - 1}
            className="px-3 py-1 border rounded bg-white text-sm disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};
