import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { invoicesApi } from '../services/invoicesApi';
import { Plus, Edit, Printer } from 'lucide-react';
import InvoiceModal from '../components/InvoiceModal';

const Invoicing: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data: invoices, isLoading, error } = useQuery('invoices', invoicesApi.getAll);
  const queryClient = useQueryClient();

  const deleteMutation = useMutation(invoicesApi.delete, {
    onSuccess: () => {
      queryClient.invalidateQueries('invoices');
    },
  });

  const handleAddInvoice = () => {
    setSelectedInvoice(null);
    setIsModalOpen(true);
  };

  const handleEditInvoice = (invoice: any) => {
    setSelectedInvoice(invoice);
    setIsModalOpen(true);
  };

  const handlePrintInvoice = (invoice: any) => {
    // Implement print functionality
    console.log('Print invoice:', invoice);
  };

  const filteredInvoices = invoices?.filter(invoice => {
    const matchesSearch = invoice.attributes.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.attributes.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error fetching invoices</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Invoicing</h1>
        <button
          onClick={handleAddInvoice}
          className="bg-blue-500 text-white px-4 py-2 rounded-md flex items-center"
        >
          <Plus className="mr-2" size={20} />
          Create Invoice
        </button>
      </div>

      <div className="mb-4 flex justify-between">
        <input
          type="text"
          placeholder="Search invoices..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border rounded-md px-4 py-2 w-64"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded-md px-4 py-2"
        >
          <option value="all">All Status</option>
          <option value="Unpaid">Unpaid</option>
          <option value="Paid">Paid</option>
          <option value="Partially Paid">Partially Paid</option>
        </select>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice #</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount (USD)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount (KHR)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredInvoices?.map((invoice) => (
              <tr key={invoice.id}>
                <td className="px-6 py-4 whitespace-nowrap">{invoice.attributes.invoiceNo}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {new Date(invoice.attributes.Date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  ${invoice.attributes.totals.USD.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {invoice.attributes.totals.KHR.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    invoice.attributes.status === 'Paid' ? 'bg-green-100 text-green-800' : 
                    invoice.attributes.status === 'Partially Paid' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {invoice.attributes.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleEditInvoice(invoice)}
                    className="text-indigo-600 hover:text-indigo-900 mr-2"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handlePrintInvoice(invoice)}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    <Printer size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <InvoiceModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          invoice={selectedInvoice}
        />
      )}
    </div>
  );
};

export default Invoicing;