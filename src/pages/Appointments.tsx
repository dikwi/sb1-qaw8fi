import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { appointmentsApi, Appointment } from '../services/appointmentsApi';
import { Edit, Trash, Calendar as CalendarIcon, List } from 'lucide-react';
import AppointmentModal from '../components/AppointmentModal';
import AppointmentCalendar from '../components/AppointmentCalendar';
import { 
  format, 
  isToday, 
  isTomorrow, 
  isWithinInterval, 
  addWeeks, 
  startOfWeek, 
  endOfWeek 
} from 'date-fns';

const Appointments: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [filter, setFilter] = useState<'all' | 'today' | 'tomorrow' | 'nextWeek'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  const { data: appointments, isLoading, error } = useQuery('appointments', appointmentsApi.getAll);

  const deleteMutation = useMutation(appointmentsApi.delete, {
    onSuccess: () => {
      queryClient.invalidateQueries('appointments');
    },
  });

  const handleAddAppointment = () => {
    setSelectedAppointment(null);
    setIsModalOpen(true);
  };

  const handleEditAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsModalOpen(true);
  };

  const handleDeleteAppointment = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const toggleView = () => {
    setViewMode(prev => (prev === 'list' ? 'calendar' : 'list'));
  };

  // Updated Filtering logic to include searchTerm
  const filteredAppointments = useMemo(() => {
    if (!appointments) return [];

    return appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.attributes.date);

      // Filter based on the selected filter
      let filterCondition = true;
      switch (filter) {
        case 'today':
          filterCondition = isToday(appointmentDate);
          break;
        case 'tomorrow':
          filterCondition = isTomorrow(appointmentDate);
          break;
        case 'nextWeek':
          const nextWeekStart = startOfWeek(addWeeks(new Date(), 1), { weekStartsOn: 1 }); // Next Monday
          const nextWeekEnd = endOfWeek(addWeeks(new Date(), 1), { weekStartsOn: 1 }); // Next Sunday
          filterCondition = isWithinInterval(appointmentDate, { start: nextWeekStart, end: nextWeekEnd });
          break;
        case 'all':
        default:
          filterCondition = true;
      }

      // Filter based on the search term (case-insensitive)
      const lowerSearchTerm = searchTerm.toLowerCase();
      const matchesSearch =
        appointment.attributes.patientName.toLowerCase().includes(lowerSearchTerm) ||
        appointment.attributes.doctorName.toLowerCase().includes(lowerSearchTerm) ||
        (appointment.attributes.note && appointment.attributes.note.toLowerCase().includes(lowerSearchTerm));

      return filterCondition && matchesSearch;
    });
  }, [appointments, filter, searchTerm]);

  // Grouping and sorting logic remains the same
  const groupedAppointments = useMemo(() => {
    if (!filteredAppointments) return {};

    // Sort appointments by date/time descending
    const sorted = [...filteredAppointments].sort(
      (a, b) => new Date(b.attributes.date).getTime() - new Date(a.attributes.date).getTime()
    );

    // Group by date (formatted as 'yyyy-MM-dd' for consistency)
    return sorted.reduce((groups: { [key: string]: Appointment[] }, appointment) => {
      const dateKey = format(new Date(appointment.attributes.date), 'yyyy-MM-dd');
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(appointment);
      return groups;
    }, {});
  }, [filteredAppointments]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error fetching appointments</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Appointments</h1>
        <div className="flex space-x-2">
          <button
            onClick={toggleView}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md flex items-center hover:bg-gray-300"
          >
            {viewMode === 'list' ? (
              <>
                <CalendarIcon className="mr-2" size={20} />
                Calendar View
              </>
            ) : (
              <>
                <List className="mr-2" size={20} />
                List View
              </>
            )}
          </button>
          <button
            onClick={handleAddAppointment}
            className="bg-blue-500 text-white px-4 py-2 rounded-md flex items-center"
          >
            Add Appointment
          </button>
        </div>
      </div>

      {/* Search and Filter Section */}
      {viewMode === 'list' && (
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 mb-4">
          {/* Omni Search Box */}
          <div className="flex items-center">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Patient, Doctor, or Note"
              className="border border-gray-300 rounded-md px-4 py-2 w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {/* Filter Buttons */}
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-md ${
                filter === 'all'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('today')}
              className={`px-4 py-2 rounded-md ${
                filter === 'today'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setFilter('tomorrow')}
              className={`px-4 py-2 rounded-md ${
                filter === 'tomorrow'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Tomorrow
            </button>
            <button
              onClick={() => setFilter('nextWeek')}
              className={`px-4 py-2 rounded-md ${
                filter === 'nextWeek'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Next Week
            </button>
          </div>
        </div>
      )}

      {viewMode === 'list' ? (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          {Object.keys(groupedAppointments).length === 0 ? (
            <div className="p-4 text-center text-gray-500">No appointments found.</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Doctor
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Note
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Object.keys(groupedAppointments)
                  .sort((a, b) => new Date(b).getTime() - new Date(a).getTime()) // Sort date groups descending
                  .map(dateKey => {
                    const date = new Date(dateKey);
                    const appointmentCount = groupedAppointments[dateKey].length;
                    const formattedDate = format(date, 'dd-MM-yyyy');

                    return (
                      <React.Fragment key={dateKey}>
                        {/* Date Header Row */}
                        <tr className="bg-gray-100">
                          <td colSpan={6} className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                            {`${formattedDate} `}
                            <span className="text-gray-500">({appointmentCount})</span>
                          </td>
                        </tr>
                        {/* Appointment Rows */}
                        {groupedAppointments[dateKey].map(appointment => (
                          <tr key={appointment.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {format(new Date(appointment.attributes.date), 'hh:mm a')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">{appointment.attributes.patientName}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{appointment.attributes.doctorName}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{appointment.attributes.note}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  appointment.attributes.status === 'Completed'
                                    ? 'bg-green-100 text-green-800'
                                    : appointment.attributes.status === 'Canceled'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}
                              >
                                {appointment.attributes.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={() => handleEditAppointment(appointment)}
                                className="text-indigo-600 hover:text-indigo-900 mr-2"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => appointment.id && handleDeleteAppointment(appointment.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <Trash size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </React.Fragment>
                    );
                  })}
              </tbody>
            </table>
          )}
        </div>
      ) : (
        <AppointmentCalendar
          appointments={appointments || []}
          onSelectAppointment={handleEditAppointment}
          onAddAppointment={handleAddAppointment}
        />
      )}

      <AppointmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        appointment={selectedAppointment}
      />
    </div>
  );
};

export default Appointments;
