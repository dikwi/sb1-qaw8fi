import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { nssfVisitCasesApi } from '../services/nssfVisitCasesApi';
import { Search } from 'lucide-react';
import ErrorMessage from '../components/ErrorMessage';

const Cases: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: cases, isLoading } = useQuery(
    ['nssfCases', showInactive],
    () => showInactive ? nssfVisitCasesApi.getAll() : nssfVisitCasesApi.getActive(),
    {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
      onError: (err: any) => {
        setError(err.message || 'Failed to load NSSF cases');
      }
    }
  );

  const filteredCases = cases?.filter(nssfCase => 
    nssfCase.attributes.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    nssfCase.attributes.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    nssfCase.attributes.khmerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) return <div>Loading...</div>;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">NSSF Medical Visit Cases</h1>
      </div>

      <div className="mb-4 flex justify-between items-center">
        <div className="relative">
          <input
            type="text"
            placeholder="Search cases..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border rounded-md w-64"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        </div>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={showInactive}
            onChange={(e) => setShowInactive(e.target.checked)}
            className="mr-2"
          />
          Show Inactive Cases
        </label>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Khmer Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredCases?.map((nssfCase) => (
              <tr key={nssfCase.id}>
                <td className="px-6 py-4 whitespace-nowrap">{nssfCase.attributes.code}</td>
                <td className="px-6 py-4 whitespace-nowrap">{nssfCase.attributes.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{nssfCase.attributes.khmerName}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    nssfCase.attributes.sta_rec_code === 'ACTIV' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {nssfCase.attributes.sta_rec_code === 'ACTIV' ? 'Active' : 'Inactive'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Cases;