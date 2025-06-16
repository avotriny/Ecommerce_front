import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, Link } from 'react-router-dom';
export function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <h1 className="text-6xl font-bold text-red-600">401</h1>
      <h2 className="text-2xl font-semibold mt-2">Non authentifié</h2>
      <p className="mt-4 text-gray-600">Vous devez vous connecter pour accéder à cette page.</p>
      <Link
        to="/login"
        className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        Aller à la connexion
      </Link>
    </div>
  );
}