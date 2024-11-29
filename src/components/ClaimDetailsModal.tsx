import React from 'react';
import { X, FileText } from 'lucide-react';
import { Claim } from '../services/claimsApi';

interface ClaimDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  claim: Claim;
}

const ClaimDetailsModal: React.FC<ClaimDetailsModalProps> = ({ isOpen, onClose, claim }) => {
  if (!isOpen) return null;

  const formatCurrency = (amount: number, currency: string) => {
    return currency === 'USD' 
      ? `$${amount.toFixed(2)}` 
      : `${amount.toLocaleString()} ${currency}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-8 w-full max-w-3xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Claim Details</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500">Claim ID</label>
              <p className="mt-1 text-lg">{claim.attributes.claimID}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Status</label>
              <span className={`mt-1 inline-flex px-2 py-1 text-sm font-semibold rounded-full ${
                claim.attributes.status === 'Approved' ? 'bg-green-100 text-green-800' :
                claim.attributes.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                claim.attributes.status === 'Paid' ? 'bg-blue-100 text-blue-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {claim.attributes.status}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Claim Type</label>
              <p className="mt-1">{claim.attributes.claimType}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Claim Date</label>
              <p className="mt-1">{new Date(claim.attributes.claimDate).toLocaleDateString()}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Amount Claimed</label>
              <p className="mt-1 font-semibold">
                {formatCurrency(claim.attributes.amountClaimed, claim.attributes.currency)}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Health Facility</label>
              <p className="mt-1">{claim.attributes.hf.data.attributes.name}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 mb-2">Related Invoices</label>
            <div className="border rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Invoice No</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Date</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {claim.attributes.invoices.data.map(invoice => (
                    <tr key={invoice.id}>
                      <td className="px-4 py-2 text-sm">{invoice.attributes.invoiceNo}</td>
                      <td className="px-4 py-2 text-sm">
                        {new Date(invoice.attributes.Date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2 text-sm">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          invoice.attributes.status === 'Paid' ? 'bg-green-100 text-green-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {invoice.attributes.status || 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <button
              onClick={() => {
                // Implement print functionality
                window.print();
              }}
              className="flex items-center px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              <FileText size={16} className="mr-2" />
              Print Claim
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClaimDetailsModal;