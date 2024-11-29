import React from 'react';
import { X } from 'lucide-react';

interface WaitingQueueModalProps {
  isOpen: boolean;
  onClose: () => void;
  visits: any[];
}

const WaitingQueueModal: React.FC<WaitingQueueModalProps> = ({ isOpen, onClose, visits }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-8 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Today's Waiting Queue</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Queue #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {visits.map((visit) => (
                <tr key={visit.id}>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">{visit.queueNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{visit.patientName}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{visit.doctor}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{visit.department}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(visit.dateIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default WaitingQueueModal;