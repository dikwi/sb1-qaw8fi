import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { visitsApi } from '../../../services/visitsApi';
import { ArrowLeft, Save } from 'lucide-react';
import ErrorMessage from '../../../components/ErrorMessage';

const VisitDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  const { data: visit, isLoading, error } = useQuery(
    ['visit', id],
    () => visitsApi.getById(parseInt(id!))
  );

  const updateMutation = useMutation(
    (data: any) => visitsApi.update(parseInt(id!), data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['visit', id]);
        queryClient.invalidateQueries('visits');
        setIsEditing(false);
      },
    }
  );

  const [formData, setFormData] = useState(visit?.attributes || {});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <ErrorMessage message="Error loading visit details" />;
  if (!visit) return <ErrorMessage message="Visit not found" />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <button
          onClick={() => navigate('/visits')}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="mr-2" size={20} />
          Back to Visits
        </button>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="bg-blue-500 text-white px-4 py-2 rounded-md"
        >
          {isEditing ? 'Cancel' : 'Edit Visit'}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Visit Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Patient Name</label>
              {isEditing ? (
                <input
                  type="text"
                  name="patientName"
                  value={formData.patientName}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
              ) : (
                <p className="mt-1">{visit.attributes.patientName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Category</label>
              {isEditing ? (
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                >
                  <option value="Worker">Worker</option>
                  <option value="Dependent">Dependent</option>
                  <option value="Other">Other</option>
                </select>
              ) : (
                <p className="mt-1">{visit.attributes.category}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Doctor</label>
              {isEditing ? (
                <input
                  type="text"
                  name="doctor"
                  value={formData.doctor}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
              ) : (
                <p className="mt-1">{visit.attributes.doctor}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Department</label>
              {isEditing ? (
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                >
                  <option value="OPD">OPD</option>
                  <option value="IPD">IPD</option>
                  <option value="ER">ER</option>
                </select>
              ) : (
                <p className="mt-1">{visit.attributes.department}</p>
              )}
            </div>
          </div>
        </div>

        {isEditing && (
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-green-500 text-white px-4 py-2 rounded-md flex items-center"
            >
              <Save className="mr-2" size={20} />
              Save Changes
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default VisitDetails;