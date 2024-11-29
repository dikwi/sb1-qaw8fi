import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { staffApi, Staff, CreateStaffData } from '../services/staffApi';
import { Plus, Calendar, DollarSign, UserCheck } from 'lucide-react'; // Imported UserCheck icon
import StaffModal from '../components/StaffModal';
import ScheduleModal from '../components/ScheduleModal';
import PayrollModal from '../components/PayrollModal';
import AttendanceModal from '../components/AttendanceModal'; // Import AttendanceModal

const HumanResources: React.FC = () => {
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isPayrollModalOpen, setIsPayrollModalOpen] = useState(false);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false); // State for AttendanceModal
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [employmentTypeFilter, setEmploymentTypeFilter] = useState<string>('all');

  const { data: staff, isLoading, error } = useQuery('staff', staffApi.getAll);
  const queryClient = useQueryClient();

  const addMutation = useMutation(staffApi.create, {
    onSuccess: () => {
      queryClient.invalidateQueries('staff');
      setIsStaffModalOpen(false);
    },
  });

  const updateMutation = useMutation(
    ({ id, data }: { id: number; data: Partial<CreateStaffData> }) =>
      staffApi.update(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('staff');
        setIsStaffModalOpen(false);
      },
    }
  );

  const deleteMutation = useMutation(staffApi.delete, {
    onSuccess: () => {
      queryClient.invalidateQueries('staff');
    },
  });

  const handleAddStaff = () => {
    setSelectedStaff(null);
    setIsStaffModalOpen(true);
  };

  const handleEditStaff = (staff: Staff) => {
    setSelectedStaff(staff);
    setIsStaffModalOpen(true);
  };

  const handleDeleteStaff = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this staff member?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const filteredStaff = staff?.filter((member: Staff) => {
    const matchesSearch = member.attributes.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesType =
      employmentTypeFilter === 'all' ||
      member.attributes.employmentType === employmentTypeFilter;
    return matchesSearch && matchesType;
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading staff data</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Staff Management</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setIsScheduleModalOpen(true)}
            className="bg-green-500 text-white px-4 py-2 rounded-md flex items-center"
          >
            <Calendar className="mr-2" size={20} />
            Schedule
          </button>
          {/* Attendance Button Added Here */}
          <button
            onClick={() => setIsAttendanceModalOpen(true)}
            className="bg-purple-500 text-white px-4 py-2 rounded-md flex items-center"
          >
            <UserCheck className="mr-2" size={20} />
            Attendance
          </button>
          <button
            onClick={() => setIsPayrollModalOpen(true)}
            className="bg-yellow-500 text-white px-4 py-2 rounded-md flex items-center"
          >
            <DollarSign className="mr-2" size={20} />
            Payroll
          </button>
          <button
            onClick={handleAddStaff}
            className="bg-blue-500 text-white px-4 py-2 rounded-md flex items-center"
          >
            <Plus className="mr-2" size={20} />
            Add Staff Member
          </button>
        </div>
      </div>

      <div className="mb-4 flex items-center space-x-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search staff..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border rounded-md"
          />
        </div>
        <select
          value={employmentTypeFilter}
          onChange={(e) => setEmploymentTypeFilter(e.target.value)}
          className="border rounded-md px-4 py-2"
        >
          <option value="all">All Types</option>
          <option value="Full-time">Full-time</option>
          <option value="Part-time">Part-time</option>
          <option value="Contract">Contract</option>
        </select>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Employment Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredStaff?.map((member: Staff) => (
              <tr key={member.id}>
                <td className="px-6 py-4 whitespace-nowrap">{member.attributes.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {member.attributes.employmentType}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      member.attributes.active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {member.attributes.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleEditStaff(member)}
                    className="text-indigo-600 hover:text-indigo-900 mr-2"
                    disabled={member.attributes.meta?.lock}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteStaff(member.id)}
                    className="text-red-600 hover:text-red-900"
                    disabled={member.attributes.meta?.lock}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isStaffModalOpen && (
        <StaffModal
          isOpen={isStaffModalOpen}
          onClose={() => setIsStaffModalOpen(false)}
          onSubmit={(staffData) => {
            if (selectedStaff?.id) {
              updateMutation.mutate({ id: selectedStaff.id, data: staffData });
            } else {
              addMutation.mutate(staffData);
            }
          }}
          staff={selectedStaff}
        />
      )}

      {isScheduleModalOpen && (
        <ScheduleModal
          isOpen={isScheduleModalOpen}
          onClose={() => setIsScheduleModalOpen(false)}
          onSubmit={(scheduleData) => {
            // Handle schedule submission
            console.log('Schedule data:', scheduleData);
            setIsScheduleModalOpen(false);
          }}
        />
      )}

      {isPayrollModalOpen && (
        <PayrollModal
          isOpen={isPayrollModalOpen}
          onClose={() => setIsPayrollModalOpen(false)}
          onSubmit={(payrollData) => {
            // Handle payroll submission
            console.log('Payroll data:', payrollData);
            setIsPayrollModalOpen(false);
          }}
        />
      )}

      {/* AttendanceModal Integration */}
      {isAttendanceModalOpen && (
        <AttendanceModal
          isOpen={isAttendanceModalOpen}
          onClose={() => setIsAttendanceModalOpen(false)}
          onSubmit={(attendanceData) => {
            // Handle attendance submission
            console.log('Attendance data:', attendanceData);
            setIsAttendanceModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default HumanResources;
