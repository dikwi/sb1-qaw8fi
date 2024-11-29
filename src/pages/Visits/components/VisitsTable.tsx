import React from 'react';
import { Trash, Star } from 'lucide-react';
import { Visit } from '../types';
import { formatDate } from '../../../utils/dateFormatter';

interface VisitsTableProps {
  visits: Visit[];
  selectedVisits: string[];
  onSelectVisit: (id: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  onFavorite: (id: string) => void;
  onDelete: (id: string) => void;
  onViewVisit: (visit: Visit) => void;
}

const VisitsTable: React.FC<VisitsTableProps> = ({
  visits,
  selectedVisits,
  onSelectVisit,
  onSelectAll,
  onFavorite,
  onDelete,
  onViewVisit,
}) => {
  const getDepartmentColor = (department: string) => {
    switch (department.toUpperCase()) {
      case 'ER':
        return 'bg-red-100 text-red-800';
      case 'IPD':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left">
              <input
                type="checkbox"
                checked={visits.length > 0 && selectedVisits.length === visits.length}
                onChange={(e) => onSelectAll(e.target.checked)}
                className="rounded border-gray-300"
              />
            </th>
            <th className="px-4 py-3 text-left">Favorite</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Doctor</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {visits.map((visit) => (
            <tr 
              key={visit.id}
              className="hover:bg-gray-50 cursor-pointer"
              onClick={() => onViewVisit(visit)}
            >
              <td className="px-4 py-4">
                <input
                  type="checkbox"
                  checked={selectedVisits.includes(visit.id.toString())}
                  onChange={(e) => {
                    e.stopPropagation();
                    onSelectVisit(visit.id.toString(), e.target.checked);
                  }}
                  className="rounded border-gray-300"
                />
              </td>
              <td className="px-4 py-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onFavorite(visit.id.toString());
                  }}
                  className="text-gray-400 hover:text-yellow-500"
                >
                  <Star
                    size={20}
                    className={visit.attributes.favorite ? 'fill-yellow-500 text-yellow-500' : ''}
                  />
                </button>
              </td>
              <td className="px-4 py-4">{visit.attributes.patientName}</td>
              <td className="px-4 py-4">{visit.attributes.category}</td>
              <td className="px-4 py-4">{formatDate(visit.attributes.dateIn)}</td>
              <td className="px-4 py-4">{visit.attributes.doctor}</td>
              <td className="px-4 py-4">
                <span className={`px-2 py-1 text-xs rounded-full ${getDepartmentColor(visit.attributes.department)}`}>
                  {visit.attributes.department}
                </span>
              </td>
              <td className="px-4 py-4">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  visit.attributes.status === 'completed' ? 'bg-green-100 text-green-800' :
                  visit.attributes.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {visit.attributes.status}
                </span>
              </td>
              <td className="px-4 py-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(visit.id.toString());
                  }}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default VisitsTable;