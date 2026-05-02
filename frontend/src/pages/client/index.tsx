import { useState } from 'react';
import { OrderList } from '../../widgets/order-list/ui/OrderList';
import { useAuthStore } from '../../entities/user/model/store';
import { CourierApplyModal } from '../../features/courier-apply/ui/CourierApplyModal';
import { useNavigate } from 'react-router-dom';

export const ClientPage = () => {
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const navigate = useNavigate();
  
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Delivery Dashboard</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">Welcome, {user?.email}</span>
            <button onClick={() => logout()} className="text-sm text-red-600 hover:text-red-800 font-medium">Logout</button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Your Deliveries</h2>
          <div className="flex space-x-3">
            {hasApplied ? (
              <span className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-md text-sm font-bold">Application Pending</span>
            ) : (
              <button
                onClick={() => setIsApplyModalOpen(true)}
                className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-md hover:bg-indigo-100 font-bold transition-colors"
              >
                Become a Courier
              </button>
            )}
            <button
              onClick={() => navigate('/client/create')}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 shadow transition-colors font-bold"
            >
              Create New Order
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <OrderList />
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Active Orders</span>
                  <span className="font-bold">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Total Spent</span>
                  <span className="font-bold">$0.00</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <CourierApplyModal 
        isOpen={isApplyModalOpen} 
        onClose={() => setIsApplyModalOpen(false)} 
        onSuccess={() => setHasApplied(true)} 
      />
    </div>
  );
};
