import {
  DirectionsRenderer,
  GoogleMap,
  useJsApiLoader,
} from '@react-google-maps/api';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useOrderDetails, useCancelOrderClient } from '../../entities/order/api/orderApi';
import { OrderStatus } from '../../shared/api/types';
import {
  cargoTypeLabelMap,
  statusColorMap,
  statusLabelMap,
  urgencyLabelMap,
} from '../../shared/utils/enumMappings';

const mapContainerStyle = {
  width: '100%',
  height: '380px',
  borderRadius: '1rem',
};

const LIBRARIES: ('places' | 'marker')[] = ['places', 'marker'];

const PhoneLink = ({
  phone,
  color,
}: {
  phone: string;
  color: 'green' | 'blue';
}) => {
  const styles = {
    green: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      icon: 'text-green-600',
    },
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      icon: 'text-blue-600',
    },
  };
  const s = styles[color];

  return (
    <a
      href={`tel:${phone.replace(/\s/g, '')}`}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-sm font-medium transition-opacity active:opacity-70 ${s.bg} ${s.border} ${s.text}`}
    >
      <svg
        width='14'
        height='14'
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth='2.5'
        strokeLinecap='round'
        strokeLinejoin='round'
        className={s.icon}
      >
        <path d='M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.36 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z' />
      </svg>
      {phone}
    </a>
  );
};

export const OrderDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: order, isLoading, isError } = useOrderDetails(id);
  const cancelMutation = useCancelOrderClient();

  const handleCancel = async () => {
    try {
      await cancelMutation.mutateAsync(id!);
      navigate('/client');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to cancel order.');
    }
  };
  const [directionsResponse, setDirectionsResponse] =
    useState<google.maps.DirectionsResult | null>(null);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries: LIBRARIES,
  });

  const calculateRoute = async () => {
    if (!order) return;
    const directionsService = new window.google.maps.DirectionsService();
    const results = await directionsService.route({
      origin: { lat: order.pickupLat, lng: order.pickupLon },
      destination: { lat: order.destLat, lng: order.destLon },
      travelMode: window.google.maps.TravelMode.DRIVING,
    });
    setDirectionsResponse(results);
  };

  useEffect(() => {
    if (isLoaded && order) calculateRoute();
  }, [isLoaded, order?.pickupLat, order?.destLat]);

  if (isLoading)
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center space-y-2'>
          <div className='w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto' />
          <p className='text-sm text-gray-400 font-medium'>
            Loading shipment...
          </p>
        </div>
      </div>
    );

  if (isError || !order)
    return (
      <div className='min-h-screen flex items-center justify-center p-8'>
        <div className='text-center'>
          <p className='text-red-500 font-bold text-lg'>Order not found</p>
          <Link to='/client' className='text-sm text-blue-600 mt-2 block'>
            ← Back to dashboard
          </Link>
        </div>
      </div>
    );

  const pickupPos = { lat: order.pickupLat, lng: order.pickupLon };

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <header className='bg-white border-b border-gray-100 sticky top-0 z-10 px-4 py-3 flex items-center justify-between'>
        <Link
          to='/client'
          className='flex items-center gap-1.5 text-gray-500 hover:text-gray-800 transition-colors text-sm font-medium'
        >
          <svg
            width='16'
            height='16'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
          >
            <path d='M19 12H5M12 5l-7 7 7 7' />
          </svg>
          Back
        </Link>
        <div className='text-center'>
          <p className='text-xs font-semibold text-gray-800 tracking-tight'>
            #{order.id.substring(0, 8).toUpperCase()}
          </p>
          <p className='text-[10px] text-gray-400'>
            {dayjs(order.createdAt).format('DD MMM YYYY')}
          </p>
        </div>
        <div className='w-16' />
      </header>

      <div className='max-w-6xl mx-auto p-4 md:p-6'>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Left column */}
          <div className='lg:col-span-1 space-y-4'>
            {/* Status card */}
            <div className='bg-white rounded-2xl border border-gray-100 p-5'>
              <div className='flex justify-between items-center mb-4'>
                <h1 className='text-base font-bold text-gray-900'>
                  Shipment details
                </h1>
                <div
                  className={`px-3 py-1 rounded-full border text-xs font-semibold ${statusColorMap[order.status]}`}
                >
                  {statusLabelMap[order.status]}
                </div>
              </div>
              
              {(order.status === OrderStatus.CREATED || order.status === OrderStatus.ASSIGNED) && (
                <button
                  onClick={handleCancel}
                  disabled={cancelMutation.isPending}
                  className='w-full mt-4 h-12 rounded-xl font-bold text-sm text-red-500 border border-red-200 hover:bg-red-50 transition-colors flex items-center justify-center'
                >
                  {cancelMutation.isPending ? 'CANCELLING...' : 'CANCEL ORDER'}
                </button>
              )}

              <div className='grid grid-cols-2 gap-3 mt-4'>
                <div className='bg-gray-50 rounded-xl p-3'>
                  <p className='text-[10px] text-gray-400 uppercase tracking-wider mb-1'>
                    Distance
                  </p>
                  <p className='text-lg font-bold text-gray-800'>
                    {order.distanceKm.toFixed(1)}{' '}
                    <span className='text-xs font-normal text-gray-400'>
                      km
                    </span>
                  </p>
                </div>
                <div className='bg-gray-50 rounded-xl p-3'>
                  <p className='text-[10px] text-gray-400 uppercase tracking-wider mb-1'>
                    Weight
                  </p>
                  <p className='text-lg font-bold text-gray-800'>
                    {order.weight}{' '}
                    <span className='text-xs font-normal text-gray-400'>
                      kg
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Courier card */}
            {order.courierEmail && (
              <div className='bg-white rounded-2xl border border-gray-100 p-5'>
                <p className='text-[10px] text-gray-400 uppercase tracking-wider mb-3'>
                  Your courier
                </p>
                <div className='flex items-center gap-3'>
                  <div className='w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm flex-shrink-0'>
                    {order.courierEmail[0].toUpperCase()}
                  </div>
                  <div className='min-w-0'>
                    <p className='text-sm font-semibold text-gray-800 truncate'>
                      {order.courierEmail}
                    </p>
                    <p className='text-xs text-gray-400'>
                      Assigned to your order
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Addresses card */}
            <div className='bg-white rounded-2xl border border-gray-100 overflow-hidden'>
              {/* Pickup */}
              <div className='p-5 border-b border-gray-50'>
                <div className='flex gap-3'>
                  <div className='flex flex-col items-center pt-1'>
                    <div className='w-2.5 h-2.5 rounded-full bg-green-500 flex-shrink-0' />
                    <div className='w-px flex-1 bg-gray-100 mt-1' />
                  </div>
                  <div className='flex-1 min-w-0 pb-4'>
                    <p className='text-[10px] text-gray-400 uppercase tracking-wider mb-1'>
                      Pickup from
                    </p>
                    <p className='text-sm font-semibold text-gray-800 mb-3 leading-snug'>
                      {order.pickupAddress}
                    </p>
                    {order.senderPhone && (
                      <PhoneLink phone={order.senderPhone} color='green' />
                    )}
                    {order.pickupComment && (
                      <p className='mt-3 text-xs text-gray-500 italic bg-gray-50 px-3 py-2 rounded-xl border border-dashed border-gray-200 leading-relaxed'>
                        "{order.pickupComment}"
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Destination */}
              <div className='p-5'>
                <div className='flex gap-3'>
                  <div className='pt-1'>
                    <div className='w-2.5 h-2.5 rounded-full bg-blue-500 flex-shrink-0' />
                  </div>
                  <div className='flex-1 min-w-0'>
                    <p className='text-[10px] text-gray-400 uppercase tracking-wider mb-1'>
                      Deliver to
                    </p>
                    <p className='text-sm font-semibold text-gray-800 mb-1 leading-snug'>
                      {order.destinationAddress}
                    </p>
                    {order.receiverName && (
                      <p className='text-xs text-gray-500 mb-3'>
                        Recipient:{' '}
                        <span className='font-semibold text-gray-700'>
                          {order.receiverName}
                        </span>
                      </p>
                    )}
                    {order.receiverPhone && (
                      <PhoneLink phone={order.receiverPhone} color='blue' />
                    )}
                    {order.deliveryComment && (
                      <p className='mt-3 text-xs text-gray-500 italic bg-gray-50 px-3 py-2 rounded-xl border border-dashed border-gray-200 leading-relaxed'>
                        "{order.deliveryComment}"
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Package info */}
            <div className='bg-white rounded-2xl border border-gray-100 p-5 space-y-4'>
              {order.description && (
                <div>
                  <p className='text-[10px] text-gray-400 uppercase tracking-wider mb-1.5'>
                    Description
                  </p>
                  <p className='text-sm text-gray-700 leading-relaxed bg-blue-50 px-3 py-2.5 rounded-xl border border-blue-100'>
                    {order.description}
                  </p>
                </div>
              )}
              <div className='grid grid-cols-2 gap-4 pt-1 border-t border-gray-50'>
                <div>
                  <p className='text-[10px] text-gray-400 uppercase tracking-wider mb-1'>
                    Cargo type
                  </p>
                  <p className='text-sm font-semibold text-gray-700'>
                    {cargoTypeLabelMap[order.cargoType]}
                  </p>
                </div>
                <div>
                  <p className='text-[10px] text-gray-400 uppercase tracking-wider mb-1'>
                    Urgency
                  </p>
                  <p className='text-sm font-semibold text-orange-600'>
                    {urgencyLabelMap[order.urgency]}
                  </p>
                </div>
              </div>
              <div className='flex justify-between items-end pt-1 border-t border-gray-50'>
                <div>
                  <p className='text-[10px] text-gray-400 uppercase tracking-wider mb-1'>
                    Paid via {order.paymentMethod}
                  </p>
                  <p className='text-2xl font-black text-blue-600'>
                    ${order.price.toFixed(2)}
                  </p>
                </div>
                {order.estimatedArrivalTime && order.status !== 'DELIVERED' && (
                  <div className='text-right'>
                    <p className='text-[10px] text-gray-400 uppercase tracking-wider mb-1'>
                      ETA
                    </p>
                    <p className='text-sm font-bold text-orange-500'>
                      {dayjs(order.estimatedArrivalTime).format('HH:mm')}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Timeline */}
            <div className='bg-white rounded-2xl border border-gray-100 p-5'>
              <p className='text-[10px] text-gray-400 uppercase tracking-wider mb-4'>
                Tracking log
              </p>
              <div className='relative'>
                <div className='absolute left-[13px] top-2 bottom-2 w-px bg-gray-100' />
                <div className='space-y-5'>
                  {order.history?.map((entry, index) => {
                    const isFirst = index === 0;
                    return (
                      <div
                        key={entry.status + entry.changedAt}
                        className='flex items-start gap-3 relative'
                      >
                        <div
                          className={`w-7 h-7 rounded-full border flex items-center justify-center flex-shrink-0 z-10 ${isFirst ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-200'}`}
                        >
                          <svg
                            width='10'
                            height='10'
                            viewBox='0 0 24 24'
                            fill='none'
                            stroke={isFirst ? 'white' : '#d1d5db'}
                            strokeWidth='3'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                          >
                            <polyline points='20 6 9 17 4 12' />
                          </svg>
                        </div>
                        <div className='flex-1 min-w-0 pt-0.5 flex justify-between items-start'>
                          <span
                            className={`text-sm font-semibold ${isFirst ? 'text-gray-900' : 'text-gray-400'}`}
                          >
                            {statusLabelMap[entry.status]}
                          </span>
                          <time className='text-[10px] text-gray-300 bg-gray-50 px-2 py-0.5 rounded ml-2 flex-shrink-0'>
                            {dayjs(entry.changedAt).format('HH:mm')}
                          </time>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Right column: Map */}
          <div className='lg:col-span-2'>
            <div className='sticky top-20 space-y-4'>
              <div className='bg-white rounded-2xl border border-gray-100 overflow-hidden'>
                {isLoaded ? (
                  <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={pickupPos}
                    zoom={12}
                    options={{
                      mapId: import.meta.env.VITE_GOOGLE_MAPS_MAP_ID,
                      disableDefaultUI: true,
                      zoomControl: true,
                    }}
                  >
                    {directionsResponse && (
                      <DirectionsRenderer
                        directions={directionsResponse}
                        options={{
                          polylineOptions: {
                            strokeColor: '#2563eb',
                            strokeWeight: 5,
                            strokeOpacity: 0.8,
                          },
                        }}
                      />
                    )}
                  </GoogleMap>
                ) : (
                  <div className='h-[380px] flex items-center justify-center bg-gray-50 animate-pulse'>
                    <p className='text-sm text-gray-300 font-medium'>
                      Loading map...
                    </p>
                  </div>
                )}
                <div className='px-5 py-3 flex items-center justify-between border-t border-gray-50'>
                  <div className='flex items-center gap-2.5'>
                    <div className='flex -space-x-1.5'>
                      <div className='w-5 h-5 rounded-full bg-green-500 border-2 border-white' />
                      <div className='w-5 h-5 rounded-full bg-blue-500 border-2 border-white' />
                    </div>
                    <span className='text-xs text-gray-400'>
                      Route established
                    </span>
                  </div>
                  <span className='text-[11px] font-medium text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full'>
                    Kyrgyzstan
                  </span>
                </div>
              </div>

              <div className='bg-white rounded-2xl border border-gray-100 p-5 flex items-center justify-between gap-4'>
                <div className='flex items-center gap-3'>
                  <div className='w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0'>
                    <svg
                      width='16'
                      height='16'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='#4338ca'
                      strokeWidth='2'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    >
                      <path d='M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' />
                    </svg>
                  </div>
                  <div>
                    <p className='text-sm font-semibold text-gray-800'>
                      Secure delivery
                    </p>
                    <p className='text-xs text-gray-400'>
                      Protected by insurance policy
                    </p>
                  </div>
                </div>
                <button className='text-xs font-medium text-indigo-600 bg-indigo-50 px-3 py-2 rounded-xl border border-indigo-100 hover:bg-indigo-100 transition-colors whitespace-nowrap flex-shrink-0'>
                  Support
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
