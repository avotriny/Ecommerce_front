// Sidebar.js
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Cancel } from '@mui/icons-material';

const links = [
  { name: 'home', path: '/' },
  { name: 'categorie', path: '/categorie' },
  { name: 'shop', path: '/shop' },
  { name: 'work', path: '/work' },
  { name: 'contact', path: '/contact' },
];

export default function Sidebar({ isOpen, setIsOpen }) {
  const location = useLocation();

  return (
    // wrapper qui gère l’ouverture/fermeture
    <div
      className={`
        fixed top-0 left-0 h-full w-60 bg-white shadow-lg z-40
        transform transition-transform duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
    >
      {/* En-tête avec bouton de fermeture */}
      <div className="flex items-center justify-end p-4 border-b">
        <button onClick={() => setIsOpen(false)}>
          <Cancel fontSize="large" />
        </button>
      </div>

      {/* Liens */}
      <nav className="flex flex-col p-4 space-y-4">
        {links.map((link) => (
          <Link
            key={link.name}
            to={link.path}
            onClick={() => setIsOpen(false)}
            className={`
              capitalize font-medium text-lg
              hover:text-accent transition
              ${location.pathname === link.path ? 'text-accent border-b-2 border-accent pb-1' : 'text-gray-700'}
            `}
          >
            {link.name}
          </Link>
        ))}
      </nav>
    </div>
  );
}
