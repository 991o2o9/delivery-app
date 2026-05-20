import {
  useBlockCourier,
  useCouriers,
} from '../../entities/admin/api/adminApi';
import { AdminLayout } from '../../widgets/admin-layout/ui/AdminLayout';

export const CouriersPage = () => {
  const { data: couriers, isLoading } = useCouriers();
  const blockMutation = useBlockCourier();

  const handleBlockToggle = async (id: string, currentIsActive: boolean) => {
    const action = currentIsActive ? 'block' : 'unblock';
    if (confirm(`Are you sure you want to ${action} this courier?`)) {
      try {
        await blockMutation.mutateAsync(id);
        alert(
          `Courier ${currentIsActive ? 'blocked' : 'unblocked'} successfully!`,
        );
      } catch (error) {
        alert('Action failed');
      }
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
                      className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white ${courier.isActive ? 'bg-green-500' : 'bg-red-500'}`}
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
                      {courier.totalOrders}
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleBlockToggle(courier.id, courier.isActive)}
                disabled={blockMutation.isPending}
                className={`w-full py-3 rounded-xl text-sm font-bold transition-all ${
                  courier.isActive
                    ? 'bg-red-50 text-red-600 hover:bg-red-600 hover:text-white'
                    : 'bg-green-50 text-green-600 hover:bg-green-600 hover:text-white'
                }`}
              >
                {blockMutation.isPending
                  ? 'Working...'
                  : courier.isActive
                    ? 'Block Access'
                    : 'Unblock Access'}
              </button>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
};
