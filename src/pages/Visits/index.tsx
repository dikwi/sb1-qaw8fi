import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import VisitsContainer from './VisitsContainer';
import VisitDetails from './components/VisitDetails';

const Visits: React.FC = () => {
  return (
    <Routes>
      <Route index element={<VisitsContainer />} />
      <Route path=":id" element={<VisitDetails />} />
      <Route path="*" element={<Navigate to="/visits" replace />} />
    </Routes>
  );
};

export default Visits;