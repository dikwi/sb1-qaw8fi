import React, { useState, useEffect } from 'react';
import { Printer } from 'lucide-react';
import { useQuery } from 'react-query';
import { fetchHealthFacilities } from '../../services/api';
import { Visit } from './types';
import VisitRow from './VisitRow';

interface VisitsProps {
  visits: Visit[];
  onChange: (visits: Visit[]) => void;
}

const Visits: React.FC<VisitsProps> = ({ visits, onChange }) => {
  const [editingVisit, setEditingVisit] = useState<Visit | null>(null);
  const [newVisit, setNewVisit] = useState<Visit>({
    id: 0,
    date: new Date().toISOString().slice(0, 10),
    healthFacility: 'OPD',
    caseType: '',
    diagnosis: '',
    queueNumber: 0,
    note: '',
  });

  const { data: healthFacilities } = useQuery('healthFacilities', fetchHealthFacilities);

  useEffect(() => {
    // By default, select the new visit row
    setEditingVisit(newVisit);
  }, [newVisit]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
    visit: Visit
  ) => {
    const { name, value } = e.target;
    if (visit.id === 0) {
      setNewVisit({ ...newVisit, [name]: value });
    } else {
      setEditingVisit({ ...editingVisit!, [name]: value });
    }
  };

  const handleSaveEdit = () => {
    if (editingVisit) {
      const updatedVisits = visits.map(v => (v.id === editingVisit.id ? editingVisit : v));
      onChange(updatedVisits);
      setEditingVisit(null);
    } else if (newVisit.healthFacility && newVisit.caseType) {
      const updatedVisits = [...visits, { ...newVisit, id: Date.now() }];
      onChange(updatedVisits);
      setNewVisit({
        id: 0,
        date: new Date().toISOString().slice(0, 10),
        healthFacility: 'OPD',
        caseType: '',
        diagnosis: '',
        queueNumber: 0,
        note: '',
      });
    }
  };

  const handleDeleteVisit = (id: number) => {
    const updatedVisits = visits.filter(v => v.id !== id);
    onChange(updatedVisits);
  };

  const handleCopyVisit = (visit: Visit) => {
    const newVisitCopy = {
      ...visit,
      id: Date.now(),
      date: new Date().toISOString().slice(0, 10),
    };
    const updatedVisits = [...visits, newVisitCopy];
    onChange(updatedVisits);
  };

  return (
    <div className="flex h-full">
      {/* Left Panel: List View */}
      <div className="w-1/3 border-r border-gray-300 overflow-y-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100 text-sm">
              <th className="border p-1">Date</th>
              <th className="border p-1">Department</th>
            </tr>
          </thead>
          <tbody>
            {visits.map(visit => (
              <tr
                key={visit.id}
                className={`cursor-pointer ${editingVisit?.id === visit.id ? 'bg-blue-100' : ''}`}
                onClick={() => setEditingVisit(visit)}
              >
                <td className="border p-1">{visit.date}</td>
                <td className="border p-1">{visit.healthFacility}</td>
              </tr>
            ))}
            <tr
              key="new-visit"
              className={`cursor-pointer ${editingVisit?.id === 0 ? 'bg-blue-100' : ''}`}
              onClick={() => setEditingVisit(newVisit)}
            >
              <td className="border p-1">{newVisit.date}</td>
              <td className="border p-1">{newVisit.healthFacility}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Separator */}
      <div className="w-1 border-gray-400 cursor-col-resize bg-gray-200" />

      {/* Right Panel: Detail Form */}
      <div className="w-2/3 p-4 overflow-y-auto">
        {editingVisit ? (
          <div>
            <h2 className="text-lg font-semibold mb-4">
              {editingVisit.id === 0 ? 'Add New Visit' : 'Edit Visit'}
            </h2>
            <div>
              <div className="mb-2">
                <label className="block mb-1">Date</label>
                <input
                  type="date"
                  name="date"
                  value={editingVisit.date}
                  onChange={e => handleInputChange(e, editingVisit)}
                  className="border p-2 w-full"
                />
              </div>
              <div className="mb-2">
                <label className="block mb-1">Health Facility</label>
                <select
                  name="healthFacility"
                  value={editingVisit.healthFacility}
                  onChange={e => handleInputChange(e, editingVisit)}
                  className="border p-2 w-full"
                >
                  <option value="">Select Facility</option>
                  {healthFacilities?.map(facility => (
                    <option key={facility.id} value={facility.name}>
                      {facility.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-2">
                <label className="block mb-1">Case Type</label>
                <input
                  type="text"
                  name="caseType"
                  value={editingVisit.caseType}
                  onChange={e => handleInputChange(e, editingVisit)}
                  className="border p-2 w-full"
                />
              </div>
              <div className="mb-2">
                <label className="block mb-1">Diagnosis</label>
                <textarea
                  name="diagnosis"
                  value={editingVisit.diagnosis}
                  onChange={e => handleInputChange(e, editingVisit)}
                  className="border p-2 w-full"
                />
              </div>
              <div className="mb-2">
                <label className="block mb-1">Note</label>
                <textarea
                  name="note"
                  value={editingVisit.note}
                  onChange={e => handleInputChange(e, editingVisit)}
                  className="border p-2 w-full"
                />
              </div>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setEditingVisit(null)}
                  className="bg-gray-500 text-white px-4 py-2 rounded"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <h2 className="text-lg font-semibold">Select a visit to view or edit details</h2>
          </div>
        )}
      </div>
    </div>
  );
};

export default Visits;
