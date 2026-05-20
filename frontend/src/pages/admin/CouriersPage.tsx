import { useState } from 'react';
import {
  useBlockCourier,
  useCourierReviews,
  useCouriers,
} from '../../entities/admin/api/adminApi';
import { AdminLayout } from '../../widgets/admin-layout/ui/AdminLayout';
import dayjs from 'dayjs';

export const CouriersPage = () => {
  const { data: couriers, isLoading } = useCouriers();
  const blockMutation = useBlockCourier();
  
  const [selectedCourierId, setSelectedCourierId] = useState<string | null>(null);
  const { data: reviews, isLoading: reviewsLoading } = useCourierReviews(selectedCourierId);

  const handleBlockToggle = async (id: string, currentIsActive: boolean) => {
    try {
      await blockMutation.mutateAsync(id);
      alert(
        `Courier ${currentIsActive ? 'blocked' : 'unblocked'} successfully!`,
      );
    } catch (error) {
      alert('Action failed');
    }
  };

  return (
    <AdminLayout title='Courier Fleet'>
      {isLoading ? (
        <div className='animate-pulse space-y-4'>
          {[1, 2, 3].map((i) => (
            <div key={i} className='h-24 bg-gray-200 rounded-xl' />
          ))}
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {couriers?.map((courier) => (
            <div
              key={courier.id}
              className='bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow'
            >
              <div>
                <div className='flex items-center space-x-4 mb-4'>
                  <div className='relative'>
                    <div className='w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg'>
                      {courier.firstName[0]}
                      {courier.lastName[0]}
                    </div>
                    <div
                      className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white ${courier.active ? 'bg-green-500' : 'bg-red-500'}`}
                    />
                  </div>
                  <div>
                    <h3 className='font-bold text-gray-900'>
                      {courier.firstName} {courier.lastName}
                    </h3>
                    <p className='text-xs text-gray-500'>{courier.email}</p>
                  </div>
                </div>

                <div className='grid grid-cols-2 gap-4 mb-6'>
                  <div className='bg-gray-50 p-2 rounded-xl text-center'>
                    <p className='text-[10px] uppercase text-gray-400 font-bold'>
                      Rating
                    </p>
                    <p className='font-black text-gray-800'>
                      ⭐ {courier.rating.toFixed(1)}
                    </p>
                  </div>
                  <div className='bg-gray-50 p-2 rounded-xl text-center'>
                    <p className='text-[10px] uppercase text-gray-400 font-bold'>
                      Orders
                    </p>
                    <p className='font-black text-gray-800'>
                      {courier.completedOrdersCount}
                    </p>
                  </div>
                </div>
              </div>

              <div className='flex gap-2 mt-4'>
                <button
                  onClick={() => setSelectedCourierId(courier.id)}
                  className='w-1/2 py-3 rounded-xl text-sm font-bold bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all'
                >
                  View Reviews
                </button>
                <button
                  onClick={() => handleBlockToggle(courier.id, courier.active)}
                  disabled={blockMutation.isPending}
                  className={`w-1/2 py-3 rounded-xl text-sm font-bold transition-all ${
                    courier.active
                      ? 'bg-red-50 text-red-600 hover:bg-red-600 hover:text-white'
                      : 'bg-green-50 text-green-600 hover:bg-green-600 hover:text-white'
                  }`}
                >
                  {blockMutation.isPending
                    ? 'Working...'
                    : courier.active
                      ? 'Block'
                      : 'Unblock'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reviews Modal */}
      {selectedCourierId && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm'>
          <div className='bg-white w-full max-w-2xl rounded-2xl shadow-xl flex flex-col max-h-[80vh] overflow-hidden'>
            <div className='p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50'>
              <div>
                <h2 className='text-xl font-bold text-gray-900'>Courier Reviews</h2>
                <p className='text-sm text-gray-500'>
                  {couriers?.find((c) => c.id === selectedCourierId)?.firstName}{' '}
                  {couriers?.find((c) => c.id === selectedCourierId)?.lastName}
                </p>
              </div>
              <button
                onClick={() => setSelectedCourierId(null)}
                className='w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors focus:outline-none'
              >
                <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                  <line x1='18' y1='6' x2='6' y2='18' />
                  <line x1='6' y1='6' x2='18' y2='18' />
                </svg>
              </button>
            </div>

            <div className='p-6 overflow-y-auto flex-1'>
              {reviewsLoading ? (
                <div className='flex justify-center items-center py-12'>
                  <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
                </div>
              ) : reviews && reviews.length > 0 ? (
                <div className='space-y-4'>
                  {reviews.map((review) => (
                    <div key={review.id} className='bg-gray-50 rounded-xl p-5 border border-gray-100'>
                      <div className='flex justify-between items-start mb-3'>
                        <div>
                          <p className='font-bold text-sm text-gray-900'>{review.clientName}</p>
                          <p className='text-xs text-gray-500'>{review.clientEmail}</p>
                        </div>
                        <div className='text-right'>
                          <div className='flex text-yellow-400 mb-1'>
                            {[1, 2, 3, 4, 5].map((star) => (
                              <svg key={star} width='14' height='14' viewBox='0 0 24 24' fill={star <= review.rating ? 'currentColor' : 'none'} stroke={star <= review.rating ? 'currentColor' : '#d1d5db'} strokeWidth='2'>
                                <polygon points='12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2' />
                              </svg>
                            ))}
                          </div>
                          <span className='text-[10px] text-gray-400'>
                            {dayjs(review.createdAt).format('MMM D, YYYY HH:mm')}
                          </span>
                        </div>
                      </div>
                      <p className='text-sm text-gray-700 mt-2 bg-white p-3 rounded-lg border border-gray-100'>
                        {review.comment || <span className='text-gray-400 italic'>No comment provided</span>}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className='text-center py-12'>
                  <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                    <svg width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='#9ca3af' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                      <path d='M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' />
                    </svg>
                  </div>
                  <h3 className='text-lg font-bold text-gray-900'>No reviews yet</h3>
                  <p className='text-sm text-gray-500'>This courier hasn't received any reviews.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
