import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useQuery } from 'react-query';
import { useHealthFacility } from '../contexts/HealthFacilityContext';
import { invoicesApi } from '../services/invoicesApi';
import { claimsApi, Claim } from '../services/claimsApi';

interface ClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
  claim: Claim | null;
}

const ClaimModal: React.FC<ClaimModalProps> = ({ isOpen, onClose, claim }) => {
  const { currentFacility } = useHealthFacility();
  const [formData, setFormData] = useState({
    claimID: '',
    claimType: 'Healthcare',
    claimDate: new Date().toISOString().split('T')[0],
    status: 'Draft',
    amountClaimed: 0,
    currency: currentFacility?.attributes.currency || 'KHR',
    selectedInvoices: [] as number[],
  });

  const { data: invoices } = useQuery('invoices', invoicesApi.getAll);

  useEffect(() => {
    if (claim) {
      setFormData({
        claimID: claim.attributes.claimID,
        claimType: claim.attributes.claimType,
        claimDate: claim.attributes.claimDate,
        status: claim.attributes.status,
        amountClaimed: claim.attributes.amountClaimed,
        currency: claim.attributes.currency,
        selectedInvoices: claim.attributes.invoices.data.map(inv => inv.id),
      });
    } else {
      setFormData(prev => ({
        ...prev,
        claimID: claimsApi.generateClaimId(currentFacility?.attributes.khmerName || 'CLM'),
        currency: currentFacility?.attributes.currency || 'KHR',
      }));
    }
  }, [claim, currentFacility]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleInvoiceSelection = (invoiceId: number) => {
    setFormData(prev => {
      const isSelected = prev.selectedInvoices.includes(invoiceId);
      const updatedInvoices = isSelected
        ? prev.selectedInvoices.filter(id => id !== invoiceId)
        : [...prev.selectedInvoices, invoiceId];
      
      // Calculate total amount from selected invoices
      const totalAmount = invoices
        ?.filter(inv => updatedInvoices.includes(inv.id))
        .reduce((sum, inv) => sum + (inv.attributes.totals?.USD || 0), 0);

      return {
        ...prev,
        selectedInvoices: updatedInvoices,
        amountClaimed: totalAmount * (currentFacility?.attributes.exchange || 4000),
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!currentFacility) {
        throw new Error('No facility selected');
      }

      const claimData = {
        ...formData,
        hf: currentFacility.id,
        invoices: formData.selectedInvoices,
      };

      if (claim) {
        await claimsApi.update(claim.id, claimData);
      } else {
        await claimsApi.create(claimData);
      }
      onClose();
    } catch (error) {
      console.error('Error saving claim:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-8 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">{claim ? 'Edit Claim' : 'New Claim'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Claim ID</label>
              <input
                type="text"
                name="claimID"
                value={formData.claimID}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                required
                readOnly
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Claim Type</label>
              <select
                name="claimType"
                value={formData.claimType}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                required
              >
                <option value="Healthcare">Healthcare</option>
                <option value="Insurance">Insurance</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Claim Date</label>
              <input
                type="date"
                name="claimDate"
                value={formData.claimDate}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Currency</label>
              <select
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                required
              >
                <option value="KHR">KHR</option>
                <option value="USD">USD</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Invoices</label>
            <div className="max-h-48 overflow-y-auto border rounded-md p-2">
              {invoices?.map(invoice => (
                <div key={invoice.id} className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    checked={formData.selectedInvoices.includes(invoice.id)}
                    onChange={() => handleInvoiceSelection(invoice.id)}
                    className="mr-2"
                  />
                  <label className="text-sm">
                    {invoice.attributes.invoiceNo} - ${invoice.attributes.totals?.USD.toFixed(2)}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Amount Claimed</label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <input
                type="number"
                name="amountClaimed"
                value={formData.amountClaimed}
                onChange={handleChange}
                className="block w-full rounded-md border-gray-300 pl-7 pr-12 focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                required
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">{formData.currency}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              {claim ? 'Update Claim' : 'Create Claim'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClaimModal;