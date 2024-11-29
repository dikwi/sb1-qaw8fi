import React, { useEffect, useState } from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { HealthFacilityProvider } from './contexts/HealthFacilityContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AuthRoute from './components/AuthRoute';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import DrugsAndServices from './pages/DrugsAndServices';
import Invoicing from './pages/Invoicing';
import Reports from './pages/Reports';
import Appointments from './pages/Appointments';
import HumanResources from './pages/HumanResources';
import HealthFacility from './pages/HealthFacility';
import LabTests from './pages/LabTests';
import Imaging from './pages/Imaging';
import Results from './pages/Results';
import Claims from './pages/Claims';
import Items from './pages/Items';
import Pharmacy from './pages/Pharmacy';
import Visits from './pages/Visits';
import VisitCases from './pages/VisitCases';
import MedicalRecordsModal from './components/MedicalRecordsModal';
import { clearAllData } from './services/localStorageService';
import { useAuthStore } from './store/authStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
      staleTime: 5 * 60 * 1000,
    },
  },
});

const App: React.FC = () => {
  const [isMedicalRecordsOpen, setIsMedicalRecordsOpen] = useState(false);
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
    clearAllData();
  }, [checkAuth]);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <HealthFacilityProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<AuthRoute type="public"><Login /></AuthRoute>} />
              <Route path="/register" element={<AuthRoute type="public"><Register /></AuthRoute>} />
              <Route path="/forgot-password" element={<AuthRoute type="public"><ForgotPassword /></AuthRoute>} />
              <Route path="/reset-password" element={<AuthRoute type="public"><ResetPassword /></AuthRoute>} />
              <Route path="*" element={
                <AuthRoute type="private">
                  <Layout onMedicalRecordsClick={() => setIsMedicalRecordsOpen(true)}>
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/patients" element={<Patients />} />
                      <Route path="/drugs-and-services" element={<DrugsAndServices />} />
                      <Route path="/invoicing" element={<Invoicing />} />
                      <Route path="/reports" element={<Reports />} />
                      <Route path="/appointments" element={<Appointments />} />
                      <Route path="/human-resources" element={<HumanResources />} />
                      <Route path="/health-facility/*" element={<HealthFacility />} />
                      <Route path="/lab-tests" element={<LabTests />} />
                      <Route path="/imaging" element={<Imaging />} />
                      <Route path="/results" element={<Results />} />
                      <Route path="/claims" element={<Claims />} />
                      <Route path="/items" element={<Items />} />
                      <Route path="/pharmacy" element={<Pharmacy />} />
                      <Route path="/visits" element={<Visits />} />
                      <Route path="/visit-cases" element={<VisitCases />} />
                    </Routes>
                  </Layout>
                </AuthRoute>
              } />
            </Routes>
            <MedicalRecordsModal 
              isOpen={isMedicalRecordsOpen} 
              onClose={() => setIsMedicalRecordsOpen(false)} 
            />
          </Router>
        </HealthFacilityProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;