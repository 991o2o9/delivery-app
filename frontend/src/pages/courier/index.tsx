import { useCurrentLocation } from '../../shared/lib/hooks/useCurrentLocation';
import { useAvailableOrders, useCurrentActiveOrder, useAcceptOrder } from '../../entities/order/api/courierApi';
import { ActiveOrderCard } from '../../widgets/active-order/ui/ActiveOrderCard';
import { useAuthStore } from '../../entities/user/model/store';

export const CourierPage = () => {
  const { location, error: geoError } = useCurrentLocation();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  const { data: availableOrders, isLoading: isAvailableLoading } = useAvailableOrders(location?.lat, location?.lon);
  const { data: activeOrder, isLoading: isActiveLoading } = useCurrentActiveOrder();
  const acceptMutation = useAcceptOrder();

  const handleAccept = async (orderId: string) => {
    try {
      await acceptMutation.mutateAsync(orderId);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to accept order');
    }
  };

  const hasActiveOrder = !!activeOrder;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-black text-blue-600 italic">COURIER DASHBOARD</h1>
          <button onClick={() => logout()} className="text-sm text-red-500 font-bold">OUT</button>
        </div>
      </header>

      <main className="flex-1 p-4 max-w-lg mx-auto w-full">
        {geoError && (
          <div className="bg-red-100 text-red-700 p-3 rounded-lg text-sm mb-4">
            GPS Error: {geoError}. Please enable location.
          </div>
        )}

        {/* Active Order Section */}
        {isActiveLoading ? (
          <div className="animate-pulse bg-gray-200 h-48 rounded-xl mb-8" />
        ) : activeOrder ? (
          <ActiveOrderCard order={activeOrder} />
        ) : null}

        {/* Available Orders Section */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-800 flex items-center">
            Available Nearby 
            <span className="ml-2 px-2 py-0.5 bg-gray-200 rounded-full text-xs">
              {availableOrders?.length || 0}
            </span>
          </h2>

          {isAvailableLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse bg-gray-200 h-32 rounded-xl" />
              ))}
            </div>
          ) : (
            availableOrders?.map((order) => (
              <div key={order.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-blue-500">{order.cargoType}</span>
                  <span className="text-xs font-mono text-gray-400">#{order.id.substring(0, 6)}</span>
                </div>
                
                <div className="text-sm">
                  <div className="flex items-start">
                    <div className="w-2 h-2 mt-1.5 rounded-full bg-green-500 mr-2 shrink-0" />
                    <p className="text-gray-700 truncate">{order.pickupAddress}</p>
                  </div>
                  <div className="w-0.5 h-3 bg-gray-200 ml-0.75 my-0.5" />
                  <div className="flex items-start">
                    <div className="w-2 h-2 mt-1.5 rounded-full bg-red-500 mr-2 shrink-0" />
                    <p className="text-gray-700 truncate">{order.destinationAddress}</p>
                  </div>
                </div>

                <div className="flex justify-between items-end pt-2 border-t border-gray-50">
                  <div>
                    <p className="text-xs text-gray-400">Distance</p>
                    <p className="font-bold text-gray-800">{order.distanceFromYou.toFixed(1)} km</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Payout</p>
                    <p className="font-bold text-green-600">${order.price.toFixed(2)}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleAccept(order.id)}
                  disabled={hasActiveOrder || acceptMutation.isPending}
                  className="w-full py-3 bg-gray-900 text-white font-bold rounded-lg text-sm disabled:bg-gray-200 disabled:text-gray-400"
                >
                  {hasActiveOrder ? 'Finish active order first' : 'Accept Order'}
                </button>
              </div>
            ))
          )}

          {!isAvailableLoading && availableOrders?.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <p>No orders nearby.</p>
              <p className="text-xs">Try moving to a busier area!</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
