import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Tab } from '@headlessui/react';

interface PayrollModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payrollData: any) => void;
}

const PayrollModal: React.FC<PayrollModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [formData, setFormData] = useState({
    staffId: '',
    payPeriod: '',
    baseSalary: 0,
    caseBasePay: 0,
    incentives: 0,
    deductions: 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-6xl h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Payroll Management</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
          <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1 mb-4">
            <Tab className={({ selected }) =>
              `w-full rounded-lg py-2.5 text-sm font-medium leading-5 
              ${selected 
                ? 'bg-white text-blue-700 shadow'
                : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'}`
            }>
              Process Payroll
            </Tab>
            <Tab className={({ selected }) =>
              `w-full rounded-lg py-2.5 text-sm font-medium leading-5 
              ${selected 
                ? 'bg-white text-blue-700 shadow'
                : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'}`
            }>
              Payroll History
            </Tab>
          </Tab.List>

          <Tab.Panels className="flex-1 overflow-hidden">
            <Tab.Panel className="h-full overflow-auto">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Staff Member</label>
                    <select
                      value={formData.staffId}
                      onChange={(e) => setFormData(prev => ({ ...prev, staffId: e.target.value }))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                      required
                    >
                      <option value="">Select Staff Member</option>
                      {/* Add staff options here */}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Pay Period</label>
                    <input
                      type="month"
                      value={formData.payPeriod}
                      onChange={(e) => setFormData(prev => ({ ...prev, payPeriod: e.target.value }))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Base Salary</label>
                    <input
                      type="number"
                      value={formData.baseSalary}
                      onChange={(e) => setFormData(prev => ({ ...prev, baseSalary: parseFloat(e.target.value) }))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Case-Based Pay</label>
                    <input
                      type="number"
                      value={formData.caseBasePay}
                      onChange={(e) => setFormData(prev => ({ ...prev, caseBasePay: parseFloat(e.target.value) }))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Incentives</label>
                    <input
                      type="number"
                      value={formData.incentives}
                      onChange={(e) => setFormData(prev => ({ ...prev, incentives: parseFloat(e.target.value) }))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Deductions</label>
                    <input
                      type="number"
                      value={formData.deductions}
                      onChange={(e) => setFormData(prev => ({ ...prev, deductions: parseFloat(e.target.value) }))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                  >
                    Process Payroll
                  </button>
                </div>
              </form>
            </Tab.Panel>

            <Tab.Panel className="h-full overflow-auto">
              <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staff Member</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pay Period</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Base Salary</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Case-Based Pay</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Pay</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {/* Add your payroll history items here */}
                  </tbody>
                </table>
              </div>
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
    </div>
  );
};

export default PayrollModal;