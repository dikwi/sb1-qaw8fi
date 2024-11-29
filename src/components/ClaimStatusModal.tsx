import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Claim } from '../services/claimsApi';

interface ClaimStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  claim: Claim;
  onUpdateStatus: (status: string) => void;
}

const ClaimStatusModal: React.FC<ClaimStatusModalProps> = ({ isOpen, onClose, claim, onUpdateStatus }) => {
  const [newStatus, setNewStatus] = useState(claim.attributes.status);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onUpdateStatus(newStatus);
      onClose();
    } catch (error) {
      console.error('Error updating claim status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-8 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Update Claim Status</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Current Status</label>
            <p className="mt-1 text-sm text-gray-500">{claim.attributes.status}</p>
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">New Status</label>
            <select
              id="status"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              disabled={isLoading}
            >
              <option value="Draft">Draft</option>
              <option value="Submited">Submitted</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="Paid">Paid</option>
            </select>
          </div>

          {newStatus === 'Rejected' && (
            <div>
              <label htmlFor="rejectionReason" className="block text-sm font-medium text-gray-700">Rejection Reason</label>
              <textarea
                id="rejectionReason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                rows={3}
                required
                disabled={isLoading}
              />
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading || newStatus === claim.attributes.status}
            >
              {isLoading ? 'Updating...' : 'Update Status'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClaimStatusModal;