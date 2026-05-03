import { Link } from 'react-router-dom';
import {
  useCompleteOrder,
  useInTransitOrder,
  usePickupOrder,
} from '../../../entities/order/api/courierApi';
import type { OrderResponseDto } from '../../../shared/api/types';
import { OrderStatus } from '../../../shared/api/types';

interface ActiveOrderCardProps {
  order: OrderResponseDto;
}

export const ActiveOrderCard = ({ order }: ActiveOrderCardProps) => {
  const pickupMutation = usePickupOrder();
  const transitMutation = useInTransitOrder();
  const completeMutation = useCompleteOrder();

  const handleAction = async () => {
    try {
      if (order.status === OrderStatus.ASSIGNED) {
        await pickupMutation.mutateAsync(order.id);
      } else if (order.status === OrderStatus.PICKED_UP) {
        await transitMutation.mutateAsync(order.id);
      } else if (order.status === OrderStatus.IN_TRANSIT) {
        await completeMutation.mutateAsync(order.id);
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to update order status');
    }
  };

  const getButtonText = () => {
    switch (order.status) {
      case OrderStatus.ASSIGNED:
        return 'I am here / Picked up';
      case OrderStatus.PICKED_UP:
        return 'Start Delivery';
      case OrderStatus.IN_TRANSIT:
        return 'Complete Delivery';
      default:
        return 'Next Step';
    }
  };

  const isPending =
    pickupMutation.isPending ||
    transitMutation.isPending ||
    completeMutation.isPending;

  return (
    <div className='bg-white border-2 border-blue-500 rounded-xl p-6 shadow-lg mb-8 relative'>
      <div className='flex justify-between items-start mb-4'>
        <h2 className='text-xl font-bold text-blue-600'>Active Order</h2>
        <Link
          to={`/courier/orders/${order.id}`}
          className='text-xs font-black text-blue-500 bg-blue-50 px-2 py-1 rounded hover:bg-blue-100 uppercase'
        >
          Open Mission Control ↗
        </Link>
      </div>

      <div className='space-y-4 mb-6'>
        <div>
          <p className='text-gray-500 text-sm'>Pickup From:</p>
          <p className='font-medium'>{order.pickupAddress}</p>
        </div>
        <div>
          <p className='text-gray-500 text-sm'>Deliver To:</p>
          <p className='font-medium'>{order.destinationAddress}</p>
        </div>
        <div className='flex justify-between text-sm'>
          <span>
            Cargo: <span className='font-bold'>{order.cargoType}</span>
          </span>
          <span>
            Price:{' '}
            <span className='font-bold text-green-600'>
              ${order.price.toFixed(2)}
            </span>
          </span>
        </div>
      </div>

      <button
        onClick={handleAction}
        disabled={isPending}
        className='w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md active:transform active:scale-95 transition-all text-lg disabled:bg-blue-300'
      >
        {isPending ? 'Updating...' : getButtonText()}
      </button>
    </div>
  );
};
