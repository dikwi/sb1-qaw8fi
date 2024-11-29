import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { visitCasesApi, VisitCase } from '../services/visitCasesApi';
import { Search, Plus, Edit, Trash } from 'lucide-react';
import VisitCaseModal from '../components/VisitCaseModal';
import ErrorMessage from '../components/ErrorMessage';

const VisitCases: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState<VisitCase | null>(null);
  const [error, setError] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const { data: visitCases, isLoading } = useQuery(
    'visitCases',
    visitCasesApi.getActive,
    {
      retry: 1,
      staleTime: 5 * 60 * 1000,
      onError: (err: any) => {
        setError(err.message || 'Failed to load visit cases');
      }
    }
  );

  const createMutation = useMutation(visitCasesApi.create, {
    onSuccess: () => {
      queryClient.invalidateQueries('visitCases');
      setIsModalOpen(false);
    },
    onError: (err: any) => {
      setError(err.message || 'Failed to create visit case');
    }
  });

  const updateMutation = useMutation(
    ({ id, data }: { id: number; data: any }) => visitCasesApi.update(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('visitCases');
        setIsModalOpen(false);
      },
      onError: (err: any) => {
        setError(err.message || 'Failed to update visit case');
      }
    }
  );

  const deleteMutation = useMutation(visitCasesApi.delete, {
    onSuccess: () => {
      queryClient.invalidateQueries('visitCases');
    },
    onError: (err: any) => {
      setError(err.message || 'Failed to delete visit case');
    }
  });

  const handleAddCase = () => {
    setSelectedCase(null);
    setIsModalOpen(true);
  };

  const handleEditCase = (visitCase: VisitCase) => {
    setSelectedCase(visitCase);
    setIsModalOpen(true);
  };

  const handleDeleteCase = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this visit case?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const filteredCases = visitCases?.filter(visitCase => 
    visitCase.attributes.med_vis_ref.toLowerCase().includes(searchTerm.toLowerCase()) ||
    visitCase.attributes.med_vis_cas_ref.toLowerCase().includes(searchTerm.toLowerCase()) ||
    visitCase.attributes.hea_fac_id.data.attributes.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) return <div>Loading...</div>;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">NSSF Visit Cases</h1>
        <button
          onClick={handleAddCase}
          className="bg-blue-500 text-white px-4 py-2 rounded-md flex items-center"
        >
          <Plus className="mr-2" size={20} />
          New Visit Case
        </button>
      </div>

      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search visit cases..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border rounded-md w-64"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visit Ref</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Case Ref</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Facility</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price (KHR)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredCases?.map((visitCase) => (
              <tr key={visitCase.id}>
                <td className="px-6 py-4 whitespace-nowrap">{visitCase.attributes.med_vis_ref}</td>
                <td className="px-6 py-4 whitespace-nowrap">{visitCase.attributes.med_vis_cas_ref}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {visitCase.attributes.hea_fac_id.data.attributes.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {visitCase.attributes.med_vis_cas_price_khr.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    visitCase.attributes.sta_rec_code === 'ACTIV' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {visitCase.attributes.sta_rec_code}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleEditCase(visitCase)}
                    className="text-indigo-600 hover:text-indigo-900 mr-2"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteCase(visitCase.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <VisitCaseModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedCase(null);
          }}
          visitCase={selectedCase}
          onSubmit={(data) => {
            if (selectedCase) {
              updateMutation.mutate({ id: selectedCase.id, data });
            } else {
              createMutation.mutate(data);
            }
          }}
        />
      )}
    </div>
  );
};

export default VisitCases;