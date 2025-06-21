import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { addItem } from '../../redux/cartSlice';
import { useDispatch } from 'react-redux';
import { Search as SearchIcon, ShoppingCart, Heart } from 'lucide-react';
import { useValue } from '../../context/ContextProvider';
import Tooltip from '@mui/material/Tooltip';

const Shop = () => {
  const { state: { currentUser } } = useValue();
  const [produits, setProduits] = useState([]);
  const [filteredProduits, setFilteredProduits] = useState([]);
  const [loading, setLoading] = useState(true);

  // États de filtre
  const [selectedCat, setSelectedCat] = useState('All');
  const [selectedSubcat, setSelectedSubcat] = useState('All');
  const [selectedCouleur, setSelectedCouleur] = useState('All');
  const [selectedPointure, setSelectedPointure] = useState('All');
  const [selectedTaille, setSelectedTaille] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Options dynamiques
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState({});
  const [couleurs, setCouleurs] = useState([]);
  const [pointures, setPointures] = useState([]);
  const [tailles, setTailles] = useState([]);

  const dispatch = useDispatch();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [prodRes, catRes, subRes, likeRes] = await Promise.all([
          axios.get('http://localhost:8000/api/produit'),
          axios.get('http://localhost:8000/api/categorie'),
          axios.get('http://localhost:8000/api/subcategorie'),
          axios.get('http://localhost:8000/api/like'),
        ]);

        // Build like map: prod_id => [user names]
        const likesMap = {};
        (likeRes.data.like || []).forEach(l => {
          if (!likesMap[l.prod_id]) likesMap[l.prod_id] = [];
          likesMap[l.prod_id].push(l.user.name || l.user.username);
        });

        // Initialize produits with like info
        const list = (prodRes.data.produit || []).map(p => {
          const users = likesMap[p.id] || [];
          return {
            ...p,
            like: users.includes(currentUser?.name || currentUser?.username),
            likeCount: users.length,
            likeUsers: users,
          };
        });

        setProduits(list);
        setFilteredProduits(list);

        // Categories
        setCategories([{ id: 'All', type_categorie: 'Toutes' }, ... (catRes.data.categorie || [])]);

        // Subcategories
        const subs = subRes.data.subcategorie || [];
        const mapSub = subs.reduce((acc, sc) => {
          if (!acc[sc.cat_id]) acc[sc.cat_id] = [];
          acc[sc.cat_id].push(sc);
          return acc;
        }, {});
        setSubcategories(mapSub);

        // Colors, sizes, points
        setCouleurs(['All', ...new Set(list.map(p => p.couleur).filter(Boolean))]);
        setPointures(['All', ...new Set(list.map(p => p.pointure).filter(Boolean))]);
        setTailles(['All', ...new Set(list.map(p => p.taille).filter(Boolean))]);
      } catch (err) {
        console.error('fetchData error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [currentUser]);

  useEffect(() => {
    let temp = [...produits];
   if (selectedCat !== 'All') {
  const validSubs = subcategories[selectedCat] || [];
  temp = temp.filter(p => validSubs.some(sc => sc.id === p.subcat_id));
}
if (selectedSubcat !== 'All') {
  temp = temp.filter(p => p.subcat_id.toString() === selectedSubcat.toString());
}

    if (selectedCouleur !== 'All') temp = temp.filter(p => p.couleur === selectedCouleur);
    if (selectedPointure !== 'All') temp = temp.filter(p => p.pointure === selectedPointure);
    if (selectedTaille !== 'All') temp = temp.filter(p => p.taille === selectedTaille);
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      temp = temp.filter(
        p => p.nom_prod.toLowerCase().includes(term) || p.desc_prod.toLowerCase().includes(term)
      );
    }
    setFilteredProduits(temp);
  }, [selectedCat, selectedSubcat, selectedCouleur, selectedPointure, selectedTaille, searchTerm, produits]);

  const handleAddToCart = produit => dispatch(addItem(produit));

  const handleLike = async produit => {
    if (!currentUser) return;
    try {
      const { data } = await axios.post(
        `http://localhost:8000/api/produit/${produit.id}/like`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` } }
      );
      setProduits(prev => prev.map(p => {
        if (p.id === produit.id) {
          const updatedUsers = data.like
            ? [...p.likeUsers, currentUser.name || currentUser.username]
            : p.likeUsers.filter(u => u !== (currentUser.name || currentUser.username));
          return { ...p, like: data.like, likeCount: data.likeCount, likeUsers: updatedUsers };
        }
        return p;
      }));
    } catch (err) {
      console.error('handleLike error:', err);
    }
  };

  return (
    <main className="flex flex-col h-screen bg-gray-50 pt-16">
      <div className="p-4 bg-white shadow flex items-center justify-between">
        <div className="flex items-center">
          <SearchIcon className="text-gray-500" />
          <input
            className="ml-2 w-64 p-2 border rounded-lg focus:outline-none"
            type="text"
            placeholder="Rechercher un produit..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-1/4 p-6 bg-white shadow-lg overflow-y-auto">
          <h2 className="font-semibold mb-4">Filtres</h2>
          <div className="space-y-4">
            <div>
              <label className="block mb-1">Catégorie</label>
              <select
                value={selectedCat}
                onChange={e => { setSelectedCat(e.target.value); setSelectedSubcat('All'); }}
                className="w-full p-2 border rounded"
              >
                {categories.map(c => <option key={c.id} value={c.id}>{c.type_categorie}</option>)}
              </select>
            </div>
            {selectedCat !== 'All' && (
              <div>
                <label className="block mb-1">Sous-catégorie</label>
                <select
                  value={selectedSubcat}
                  onChange={e => setSelectedSubcat(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="All">Toutes</option>
                  {subcategories[selectedCat]?.map(sc => (
                    <option key={sc.id} value={sc.id}>{sc.name_categorie}</option>
                  ))}
                </select>
              </div>
            )}
            {/* Couleur, Taille, Pointure identiques à l'initialisation */}
          </div>
        </aside>
        <section className="flex-1 p-6 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin border-4 border-gray-200 border-t-blue-500 rounded-full w-16 h-16"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredProduits.map(p => (
                <div key={p.id} className="bg-white rounded-2xl shadow-lg flex flex-col">
                  <div className="relative group">
                    {p.promotion && (
                      <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg">
                        -{p.promotion}%
                      </span>
                    )}
                    <img
                      src={p.images ? `http://localhost:8000/${p.images}` : ''}
                      alt={p.nom_prod}
                      className="h-48 w-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <Tooltip title={p.likeUsers.join(', ') || 'Aucun like'} arrow>
                      <button
                        onClick={() => handleLike(p)}
                        className="absolute top-3 right-3 flex items-center bg-white p-1 rounded-full shadow hover:bg-pink-100 transition"
                      >
                        <Heart
                          size={18}
                          className={p.like ? 'text-red-500 fill-current' : 'text-gray-400'}
                        />
                        {p.likeCount > 0 && (
                          <span className="ml-1 text-sm font-medium text-gray-700">{p.likeCount}</span>
                        )}
                      </button>
                    </Tooltip>
                  </div>
                  <div className="p-4 flex flex-col flex-grow">
                    <h3 className="text-lg font-bold mb-1 truncate">{p.nom_prod}</h3>
                    <p className="text-gray-600 text-sm mb-2 line-clamp-2">{p.desc_prod}</p>
                    <div className="mt-auto flex items-center justify-between pt-4">
                      <div>
                        {p.promotion ? (
                          <div className="flex items-baseline space-x-2">
                            <span className="text-2xl font-extrabold text-green-600">€{p.prix_promo}</span>
                            <span className="text-sm text-red-500 line-through">€{p.prix_prod}</span>
                          </div>
                        ) : (
                          <span className="text-2xl font-extrabold text-green-600">€{p.prix_prod}</span>
                        )}
                      </div>
                      <button
                        onClick={() => handleAddToCart(p)}
                        className="bg-gradient-to-r from-green-400 to-blue-500 p-2 rounded-full shadow-lg hover:scale-105 transition-transform"
                      >
                        <ShoppingCart className="text-white" size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default Shop;