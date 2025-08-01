import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Search as SearchIcon, Heart } from 'lucide-react';
import Tooltip from '@mui/material/Tooltip';
import { useNavigate } from 'react-router-dom';
import { useValue } from '../../context/ContextProvider';

const ListProduit = () => {
  const { state: { currentUser } } = useValue();
  const navigate = useNavigate();

  // Données
  const [produits, setProduits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [prodRes, catRes, likeRes] = await Promise.all([
          axios.get('/api/produit'),
          axios.get('/api/categorie'),
          axios.get('/api/like'),
        ]);

        // Debug API response
        console.log('API produits:', prodRes.data.produit);
        console.log('API categories:', catRes.data.categorie);
        console.log('API likes:', likeRes.data.like);

        // Charger catégories
        const catList = catRes.data.categorie || [];
        setCategories([{ id: 'Tous', type_categorie: 'Toutes' }, ...catList]);

        // Prétraitement des likes
        const likesMap = {};
        (likeRes.data.like || []).forEach(l => {
          likesMap[l.prod_id] = likesMap[l.prod_id] || [];
          likesMap[l.prod_id].push(l.user.name || l.user.username);
        });

        // Transformation des produits
        const list = (prodRes.data.produit || []).map(p => {
          // Vérification des champs
          const createdAt = p.created_at || p.updated_at || new Date().toISOString();
          const catId = p.cat_id != null ? p.cat_id : p.categorie_id;
          console.log('Produit raw:', p);
          return {
            ...p,
            catId,
            created_at: createdAt,
            like: (likesMap[p.id] || []).includes(currentUser?.name || ''),
            likeCount: (likesMap[p.id] || []).length,
            likeUsers: likesMap[p.id] || [],
          };
        });

        console.log('Produits transformés:', list);
        setProduits(list);
      } catch (err) {
        console.error('fetchData error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [currentUser]);

  // Calcul des 10 derniers produits par catégorie
  const latestByCategory = useMemo(() => {
    const map = {};
    produits.forEach(p => {
      const catObj = categories.find(c => c.id === p.catId);
      const catName = catObj?.type_categorie || 'Autres';
      if (!map[catName]) map[catName] = [];
      map[catName].push(p);
    });
    return Object.entries(map).map(([category, items]) => ({
      category,
      products: items
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 10),
    }));
  }, [produits, categories]);

  // Gestion du like
  const handleLike = async id => {
    if (!currentUser) return;
    try {
      const { data } = await axios.post(`/api/produit/${id}/like`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` },
      });
      setProduits(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
    } catch (err) {
      console.error('like error:', err);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin border-4 border-gray-200 border-t-blue-500 rounded-full w-16 h-16" />
    </div>
  );

  return (
    <main className="pt-16 bg-gray-50">
      <div className="p-4 bg-white shadow flex items-center">
        <SearchIcon className="text-gray-500" />
        <input
          className="ml-2 w-64 p-2 border rounded-lg"
          placeholder="Rechercher un produit..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="space-y-12 p-6">
        {latestByCategory.map(({ category, products }) => (
          <section key={category}>
            <h2 className="text-2xl font-bold mb-4">Derniers produits - {category}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products
                .filter(p => p.nom_prod.toLowerCase().includes(searchTerm.toLowerCase()) || p.desc_prod.toLowerCase().includes(searchTerm.toLowerCase()))
                .map(prod => (
                  <div key={prod.id} className="bg-white rounded-2xl shadow-lg flex flex-col">
                    <div className="relative group">
                      {prod.promotion && <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg">-{prod.promotion}%</span>}
                      <img
                        src={(prod.images || prod.image_path) ? `/storage/${prod.images || prod.image_path}` : '/placeholder.png'}
                        alt={prod.nom_prod}
                        className="h-48 w-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <Tooltip title={prod.likeUsers.join(', ')} arrow>
                        <button onClick={() => handleLike(prod.id)} className="absolute top-3 right-3 bg-white p-1 rounded-full shadow hover:bg-pink-100">
                          <Heart className={prod.like ? 'text-red-500' : 'text-gray-400'} size={18} />
                          {prod.likeCount > 0 && <span className="ml-1 text-sm">{prod.likeCount}</span>}
                        </button>
                      </Tooltip>
                    </div>
                    <div className="p-4 flex flex-col flex-grow">
                      <h3 className="text-lg font-bold mb-1 truncate">{prod.nom_prod}</h3>
                      <p className="text-gray-600 text-sm mb-2 line-clamp-2">{prod.desc_prod}</p>
                      <button onClick={() => navigate(`/produit/${encodeURIComponent(prod.nom_prod)}`)} className="mt-auto bg-blue-500 text-white px-3 py-2 rounded-2xl shadow hover:shadow-lg">
                        Détails
                      </button>
                    </div>
                  </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
};

export default ListProduit;
