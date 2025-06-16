// src/Navbar.js
import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch as useReduxDispatch } from 'react-redux';
import { ShoppingCart, Menu as MenuIcon } from '@mui/icons-material';
import Sidebar from './Sidebar';
import { useValue } from '../context/ContextProvider';
import { Avatar } from '@mui/material';

const links = [
  { name: 'home', path: '/' },
  { name: 'categorie', path: '/dashboard/categorie' },
  { name: 'shop', path: '/shop' },
  { name: 'work', path: '/work' },
  { name: 'contact', path: '/contact' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loadingLogout, setLoadingLogout] = useState(false);
  const dropdownRef = useRef();
  const location = useLocation();
  const navigate = useNavigate();
  const reduxDispatch = useReduxDispatch();
  const { state: { currentUser }, dispatch } = useValue();
  const totalQuantity = useSelector(s => s.cart.totalQuantity);

  // Fermer le dropdown quand on clique à l’extérieur
  useEffect(() => {
    const handleClickOutside = e => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    // Confirmation
    const ok = window.confirm('Êtes-vous sûr de vouloir vous déconnecter ?');
    if (!ok) return;

    setLoadingLogout(true);
    try {
      // 1) Effacer du store Redux
      reduxDispatch({ type: 'auth/logout' });
      // 2) Effacer du context
      dispatch({ type: 'LOGOUT' });
      // 3) Effacer localStorage
      localStorage.removeItem('currentUser');
      localStorage.removeItem('auth_token');
      // 4) Redirection et mise à jour immédiate de l'UI sans reload
      navigate('/');
    } catch (err) {
      console.error('Logout error', err);
    } finally {
      setLoadingLogout(false);
      setMenuOpen(false);
    }
  };

  return (
    <header className="fixed w-full bg-white shadow-md z-50">
      <div className="container mx-auto px-4 flex items-center justify-between h-16 text-gray-900">
        {/* Bouton mobile */}
        <button className="xl:hidden p-2" onClick={() => setIsOpen(true)}>
          <MenuIcon fontSize="large" />
        </button>

        {/* Logo */}
        <Link to="/" className="text-2xl font-bold max-xl:hidden">
          <img
            src="./images/shopnakay.jpg"
            alt="shopnakay"
            className="w-12 h-12 rounded-full border object-cover"
          />
        </Link>

        {/* Liens desktop */}
        <nav className="hidden xl:flex space-x-8 items-center">
          {links.map(link => (
            <Link
              key={link.name}
              to={link.path}
              className={
                `capitalize font-medium hover:text-green-500 transition ` +
                (location.pathname.startsWith(link.path)
                  ? 'text-green-500 border-b-2 border-green-500 pb-1'
                  : 'text-gray-700')
              }
            >
              {link.name}
            </Link>
          ))}

          {/* Panier */}
          <Link
            to="/cart"
            className="relative flex items-center p-2 hover:text-green-500 transition"
          >
            <ShoppingCart />
            {totalQuantity > 0 && (
              <>  
                <span className="absolute -top-1 -right-1 inline-flex w-5 h-5 rounded-full bg-red-500 opacity-75 animate-ping" />
                <span className="absolute -top-1 -right-1 inline-flex w-5 h-5 rounded-full bg-red-600 text-white text-xs font-bold flex items-center justify-center">
                  {totalQuantity}
                </span>
              </>
            )}
          </Link>

          {/* Auth */}
          {!currentUser ? (
            <Link
              to="/auth"
              className="px-4 py-2 bg-green-500 text-white rounded hover:opacity-90 transition"
            >
              Se connecter
            </Link>
          ) : (
            <div className="relative" ref={dropdownRef}>
              <Avatar
                src={currentUser.avatar}
                alt="Avatar"
                className="cursor-pointer"
                onClick={() => setMenuOpen(o => !o)}
              />
              {menuOpen && (
                <ul className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg">
                  <li>
                    <Link
                      to="/profile"
                      className="block px-4 py-2 hover:bg-gray-100"
                      onClick={() => setMenuOpen(false)}
                    >
                      Changer profil
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/dashboard"
                      className="block px-4 py-2 hover:bg-gray-100"
                      onClick={() => setMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                  </li>
                  <li>
                    <button
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center justify-between"
                      onClick={handleLogout}
                      disabled={loadingLogout}
                    >
                      {loadingLogout ? 'Déconnexion...' : 'Logout'}
                    </button>
                  </li>
                </ul>
              )}
            </div>
          )}
        </nav>
      </div>

      {/* Sidebar mobile */}
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />
    </header>
  );
}
