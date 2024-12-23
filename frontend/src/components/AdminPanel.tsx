import React from 'react';
import ModelManagement from './features/Chat/ModelManagement';
import AnalyticsDashboard from './AnalyticsDashboard';

const AdminPanel: React.FC = () => {
  return (
    <div>
      <h2>Admin Panel</h2>
      <ModelManagement />
      <AnalyticsDashboard />
    </div>
  );
};

export default AdminPanel;
