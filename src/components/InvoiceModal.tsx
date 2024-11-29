import React, { useState, useEffect } from 'react';
import { X, Plus, Trash } from 'lucide-react';
import { useMutation, useQueryClient } from 'react-query';
import { invoicesApi, CreateInvoiceData, InvoiceItem } from '../services/invoicesApi';
import { useHealthFacility } from '../contexts/HealthFacilityContext';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice?: any;
}

const InvoiceModal: React.FC<InvoiceModalProps> = ({ isOpen, onClose, invoice }) => {
  const { currentFacility } = useHealthFacility();
  const queryClient = useQueryClient();

  const initialFormData: CreateInvoiceData = {
    invoiceNo: '',
    Date: new Date().toISOString(),
    status: 'Unpaid',
    items: [],
    totals: {
      USD: 0,
      KHR: 0
    },
    adm: [{
      active: true,
      hf: currentFacility?.id?.toString() || ''
    }]
  };

  const [formData, setFormData] = useState<CreateInvoiceData>(initialFormData);

  useEffect(() => {
    if (invoice) {
      setFormData({
        invoiceNo: invoice.attributes.invoiceNo,
        Date: invoice.attributes.Date,
        status: invoice.attributes.status,
        items: invoice.attributes.items.map((item: any) => ({
          Description: item.Description,
          qty: item.qty,
          rate: item.rate,
          disc: item.disc,
          disc2: item.disc2,
          amt: item.amt
        })),
        totals: invoice.attributes.totals,
        adm: invoice.attributes.adm.map((admItem: any) => ({
          active: admItem.active,
          hf: currentFacility?.id?.toString() || '',
          lock: admItem.lock || false
        }))
      });
    } else {
      // Generate new invoice number and set hf from currentFacility
      setFormData({
        ...initialFormData,
        invoiceNo: `INV-${Date.now()}`,
        adm: [{
          active: true,
          hf: currentFacility?.id?.toString() || ''
        }]
      });
    }
  }, [invoice, currentFacility]);

  const addMutation = useMutation(invoicesApi.create, {
    onSuccess: () => {
      queryClient.invalidateQueries('invoices');
      onClose();
    }
  });

  const updateMutation = useMutation(
    ({ id, data }: { id: number; data: Partial<CreateInvoiceData> }) =>
      invoicesApi.update(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('invoices');
        onClose();
      }
    }
  );

  const handleAddItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          Description: '',
          qty: 1,
          rate: 0,
          disc: null,
          disc2: null,
          amt: 0
        }
      ]
    }));
  };

  const handleRemoveItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
    setFormData(prev => {
      const newItems = [...prev.items];
      const currentItem = newItems[index];
      
      let updatedAmt = currentItem.amt;

      if (field === 'qty' || field === 'rate') {
        const qty = field === 'qty' ? value : currentItem.qty;
        const rate = field === 'rate' ? value : currentItem.rate;
        updatedAmt = qty * rate;

        // Apply existing discounts if any
        if (currentItem.disc) {
          updatedAmt *= (1 - currentItem.disc / 100);
        }
        if (currentItem.disc2) {
          updatedAmt *= (1 - currentItem.disc2 / 100);
        }
      } else if (field === 'disc' || field === 'disc2') {
        const baseAmt = currentItem.qty * currentItem.rate;
        const disc1 = field === 'disc' ? value : currentItem.disc;
        const disc2 = field === 'disc2' ? value : currentItem.disc2;
        
        updatedAmt = baseAmt;
        if (disc1) {
          updatedAmt *= (1 - disc1 / 100);
        }
        if (disc2) {
          updatedAmt *= (1 - disc2 / 100);
        }
      }

      newItems[index] = {
        ...currentItem,
        [field]: value,
        amt: updatedAmt
      };

      // Calculate totals
      const totalUSD = newItems.reduce((sum, item) => sum + item.amt, 0);
      const exchangeRate = currentFacility?.attributes.exchange || 4100;

      return {
        ...prev,
        items: newItems,
        totals: {
          USD: totalUSD,
          KHR: totalUSD * exchangeRate
        }
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Ensure health facility is set
    const submissionData = {
      ...formData,
      adm: [{
        active: true,
        hf: currentFacility?.id?.toString() || '',
        lock: false
      }]
    };

    if (invoice?.id) {
      updateMutation.mutate({ id: invoice.id, data: submissionData });
    } else {
      addMutation.mutate(submissionData);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center overflow-y-auto">
      <div className="bg-white rounded-lg p-8 w-full max-w-4xl my-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">{invoice ? 'Edit Invoice' : 'Create Invoice'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Invoice Number</label>
              <input
                type="text"
                value={formData.invoiceNo}
                readOnly
                className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Date</label>
              <input
                type="datetime-local"
                value={formData.Date.slice(0, 16)}
                onChange={(e) => setFormData(prev => ({ ...prev, Date: new Date(e.target.value).toISOString() }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-medium">Items</h3>
              <button
                type="button"
                onClick={handleAddItem}
                className="text-blue-500 hover:text-blue-700"
              >
                <Plus size={20} />
              </button>
            </div>
            <div className="space-y-2">
              {formData.items.map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={item.Description}
                    onChange={(e) => handleItemChange(index, 'Description', e.target.value)}
                    placeholder="Description"
                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    required
                  />
                  <input
                    type="number"
                    value={item.qty}
                    onChange={(e) => handleItemChange(index, 'qty', parseFloat(e.target.value) || 0)}
                    placeholder="Qty"
                    className="w-20 rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    required
                    min={0}
                  />
                  <input
                    type="number"
                    value={item.rate}
                    onChange={(e) => handleItemChange(index, 'rate', parseFloat(e.target.value) || 0)}
                    placeholder="Rate"
                    className="w-24 rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    required
                    min={0}
                  />
                  <input
                    type="number"
                    value={item.disc || ''}
                    onChange={(e) => handleItemChange(index, 'disc', e.target.value ? parseFloat(e.target.value) : null)}
                    placeholder="Disc %"
                    className="w-20 rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    min={0}
                    max={100}
                  />
                  <input
                    type="number"
                    value={item.disc2 || ''}
                    onChange={(e) => handleItemChange(index, 'disc2', e.target.value ? parseFloat(e.target.value) : null)}
                    placeholder="Disc2 %"
                    className="w-20 rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    min={0}
                    max={100}
                  />
                  <span className="w-24 text-right">${item.amt.toFixed(2)}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash size={20} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                className="mt-1 rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                required
              >
                <option value="Unpaid">Unpaid</option>
                <option value="Paid">Paid</option>
                <option value="Partially Paid">Partially Paid</option>
              </select>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold">Total: ${formData.totals.USD.toFixed(2)}</p>
              <p className="text-sm text-gray-600">KHR: {formData.totals.KHR.toLocaleString()}</p>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
              disabled={!currentFacility}
            >
              {invoice ? 'Update Invoice' : 'Create Invoice'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InvoiceModal;