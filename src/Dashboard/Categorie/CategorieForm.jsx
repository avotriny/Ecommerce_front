import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { useValue } from '../../context/ContextProvider';

const CategoryForm = () => {
  const [nomCategorie, setNomCategorie] = useState('');
  const [loading, setLoading] = useState(false);

  const { id } = useParams();
  const cleanId = id?.trim(); // ✅ FIX %0A
  const isEdit = Boolean(cleanId);

  const navigate = useNavigate();
  const { dispatch } = useValue();

  // 🔄 Charger la catégorie en mode édition
  useEffect(() => {
    if (!isEdit) return;

    setLoading(true);

    axios
      .get(`/api/categorie/${cleanId}`)
      .then((res) => {
        setNomCategorie(
          res.data.type_categorie ||
          res.data.categorie?.type_categorie ||
          ''
        );
      })
      .catch((err) => {
        console.error(err);
        dispatch({
          type: 'UPDATE_ALERT',
          payload: {
            open: true,
            severity: 'error',
            message: 'Impossible de charger la catégorie',
          },
        });
      })
      .finally(() => setLoading(false));
  }, [cleanId, isEdit, dispatch]);

  // 💾 Enregistrement
  const handleSubmit = async (e) => {
    e.preventDefault();

    dispatch({ type: 'START_LOADING' });

    try {
      const payload = { type_categorie: nomCategorie };

      if (isEdit) {
        await axios.put(`/api/categorie/${cleanId}`, payload);
      } else {
        await axios.post('/api/categorie', payload);
      }

      dispatch({
        type: 'UPDATE_ALERT',
        payload: {
          open: true,
          severity: 'success',
          message: isEdit
            ? 'Catégorie modifiée avec succès'
            : 'Catégorie ajoutée avec succès',
        },
      });

      navigate('/dashboard/categorie');
    } catch (err) {
      console.error(err);
      dispatch({
        type: 'UPDATE_ALERT',
        payload: {
          open: true,
          severity: 'error',
          message: 'Erreur lors de l’enregistrement',
        },
      });
    } finally {
      dispatch({ type: 'END_LOADING' });
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 space-y-6"
      >
        <h2 className="text-xl font-bold text-center uppercase">
          {isEdit ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
        </h2>

        <div>
          <label className="block font-medium mb-1">
            Nom de la catégorie
          </label>
          <input
            type="text"
            value={nomCategorie}
            onChange={(e) => setNomCategorie(e.target.value)}
            required
            disabled={loading}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400"
            placeholder="Ex : Informatique"
          />
        </div>

        <div className="flex justify-between">
          <button
            type="button"
            onClick={() => navigate('/dashboard/categorie')}
            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
          >
            Annuler
          </button>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isEdit ? 'Modifier' : 'Enregistrer'}
          </button>
        </div>
      </form>
    </main>
  );
};

export default CategoryForm;
