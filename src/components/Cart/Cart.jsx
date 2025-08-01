import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { updateQuantity, clearCart } from '../../redux/cartSlice';
import { ShoppingCart } from '@mui/icons-material';

export default function Cart() {
  const dispatch = useDispatch();
  const { items, total, totalQuantity } = useSelector((s) => s.cart);

  // Form fields
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [adresse, setAdresse] = useState('');
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Géolocalisation
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(pos.coords.latitude);
          setLongitude(pos.coords.longitude);
        },
        () => console.warn('Géo non dispo')
      );
    }
  }, []);

  const handleChange = (id, delta) => {
    dispatch(updateQuantity({ id, delta }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Construction du payload avec tous les produits
      const payload = {
        nom,
        email,
        phone,
        adresse,
        latitude,
        longitude,
        products: items.map((item) => ({
          prod_id: item.id,
          quantite: item.quantity
        }))
      };

      // Envoi d'une seule requête
      const res = await axios.post(
        'http://localhost:8000/api/commande',
        payload
      );
      const checkoutUrl = res.data.checkoutUrl;

      // Vider le panier et redirection
      dispatch(clearCart());
      localStorage.removeItem('cart');
      window.location.href = checkoutUrl;
    } catch (err) {
      console.error('Erreur commande', err);
      setError('❌ Une erreur est survenue, réessayez.');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 bg-gray-50">
        <ShoppingCart className="text-6xl text-gray-300 mb-6 animate-pulse" />
        <h2 className="text-2xl font-semibold text-gray-600 mb-2">
          Votre panier est vide
        </h2>
        <p className="text-gray-500">Ajoutez des produits pour commencer !</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-8 bg-gray-50">
      {/* Articles */}
      <div className="md:col-span-2 space-y-4">
        <h1 className="text-3xl font-bold">Panier ({totalQuantity} articles)</h1>
        {items.map((item) => {
          const unit = parseFloat(item.prix_prod);
          const lineTotal = unit * item.quantity;
          return (
            <div
              key={item.id}
              className="flex items-center bg-white rounded-lg shadow hover:shadow-lg transition p-4"
            >
              <img
                src={`http://localhost:8000/${item.images?.[0]}`}
                alt={item.nom_prod}
                className="w-20 h-20 object-cover rounded-md mr-4"
              />
              <div className="flex-1">
                <h2 className="text-lg font-medium mb-1">{item.nom_prod}</h2>
                <p className="text-gray-500 mb-2 truncate">{item.desc_prod}</p>
                <div className="flex items-center space-x-4">
                  <span className="font-semibold text-green-600">
                    €{unit.toFixed(2)}
                  </span>
                  <div className="flex items-center border rounded-lg overflow-hidden">
                    <button
                      onClick={() => handleChange(item.id, -1)}
                      className="px-3 py-1 hover:bg-gray-100"
                    >
                      −
                    </button>
                    <span className="px-4 py-1">{item.quantity}</span>
                    <button
                      onClick={() => handleChange(item.id, +1)}
                      className="px-3 py-1 hover:bg-gray-100"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
              <span className="font-bold">€{lineTotal.toFixed(2)}</span>
            </div>
          );
        })}
        <button
          onClick={() => {
            dispatch(clearCart());
            localStorage.removeItem('cart');
          }}
          className="mt-4 text-red-600 hover:underline"
        >
          Vider le panier
        </button>
      </div>

      {/* Récap & Formulaire */}
      <div className="bg-white rounded-lg shadow-lg p-6 space-y-6 sticky top-6">
        <h2 className="text-2xl font-semibold">Récapitulatif</h2>
        <div className="flex justify-between">
          <span>Sous‑total</span>
          <span className="font-bold">€{total.toFixed(2)}</span>
        </div>
        <hr />
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-red-600">{error}</p>}
          <input
            type="text"
            placeholder="Nom complet"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            required
            className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
          <input
            type="tel"
            placeholder="Téléphone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
          <input
            type="text"
            placeholder="Adresse de livraison"
            value={adresse}
            onChange={(e) => setAdresse(e.target.value)}
            required
            className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 text-white rounded-lg transition ${
              loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? 'En cours...' : 'Passer à la caisse'}
          </button>
        </form>
      </div>
    </div>
  );
}
