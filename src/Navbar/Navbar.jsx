// Nav.js
import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ShoppingCart, Menu } from '@mui/icons-material';
import Sidebar from './Sidebar';
import {useValue} from '../context/ContextProvider'
import { Avatar } from '@mui/material';

const links = [
  { name: 'home', path: '/' },
  { name: 'categorie', path: '/categorie' },
  { name: 'shop', path: '/shop' },
  { name: 'work', path: '/work' },
  { name: 'contact', path: '/contact' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { state: {currentUser}} = useValue()

  const totalQuantity = useSelector((s) => s.cart.totalQuantity);
  

  // Fermer le dropdown quand on clique à l’extérieur
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    // votre action de logout ici
    dispatch({ type: 'auth/logout' });
    setMenuOpen(false);
    navigate('/');
  };

  return (
    <header className="fixed w-full bg-white shadow-md z-50">
      <div className="container mx-auto px-4 flex items-center justify-between h-16">
        {/* Button mobile */}
        <button
          className="xl:hidden p-2"
          onClick={() => setIsOpen(true)}
        >
          <Menu fontSize="large" />
        </button>

        {/* Logo */}
        <Link to="/" className="text-2xl font-bold">
          Jonatan<span className="text-accent">.</span>
        </Link>

        {/* Liens desktop */}
        <nav className="hidden xl:flex space-x-8 items-center">
          {links.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`
                capitalize font-medium 
                hover:text-accent transition 
                ${location.pathname === link.path ? 'text-accent border-b-2 border-accent pb-1' : ''}
              `}
            >
              {link.name}
            </Link>
          ))}

<Link
  to="/cart"
  className="relative flex items-center p-2 hover:text-accent transition"
>
  <ShoppingCart />

  {totalQuantity > 0 && (
    <>
      {/* cercle animé “ping” derrière */}
      <span
        className="absolute -top-1 -right-1 inline-flex w-5 h-5 rounded-full bg-red-500 opacity-75 animate-ping"
      />
      {/* badge fixe par-dessus */}
      <span
        className="absolute -top-1 -right-1 inline-flex w-5 h-5 rounded-full bg-red-600 text-white text-xs font-bold
                   flex items-center justify-center"
      >
        {totalQuantity}
      </span>
    </>
  )}
</Link>

          {/* Auth */}
          {!currentUser ? (
            <Link
              to="/login"
              className="px-4 py-2 bg-accent text-white rounded hover:opacity-90 transition"
            >
              Se connecter
            </Link>
          ) : (
            <div className="relative" ref={dropdownRef}>
              <Avatar
                src={currentUser.avatar}
                alt="Avatar"
                className="cursor-pointer"
                onClick={() => setMenuOpen((o) => !o)}
              />
              {menuOpen && (
                <ul className="absolute right-0 mt-2 w-40 bg-white border rounded shadow-lg">
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
                      to="/dashboard/*"
                      className="block px-4 py-2 hover:bg-gray-100"
                      onClick={() => setMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                  </li>
                  <li>
                    <button
                      className="w-full text-left px-4 py-2 hover:bg-gray-100"
                      onClick={handleLogout}
                    >
                      Logout
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
