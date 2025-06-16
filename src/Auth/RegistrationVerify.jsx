// src/pages/RegistrationVerify.jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function RegistrationVerify() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Si vous voulez demander le code :
  const [codeInput, setCodeInput] = useState('');

  useEffect(() => {
    if (!token) {
      setMessage({ type: 'error', text: 'Token manquant dans l’URL.' });
    }
  }, [token]);

  const handleVerify = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const url = `http://localhost:8000/api/registration/verify?token=${encodeURIComponent(token)}`;
      // si vous voulez envoyer aussi le code, adaptez en POST
      const res = await axios.get(url);
      setMessage({ type: 'success', text: res.data.message });
      // rediriger vers login ou dashboard
      setTimeout(() => navigate('/auth'), 2000);
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Erreur serveur';
      setMessage({ type: 'error', text: errMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white p-8 rounded shadow">
        <h2 className="text-2xl font-semibold mb-4">Vérification de votre compte</h2>
        {message && (
          <div
            className={`p-3 mb-4 rounded ${
              message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}
          >
            {message.text}
          </div>
        )}
        {/* Si vous souhaitez le code à 6 chiffres :
        <input
          type="text"
          maxLength="6"
          value={codeInput}
          onChange={e => setCodeInput(e.target.value)}
          placeholder="Entrez votre code"
          className="w-full p-2 border rounded mb-4"
        /> */}
        <button
          onClick={handleVerify}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          {loading ? 'Vérification…' : 'Activer mon compte'}
        </button>
      </div>
    </div>
  );
}
