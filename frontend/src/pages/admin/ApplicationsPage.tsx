import { usePendingApplications, useApproveApplication } from '../../entities/application/api/applicationApi';
import { AdminLayout } from '../../widgets/admin-layout/ui/AdminLayout';

export const ApplicationsPage = () => {
  const { data: applications, isLoading } = usePendingApplications();
  const approveMutation = useApproveApplication();

  const handleApprove = async (id: string) => {
    try {
      await approveMutation.mutateAsync(id);
      alert('Application approved successfully!');
    } catch (error) {
      alert('Failed to approve application');
    }
  };

  return (
    <AdminLayout title="Recruitment">
      {isLoading ? (
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-32 bg-gray-200 rounded-xl" />)}
        </div>
      ) : applications?.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
          <p className="text-gray-400 font-medium font-black uppercase tracking-widest">No pending applications</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {applications?.map((app) => (
            <div key={app.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:shadow-md transition-shadow">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="font-bold text-lg text-gray-900">{app.userName}</h3>
                  <span className="px-2.5 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-black uppercase rounded-full border border-blue-100">
                    {app.userEmail}
                  </span>
                </div>
                <p className="text-gray-600 text-sm italic bg-gray-50 p-4 rounded-xl border border-gray-100">
                  "{app.message}"
                </p>
                <p className="text-[10px] text-gray-400 mt-3 uppercase font-black tracking-widest">
                  Applied on: {new Date(app.createdAt).toLocaleDateString()}
                </p>
              </div>

              <button
                onClick={() => handleApprove(app.id)}
                disabled={approveMutation.isPending}
                className="w-full md:w-auto px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-black uppercase tracking-widest rounded-xl shadow-lg shadow-green-100 transition-all disabled:bg-gray-200 text-xs"
              >
                {approveMutation.isPending ? 'Processing...' : 'Approve Application'}
              </button>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
};
