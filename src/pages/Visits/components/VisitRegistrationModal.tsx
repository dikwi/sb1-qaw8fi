import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useHealthFacility } from '../../../contexts/HealthFacilityContext';
import { visitsApi } from '../../../services/visitsApi';
import { nssfVisitCasesApi } from '../../../services/nssfVisitCasesApi';
import { fetchPatients, fetchUsers } from '../../../services/api';

interface VisitRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const VisitRegistrationModal: React.FC<VisitRegistrationModalProps> = ({ isOpen, onClose }) => {
  const { currentFacility } = useHealthFacility();
  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    department: 'OPD',
    category: 'Worker',
    newOld: 'NEW' as const,
    nssfCase: '',
  });

  const { data: patients } = useQuery('patients', fetchPatients);
  const { data: users } = useQuery('users', fetchUsers);
  const { data: nssfCases } = useQuery('nssfVisitCases', nssfVisitCasesApi.getActive);
  const queryClient = useQueryClient();

  const doctors = users?.filter(user => user.role === 'Doctor') || [];

  const addVisitMutation = useMutation(visitsApi.create, {
    onSuccess: () => {
      queryClient.invalidateQueries('visits');
      onClose();
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentFacility) {
      console.error('No facility selected');
      return;
    }

    const visitData = {
      visitNo: visitsApi.generateVisitNo(currentFacility.attributes.khmerName),
      dateIn: new Date().toISOString(),
      category: formData.category,
      doctor: doctors.find(d => d.id === formData.doctorId)?.name || '',
      department: formData.department,
      step: 1,
      status: 'Pending',
      newOld: formData.newOld,
      patient: parseInt(formData.patientId),
      hf: currentFacility.id,
      nssfCase: formData.nssfCase ? parseInt(formData.nssfCase) : undefined,
    };

    addVisitMutation.mutate(visitData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-8 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">New Visit</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Patient</label>
            <select
              name="patientId"
              value={formData.patientId}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              required
            >
              <option value="">Select Patient</option>
              {patients?.map((patient: any) => (
                <option key={patient.id} value={patient.id}>{patient.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Doctor</label>
            <select
              name="doctorId"
              value={formData.doctorId}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              required
            >
              <option value="">Select Doctor</option>
              {doctors.map((doctor: any) => (
                <option key={doctor.id} value={doctor.id}>{doctor.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Department</label>
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              required
            >
              <option value="OPD">OPD</option>
              <option value="IPD">IPD</option>
              <option value="ER">ER</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              required
            >
              <option value="Worker">Worker</option>
              <option value="Dependent">Dependent</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Visit Type</label>
            <select
              name="newOld"
              value={formData.newOld}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              required
            >
              <option value="NEW">New Visit</option>
              <option value="OLD">Follow-up</option>
            </select>
          </div>

          {currentFacility?.attributes.nss && (
            <div>
              <label className="block text-sm font-medium text-gray-700">NSSF Case</label>
              <select
                name="nssfCase"
                value={formData.nssfCase}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              >
                <option value="">Select NSSF Case</option>
                {nssfCases?.map(nssfCase => (
                  <option key={nssfCase.id} value={nssfCase.id}>
                    {nssfCase.attributes.code} - {nssfCase.attributes.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex justify-end space-x-4">
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
              Register Visit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VisitRegistrationModal;