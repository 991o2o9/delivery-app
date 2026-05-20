import { useNavigate } from 'react-router-dom';
import {
  useAcceptOrder,
  useAvailableOrders,
  useCurrentActiveOrder,
} from '../../entities/order/api/courierApi';
import { useAuthStore } from '../../entities/user/model/store';
import { useCurrentLocation } from '../../shared/lib/hooks/useCurrentLocation';
import { ActiveOrderCard } from '../../widgets/active-order/ui/ActiveOrderCard';
import { AvailableOrderCard } from '../../widgets/available-order/ui/AvailableOrderCard';

export const CourierPage = () => {
  const { location, error: geoError } = useCurrentLocation();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  const { data: availableOrders, isLoading: isAvailableLoading } =
    useAvailableOrders(location?.lat, location?.lon);
  const { data: activeOrder, isLoading: isActiveLoading } =
    useCurrentActiveOrder();

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
    <div className='min-h-screen bg-gray-50 flex flex-col pb-20 lg:pb-0'>

      {/* ── Header ── */}
      <header className='bg-white shadow-sm sticky top-0 z-10 border-b border-gray-100'>
        <div className='max-w-7xl mx-auto px-4 py-4 flex justify-between items-center'>
          <h1 className='text-xl font-black text-blue-600 italic tracking-tight'>
            COURIER DASHBOARD
          </h1>
          <div className='flex items-center gap-4'>
            {user?.email && (
              <span className='hidden sm:block text-xs font-bold text-gray-400 uppercase tracking-wider'>
                {user.email}
              </span>
            )}
            <button
              onClick={() => navigate('/courier/history')}
              className='text-xs font-black text-white bg-blue-600 hover:bg-blue-700 active:scale-95 px-4 py-2 rounded-lg shadow-md transition-all duration-200'
            >
              HISTORY
            </button> 
            <button
              onClick={() => logout()}
              className='text-sm text-red-500 font-bold hover:text-red-600 transition-colors'
            >
              OUT
            </button>
          </div>
        </div>
      </header>

      {/* ── GPS Error banner ── */}
      {geoError && (
        <div className='bg-red-100 text-red-700 px-4 py-2 text-sm font-medium text-center'>
          GPS Error: {geoError}. Please enable location.
        </div>
      )}

      {/* ── Main ── */}
      <main className='flex-1 max-w-7xl mx-auto w-full px-4 py-6 lg:grid lg:grid-cols-[340px_1fr] lg:gap-6 lg:items-start'>

        {/* ══ LEFT SIDEBAR (desktop) / TOP SECTION (mobile): Active Order ══ */}
        <aside className='lg:sticky lg:top-20'>
          {isActiveLoading ? (
            <div className='animate-pulse bg-gray-200 h-48 rounded-2xl mb-6 lg:mb-0' />
          ) : activeOrder ? (
            <div className='mb-6 lg:mb-0'>
              <p className='text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3'>
                Active Mission
              </p>
              <ActiveOrderCard order={activeOrder} />
            </div>
          ) : (
            /* Empty state for sidebar on desktop */
            <div className='hidden lg:flex flex-col items-center justify-center bg-white rounded-2xl border border-dashed border-gray-200 p-8 text-center'>
              <div className='w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3 text-xl'>
                📦
              </div>
              <p className='text-sm font-bold text-gray-400'>No active order</p>
              <p className='text-xs text-gray-300 mt-1'>
                Accept an order to start
              </p>
            </div>
          )}
        </aside>

        {/* ══ RIGHT / MAIN: Available Orders ══ */}
        <section className='space-y-4'>
          <div className='flex items-center justify-between'>
            <h2 className='text-lg font-bold text-gray-800 flex items-center gap-2'>
              Available Nearby
              <span className='px-2 py-0.5 bg-gray-200 rounded-full text-xs font-black'>
                {availableOrders?.length || 0}
              </span>
            </h2>
            {location && (
              <span className='text-[10px] font-black text-green-500 uppercase tracking-wider flex items-center gap-1'>
                <span className='w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block' />
                GPS Active
              </span>
            )}
          </div>

          {isAvailableLoading ? (
            <div className='space-y-4'>
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className='animate-pulse bg-gray-200 h-32 rounded-2xl'
                />
              ))}
            </div>
          ) : (
            <div className='space-y-4'>
              {availableOrders?.map((order) => (
                <AvailableOrderCard
                  key={order.id}
                  order={order}
                  onAccept={handleAccept}
                  disabled={hasActiveOrder || acceptMutation.isPending}
                  acceptText={
                    hasActiveOrder
                      ? 'Finish active order first'
                      : 'Accept Order'
                  }
                />
              ))}
            </div>
          )}

          {!isAvailableLoading && availableOrders?.length === 0 && (
            <div className='text-center py-16 text-gray-400'>
              <p className='text-2xl mb-2'>🗺️</p>
              <p className='font-bold'>No orders nearby.</p>
              <p className='text-xs mt-1'>Try moving to a busier area!</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};