// src/components/admin/UsersList.jsx
import React, { useEffect, useState, useMemo, Fragment } from 'react';
import moment from 'moment';
import axios from 'axios';
import { useValue } from '../../context/ContextProvider';
import { Menu, Transition } from '@headlessui/react';
import { Search, Download, Trash2, UserPlus } from 'lucide-react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export default function UsersList() {
  const { state: { currentUser }, dispatch } = useValue();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    axios.get('/api/users', {
      headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
    })
    .then(resp => setUsers(resp.data.users || []))
    .catch(err => {
      console.error('Erreur chargement utilisateurs :', err);
      dispatch({ type: 'UPDATE_ALERT', payload: {
        open: true,
        severity: 'error',
        message: "Impossible de charger les utilisateurs."
      }});
    })
    .finally(() => setLoading(false));
  }, [dispatch]);

  // Filtre selon recherche
  const filtered = useMemo(() => users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  ), [users, search]);

  // Export CSV
  const exportCsv = () => {
    const header = ['ID','Nom','Email','Rôle','Statut','Inscrit le'];
    const data = filtered.map(u => [
      u.id,
      u.name,
      u.email,
      u.role,
      u.active,
      moment(u.created_at).format('YYYY-MM-DD HH:mm')
    ]);
    const csvContent = [header, ...data].map(e => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'utilisateurs.csv');
  };

  // Export XLSX
  const exportXlsx = () => {
    const ws = XLSX.utils.json_to_sheet(filtered.map(u => ({
      ID: u.id,
      Nom: u.name,
      Email: u.email,
      Role: u.role,
      Statut: u.active,
      'Inscrit le': moment(u.created_at).format('YYYY-MM-DD HH:mm')
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Utilisateurs');
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([wbout], { type: 'application/octet-stream' }), 'utilisateurs.xlsx');
  };

  const handleRoleChange = (userId, newRole) => {
    axios.patch(`/api/users/${userId}/role`, { role: newRole }, {
      headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
    })
    .then(({ data }) => {
      setUsers(prev => prev.map(u => u.id === userId ? data.user : u));
      dispatch({ type: 'UPDATE_ALERT', payload: { open: true, severity: 'success', message: data.message }});
    })
    .catch(err => {
      console.error(err);
      dispatch({ type: 'UPDATE_ALERT', payload: { open: true, severity: 'error', message: "Erreur mise à jour rôle." }});
    });
  };

  const handleActiveToggle = (userId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'desactive' : 'active';
    axios.patch(`/api/users/${userId}/active`, { active: newStatus }, {
      headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
    })
    .then(({ data }) => {
      setUsers(prev => prev.map(u => u.id === userId ? data.user : u));
      dispatch({ type: 'UPDATE_ALERT', payload: { open: true, severity: 'success', message: data.message }});
    })
    .catch(err => {
      console.error(err);
      dispatch({ type: 'UPDATE_ALERT', payload: { open: true, severity: 'error', message: "Erreur mise à jour statut." }});
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl p-6 space-y-4">
      <h2 className="text-3xl font-semibold text-center text-gray-800">Gestion des Utilisateurs</h2>
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:w-1/3">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <input
            type="search"
            placeholder="Rechercher nom ou email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>
        <div className="flex items-center space-x-2">
          <button onClick={exportCsv} className="inline-flex items-center px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg">
            <Download className="w-4 h-4 mr-1" /> CSV
          </button>
          <button onClick={exportXlsx} className="inline-flex items-center px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg">
            <Download className="w-4 h-4 mr-1" /> XLSX
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg shadow-lg">
        <table className="w-full table-auto text-left">
          <thead className="bg-blue-600 text-white uppercase text-sm">
            <tr>
              {['Avatar','Nom','Email','Rôle','Statut','Inscrit le','Actions'].map((h,i)=>(
                <th key={i} className="px-6 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((u, idx) => (
              <tr key={u.id} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100 transition`}>                
                <td className="px-6 py-4">
                  {u.avatar ? (
                    <img src={`http://localhost:8000/storage/${u.avatar}`} alt="avatar" className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 text-gray-800">{u.name}</td>
                <td className="px-6 py-4 text-gray-600">{u.email}</td>
                <td className="px-6 py-4">
                  {currentUser.role === 'admin' ? (
                    <Menu as="div" className="relative inline-block text-left">
                      <Menu.Button className="px-2 py-1 bg-gray-200 rounded">{u.role}</Menu.Button>
                      <Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95">
                        <Menu.Items className="absolute mt-2 w-28 bg-white shadow-lg rounded-md">
                          {['admin','user','guest'].map(role => (
                            <Menu.Item key={role}>
                              {({ active }) => (
                                <button
                                  onClick={() => handleRoleChange(u.id, role)}
                                  className={`${active?'bg-gray-100':''} block w-full text-left px-4 py-2`}
                                >{role}</button>
                              )}
                            </Menu.Item>
                          ))}
                        </Menu.Items>
                      </Transition>
                    </Menu>
                  ) : <span className="capitalize">{u.role}</span>}
                </td>
                <td className="px-6 py-4">
                  {currentUser.role === 'admin' ? (
                    <button
                      onClick={() => handleActiveToggle(u.id, u.active)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition ${u.active==='active'? 'bg-green-100 text-green-800':'bg-red-100 text-red-800'}`}
                    >{u.active}</button>
                  ) : <span className="capitalize">{u.active}</span>}
                </td>
                <td className="px-6 py-4 text-gray-600">{moment(u.created_at).format('YYYY-MM-DD HH:mm')}</td>
                <td className="px-6 py-4">
                  {currentUser.role==='admin' && (
                    <button onClick={() => handleRoleChange(u.id, u.role)} className="inline-flex items-center px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition">
                      <UserPlus className="w-4 h-4 mr-1" /> Save
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
