import {
  DirectionsRenderer,
  GoogleMap,
  useJsApiLoader,
} from '@react-google-maps/api';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useOrderDetails } from '../../entities/order/api/orderApi';
import {
  cargoTypeLabelMap,
  statusColorMap,
  statusLabelMap,
  urgencyLabelMap,
} from '../../shared/utils/enumMappings';

const mapContainerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '1rem',
};

const LIBRARIES: ('places' | 'marker')[] = ['places', 'marker'];

export const OrderDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading, isError } = useOrderDetails(id);
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
    if (isLoaded && order) {
      calculateRoute();
    }
  }, [isLoaded, order?.pickupLat, order?.destLat]);

  if (isLoading)
    return (
      <div className='p-8 text-center animate-pulse font-black text-blue-600'>
        LOADING SHIPMENT DATA...
      </div>
    );
  if (isError || !order)
    return <div className='p-8 text-center text-red-500 font-bold'>⚠️ Order not found.</div>;

  const pickupPos = { lat: order.pickupLat, lng: order.pickupLon };

  return (
    <div className='min-h-screen bg-gray-50 p-4 md:p-8'>
      <div className='max-w-6xl mx-auto'>
        <div className='mb-6 flex justify-between items-center'>
          <Link
            to='/client'
            className='text-gray-500 font-bold hover:text-blue-600 flex items-center space-x-2 transition-colors'
          >
            <span>← Back to Dashboard</span>
          </Link>
          <div className='text-right'>
            <p className='text-[10px] font-black text-gray-400 uppercase tracking-widest'>Ordered on</p>
            <p className='text-sm font-bold text-gray-700'>{dayjs(order.createdAt).format('DD MMMM YYYY')}</p>
          </div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          {/* Left Column: Detailed Info */}
          <div className='lg:col-span-1 space-y-6'>
            
            {/* Status & ID Card */}
            <div className='bg-white p-6 rounded-2xl shadow-sm border border-gray-100'>
              <div className='flex justify-between items-start mb-6'>
                <div>
                  <h1 className='text-2xl font-black text-gray-900 tracking-tighter'>
                    SHIPMENT #{order.id.substring(0, 8).toUpperCase()}
                  </h1>
                  <p className='text-[10px] font-bold text-blue-500 uppercase tracking-widest mt-1'>
                    Internal Tracking Active
                  </p>
                </div>
              </div>
              <div className={`w-full py-3 rounded-xl border flex items-center justify-center gap-2 ${statusColorMap[order.status]} shadow-sm`}>
                <div className='w-2 h-2 rounded-full bg-current animate-pulse' />
                <span className='text-xs font-black uppercase tracking-widest'>
                  {statusLabelMap[order.status]}
                </span>
              </div>
            </div>

            {/* Courier Info (Conditional) */}
            {order.courierEmail && (
              <div className='bg-blue-600 p-6 rounded-2xl shadow-lg shadow-blue-100 text-white'>
                <p className='text-[10px] font-black uppercase tracking-widest opacity-70 mb-3'>Your Courier</p>
                <div className='flex items-center gap-4'>
                  <div className='w-12 h-12 rounded-full bg-white/20 flex items-center justify-center font-black text-lg'>
                    {order.courierEmail[0].toUpperCase()}
                  </div>
                  <div>
                    <p className='font-bold'>{order.courierEmail}</p>
                    <p className='text-[10px] uppercase font-black opacity-60'>Assigned to your mission</p>
                  </div>
                </div>
              </div>
            )}

            {/* Main Details */}
            <div className='bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-5'>
              <div className='grid grid-cols-2 gap-4 pb-5 border-b border-gray-50'>
                <div>
                  <p className='text-[10px] uppercase font-black text-gray-400 tracking-wider mb-1'>Distance</p>
                  <p className='text-lg font-black text-gray-800'>{order.distanceKm.toFixed(2)} km</p>
                </div>
                <div>
                  <p className='text-[10px] uppercase font-black text-gray-400 tracking-wider mb-1'>Total Weight</p>
                  <p className='text-lg font-black text-gray-800'>{order.weight} kg</p>
                </div>
              </div>

              <div className='space-y-4'>
                <div className='relative pl-6'>
                  <div className='absolute left-0 top-1.5 w-2 h-2 rounded-full bg-green-500' />
                  <p className='text-[10px] uppercase font-black text-gray-400 tracking-wider'>Pickup</p>
                  <p className='text-sm text-gray-700 font-bold'>{order.pickupAddress}</p>
                </div>
                <div className='relative pl-6'>
                  <div className='absolute left-0 top-1.5 w-2 h-2 rounded-full bg-blue-500' />
                  <p className='text-[10px] uppercase font-black text-gray-400 tracking-wider'>Destination</p>
                  <p className='text-sm text-gray-700 font-bold'>{order.destinationAddress}</p>
                  {order.receiverName && (
                    <p className='text-[11px] text-gray-400 font-medium mt-1 italic'>To: {order.receiverName}</p>
                  )}
                </div>
              </div>

              <div className='pt-5 border-t border-gray-50 grid grid-cols-2 gap-4'>
                <div>
                  <p className='text-[10px] uppercase font-black text-gray-400 tracking-wider'>Cargo</p>
                  <p className='text-sm font-bold text-gray-700'>{cargoTypeLabelMap[order.cargoType]}</p>
                </div>
                <div>
                  <p className='text-[10px] uppercase font-black text-gray-400 tracking-wider'>Urgency</p>
                  <p className='text-sm font-bold text-gray-700'>{urgencyLabelMap[order.urgency]}</p>
                </div>
              </div>

              <div className='pt-5 border-t border-gray-50 flex justify-between items-end'>
                <div>
                  <p className='text-[10px] uppercase font-black text-gray-400 tracking-wider'>Paid via {order.paymentMethod}</p>
                  <p className='text-3xl font-black text-blue-600 mt-1'>${order.price.toFixed(2)}</p>
                </div>
                {order.estimatedArrivalTime && order.status !== 'DELIVERED' && (
                  <div className='text-right'>
                    <p className='text-[10px] uppercase font-black text-gray-400 tracking-wider'>ETA</p>
                    <p className='text-sm font-bold text-orange-500'>{dayjs(order.estimatedArrivalTime).format('HH:mm')}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Timeline */}
            <div className='bg-white p-6 rounded-2xl shadow-sm border border-gray-100'>
              <p className='text-[10px] font-black text-gray-400 tracking-widest uppercase mb-6 text-center border-b border-gray-50 pb-4'>
                Live Tracking Log
              </p>

              <div className='relative'>
                <div className='absolute left-[17px] top-2 bottom-2 w-0.5 bg-gray-50' />

                <div className='flex flex-col space-y-6'>
                  {order.history?.map((entry, index) => {
                    const isFirst = index === 0;
                    const iconColor = isFirst
                      ? 'bg-blue-600 border-blue-100 text-white'
                      : 'bg-white border-gray-100 text-gray-300';

                    return (
                      <div key={entry.status + entry.changedAt} className='flex items-start gap-4 relative'>
                        <div className={`w-[36px] h-[34px] rounded-full border-2 flex items-center justify-center flex-shrink-0 z-10 transition-all ${iconColor} ${isFirst ? 'shadow-lg shadow-blue-100 scale-110' : ''}`}>
                          <svg width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='3' strokeLinecap='round' strokeLinejoin='round'>
                            <polyline points='20 6 9 17 4 12' />
                          </svg>
                        </div>

                        <div className='flex-1 min-w-0 pt-0.5'>
                          <div className='flex items-center justify-between mb-1'>
                            <span className={`text-sm font-black uppercase tracking-tight ${isFirst ? 'text-gray-900' : 'text-gray-400'}`}>
                              {statusLabelMap[entry.status]}
                            </span>
                            <time className='text-[10px] font-bold text-gray-300 bg-gray-50 px-2 py-0.5 rounded'>
                              {dayjs(entry.changedAt).format('HH:mm')}
                            </time>
                          </div>
                          {isFirst && (
                            <p className='text-[10px] text-blue-500 font-bold uppercase tracking-tighter'>Latest Activity</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Map Preview */}
          <div className='lg:col-span-2'>
            <div className='sticky top-8 space-y-4'>
              <div className='bg-white p-2 rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden'>
                {isLoaded ? (
                  <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={pickupPos}
                    zoom={12}
                    options={{
                      mapId: import.meta.env.VITE_GOOGLE_MAPS_MAP_ID,
                      disableDefaultUI: true,
                      zoomControl: true,
                      styles: [{ featureType: "all", elementType: "labels.text.fill", stylers: [{ color: "#333333" }] }]
                    }}
                  >
                    {directionsResponse && (
                      <DirectionsRenderer 
                        directions={directionsResponse} 
                        options={{
                          polylineOptions: { strokeColor: "#2563eb", strokeWeight: 5, strokeOpacity: 0.8 },
                          markerOptions: { opacity: 0.9 }
                        }}
                      />
                    )}
                  </GoogleMap>
                ) : (
                  <div className='h-[400px] flex items-center justify-center bg-gray-100 rounded-3xl animate-pulse font-black text-gray-300'>
                    INITIALIZING REAL-TIME MAP...
                  </div>
                )}
                <div className='p-5 flex justify-between items-center bg-gray-50/50'>
                  <div className='flex items-center gap-3'>
                    <div className='flex -space-x-2'>
                      <div className='w-6 h-6 rounded-full bg-green-500 border-2 border-white' />
                      <div className='w-6 h-6 rounded-full bg-blue-500 border-2 border-white' />
                    </div>
                    <span className='text-[10px] font-black text-gray-500 uppercase tracking-widest'>Route established</span>
                  </div>
                  <span className='text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-tighter'>
                    Kyrgyzstan Delivery Zone
                  </span>
                </div>
              </div>
              
              <div className='p-6 bg-indigo-50 rounded-2xl border border-indigo-100 flex items-center justify-between'>
                <div className='flex items-center gap-4'>
                  <div className='text-2xl'>🛡️</div>
                  <div>
                    <p className='text-sm font-black text-indigo-900 leading-tight uppercase'>Secure Delivery</p>
                    <p className='text-[11px] text-indigo-600 font-medium'>Your package is protected by our global insurance policy.</p>
                  </div>
                </div>
                <button className='text-[10px] font-black bg-white text-indigo-600 px-4 py-2 rounded-xl shadow-sm hover:shadow-md transition-all uppercase'>
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
