import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

interface RedirectRouteProps {
  children: React.ReactElement;
}

const RedirectRoute: React.FC<RedirectRouteProps> = ({ children }) => {
  const { isLoggedIn } = useContext(AuthContext);

  if (isLoggedIn) {
    return <Navigate to="/" replace />; // Redirect to home if logged in
  }

  return children;
};

export default RedirectRoute;
