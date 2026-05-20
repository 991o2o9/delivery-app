import { useState } from 'react';
import dayjs from 'dayjs';
import type { AvailableOrderResponseDto } from '../../../shared/api/types';

interface AvailableOrderCardProps {
  order: AvailableOrderResponseDto;
  onAccept: (orderId: string) => void;
  disabled: boolean;
  acceptText: string;
}

export const AvailableOrderCard = ({ order, onAccept, disabled, acceptText }: AvailableOrderCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const formattedTime = order.estimatedArrivalTime
    ? dayjs(order.estimatedArrivalTime).format('HH:mm')
    : 'ASAP';

  return (
    <div
      onClick={() => setIsExpanded(!isExpanded)}
      className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-3 cursor-pointer transition-all duration-200 hover:shadow-md"
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold px-2 py-1 bg-blue-100 text-blue-700 rounded-md">
            {order.cargoType}
          </span>
          <span className="text-xs font-semibold px-2 py-1 bg-gray-100 text-gray-700 rounded-md">
            {order.weight} kg
          </span>
        </div>
        <span className="text-xs font-mono text-gray-400">#{order.id.substring(0, 6)}</span>
      </div>

      {/* Route & Distance */}
      <div className="text-sm bg-gray-50 p-3 rounded-lg border border-gray-100">
        <div className="flex items-start">
          <div className="w-2 h-2 mt-1.5 rounded-full bg-green-500 mr-2 shrink-0" />
          <div className="flex-1">
            <p className="text-gray-800 font-medium truncate">{order.pickupAddress}</p>
            <p className="text-xs text-gray-500 mt-0.5">To pickup: {order.distanceFromYou.toFixed(1)} km</p>
          </div>
        </div>
        <div className="w-0.5 h-4 bg-gray-300 ml-1 my-1" />
        <div className="flex items-start">
          <div className="w-2 h-2 mt-1.5 rounded-full bg-red-500 mr-2 shrink-0" />
          <div className="flex-1">
            <p className="text-gray-800 font-medium truncate">{order.destinationAddress}</p>
            <p className="text-xs text-gray-500 mt-0.5">Delivery: {order.distanceKm.toFixed(1)} km</p>
          </div>
        </div>
      </div>

      {/* Timing */}
      <div className="flex items-center text-sm font-semibold text-gray-700">
        <span className="mr-2">⏱</span> Deliver by {formattedTime}
      </div>

      {/* Expandable Section */}
      {isExpanded && (
        <div className="pt-3 border-t border-gray-100 space-y-2 text-sm mt-2 animate-fadeIn">
          {order.description && (
            <div>
              <p className="text-xs text-gray-400">Comment</p>
              <p className="text-gray-700 bg-yellow-50 p-2 rounded text-xs border border-yellow-100">
                {order.description}
              </p>
            </div>
          )}
          {order.receiverName && (
            <div>
              <p className="text-xs text-gray-400">Receiver</p>
              <p className="text-gray-700 font-medium">{order.receiverName}</p>
            </div>
          )}
          <div>
            <p className="text-xs text-gray-400">Payment Details</p>
            <p className="text-gray-700 font-medium capitalize">{order.paymentMethod.toLowerCase()}</p>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex justify-between items-center pt-3 border-t border-gray-100">
        <div className="flex flex-col">
          <p className="text-xs text-gray-400">Payout</p>
          <div className="flex items-center space-x-1">
            <span className="font-bold text-lg text-green-600">${order.price.toFixed(2)}</span>
            <span className="text-xs text-gray-500 uppercase bg-gray-100 px-1.5 py-0.5 rounded">
              {order.paymentMethod === 'CASH' ? '💵 Cash' : '💳 Card'}
            </span>
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation(); // Prevent toggling the accordion when clicking accept
            onAccept(order.id);
          }}
          disabled={disabled}
          className="px-6 py-2.5 bg-gray-900 text-white font-bold rounded-lg text-sm disabled:bg-gray-200 disabled:text-gray-400 shadow-sm transition-transform active:scale-95"
        >
          {acceptText}
        </button>
      </div>

      {/* Toggle Hint */}
      {!isExpanded && (
        <div className="text-center w-full mt-1">
          <span className="text-[10px] text-gray-400 font-medium tracking-wide">Tap for details ⌄</span>
        </div>
      )}
      {isExpanded && (
        <div className="text-center w-full mt-1">
          <span className="text-[10px] text-gray-400 font-medium tracking-wide">Tap to collapse ⌃</span>
        </div>
      )}
    </div>
  );
};
