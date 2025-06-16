import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { addItem } from '../../redux/cartSlice';
import { useDispatch } from 'react-redux';
import { Search as SearchIcon, ShoppingCart, Heart } from 'lucide-react';

const Shop = () => {
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

  // Chargement initial des données
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [prodRes, catRes, subRes] = await Promise.all([
          axios.get('http://localhost:8000/api/produit'),
          axios.get('http://localhost:8000/api/categorie'),
          axios.get('http://localhost:8000/api/subcategorie'),
        ]);

        const list = prodRes.data.produit;
        setProduits(list);
        setFilteredProduits(list);

        // Catégories
        const cats = [{ id: 'All', name: 'Toutes' }, ...catRes.data.categorie.map(c => ({ id: c.id, name: c.type_categorie }))];
        setCategories(cats);

        // Sous-catégories par catégorie
        const subs = subRes.data.subcategories;
        const mapSub = subs.reduce((acc, sc) => {
          if (!acc[sc.cat_id]) acc[sc.cat_id] = [];
          acc[sc.cat_id].push({ id: sc.id, name: sc.name_categorie });
          return acc;
        }, {});
        setSubcategories(mapSub);

        // Couleurs, pointures, tailles
        setCouleurs(['All', ...new Set(list.map(p => p.couleur).filter(Boolean))]);
        setPointures(['All', ...new Set(list.map(p => p.pointure).filter(Boolean))]);
        setTailles(['All', ...new Set(list.map(p => p.taille).filter(Boolean))]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filtrage
  useEffect(() => {
    let temp = [...produits];
    if (selectedCat !== 'All') temp = temp.filter(p => p.subcategorie?.categorie?.id === selectedCat);
    if (selectedSubcat !== 'All') temp = temp.filter(p => p.subcat_id === selectedSubcat);
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
  const handleLike = produit => {
    // TODO: implémenter logique de 'like'
    console.log('Liked', produit.id);
  };

  return (
    <main className="flex flex-col h-screen bg-gray-50">
      {/* Barre de recherche */}
      <div className="p-4 bg-white shadow flex items-center space-x-2">
        <SearchIcon className="text-gray-500" />
        <input
          type="text"
          placeholder="Rechercher un produit..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full pl-2 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar filtres */}
        <aside className="w-1/4 p-6 bg-white shadow-lg overflow-y-auto space-y-6">
          {/* Catégorie */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Catégorie</h3>
            <select
              value={selectedCat}
              onChange={e => { setSelectedCat(e.target.value); setSelectedSubcat('All'); }}
              className="w-full p-2 border rounded-lg"
            >
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          {/* Sous-catégorie */}
          {selectedCat !== 'All' && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Sous-catégorie</h3>
              <select
                value={selectedSubcat}
                onChange={e => setSelectedSubcat(e.target.value)}
                className="w-full p-2 border rounded-lg"
              >
                <option value="All">Toutes</option>
                {subcategories[selectedCat]?.map(sc => <option key={sc.id} value={sc.id}>{sc.name}</option>)}
              </select>
            </div>
          )}
          {/* Autres filtres... */}
        </aside>

        {/* Grille produits */}
        <section className="flex-1 p-6 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin border-4 border-gray-200 border-t-blue-500 rounded-full w-16 h-16"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredProduits.map(p => (
                <div key={p.id} className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition overflow-hidden flex flex-col">
                  <div className="relative group">
                    {p.promotion && (
                      <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg">
                        -{p.promotion}%
                      </span>
                    )}
                    <img
                      src={`http://localhost:8000/${p.images}`}
                      alt={p.nom_prod}
                      className="h-48 w-full object-cover group-hover:scale-105 transition-transform"
                    />
                    {/* Like button */}
                    <button
                      onClick={() => handleLike(p)}
                      className="absolute top-3 right-3 bg-white p-1 rounded-full shadow hover:bg-pink-100 transition"
                    >
                      <Heart className="text-pink-500" size={18} />
                    </button>
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
