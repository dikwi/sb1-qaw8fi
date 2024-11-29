import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { claimsApi, Claim } from '../services/claimsApi';
import { X, Plus, RefreshCw, FileText } from 'lucide-react';
import ClaimModal from '../components/ClaimModal';
import ClaimStatusModal from '../components/ClaimStatusModal';
import ClaimDetailsModal from '../components/ClaimDetailsModal';
import MonthlyClaimsBatchProcess from '../components/MonthlyClaimsBatchProcess';

const Claims: React.FC = () => {
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const queryClient = useQueryClient();
  const { data: claims, isLoading, error } = useQuery('claims', claimsApi.getAll);

  const submitClaimMutation = useMutation(claimsApi.submit, {
    onSuccess: () => {
      queryClient.invalidateQueries('claims');
      setIsStatusModalOpen(false);
    },
  });

  const updateClaimStatusMutation = useMutation(
    ({ id, status }: { id: number; status: 'Approved' | 'Rejected' | 'Paid' }) => {
      switch (status) {
        case 'Approved':
          return claimsApi.approve(id);
        case 'Rejected':
          return claimsApi.reject(id);
        case 'Paid':
          return claimsApi.markAsPaid(id);
        default:
          throw new Error('Invalid status');
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('claims');
        setIsStatusModalOpen(false);
      },
    }
  );

  const filteredClaims = useMemo(() => {
    return claims?.filter(claim => {
      const matchesSearch = 
        claim.attributes.claimID.toLowerCase().includes(searchTerm.toLowerCase()) ||
        claim.attributes.hf.data.attributes.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || claim.attributes.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [claims, searchTerm, statusFilter]);

  const handleViewClaim = (claim: Claim) => {
    setSelectedClaim(claim);
    setIsDetailsModalOpen(true);
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading claims</div>;

  return (
    <div>
      <div className="mb-6">
        <MonthlyClaimsBatchProcess />
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <input
            type="text"
            placeholder="Search claims..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border rounded-md px-4 py-2"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded-md px-4 py-2"
          >
            <option value="all">All Status</option>
            <option value="Draft">Draft</option>
            <option value="Submited">Submitted</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Paid">Paid</option>
          </select>
        </div>
        <button
          onClick={() => setIsClaimModalOpen(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded-md flex items-center"
        >
          <Plus className="mr-2" size={20} />
          New Claim
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Claim ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Facility</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredClaims?.map((claim) => (
              <tr key={claim.id}>
                <td className="px-6 py-4 whitespace-nowrap">{claim.attributes.claimID}</td>
                <td className="px-6 py-4 whitespace-nowrap">{claim.attributes.hf.data.attributes.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {new Date(claim.attributes.claimDate).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {claim.attributes.amountClaimed.toLocaleString()} {claim.attributes.currency}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    claim.attributes.status === 'Approved' ? 'bg-green-100 text-green-800' :
                    claim.attributes.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                    claim.attributes.status === 'Paid' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {claim.attributes.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => {
                      setSelectedClaim(claim);
                      setIsStatusModalOpen(true);
                    }}
                    className="text-indigo-600 hover:text-indigo-900 mr-2"
                  >
                    <RefreshCw size={16} />
                  </button>
                  <button
                    onClick={() => handleViewClaim(claim)}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    <FileText size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isClaimModalOpen && (
        <ClaimModal
          isOpen={isClaimModalOpen}
          onClose={() => setIsClaimModalOpen(false)}
          claim={null}
        />
      )}

      {isStatusModalOpen && selectedClaim && (
        <ClaimStatusModal
          isOpen={isStatusModalOpen}
          onClose={() => {
            setIsStatusModalOpen(false);
            setSelectedClaim(null);
          }}
          claim={selectedClaim}
          onUpdateStatus={(status) => {
            if (selectedClaim) {
              updateClaimStatusMutation.mutate({ 
                id: selectedClaim.id, 
                status: status as 'Approved' | 'Rejected' | 'Paid'
              });
            }
          }}
        />
      )}

      {isDetailsModalOpen && selectedClaim && (
        <ClaimDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => {
            setIsDetailsModalOpen(false);
            setSelectedClaim(null);
          }}
          claim={selectedClaim}
        />
      )}
    </div>
  );
};

export default Claims;