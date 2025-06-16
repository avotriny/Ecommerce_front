import React, {useState} from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import {useValue} from './context/ContextProvider'

export default function DashboardPrivateRoute() {
  const { state: { currentUser } } = useValue();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <LoadingIndicator />;

  if (!currentUser) return <UnauthorizedPage />;

  // Exemple de vérification de rôle admin si nécessaire
  if (!currentUser.role !== 'admin') return <ForbiddenPage />;

  return <Outlet />;
}