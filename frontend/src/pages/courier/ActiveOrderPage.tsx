import dayjs from 'dayjs';
import { useNavigate, useParams } from 'react-router-dom';
import {
  useCompleteOrder,
  useOrderDetails,
  usePickupOrder,
  useStartTransitOrder,
} from '../../entities/order/api/orderApi';
import { OrderStatus } from '../../shared/api/types';
import {
  cargoTypeLabelMap,
  statusColorMap,
  statusLabelMap,
  urgencyLabelMap,
} from '../../shared/utils/enumMappings';

export const ActiveOrderPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: order, isLoading, isError } = useOrderDetails(id);

  const pickupMutation = usePickupOrder();
  const transitMutation = useStartTransitOrder();
  const completeMutation = useCompleteOrder();

  if (isLoading)
    return (
      <div className='min-h-screen flex items-center justify-center animate-pulse font-black text-blue-600 text-2xl tracking-tighter uppercase'>
        Initializing...
      </div>
    );
  if (isError || !order)
    return (
      <div className='p-8 text-center text-red-500 font-bold'>
        ⚠️ Connection lost. Error loading order.
      </div>
    );

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
      alert(
        error.response?.data?.message || 'Operation failed. Please try again.',
      );
    }
  };

  const getButtonConfig = () => {
    switch (order.status) {
      case OrderStatus.ASSIGNED:
        return {
          text: 'CONFIRM PICKUP',
          color: 'bg-blue-600',
          pending: pickupMutation.isPending,
        };
      case OrderStatus.PICKED_UP:
        return {
          text: 'START TRANSIT',
          color: 'bg-orange-500',
          pending: transitMutation.isPending,
        };
      case OrderStatus.IN_TRANSIT:
        return {
          text: 'MARK AS DELIVERED',
          color: 'bg-green-600',
          pending: completeMutation.isPending,
        };
      case OrderStatus.DELIVERED:
        return {
          text: 'ORDER COMPLETED',
          color: 'bg-gray-400',
          disabled: true,
        };
      default:
        return {
          text: 'BACK TO MARKET',
          color: 'bg-blue-600',
          onClick: () => navigate('/courier'),
        };
    }
  };

  const config = getButtonConfig();

  return (
    <div className='min-h-screen bg-gray-50 text-gray-900 flex flex-col pb-32'>
      {/* Mobile Header */}
      <header className='p-4 border-b border-gray-200 flex justify-between items-center bg-white sticky top-0 z-10 shadow-sm'>
        <button
          onClick={() => navigate('/courier')}
          className='text-gray-500 font-black flex items-center text-xs tracking-tighter'
        >
          <span className='mr-1 text-lg'>←</span> RETURN
        </button>
        <div className='text-center'>
          <span className='text-[10px] block font-black tracking-widest text-gray-400 uppercase leading-none mb-1'>
            Mission Control
          </span>
          <span className='text-xs font-black text-blue-600'>
            #{order.id.substring(0, 8).toUpperCase()}
          </span>
        </div>
        <div className='w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-black text-white text-[10px] shadow-lg shadow-blue-200'>
          CO
        </div>
      </header>

      <main className='p-4 space-y-5 max-w-md mx-auto w-full'>
        {/* Status & ETA */}
        <div className='bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex justify-between items-center'>
          <div
            className={`px-3 py-1 rounded-full border ${statusColorMap[order.status]} shadow-sm`}
          >
            <span className='text-[10px] font-black uppercase tracking-widest'>
              {statusLabelMap[order.status]}
            </span>
          </div>
          <div className='text-right'>
            <p className='text-[9px] font-black text-gray-400 uppercase'>
              Estimated Arrival
            </p>
            <p className='font-black text-orange-500 text-sm'>
              {order.estimatedArrivalTime
                ? dayjs(order.estimatedArrivalTime).format('HH:mm')
                : '--:--'}
            </p>
          </div>
        </div>

        {/* Info Grid: Payout & Distance */}
        <div className='grid grid-cols-2 gap-4'>
          <div className='bg-white p-4 rounded-2xl border border-gray-100 shadow-sm'>
            <p className='text-[9px] font-black text-gray-400 uppercase mb-1 tracking-wider'>
              Distance
            </p>
            <p className='font-black text-gray-800 text-lg'>
              {order.distanceKm?.toFixed(1) || '0.0'}{' '}
              <span className='text-xs text-gray-400'>km</span>
            </p>
          </div>
          <div className='bg-white p-4 rounded-2xl border border-gray-100 shadow-sm text-right'>
            <p className='text-[9px] font-black text-gray-400 uppercase mb-1 tracking-wider'>
              Your Payout
            </p>
            <p className='font-black text-lg text-green-600'>
              ${order.price.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Addresses */}
        <div className='space-y-3'>
          <div className='bg-white p-5 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden'>
            <div className='absolute top-0 left-0 w-1.5 h-full bg-green-500' />
            <div className='flex justify-between items-start mb-2'>
              <p className='text-[10px] font-black text-green-600 uppercase tracking-wider'>
                Pickup From
              </p>
              <div className='flex items-center space-x-2'>
                {order.status === OrderStatus.ASSIGNED && (
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${order.pickupLat},${order.pickupLon}`}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg text-green-700 text-xs font-medium hover:bg-green-100 transition-colors'
                  >
                    <svg
                      width='12'
                      height='12'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='currentColor'
                      strokeWidth='2.5'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    >
                      <polygon points='3 11 22 2 13 21 11 13 3 11' />
                    </svg>
                    Pickup point
                  </a>
                )}
                <span className='text-[10px] font-black text-gray-300'>
                  SENDER
                </span>
              </div>
            </div>
            <p className='text-md font-bold text-gray-800 leading-tight mb-1'>
              {order.pickupAddress}
            </p>
            <p className='text-xs text-blue-500 font-bold underline mb-2'>
              {order.clientEmail}
            </p>
            {order.pickupComment && (
              <div className='mt-3 p-3 bg-gray-50 rounded-xl border border-gray-100 border-dashed text-sm text-gray-500 italic'>
                “{order.pickupComment}”
              </div>
            )}
          </div>

          <div className='bg-white p-5 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden'>
            <div className='absolute top-0 left-0 w-1.5 h-full bg-blue-500' />
            <div className='flex justify-between items-start mb-2'>
              <p className='text-[10px] font-black text-blue-600 uppercase tracking-wider'>
                Deliver To
              </p>
              <div className='flex items-center space-x-2'>
                {(order.status === OrderStatus.PICKED_UP ||
                  order.status === OrderStatus.IN_TRANSIT) && (
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${order.destLat},${order.destLon}`}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-xs font-medium hover:bg-blue-100 transition-colors'
                  >
                    <svg
                      width='12'
                      height='12'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='currentColor'
                      strokeWidth='2.5'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    >
                      <polygon points='3 11 22 2 13 21 11 13 3 11' />
                    </svg>
                    Destination
                  </a>
                )}
                <span className='text-[10px] font-black text-gray-300'>
                  RECEIVER
                </span>
              </div>
            </div>
            <p className='text-md font-bold text-gray-800 leading-tight mb-1'>
              {order.destinationAddress}
            </p>
            {order.receiverName && (
              <p className='text-sm font-black text-gray-700 bg-blue-50 inline-block px-2 py-0.5 rounded-lg mb-2'>
                Recipient: {order.receiverName}
              </p>
            )}
            {order.deliveryComment && (
              <div className='mt-2 p-3 bg-gray-50 rounded-xl border border-gray-100 border-dashed text-sm text-gray-500 italic'>
                “{order.deliveryComment}”
              </div>
            )}
          </div>
        </div>

        {/* Cargo Details */}
        <div className='bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-4'>
          <div className='flex justify-between items-center border-b border-gray-50 pb-3'>
            <div>
              <p className='text-[9px] font-black text-gray-400 uppercase tracking-wider'>
                Package Type
              </p>
              <p className='font-bold text-gray-800 text-sm'>
                {cargoTypeLabelMap[order.cargoType]}
              </p>
            </div>
            <div className='text-right'>
              <p className='text-[9px] font-black text-gray-400 uppercase tracking-wider'>
                Weight
              </p>
              <p className='font-bold text-gray-800 text-sm'>
                {order.weight} kg
              </p>
            </div>
          </div>
          <div className='flex justify-between items-center'>
            <div>
              <p className='text-[9px] font-black text-gray-400 uppercase tracking-wider'>
                Urgency
              </p>
              <p className='font-bold text-orange-600 text-sm'>
                {urgencyLabelMap[order.urgency]}
              </p>
            </div>
            <div className='text-right'>
              <p className='text-[9px] font-black text-gray-400 uppercase tracking-wider'>
                Payment
              </p>
              <p className='font-black text-blue-600 text-xs uppercase'>
                {order.paymentMethod}
              </p>
            </div>
          </div>
        </div>

        {/* Mission Timeline */}
        <div className='bg-white p-4 rounded-2xl border border-gray-100 shadow-sm'>
          <p className='text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 border-b border-gray-50 pb-2'>
            Mission Log
          </p>
          <div className='space-y-4'>
            {order.history?.map((entry, idx) => (
              <div key={idx} className='flex items-center gap-3'>
                <div
                  className={`w-1.5 h-1.5 rounded-full ${idx === 0 ? 'bg-blue-600 animate-pulse' : 'bg-gray-200'}`}
                />
                <div className='flex-1 flex justify-between items-center'>
                  <span
                    className={`text-[11px] font-bold uppercase ${idx === 0 ? 'text-gray-900' : 'text-gray-400'}`}
                  >
                    {statusLabelMap[entry.status]}
                  </span>
                  <span className='text-[10px] text-gray-300 font-medium'>
                    {dayjs(entry.changedAt).format('HH:mm')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Helper Note */}
        <div className='p-4 bg-indigo-50 rounded-2xl border border-indigo-100 flex items-start space-x-3'>
          <div className='w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center shrink-0 text-white text-[10px] font-black'>
            !
          </div>
          <p className='text-[11px] text-indigo-700 font-bold leading-tight'>
            SYSTEM NOTE: Confirm each step immediately after completion. Payout
            is processed upon final delivery confirmation.
          </p>
        </div>
      </main>

      {/* Dynamic Sticky Bottom Bar */}
      <footer className='fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] z-20'>
        <button
          onClick={config.onClick || handleAction}
          disabled={config.disabled || config.pending}
          className={`w-full h-16 rounded-2xl font-black text-lg tracking-widest shadow-lg transition-all active:scale-95 flex items-center justify-center text-white ${config.color} ${config.disabled ? 'opacity-50 grayscale cursor-not-allowed' : 'hover:brightness-105 active:shadow-inner'}`}
        >
          {config.pending ? (
            <div className='w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin' />
          ) : (
            config.text
          )}
        </button>
      </footer>
    </div>
  );
};
