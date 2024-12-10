import React, { useEffect, useState, useContext } from 'react';
import api from '../api/apiClient';
import { AuthContext } from '../context/AuthContext';

const AnalyticsDashboard: React.FC = () => {
  const { isLoggedIn } = useContext(AuthContext);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (isLoggedIn) {
      api.get('/analytics/usage')
        .then(res => setStats(res.data))
        .catch(error => console.error('Fetching analytics failed:', error));
    }
  }, [isLoggedIn]);

  return (
    <div>
      <h3>Analytics</h3>
      {stats && <pre>{JSON.stringify(stats, null, 2)}</pre>}
    </div>
  );
};

export default AnalyticsDashboard;
