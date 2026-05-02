import { useNavigate } from 'react-router-dom';
import { OrderForm } from '../../features/order-create/ui/OrderForm';

export const CreateOrderPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/client')}
          className="mb-6 text-gray-500 font-bold hover:text-blue-600 flex items-center space-x-2 transition-colors"
        >
          <span>← Back to Dashboard</span>
        </button>
        
        <OrderForm 
          onSuccess={() => navigate('/client')} 
          onCancel={() => navigate('/client')} 
        />
      </div>
    </div>
  );
};
