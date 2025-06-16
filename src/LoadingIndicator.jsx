import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, Link } from 'react-router-dom';
import { useValue } from './context/ContextProvider';

/**
 * Loading Indicator Component
 */
export function LoadingIndicator() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-gray-700">Chargement en cours...</p>
    </div>
  );
}