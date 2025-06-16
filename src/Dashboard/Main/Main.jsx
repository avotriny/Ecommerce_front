import React, { useEffect, useState } from 'react';
import axios from 'axios';
import moment from 'moment';
import AreaCharts from './AreaChart';
import PieCharts from './PieChart';
import { useValue } from '../../context/ContextProvider';

const Loader = () => (
  <div className="flex justify-center items-center h-screen">
    <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
  </div>
);

const Main = () => {
  const { dispatch } = useValue();
  const [users, setUsers] = useState([]);
  const [commande, setCommande] = useState([]);
  const [produit, setProduit] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get('http://localhost:8000/api/users', { headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` } }),
      axios.get('http://localhost:8000/api/commande', { headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` } }),
      axios.get('http://localhost:8000/api/produit', { headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` } })
    ])
      .then(([u, c, p]) => {
        setUsers(u.data.users || []);
        const listCommande = Array.isArray(c.data.commandes) ? c.data.commandes : c.data.commandes.data || [];
        setCommande(listCommande);
        setProduit(p.data.produit || []);
      })
      .catch(err => {
        console.error(err);
        dispatch({ type: 'UPDATE_ALERT', payload: { open: true, severity: 'error', message: 'Erreur dashboard' } });
      })
      .finally(() => setLoading(false));
  }, [dispatch]);
  console.log(produit);

  if (loading) return <Loader />;

  const recentUsers = [...users].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5);
  const recentCommandes = [...commande].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5);

  return (
    <div className="container mx-auto p-6 grid gap-8 lg:grid-cols-3">
      {/* Statistiques */}
      <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow p-6 text-center">
          <h4 className="text-xl font-medium mb-2">Utilisateurs</h4>
          <p className="text-4xl font-bold text-indigo-600">{users.length}</p>
        </div>
        <div className="bg-white rounded-2xl shadow p-6 text-center">
          <h4 className="text-xl font-medium mb-2">Commandes</h4>
          <p className="text-4xl font-bold text-indigo-600">{commande.length}</p>
        </div>
        <div className="bg-white rounded-2xl shadow p-6 text-center">
          <h4 className="text-xl font-medium mb-2">Produits</h4>
          <p className="text-4xl font-bold text-indigo-600">{produit.length}</p>
        </div>
      </div>

      {/* Derniers inscrits et commandes */}
      <div className="lg:col-span-3 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl shadow p-6">
          <h4 className="text-2xl font-semibold mb-4">Derniers utilisateurs inscrits</h4>
          <div className="space-y-4">
            {recentUsers.map(u => (
              <div key={u.id} className="flex items-center space-x-4">
                <img src={`http://localhost:8000/${u.avatar}`} alt={u.name} className="w-14 h-14 rounded-full object-cover" />
                <div>
                  <p className="font-medium text-lg">{u.name}</p>
                  <p className="text-gray-500 text-sm">Inscrit le {moment(u.created_at).format('LL')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow p-6">
          <h4 className="text-2xl font-semibold mb-4">Dernières commandes</h4>
          <div className="space-y-4">
            {recentCommandes.map(c => (
              <div key={c.id} className="flex items-center space-x-4">
                <img src={`http://localhost:8000/${c.produit?.images}`} alt={c.produit?.nom_prod} className="w-14 h-14 rounded object-cover" />
                <div>
                  <p className="font-medium text-lg">Commande N°{c.id}</p>
                  <p className="text-gray-700">{c.produit?.nom_prod}</p>
                  <p className="text-gray-700">Quantite {c.quantite}</p>
                  <p className="text-gray-500 text-sm">{moment(c.created_at).format('LL')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Graphiques */}
      <div className="lg:col-span-3 grid grid-cols-1 lg:grid-cols-2 gap-8 order-last lg:order-none">
        <AreaCharts commandes={commande} />
        <PieCharts commandes={commande} />
      </div>
    </div>
  );
};

export default Main;