import React, { useState, useEffect, useMemo } from 'react';
import { useParams }               from 'react-router-dom';
import axios                        from 'axios';
import { useDispatch }             from 'react-redux';
import { addItem }                 from '../../redux/cartSlice';
import { ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react';

// Utility pour générer l'URL d'une image (string ou array)
const buildImageUrl = (images, index = 0) => {
  let path = null;
  if (Array.isArray(images) && images.length) {
    path = images[index];
  } else if (typeof images === 'string' && images) {
    path = images;
  }
  if (!path) return 'https://via.placeholder.com/500x500?text=No+Image';
  return `http://localhost:8000/${path}`;
};

const ProduitDetail = () => {
  const { nom }    = useParams();
  const dispatch   = useDispatch();
  const [variantes, setVariantes]         = useState([]);
  const [loading, setLoading]             = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeIndex, setActiveIndex]     = useState(0);

  // Filtres
  const [filterCouleur, setFilterCouleur]   = useState('Tous');
  const [filterTaille, setFilterTaille]     = useState('Tous');
  const [filterPointure, setFilterPointure] = useState('Tous');

  useEffect(() => {
    async function fetchVariantes() {
      setLoading(true);
      try {
        const res = await axios.get(
          `http://localhost:8000/api/produit/${encodeURIComponent(nom)}`
        );
        setVariantes(res.data.produit || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchVariantes();
  }, [nom]);

  // Dropdown options
  const couleurs = useMemo(() => ['Tous', ...new Set(variantes.map(v => v.couleur).filter(Boolean))], [variantes]);
  const tailles  = useMemo(() => ['Tous', ...new Set(variantes.map(v => v.taille).filter(Boolean))], [variantes]);
  const points   = useMemo(() => ['Tous', ...new Set(variantes.map(v => v.pointure).filter(Boolean))], [variantes]);

  // Variantes après filtres
  const displayed = useMemo(() => variantes.filter(v =>
    (filterCouleur   === 'Tous' || v.couleur   === filterCouleur) &&
    (filterTaille    === 'Tous' || v.taille    === filterTaille)  &&
    (filterPointure  === 'Tous' || v.pointure  === filterPointure)
  ), [variantes, filterCouleur, filterTaille, filterPointure]);

  // Si la liste change, on remet activeIndex et imageIndex à 0
  useEffect(() => {
    setActiveIndex(0);
    setCurrentImageIndex(0);
  }, [displayed.length]);

  if (loading) return <div className="p-6 text-center">Chargement…</div>;
  if (!displayed.length) return <div className="p-6 text-center">Aucune variante pour « {nom} »</div>;

  // Variante active
  const active = displayed[activeIndex];

  // Carousel controls
  const prevImage = () => setCurrentImageIndex(i =>
    i === 0
      ? (Array.isArray(active.images) ? active.images.length - 1 : 0)
      : i - 1
  );
  const nextImage = () => setCurrentImageIndex(i =>
    Array.isArray(active.images) && i === active.images.length - 1
      ? 0
      : i + 1
  );

  return (
    <main className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-extrabold mb-6">{nom}</h1>

      {/* FILTRES */}
      <div className="flex flex-wrap gap-4 mb-6">
        {[ 
          { label:'Couleur',   opts:couleurs,   state:filterCouleur,   set:setFilterCouleur },
          { label:'Taille',    opts:tailles,    state:filterTaille,    set:setFilterTaille    },
          { label:'Pointure',  opts:points,     state:filterPointure, set:setFilterPointure  }
        ].map(({ label, opts, state, set }) => (
          <div key={label}>
            <label className="block text-sm font-medium mb-1">{label}</label>
            <select
              className="p-2 border rounded-lg bg-white shadow-sm focus:outline-none"
              value={state}
              onChange={e => set(e.target.value)}
            >
              {opts.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
        ))}
      </div>

      {/* SECTION INFO + CAROUSEL */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Carousel */}
        <div className="relative bg-white rounded-2xl overflow-hidden shadow-md">
          {Array.isArray(active.images) && active.images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute top-1/2 left-2 -translate-y-1/2 bg-white p-2 rounded-full shadow hover:bg-gray-100 transition"
              >
                <ChevronLeft />
              </button>
              <button
                onClick={nextImage}
                className="absolute top-1/2 right-2 -translate-y-1/2 bg-white p-2 rounded-full shadow hover:bg-gray-100 transition"
              >
                <ChevronRight />
              </button>
            </>
          )}
          <img
            src={buildImageUrl(active.images, currentImageIndex)}
            alt={`${nom} ${currentImageIndex + 1}`}
            className="w-full h-[500px] object-cover"
          />
        </div>

        {/* Détails */}
        <div className="space-y-4">
          <p className="text-gray-700">{active.desc_prod}</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p><strong>Origine :</strong> {active.origin_prod}</p>
              <p><strong>Poids :</strong> {active.poids_prod ?? '—'} kg</p>
            </div>
            <div>
              <p><strong>Stock :</strong> {active.stock_prod}</p>
              <p>
                <strong>Statut :</strong>{' '}
                {active.status
                  ? <span className="text-green-600 font-medium">Disponible</span>
                  : <span className="text-red-600 font-medium">Indisponible</span>}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {active.promotion ? (
              <>
                <span className="text-3xl font-extrabold text-green-600">€{active.prix_promo}</span>
                <span className="text-xl text-red-500 line-through">€{active.prix_prod}</span>
                <span className="px-2 py-1 bg-red-600 text-white text-xs rounded-full">-{active.promotion}%</span>
              </>
            ) : (
              <span className="text-3xl font-extrabold text-green-600">€{active.prix_prod}</span>
            )}
          </div>
          <button
            onClick={() => dispatch(addItem(active))}
            className="mt-6 w-full flex items-center justify-center bg-gradient-to-tr from-green-400 to-blue-500 text-white py-3 rounded-full shadow-lg hover:shadow-2xl transition transform hover:scale-105"
          >
            <ShoppingCart size={24} className="mr-2" /> Ajouter au panier
          </button>
        </div>
      </div>

      {/* VARIANTES */}
      {displayed.length > 1 && (
        <>
          <h2 className="text-2xl font-bold mb-4">Autres variantes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayed.map((v, idx) => (
              <div
                key={v.id}
                className={`bg-white rounded-2xl shadow-md hover:shadow-xl transition p-4 flex flex-col cursor-pointer
                  ${idx === activeIndex ? 'ring-2 ring-blue-400' : ''}`}
                onClick={() => {
                  setActiveIndex(idx);
                  setCurrentImageIndex(0);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                <img
                  src={buildImageUrl(v.images, 0)}
                  alt={`${nom} variant`}
                  className="w-full h-40 object-cover rounded-lg mb-3"
                />
                <div className="flex-1 space-y-1">
                  <p><strong>Couleur :</strong> {v.couleur || '—'}</p>
                  <p><strong>Taille :</strong> {v.taille || '—'}</p>
                  <p><strong>Pointure :</strong> {v.pointure || '—'}</p>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-lg font-bold text-green-600">
                    {v.promotion ? `€${v.prix_promo}` : `€${v.prix_prod}`}
                  </span>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      dispatch(addItem(v));
                    }}
                    className="bg-green-500 text-white p-2 rounded-full shadow hover:bg-green-600 transition"
                  >
                    <ShoppingCart size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </main>
  );
};

export default ProduitDetail;
