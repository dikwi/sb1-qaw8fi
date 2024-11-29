import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useMutation, useQueryClient } from 'react-query';
import { appointmentsApi, Appointment } from '../services/appointmentsApi';
import { useHealthFacility } from '../contexts/HealthFacilityContext';

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment?: Appointment | null;
}

const AppointmentModal: React.FC<AppointmentModalProps> = ({ isOpen, onClose, appointment }) => {
  const { currentFacility } = useHealthFacility();
  const [formData, setFormData] = useState({
    patientName: '',
    doctorName: '',
    date: '',
    time: '07:00',
    status: 'Scheduled' as const,
    note: '',
    healthFacility: '',
  });

  const queryClient = useQueryClient();

  useEffect(() => {
    if (appointment) {
      const date = new Date(appointment.attributes.date);
      setFormData({
        patientName: appointment.attributes.patientName,
        doctorName: appointment.attributes.doctorName,
        date: date.toISOString().split('T')[0],
        time: date.toTimeString().slice(0, 5),
        status: appointment.attributes.status,
        note: appointment.attributes.note || '',
        healthFacility: appointment.attributes.healthFacility || currentFacility?.name || '',
      });
    } else {
      setFormData({
        patientName: '',
        doctorName: '',
        date: '',
        time: '07:00',
        status: 'Scheduled',
        note: '',
        healthFacility: currentFacility?.name || '',
      });
    }
  }, [appointment, currentFacility]);

  const addMutation = useMutation(appointmentsApi.create, {
    onSuccess: () => {
      queryClient.invalidateQueries('appointments');
      onClose();
    },
    onError: (error) => {
      console.error('Error adding appointment:', error);
      // Handle error (e.g., show error message to user)
    }
  });

  const updateMutation = useMutation(
    ({ id, data }: { id: number; data: Partial<Appointment['attributes']> }) =>
      appointmentsApi.update(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('appointments');
        onClose();
      },
      onError: (error) => {
        console.error('Error updating appointment:', error);
        // Handle error (e.g., show error message to user)
      }
    }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const appointmentData = {
        patientName: formData.patientName,
        doctorName: formData.doctorName,
        date: new Date(`${formData.date}T${formData.time}`).toISOString(),
        status: formData.status,
        note: formData.note,
        healthFacility: formData.healthFacility,
      };

      if (appointment?.id) {
        await updateMutation.mutateAsync({ id: appointment.id, data: appointmentData });
      } else {
        await addMutation.mutateAsync(appointmentData);
      }
    } catch (error) {
      console.error('Error submitting appointment:', error);
      // Handle error (e.g., show error message to user)
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-8 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">{appointment ? 'Edit Appointment' : 'Add New Appointment'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="patientName" className="block text-sm font-medium text-gray-700">
              Patient Name
            </label>
            <input
              type="text"
              id="patientName"
              name="patientName"
              value={formData.patientName}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="doctorName" className="block text-sm font-medium text-gray-700">
              Doctor Name
            </label>
            <input
              type="text"
              id="doctorName"
              name="doctorName"
              value={formData.doctorName}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="date" className="block text-sm font-medium text-gray-700">
              Date
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="time" className="block text-sm font-medium text-gray-700">
              Time
            </label>
            <input
              type="time"
              id="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="healthFacility" className="block text-sm font-medium text-gray-700">
              Health Facility
            </label>
            <input
              type="text"
              id="healthFacility"
              name="healthFacility"
              value={formData.healthFacility}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="note" className="block text-sm font-medium text-gray-700">
              Note
            </label>
            <textarea
              id="note"
              name="note"
              value={formData.note}
              onChange={handleChange}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              required
            >
              <option value="Scheduled">Scheduled</option>
              <option value="Completed">Completed</option>
              <option value="Canceled">Canceled</option>
            </select>
          </div>
          <div className="mt-6">
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              {appointment ? 'Update Appointment' : 'Add Appointment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AppointmentModal;