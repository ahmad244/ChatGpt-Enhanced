import React, { useEffect, useState, useContext } from 'react';
import api from '../api/apiClient';
import { AuthContext } from '../context/AuthContext';

const ModelManagement: React.FC = () => {
  const { isLoggedIn } = useContext(AuthContext);
  const [models, setModels] = useState<any[]>([]);

  useEffect(() => {
    if (isLoggedIn) {
      api.get('/models')
        .then(res => setModels(res.data))
        .catch(error => console.error('Fetching models failed:', error));
    }
  }, [isLoggedIn]);

  return (
    <div>
      <h3>Models</h3>
      {models.map(m => (
        <div key={m._id}>{m.name} - {m.enabled ? 'Enabled' : 'Disabled'}</div>
      ))}
    </div>
  );
};

export default ModelManagement;
