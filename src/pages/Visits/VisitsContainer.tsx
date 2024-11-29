import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { visitsApi } from '../../services/visitsApi';
import VisitsHeader from './components/VisitsHeader';
import VisitsTable from './components/VisitsTable';
import VisitRegistrationModal from './components/VisitRegistrationModal';
import WaitingQueueModal from './components/WaitingQueueModal';
import { Visit } from './types';
import ErrorMessage from '../../components/ErrorMessage';

const VisitsContainer: React.FC = () => {
  const [selectedVisits, setSelectedVisits] = useState<string[]>([]);
  const [isWaitingQueueModalOpen, setIsWaitingQueueModalOpen] = useState(false);
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const { data: visits = [], isLoading, error } = useQuery('visits', visitsApi.getAll);

  const deleteMutation = useMutation(
    (id: number) => visitsApi.delete(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('visits');
      },
    }
  );

  const handleSelectVisit = (id: string, checked: boolean) => {
    setSelectedVisits(prev => 
      checked ? [...prev, id] : prev.filter(visitId => visitId !== id)
    );
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedVisits(checked ? visits.map(visit => visit.id.toString()) : []);
  };

  const handleFavorite = async (id: string) => {
    const visit = visits.find(v => v.id.toString() === id);
    if (visit) {
      try {
        await visitsApi.update(parseInt(id), { 
          ...visit.attributes,
          favorite: !visit.attributes.favorite 
        });
        queryClient.invalidateQueries('visits');
      } catch (error) {
        console.error('Error updating favorite status:', error);
      }
    }
  };

  const handleDeleteVisit = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this visit?')) {
      try {
        await deleteMutation.mutateAsync(parseInt(id));
      } catch (error) {
        console.error('Error deleting visit:', error);
      }
    }
  };

  const handleViewVisit = (visit: Visit) => {
    navigate(`/visits/${visit.id}`);
  };

  const filteredVisits = useMemo(() => {
    return visits.filter(visit => {
      const matchesSearch = visit.attributes.patientName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || visit.attributes.status === filterStatus;
      const matchesDepartment = filterDepartment === 'all' || visit.attributes.department === filterDepartment;
      return matchesSearch && matchesStatus && matchesDepartment;
    });
  }, [visits, searchTerm, filterStatus, filterDepartment]);

  const todayVisits = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return visits
      .filter(visit => visit.attributes.dateIn.startsWith(today))
      .sort((a, b) => new Date(a.attributes.dateIn).getTime() - new Date(b.attributes.dateIn).getTime());
  }, [visits]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <ErrorMessage message="Error loading visits" />;

  return (
    <div className="space-y-6">
      <VisitsHeader 
        onAddVisit={() => setIsRegistrationModalOpen(true)}
        onViewWaitingQueue={() => setIsWaitingQueueModalOpen(true)}
      />

      <div className="flex space-x-4 mb-4">
        <input
          type="text"
          placeholder="Search visits..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border rounded-md px-4 py-2 w-64"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border rounded-md px-4 py-2"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
        <select
          value={filterDepartment}
          onChange={(e) => setFilterDepartment(e.target.value)}
          className="border rounded-md px-4 py-2"
        >
          <option value="all">All Departments</option>
          <option value="OPD">OPD</option>
          <option value="IPD">IPD</option>
          <option value="ER">ER</option>
        </select>
      </div>

      <VisitsTable
        visits={filteredVisits}
        selectedVisits={selectedVisits}
        onSelectVisit={handleSelectVisit}
        onSelectAll={handleSelectAll}
        onFavorite={handleFavorite}
        onDelete={handleDeleteVisit}
        onViewVisit={handleViewVisit}
      />

      {isWaitingQueueModalOpen && (
        <WaitingQueueModal
          isOpen={isWaitingQueueModalOpen}
          onClose={() => setIsWaitingQueueModalOpen(false)}
          visits={todayVisits}
        />
      )}

      {isRegistrationModalOpen && (
        <VisitRegistrationModal
          isOpen={isRegistrationModalOpen}
          onClose={() => setIsRegistrationModalOpen(false)}
        />
      )}
    </div>
  );
};

export default VisitsContainer;