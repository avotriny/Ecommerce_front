import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Menu } from '@headlessui/react';
import { Edit2, Trash2, Plus, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useValue } from '../../context/ContextProvider';

const CategoriesList = () => {
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const { dispatch } = useValue();
  const navigate = useNavigate();

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:8000/api/categorie');
      setRows(res.data.categorie || []);
    } catch (err) {
      dispatch({
        type: 'UPDATE_ALERT',
        payload: {
          open: true,
          severity: 'error',
          message: 'Erreur lors du chargement des catégories',
        },
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const filtered = useMemo(
    () =>
      rows.filter((c) =>
        c.type_categorie
          .toLowerCase()
          .includes(search.toLowerCase())
      ),
    [rows, search]
  );

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette catégorie ?')) return;

    try {
      await axios.delete(`http://localhost:8000/api/categorie/${id}`);
      dispatch({
        type: 'UPDATE_ALERT',
        payload: {
          open: true,
          severity: 'success',
          message: 'Catégorie supprimée',
        },
      });
      fetchCategories();
    } catch {
      dispatch({
        type: 'UPDATE_ALERT',
        payload: {
          open: true,
          severity: 'error',
          message: 'Suppression impossible',
        },
      });
    }
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Gestion des catégories</h2>

        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg"
            />
          </div>

          <button
            onClick={() => navigate('/dashboard/categorie/new')}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle
          </button>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left">ID</th>
              <th className="px-4 py-2 text-left">Nom</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((cat) => (
              <tr key={cat.id} className="border-t">
                <td className="px-4 py-2">{cat.id}</td>
                <td className="px-4 py-2">{cat.type_categorie}</td>
                <td className="px-4 py-2 flex gap-2">
  <button
    onClick={() => navigate(`/dashboard/categorie/${cat.id}/edit`)}
    className="flex items-center px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
  >
    <Edit2 className="w-4 h-4 mr-1" />
    Éditer
  </button>

  <button
    onClick={() => handleDelete(cat.id)}
    className="flex items-center px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
  >
    <Trash2 className="w-4 h-4 mr-1" />
    Supprimer
  </button>
</td>

              </tr>
            ))}
          </tbody>
        </table>

        {loading && (
          <div className="p-4 text-center text-gray-500">
            Chargement…
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoriesList;
