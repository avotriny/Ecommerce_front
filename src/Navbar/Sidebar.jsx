// src/Sidebar.js
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Cancel as CancelIcon } from '@mui/icons-material';

const links = [
  { name: 'home', path: '/' },
  { name: 'categorie', path: '/categorie' },
  { name: 'shop', path: '/shop' },
  { name: 'produit', path: '/produit' },
  { name: 'A Propos', path: '/about' },
  { name: 'contact', path: '/contact' },
];

export default function Sidebar({ isOpen, setIsOpen }) {
  const location = useLocation();

  return (
    <div
      className={`
        fixed top-0 left-0 h-full w-60 bg-white shadow-lg z-40
        transform transition-transform duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
    >
      {/* En-tête */}
      <div className="flex items-center justify-between p-4 border-b">
        <Link to="/" className="text-2xl font-bold xl:hidden">
          <img
            src="./images/shopnakay.jpg"
            alt="shopnakay"
            className="w-12 h-12 rounded-full border object-cover"
          />
        </Link>
        <button onClick={() => setIsOpen(false)}>
          <CancelIcon fontSize="large" />
        </button>
      </div>

      {/* Liens */}
      <nav className="flex flex-col p-4 space-y-4">
        {links.map(link => (
          <Link
            key={link.name}
            to={link.path}
            onClick={() => setIsOpen(false)}
            className={`
              capitalize font-medium text-lg hover:text-green-500 transition
              ${location.pathname.startsWith(link.path)
                ? 'text-green-500 border-b-2 border-green-500 pb-1'
                : 'text-gray-700'}
            `}
          >
            {link.name}
          </Link>
        ))}
      </nav>
    </div>
  );
}
