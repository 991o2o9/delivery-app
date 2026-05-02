import { useState } from 'react';
import { useApplyForCourier } from '../../../entities/application/api/applicationApi';
import { useAuthStore } from '../../../entities/user/model/store';

interface CourierApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CourierApplyModal = ({ isOpen, onClose, onSuccess }: CourierApplyModalProps) => {
  const [message, setMessage] = useState('');
  const user = useAuthStore((state) => state.user);
  const applyMutation = useApplyForCourier();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    try {
      await applyMutation.mutateAsync({ userId: user.id, message });
      onSuccess();
      onClose();
    } catch (error) {
      alert('Failed to send application');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Apply to be a Courier</h2>
        <p className="text-gray-600 mb-6 text-sm">
          Tell us why you want to join our delivery team. We will review your application soon.
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Your Message</label>
            <textarea
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              rows={4}
              placeholder="E.g. I have a car and 2 years of delivery experience..."
            />
          </div>

          <div className="flex space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={applyMutation.isPending}
              className="flex-1 py-3 px-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:bg-blue-300 shadow-lg shadow-blue-200 transition-all"
            >
              {applyMutation.isPending ? 'Sending...' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
