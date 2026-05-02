import { useState } from 'react';
import dayjs from 'dayjs';
import { useMyOrders } from '../../../entities/order/api/orderApi';
import { OrderStatus } from '../../../shared/api/types';
import { Link } from 'react-router-dom';

export const OrderList = () => {
  const [page, setPage] = useState(0);
  const size = 5;
  
  const { data, isLoading, isError } = useMyOrders(page, size);

  if (isLoading) return <div className="text-center py-10">Loading orders...</div>;
  if (isError) return <div className="text-center py-10 text-red-500">Error loading orders</div>;

  const orders = data?.content || [];
  const totalPages = data?.totalPages || 0;

  const getStatusColor = (status: OrderStatus) => {
    const colors: Record<OrderStatus, string> = {
      [OrderStatus.CREATED]: 'bg-blue-100 text-blue-800',
      [OrderStatus.COURIER_ASSIGNED]: 'bg-indigo-100 text-indigo-800',
      [OrderStatus.PICKED_UP]: 'bg-yellow-100 text-yellow-800',
      [OrderStatus.DELIVERING]: 'bg-orange-100 text-orange-800',
      [OrderStatus.DELIVERED]: 'bg-green-100 text-green-800',
      [OrderStatus.CANCELLED]: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-800">My Orders</h2>
      
      {orders.length === 0 ? (
        <p className="text-gray-500 text-center py-10 bg-gray-50 rounded-lg">No orders found.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white p-4 rounded-lg shadow border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-sm font-mono text-gray-500">#{order.id.substring(0, 8)}</span>
                    <h3 className="font-bold text-gray-800">{order.cargoType}</h3>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                  <div>
                    <p className="text-gray-500">From:</p>
                    <p className="text-gray-700 truncate">{order.pickupAddress}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">To:</p>
                    <p className="text-gray-700 truncate">{order.destinationAddress}</p>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-3 border-t">
                  <div className="flex items-center space-x-4">
                    <span className="text-gray-500 text-xs">
                      {dayjs(order.createdAt).format('DD MMM YYYY, HH:mm')}
                    </span>
                    <Link 
                      to={`/client/orders/${order.id}`}
                      className="text-xs font-bold text-blue-600 hover:underline uppercase tracking-tighter"
                    >
                      Track Order →
                    </Link>
                  </div>
                  <span className="font-bold text-lg text-blue-600">
                    ${order.price.toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center items-center space-x-4 mt-6">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-4 py-2 border rounded-md disabled:opacity-50 hover:bg-gray-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {page + 1} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="px-4 py-2 border rounded-md disabled:opacity-50 hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};
