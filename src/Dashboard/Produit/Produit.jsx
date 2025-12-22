import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useValue } from '../../context/ContextProvider';
import { motion } from 'framer-motion';
import { Grid, Tag, DollarSign, Box, Image, Truck, Layers } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';


const Produit = () => {
  const [subcategories, setSubcategories] = useState([]);
  const { dispatch } = useValue();
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [produitInput, setProduitInput] = useState({
    subcat_id: '', nom_prod: '', desc_prod: '', prix_prod: '', poids_prod: '', origin_prod: '', promotion: '', prix_promo: '', couleur: '', taille: '', pointure: '', stock_prod: '', images: null,
  });

  const handleInput = (e) => {
    const { name, value, files } = e.target;
  
    setProduitInput((prev) => {
      const updated = {
        ...prev,
        [name]: name === 'images' ? files[0] : value,
      };
  
      const prix = parseFloat(updated.prix_prod);
      const promo = parseFloat(updated.promotion);
  
      if (!isNaN(prix) && !isNaN(promo)) {
        updated.prix_promo = ((1 - promo / 100) * prix).toFixed(2);
      } else {
        updated.prix_promo = '';
      }
  
      return updated;
    });
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch({ type: 'START_LOADING' });
  
    try {
      const formData = new FormData();
  
      Object.entries(produitInput).forEach(([key, val]) => {
        if (val !== null && val !== '') {
          formData.append(key, val);
        }
      });
  
      const token = localStorage.getItem('auth_token');

      if (isEdit) {
        await axios.post(
          `http://localhost:8000/api/produit/${id}?_method=PUT`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data',
            },
          }
        );
      } else {
        await axios.post(
          'http://localhost:8000/api/produit',
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data',
            },
          }
        );
      }
      
  
      dispatch({
        type: 'UPDATE_ALERT',
        payload: {
          open: true,
          severity: 'success',
          message: isEdit
            ? 'Produit modifié avec succès ✏️'
            : 'Produit ajouté avec succès ✅',
        },
      });
      
  
      // Reset form
      setProduitInput({
        subcat_id: '',
        nom_prod: '',
        desc_prod: '',
        prix_prod: '',
        poids_prod: '',
        origin_prod: '',
        promotion: '',
        prix_promo: '',
        couleur: '',
        taille: '',
        pointure: '',
        stock_prod: '',
        images: null,
      });
  
    } catch (error) {
      console.error(error.response?.data);
  
      dispatch({
        type: 'UPDATE_ALERT',
        payload: {
          open: true,
          severity: 'error',
          message: 'Erreur lors de l’enregistrement du produit ❌',
        },
      });
    } finally {
      dispatch({ type: 'END_LOADING' });
    }
  };
  

  useEffect(() => {
    axios.get('http://localhost:8000/api/subcategorie')
      .then((res) => setSubcategories(res.data.subcategories || res.data.subcategorie || []))
      .catch(() => setSubcategories([]));
  }, []);

  useEffect(() => {
    if (!isEdit) return;
  
    const token = localStorage.getItem('auth_token');
  
    axios.get(`http://localhost:8000/api/produit/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      const p = res.data.produit;
  
      setProduitInput({
        subcat_id: p.subcat_id ?? '',
        nom_prod: p.nom_prod ?? '',
        desc_prod: p.desc_prod ?? '',
        prix_prod: p.prix_prod ?? '',
        poids_prod: p.poids_prod ?? '',
        origin_prod: p.origin_prod ?? '',
        promotion: p.promotion ?? '',
        prix_promo: p.prix_promo ?? '',
        couleur: p.couleur ?? '',
        taille: p.taille ?? '',
        pointure: p.pointure ?? '',
        stock_prod: p.stock_prod ?? '',
        images: null, // ⚠️ image jamais pré-remplie
      });
    })
    .catch(err => {
      console.error(err);
    });
  }, [id]);
  

  return (
    <main className="flex items-center justify-center py-12 bg-gradient-to-br from-purple-50 to-purple-100 min-h-screen">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-10">
        <h2 className="text-3xl font-extrabold text-center text-green-500 mb-8 uppercase tracking-wide">{isEdit ? 'Modification du produit' : 'Ajout de Produit'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Catégorie */}
          <div>
            <label htmlFor="subcat_id" className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
            <div className="relative">
              <Grid className="absolute top-3 left-3 text-green-500" />
              <select id="subcat_id" name="subcat_id" value={produitInput.subcat_id} onChange={handleInput} required className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:ring-purple-200 focus:ring-2 transition">
                <option value="" disabled>Sélectionnez une catégorie</option>
                {subcategories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name_categorie}</option>)}
              </select>
            </div>
          </div>

          {/* Nom & Description */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-black">
            <div>
              <label htmlFor="nom_prod" className="block text-sm font-medium text-gray-700 mb-1">Nom du produit</label>
              <div className="relative">
                <Tag className="absolute top-3 left-3 text-green-500" />
                <input id="nom_prod" type="text" name="nom_prod" placeholder="Ex: Chaussure Sport" value={produitInput.nom_prod} onChange={handleInput} required className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:ring-green-200 focus:ring-2 transition" />
              </div>
            </div>
            <div>
              <label htmlFor="desc_prod" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <div className="relative">
                <Layers className="absolute top-3 left-3 text-blue-500" />
                <textarea id="desc_prod" name="desc_prod" placeholder="Détaillez le produit" rows={3} value={produitInput.desc_prod} onChange={handleInput} required className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-200 focus:ring-2 transition" />
              </div>
            </div>
          </div>

          {/* Prix, Stock & Promo */}
          <div className="grid grid-cols-3 gap-6 text-black">
            <div>
              <label htmlFor="prix_prod" className="block text-sm font-medium text-gray-700 mb-1">Prix (€)</label>
              <div className="relative">
                <DollarSign className="absolute top-3 left-3 text-yellow-500" />
                <input id="prix_prod" type="number" name="prix_prod" placeholder="Ex: 49.99" value={produitInput.prix_prod} onChange={handleInput} required className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-yellow-500 focus:ring-yellow-200 focus:ring-2 transition" />
              </div>
            </div>
            <div>
              <label htmlFor="promotion" className="block text-sm font-medium text-gray-700 mb-1">Promo (%)</label>
              <div className="relative">
                <DollarSign className="absolute top-3 left-3 text-pink-500" />
                <input id="promotion" type="number" name="promotion" placeholder="Ex: 10" value={produitInput.promotion} onChange={handleInput} className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-pink-500 focus:ring-pink-200 focus:ring-2 transition" />
              </div>
            </div>
            <div>
              <label htmlFor="prix_promo" className="block text-sm font-medium text-gray-700 mb-1">Prix promo</label>
              <div className="relative">
                <DollarSign className="absolute top-3 left-3 text-purple-500" />
                <input id="prix_promo" type="text" name="prix_promo" placeholder="Calcul automatique" value={produitInput.prix_promo} readOnly className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-100 focus:border-purple-500 focus:ring-purple-200 focus:ring-2 transition" />
              </div>
            </div>
          </div>

          {/* Couleur, Taille & Pointure */}
          <div className="grid grid-cols-3 gap-6 text-black">
            <div>
              <label htmlFor="couleur" className="block text-sm font-medium text-gray-700 mb-1">Couleur</label>
              <input id="couleur" type="text" name="couleur" placeholder="Ex: Rouge" value={produitInput.couleur} onChange={handleInput} className="w-full pl-4 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-indigo-200 focus:ring-2 transition" />
            </div>
            <div>
              <label htmlFor="taille" className="block text-sm font-medium text-gray-700 mb-1">Taille</label>
              <input id="taille" type="text" name="taille" placeholder="Ex: M" value={produitInput.taille} onChange={handleInput} className="w-full pl-4 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-indigo-200 focus:ring-2 transition" />
            </div>
            <div>
              <label htmlFor="pointure" className="block text-sm font-medium text-gray-700 mb-1">Pointure</label>
              <input id="pointure" type="text" name="pointure" placeholder="Ex: 42" value={produitInput.pointure} onChange={handleInput} className="w-full pl-4 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-indigo-200 focus:ring-2 transition" />
            </div>
          </div>

          {/* Origine & Poids */}
          <div className="grid grid-cols-2 gap-6 text-black">
            <div>
              <label htmlFor="origin_prod" className="block text-sm font-medium text-gray-700 mb-1">Origine</label>
              <div className="relative">
                <Truck className="absolute top-3 left-3 text-indigo-500" />
                <input id="origin_prod" type="text" name="origin_prod" placeholder="Ex: France" value={produitInput.origin_prod} onChange={handleInput} className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-indigo-200 focus:ring-2 transition" />
            </div>
          </div>
          <div>
            <label htmlFor="poids_prod" className="block text-sm font-medium text-gray-700 mb-1">Poids (kg)</label>
            <div className="relative">
              <Layers className="absolute top-3 left-3 text-teal-500" />
              <input id="poids_prod" type="text" name="poids_prod" placeholder="Ex: 1.5" value={produitInput.poids_prod} onChange={handleInput} className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-teal-500 focus:ring-teal-200 focus:ring-2 transition" />
            </div>
          </div>
          <div>
            <label htmlFor="poids_prod" className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
            <div className="relative">
              <Layers className="absolute top-3 left-3 text-teal-500" />
              <input id="stock_prod" type="text" name="stock_prod" placeholder="Ex: 1.5" value={produitInput.stock_prod} onChange={handleInput} className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-teal-500 focus:ring-teal-200 focus:ring-2 transition" />
            </div>
          </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image du produit</label>
            <div className="flex items-center space-x-4">
              <Image className="text-green-500" size={24} />
              <label className="cursor-pointer bg-green-600 text-white px-4 py-2 rounded-full hover:bg-green-600 transition">
                Choisir une image
                <input type="file" name="images" accept="image/*" onChange={handleInput} className="sr-only" />
              </label>
              <span className="text-gray-500 truncate">{produitInput.images?.name || 'Aucun fichier sélectionné'}</span>
            </div>
          </div>

          {/* Submit Button */}
          <button type="submit" className="w-full py-4 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold text-lg uppercase tracking-wide hover:from-indigo-600 hover:to-green-500 focus:outline-none focus:ring-4 focus:ring-purple-300 transition">
          {isEdit ? 'Modifier le produit' : 'Enregistrer le produit'}
          </button>
        </form>
      </motion.div>
    </main>
  );
};

export default Produit;
