import { useEffect, useState } from 'react';
import moment from 'moment';
import axios from 'axios';
import { useValue } from '../../context/ContextProvider';

const Users = () => {
  const {
    state: { currentUser },
    dispatch,
  } = useValue();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    axios
      .get('http://localhost:8000/api/users', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
      })
      .then(resp => setUsers(resp.data.users || []))
      .catch(err => {
        console.error('Erreur de chargement des utilisateurs :', err);
        dispatch({
          type: 'UPDATE_ALERT',
          payload: {
            open: true,
            severity: 'error',
            message: "Impossible de charger les utilisateurs.",
          },
        });
      })
      .finally(() => setLoading(false));
  }, [dispatch]);

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl p-6">
      <h2 className="text-3xl font-semibold text-center text-gray-800 mb-6">Gestion des Utilisateurs</h2>

      <div className="flex flex-col sm:flex-row sm:justify-between items-center mb-6 gap-4">
        <input
          type="search"
          placeholder="Rechercher par nom ou email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full sm:w-1/3 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        />
        {currentUser?.role === 'admin' && (
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Ajouter un utilisateur
          </button>
        )}
      </div>

      <div className="overflow-hidden rounded-lg shadow-lg">
        <table className="w-full table-auto text-left">
          <thead className="bg-blue-600 text-white uppercase text-sm">
            <tr>
              <th className="px-6 py-3">Avatar</th>
              <th className="px-6 py-3">Nom</th>
              <th className="px-6 py-3">Email</th>
              <th className="px-6 py-3">Active</th>
              <th className="px-6 py-3">Créé le</th>
              <th className="px-6 py-3">ID</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((user, idx) => (
              <tr
                key={user.id}
                className={`transition hover:bg-gray-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
              >
                <td className="px-6 py-4">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt="avatar"
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 text-gray-800">{user.name}</td>
                <td className="px-6 py-4 text-gray-600">{user.email}</td>
                <td className="px-6 py-4 capitalize text-gray-700">{user.active}</td>
                <td className="px-6 py-4 text-gray-600">
                  {moment(user.created_at).format('YYYY-MM-DD HH:mm:ss')}
                </td>
                <td className="px-6 py-4 text-gray-500">{user.id}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Users;
