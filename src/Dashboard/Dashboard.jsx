import React, { useState } from 'react';
import { Routes, Route, Navigate, useNavigate, Outlet } from 'react-router-dom';
import SideList from './SideList';
import { useValue } from '../context/ContextProvider';
import { FiMenu, FiHome } from 'react-icons/fi';
import Categorie from './Categorie/Categorie'
import Produit from './Produit/Produit';
import Users from './users/Users'
import Main from './Main/Main'
// import Commande from '../components/Commande/Commande';

function RequireAuth({ children }) {
  const { state: { currentUser } } = useValue();
  return currentUser ? children : <Navigate to="/401" replace />;
}

function RequireAdmin({ children }) {
  const { state: { currentUser } } = useValue();
  if (!currentUser) return <Navigate to="/401" replace />;
  return currentUser.role === 'admin' ? children : <Navigate to="/403" replace />;
}

export default function Dashboard() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <RequireAuth>
      <div className="flex h-screen bg-gray-100">
        <SideList open={open} setOpen={setOpen} />
        <div className="flex flex-col flex-1">
          <header className="flex items-center justify-between bg-white h-16 px-4 shadow-md">
            <div className="flex items-center">
              {!open && (
                <button onClick={() => setOpen(true)} className="p-2 rounded hover:bg-gray-200">
                  <FiMenu className="h-6 w-6 text-gray-600" />
                </button>
              )}
              <button onClick={() => navigate('/')} className="ml-4 p-2 rounded hover:bg-gray-200">
                <FiHome className="h-6 w-6 text-gray-600" />
              </button>
              <h1 className="ml-4 text-xl font-semibold text-gray-800">Dashboard</h1>
            </div>
          </header>
          <main className="flex-1 p-6 overflow-auto">
            <Routes>
              <Route path="" element={<Navigate to="categorie" replace />} />
              <Route path="user" element={<RequireAdmin><Users /></RequireAdmin>} />
              <Route path="main" element={<RequireAdmin><Main /></RequireAdmin>} />
              <Route path="categorie" element={<Categorie />} />
              <Route path="produit" element={<Produit />} />
              {/* <Route path="commande" element={<Commande />} /> */}
              <Route path="*" element={<div>Bienvenue sur le Dashboard</div>} />
            </Routes>
          </main>
        </div>
      </div>
    </RequireAuth>
  );
}