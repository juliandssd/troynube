import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from './pages/authStore';

const ProtectedRoute = ({ children }) => {
  const authData = useAuthStore((state) => state.authData);
  const location = useLocation();

  if (!authData[1]) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};



export default ProtectedRoute