import React from 'react';
import { useLocation, Link } from 'react-router-dom';

const RegistrationConfirm = () => {
  const { state } = useLocation();
  const email = state?.email;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white p-8 rounded shadow text-center">
        <h2 className="text-2xl font-semibold mb-4">Inscription réussie !</h2>
        <p className="mb-6">
          Merci pour votre inscription{email ? `, ${email}` : ''}.
          Un email de confirmation vous a été envoyé.
          Veuillez vérifier votre boîte de réception et cliquer sur le lien d’activation.
        </p>
        <Link to="/auth" className="inline-block bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
          Retour à la connexion
        </Link>
      </div>
    </div>
  );
};

export default RegistrationConfirm;