import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { useCourierHistory } from '../../entities/order/api/courierApi';
import { OrderStatus } from '../../shared/api/types';

export const CourierHistoryPage = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const size = 10;
  
  const { data: historyPage, isLoading } = useCourierHistory(page, size);

  return (
    <div className='min-h-screen bg-gray-50 text-gray-900'>
      {/* ── Header ── */}
      <header className='bg-white border-b border-gray-200 shadow-sm sticky top-0 z-30'>
        <div className='max-w-6xl mx-auto px-4 py-3 flex justify-between items-center'>
          <button
            onClick={() => navigate('/courier')}
            className='text-gray-500 font-black flex items-center text-xs tracking-tighter hover:text-gray-800 transition-colors'
          >
            <span className='mr-1 text-lg'>←</span> RETURN
          </button>
          <div className='text-center'>
            <span className='text-[10px] block font-black tracking-widest text-gray-400 uppercase leading-none mb-1'>
              Mission Log
            </span>
            <span className='text-xs font-black text-gray-800'>
              HISTORY
            </span>
          </div>
          <div className='w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-black text-gray-600 text-[10px]'>
            LOG
          </div>
        </div>
      </header>

      <main className='max-w-3xl mx-auto px-4 py-6 space-y-4 pb-20'>
        <h2 className='text-xl font-black text-gray-800 italic tracking-tight mb-6'>
          YOUR COMPLETED MISSIONS
        </h2>

        {isLoading ? (
          <div className='space-y-4'>
            {[1, 2, 3].map((i) => (
              <div key={i} className='animate-pulse bg-white h-32 rounded-2xl border border-gray-100 shadow-sm' />
            ))}
          </div>
        ) : historyPage?.content.length === 0 ? (
          <div className='text-center py-16 text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200'>
            <p className='text-2xl mb-2'>🗄️</p>
            <p className='font-bold'>No history found.</p>
            <p className='text-xs mt-1'>Complete some deliveries to see them here.</p>
          </div>
        ) : (
          <div className='space-y-4'>
            {historyPage?.content.map((order) => (
              <div key={order.id} className='bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col space-y-3'>
                <div className='flex justify-between items-center border-b border-gray-50 pb-2'>
                  <div className='flex items-center space-x-2'>
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${order.status === OrderStatus.DELIVERED ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                      {order.status}
                    </span>
                    <span className='text-xs font-mono text-gray-400'>#{order.id.substring(0, 8)}</span>
                  </div>
                  <span className='text-xs text-gray-400 font-bold'>
                    {dayjs(order.createdAt).format('DD MMM YYYY')}
                  </span>
                </div>

                <div className='text-sm space-y-1.5'>
                  <div className='flex items-start'>
                    <div className='w-1.5 h-1.5 mt-2 rounded-full bg-green-500 mr-2 shrink-0' />
                    <p className='text-gray-700 font-medium truncate'>{order.pickupAddress}</p>
                  </div>
                  <div className='w-0.5 h-2 bg-gray-200 ml-0.5 my-0.5' />
                  <div className='flex items-start'>
                    <div className='w-1.5 h-1.5 mt-2 rounded-full bg-blue-500 mr-2 shrink-0' />
                    <p className='text-gray-700 font-medium truncate'>{order.destinationAddress}</p>
                  </div>
                </div>

                <div className='flex justify-between items-end pt-2 border-t border-gray-50'>
                  <div>
                    <p className='text-[10px] font-black text-gray-400 uppercase'>Distance</p>
                    <p className='font-bold text-gray-800 text-sm'>{order.distanceKm.toFixed(1)} km</p>
                  </div>
                  <div className='text-right'>
                    <p className='text-[10px] font-black text-gray-400 uppercase'>Earned</p>
                    <p className={`font-black text-lg ${order.status === OrderStatus.DELIVERED ? 'text-green-600' : 'text-gray-400 line-through'}`}>
                      ${order.price.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {historyPage && historyPage.totalPages > 1 && (
          <div className="flex justify-center items-center space-x-4 pt-6">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-700 disabled:opacity-50"
            >
              PREV
            </button>
            <span className="text-xs font-bold text-gray-500">
              PAGE {page + 1} OF {historyPage.totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(historyPage.totalPages - 1, p + 1))}
              disabled={page >= historyPage.totalPages - 1}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-700 disabled:opacity-50"
            >
              NEXT
            </button>
          </div>
        )}
      </main>
    </div>
  );
};
