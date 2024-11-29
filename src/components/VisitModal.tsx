import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useHealthFacility } from '../contexts/HealthFacilityContext';
import { visitsApi } from '../services/visitsApi';
import { nssfVisitCasesApi } from '../services/nssfVisitCasesApi';
import { fetchPatients, fetchUsers } from '../services/api';

interface VisitModalProps {
  isOpen: boolean;
  onClose: () => void;
  visit: any | null;
}

const VisitModal: React.FC<VisitModalProps> = ({ isOpen, onClose, visit }) => {
  const { currentFacility } = useHealthFacility();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    visitNo: '',
    dateIn: new Date().toISOString().split('T')[0],
    category: 'Worker',
    doctor: '',
    department: 'OPD',
    status: 'Pending',
    newOld: 'NEW' as const,
    patient: '',
    nssfCase: '',
    chiefComplaint: '',
    historyPresentIllness: '',
    socialHistory: {
      smoking: '',
      alcohol: ''
    },
    pastMedicalHistory: {
      htn: '',
      t2dm: '',
      antiTB: ''
    }
  });

  const { data: patients } = useQuery('patients', fetchPatients);
  const { data: doctors } = useQuery('users', () => 
    fetchUsers().then(users => users.filter(user => user.role === 'Doctor'))
  );
  const { data: nssfCases } = useQuery('nssfCases', nssfVisitCasesApi.getActive);

  const mutation = useMutation(
    (data: any) => visit ? visitsApi.update(visit.id, data) : visitsApi.create(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('visits');
        onClose();
      },
      onError: (error) => {
        console.error('Error saving visit:', error);
      }
    }
  );

  useEffect(() => {
    if (visit) {
      setFormData({
        ...visit.attributes,
        patient: visit.attributes.patient.data.id.toString(),
        nssfCase: visit.attributes.nssfCase?.data?.id.toString() || ''
      });
    } else if (currentFacility) {
      setFormData(prev => ({
        ...prev,
        visitNo: visitsApi.generateVisitNo(currentFacility.attributes.khmerName)
      }));
    }
  }, [visit, currentFacility]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      if (name.includes('.')) {
        const [section, field] = name.split('.');
        return {
          ...prev,
          [section]: {
            ...prev[section as keyof typeof prev],
            [field]: value
          }
        };
      }
      return { ...prev, [name]: value };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentFacility) {
      console.error('No facility selected');
      return;
    }

    const submitData = {
      ...formData,
      hf: currentFacility.id,
      patient: parseInt(formData.patient),
      nssfCase: formData.nssfCase ? parseInt(formData.nssfCase) : undefined
    };

    mutation.mutate(submitData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center overflow-y-auto">
      <div className="bg-white rounded-lg p-8 w-full max-w-4xl my-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">{visit ? 'Edit Visit' : 'New Visit'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Visit No</label>
              <input
                type="text"
                value={formData.visitNo}
                readOnly
                className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Date</label>
              <input
                type="date"
                name="dateIn"
                value={formData.dateIn}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Patient</label>
              <select
                name="patient"
                value={formData.patient}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                required
              >
                <option value="">Select Patient</option>
                {patients?.map(patient => (
                  <option key={patient.id} value={patient.id}>
                    {patient.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Doctor</label>
              <select
                name="doctor"
                value={formData.doctor}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                required
              >
                <option value="">Select Doctor</option>
                {doctors?.map(doctor => (
                  <option key={doctor.id} value={doctor.name}>
                    {doctor.name}
                  </option>
                ))}
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
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Chief Complaint</label>
            <textarea
              name="chiefComplaint"
              value={formData.chiefComplaint || ''}
              onChange={handleChange}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">History of Present Illness</label>
            <textarea
              name="historyPresentIllness"
              value={formData.historyPresentIllness || ''}
              onChange={handleChange}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Social History</h3>
              <div className="space-y-2">
                <div>
                  <label className="block text-sm text-gray-600">Smoking</label>
                  <input
                    type="text"
                    name="socialHistory.smoking"
                    value={formData.socialHistory.smoking || ''}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600">Alcohol</label>
                  <input
                    type="text"
                    name="socialHistory.alcohol"
                    value={formData.socialHistory.alcohol || ''}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Past Medical History</h3>
              <div className="space-y-2">
                <div>
                  <label className="block text-sm text-gray-600">HTN</label>
                  <input
                    type="text"
                    name="pastMedicalHistory.htn"
                    value={formData.pastMedicalHistory.htn || ''}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600">T2DM</label>
                  <input
                    type="text"
                    name="pastMedicalHistory.t2dm"
                    value={formData.pastMedicalHistory.t2dm || ''}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600">Anti TB</label>
                  <input
                    type="text"
                    name="pastMedicalHistory.antiTB"
                    value={formData.pastMedicalHistory.antiTB || ''}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                </div>
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
              {visit ? 'Update Visit' : 'Create Visit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VisitModal;