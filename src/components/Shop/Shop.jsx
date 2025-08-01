import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { Search as SearchIcon, ShoppingCart, Heart } from 'lucide-react';
import { useValue } from '../../context/ContextProvider';
import Tooltip from '@mui/material/Tooltip';
import { useNavigate } from 'react-router-dom';
import { useMemo } from 'react';



const Shop = () => {
  const { state: { currentUser } } = useValue();
  const dispatch = useDispatch();

  const [produits, setProduits] = useState([]);
  const [filteredProduits, setFilteredProduits] = useState([]);
  const [loading, setLoading] = useState(true);

  // États de filtre
  const [selectedCat, setSelectedCat] = useState('Tous');
  const [selectedSubcat, setSelectedSubcat] = useState('Tous');
  const [selectedCouleur, setSelectedCouleur] = useState('Tous');
  const [selectedPointure, setSelectedPointure] = useState('Tous');
  const [selectedTaille, setSelectedTaille] = useState('Tous');
  const [searchTerm, setSearchTerm] = useState('');

  // Options dynamiques
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState({});
  const [couleurs, setCouleurs] = useState([]);
  const [pointures, setPointures] = useState([]);
  const [tailles, setTailles] = useState([]);
  const navigate = useNavigate();

const groupedProduits = useMemo(() => {
  const map = {};
  filteredProduits.forEach(p => {
    if (!map[p.nom_prod]) {
      map[p.nom_prod] = {
        nom_prod: p.nom_prod,
        desc_prod: p.desc_prod,
        promo: p.promotion,
        prix_prod: p.prix_prod,
        prix_promo: p.prix_promo,
        image: p.images,
        like: p.like,
        likeCount: p.likeCount,
        likeUsers: p.likeUsers,
        variantes: []
      };
    }
    map[p.nom_prod].variantes.push({
      id: p.id,
      couleur: p.couleur,
      taille: p.taille,
      pointure: p.pointure,
      stock: p.stock_prod,
      prix_prod: p.prix_prod,
      prix_promo: p.prix_promo,
      promotion: p.promotion
    });
  });
  return Object.values(map);
}, [filteredProduits]);


  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [prodRes, catRes, subRes, likeRes] = await Promise.all([
          axios.get('/api/produit'),
          axios.get('/api/categorie'),
          axios.get('/api/subcategorie'),
          axios.get('/api/like'),
        ]);

        // Prétraitement des likes
        const likesMap = {};
        (likeRes.data.like || []).forEach(l => {
          likesMap[l.prod_id] = likesMap[l.prod_id] || [];
          likesMap[l.prod_id].push(l.user.name || l.user.username);
        });

        const list = (prodRes.data.produit || []).map(p => {
          const users = likesMap[p.id] || [];
          return {
            ...p,
            like: users.includes(currentUser?.name || ''),
            likeCount: users.length,
            likeUsers: users,
          };
        });

        setProduits(list);
        setFilteredProduits(list);

        // catégories + sous-catégories
        setCategories([{ id: 'Tous', type_categorie: 'Toutes' }, ...(catRes.data.categorie || [])]);
        const subMap = {};
        (subRes.data.subcategories || []).forEach(sc => {
          subMap[sc.cat_id] = subMap[sc.cat_id] || [];
          subMap[sc.cat_id].push(sc);
        });
        setSubcategories(subMap);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [currentUser]);

  // Options dynamiques après sélection de sous-catégorie
  useEffect(() => {
    if (selectedSubcat === 'Tous') {
      setCouleurs(['Tous']);
      setTailles(['Tous']);
      setPointures(['Tous']);
      return;
    }

    const base = produits.filter(p => p.subcat_id.toString() === selectedSubcat.toString());
    const cols  = Array.from(new Set(base.map(p => p.couleur).filter(Boolean)));
    const tails = Array.from(new Set(base.map(p => p.taille).filter(Boolean)));
    const pts   = Array.from(new Set(base.map(p => p.pointure).filter(Boolean)));

    setCouleurs(['Tous', ...cols]);
    setTailles(['Tous', ...tails]);
    setPointures(['Tous', ...pts]);
  }, [selectedSubcat, produits]);

  // Filtrage principal
  useEffect(() => {
    let temp = [...produits];

    // par catégorie
    if (selectedCat !== 'Tous') {
      const validSubs = subcategories[selectedCat] || [];
      temp = temp.filter(p => validSubs.map(sc => sc.id).includes(p.subcat_id));
    }
    // par sous-catégorie
    if (selectedSubcat !== 'Tous') temp = temp.filter(p => p.subcat_id.toString() === selectedSubcat.toString());

    // filtres détaillés
    if (selectedCouleur !== 'Tous')  temp = temp.filter(p => p.couleur === selectedCouleur);
    if (selectedTaille  !== 'Tous')  temp = temp.filter(p => p.taille  === selectedTaille);
    if (selectedPointure !== 'Tous') temp = temp.filter(p => p.pointure === selectedPointure);

    // recherche textuelle
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      temp = temp.filter(p =>
        p.nom_prod.toLowerCase().includes(term) ||
        p.desc_prod.toLowerCase().includes(term)
      );
    }

    setFilteredProduits(temp);
  }, [selectedCat, selectedSubcat, selectedCouleur, selectedTaille, selectedPointure, searchTerm, produits, subcategories]);

  const handleLike = async p => {
    if (!currentUser) return;
    try {
      const { data } = await axios.post(
        `http://localhost:8000/api/produit/${p.id}/like`, {},
        { headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` } }
      );
      setProduits(prev => prev.map(prod =>
        prod.id === p.id
          ? { ...prod, like: data.like, likeCount: data.likeCount, likeUsers: data.likeUsers }
          : prod
      ));
    } catch (err) {
      console.error('like error:', err);
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
          <div className="space-y-4 text-black">
            {/* Catégorie */}
            <div>
  <label className="block mb-1">Catégorie</label>
  <select
    value={selectedCat}
    onChange={e => {
      setSelectedCat(e.target.value);
      setSelectedSubcat('Tous');
      setSelectedCouleur('Tous');
      setSelectedTaille('Tous');
      setSelectedPointure('Tous');
    }}
    className="w-full p-2 border rounded"
  >
   <option value="Tous">Toutes</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.type_categorie}</option>
              ))}
  </select>
</div>
            {/* Sous-catégorie */}
            {selectedCat !== 'Tous' && (
              <div>
                <label className="block mb-1">Sous-catégorie</label>
                <select
                  value={selectedSubcat}
                onChange={e => {
                  setSelectedSubcat(e.target.value);
                  setSelectedCouleur('Tous');
                  setSelectedTaille('Tous');
                  setSelectedPointure('Tous');
                }}
                  className="w-full p-2 border rounded"
                >
                  <option value="Tous">Toutes</option>
                  {(subcategories[selectedCat] || []).map(sc => (
                    <option key={sc.id} value={sc.id}>{sc.name_categorie}</option>
                  ))}
                </select>
              </div>
            )}
{selectedSubcat !== 'Tous' && couleurs.length > 1 && (
  <div>
    <label className="block mb-1">Couleur</label>
    <select
      value={selectedCouleur}
      onChange={e => setSelectedCouleur(e.target.value)}
      className="w-full p-2 border rounded"
    >
      {couleurs.map(col => <option key={col} value={col}>{col}</option>)}
    </select>
  </div>
)}

{/* Taille — seulement si la liste contient autre chose que "Tous" */}
{selectedSubcat !== 'Tous' && tailles.length > 1&& (
  <div>
    <label className="block mb-1">Taille</label>
    <select
      value={selectedTaille}
      onChange={e => setSelectedTaille(e.target.value)}
      className="w-full p-2 border rounded"
    >
      {tailles.map(t => <option key={t} value={t}>{t}</option>)}
    </select>
  </div>
)}

{/* Pointure — idem */}
{selectedSubcat !== 'Tous' && pointures.length > 1 && (
  <div>
    <label className="block mb-1">Pointure</label>
    <select
      value={selectedPointure}
      onChange={e => setSelectedPointure(e.target.value)}
      className="w-full p-2 border rounded"
    >
      {pointures.map(pt => <option key={pt} value={pt}>{pt}</option>)}
    </select>
  </div>
)}
          </div>
        </aside>
        <section className="flex-1 p-6 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin border-4 border-gray-200 border-t-blue-500 rounded-full w-16 h-16"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
{groupedProduits.map(prod => (
  <div key={prod.nom_prod} className="bg-white rounded-2xl shadow-lg flex flex-col">
    <div className="relative group">
      {prod.promo && (
        <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg">
          -{prod.promo}%
        </span>
      )}

      <img
        src={prod.image ? `http://localhost:8000/${prod.image}` : ''}
        alt={prod.nom_prod}
        className="h-48 w-full object-cover group-hover:scale-105 transition-transform"
      />

      <Tooltip title={(prod.likeUsers || []).join(', ')} arrow>
        <button
          onClick={() => handleLike({ id: prod.variantes[0].id })}  
          className="absolute top-3 right-3 flex items-center bg-white p-1 rounded-full shadow hover:bg-pink-100 transition"
        >
          <Heart
            size={18}
            className={prod.like ? 'text-red-500 fill-current' : 'text-gray-400'}
          />
          {prod.likeCount > 0 && (
            <span className="ml-1 text-sm font-medium text-gray-700">
              {prod.likeCount}
            </span>
          )}
        </button>
      </Tooltip>
    </div>

    <div className="p-4 flex flex-col flex-grow">
      <h3 className="text-lg font-bold mb-1 truncate">{prod.nom_prod}</h3>
      <p className="text-gray-600 text-sm mb-2 line-clamp-2">{prod.desc_prod}</p>
<div className="mt-auto flex items-center justify-between pt-4 space-x-2">
  {/* Prix */}
  <div className="flex-1">
    {prod.promo ? (
      <div className="flex items-baseline space-x-2">
        <span className="text-2xl font-extrabold text-green-600">
          €{prod.prix_promo}
        </span>
        <span className="text-sm text-red-500 line-through">
          €{prod.prix_prod}
        </span>
      </div>
    ) : (
      <span className="text-2xl font-extrabold text-green-600">
        €{prod.prix_prod}
      </span>
    )}
  </div>

  {/* Bouton Voir les détails */}
  <button
    onClick={() => navigate(`/produit/${encodeURIComponent(prod.nom_prod)}`)}
    className="flex items-center bg-blue-500 text-white px-3 py-2 rounded-2xl shadow hover:shadow-lg transition transform hover:-translate-y-0.5"
  >
    Détails
  </button>

  {/* Icône Ajouter au panier */}
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