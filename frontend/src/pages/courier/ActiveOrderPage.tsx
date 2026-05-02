import { useParams, useNavigate } from 'react-router-dom';
import { useOrderDetails, usePickupOrder, useStartTransitOrder, useCompleteOrder } from '../../entities/order/api/orderApi';
import { OrderStatus } from '../../shared/api/types';
import { statusLabelMap, cargoTypeLabelMap, statusColorMap } from '../../shared/utils/enumMappings';

export const ActiveOrderPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: order, isLoading, isError } = useOrderDetails(id);

  const pickupMutation = usePickupOrder();
  const transitMutation = useStartTransitOrder();
  const completeMutation = useCompleteOrder();

  if (isLoading) return <div className="min-h-screen flex items-center justify-center animate-pulse font-black text-blue-600 text-2xl tracking-tighter">LOADING MISSION...</div>;
  if (isError || !order) return <div className="p-8 text-center text-red-500 font-bold">⚠️ Error loading mission data.</div>;

  const handleAction = async () => {
    try {
      if (order.status === OrderStatus.ASSIGNED) {
        await pickupMutation.mutateAsync(order.id);
      } else if (order.status === OrderStatus.PICKED_UP) {
        await transitMutation.mutateAsync(order.id);
      } else if (order.status === OrderStatus.IN_TRANSIT) {
        await completeMutation.mutateAsync(order.id);
        navigate('/courier');
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Operation failed. Please try again.');
    }
  };

  const getButtonConfig = () => {
    switch (order.status) {
      case OrderStatus.ASSIGNED: 
        return { text: 'CONFIRM PICKUP', color: 'bg-blue-600', pending: pickupMutation.isPending };
      case OrderStatus.PICKED_UP: 
        return { text: 'START TRANSIT', color: 'bg-orange-500', pending: transitMutation.isPending };
      case OrderStatus.IN_TRANSIT: 
        return { text: 'MARK AS DELIVERED', color: 'bg-green-600', pending: completeMutation.isPending };
      case OrderStatus.DELIVERED:
        return { text: 'ORDER COMPLETED', color: 'bg-gray-400', disabled: true };
      default: 
        return { text: 'BACK TO MARKET', color: 'bg-blue-600', onClick: () => navigate('/courier') };
    }
  };

  const config = getButtonConfig();

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col pb-32">
      {/* Mobile Header */}
      <header className="p-4 border-b border-gray-200 flex justify-between items-center bg-white sticky top-0 z-10">
        <button onClick={() => navigate('/courier')} className="text-gray-500 font-bold flex items-center text-sm">
          <span className="mr-1">←</span> BACK
        </button>
        <div className="text-center">
          <span className="text-[10px] block font-black tracking-widest text-gray-400 uppercase leading-none mb-1">Active Mission</span>
          <span className="text-xs font-bold text-blue-600 truncate max-w-[120px] block">#{order.id.substring(0, 8)}</span>
        </div>
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-black text-white text-[10px]">GO</div>
      </header>

      <main className="p-4 space-y-6 max-w-md mx-auto w-full">
        {/* Status & Distance */}
        <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <div className={`px-3 py-1 rounded-full border ${statusColorMap[order.status]} shadow-sm`}>
            <span className="text-[10px] font-black uppercase tracking-widest">{statusLabelMap[order.status]}</span>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-gray-400 uppercase">Route</p>
            <p className="font-black text-blue-600">{order.distanceKm?.toFixed(1) || '0.0'} km</p>
          </div>
        </div>

        {/* Addresses */}
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-green-500" />
            <p className="text-[10px] font-black text-green-600 uppercase mb-2 tracking-wider">Pickup Location</p>
            <p className="text-lg font-bold text-gray-800 leading-tight">{order.pickupAddress}</p>
            {order.clientEmail && (
              <p className="text-xs text-gray-400 mt-1 font-medium underline">{order.clientEmail}</p>
            )}
            {order.pickupComment && (
              <div className="mt-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-sm text-gray-500 italic">“{order.pickupComment}”</p>
              </div>
            )}
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500" />
            <p className="text-[10px] font-black text-blue-600 uppercase mb-2 tracking-wider">Delivery Destination</p>
            <p className="text-lg font-bold text-gray-800 leading-tight">{order.destinationAddress}</p>
            {order.receiverName && (
              <p className="text-sm font-bold text-gray-700 mt-1">Contact: {order.receiverName}</p>
            )}
            {order.deliveryComment && (
              <div className="mt-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-sm text-gray-500 italic">“{order.deliveryComment}”</p>
              </div>
            )}
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-[10px] font-black text-gray-400 uppercase mb-1 tracking-wider">Package Details</p>
            <p className="font-bold text-gray-800 text-sm">{cargoTypeLabelMap[order.cargoType]}</p>
            <p className="text-xs font-medium text-gray-500">{order.weight} kg</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm text-right">
            <p className="text-[10px] font-black text-gray-400 uppercase mb-1 tracking-wider">Payment / Payout</p>
            <p className="font-black text-xl text-green-600">${order.price.toFixed(2)}</p>
            <p className="text-[10px] font-bold text-blue-500">{order.paymentMethod}</p>
          </div>
        </div>

        {/* Action Help */}
        <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-start space-x-3">
          <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center shrink-0 text-white text-[10px] font-bold">!</div>
          <p className="text-xs text-blue-700 font-medium leading-relaxed italic">
            Once you arrive at the pickup location and collect the package, tap the button below to update the status.
          </p>
        </div>
      </main>

      {/* Dynamic Sticky Bottom Bar */}
      <footer className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] z-20">
        <button
          onClick={config.onClick || handleAction}
          disabled={config.disabled || config.pending}
          className={`w-full h-16 rounded-2xl font-black text-lg tracking-widest shadow-lg transition-all active:scale-95 flex items-center justify-center text-white ${config.color} ${config.disabled ? 'opacity-50 grayscale cursor-not-allowed' : 'hover:brightness-105 active:shadow-inner'}`}
        >
          {config.pending ? (
            <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            config.text
          )}
        </button>
      </footer>
    </div>
  );
};
