// src/Navbar.js
import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch as useReduxDispatch } from 'react-redux';
import { ShoppingCart, Menu as MenuIcon } from '@mui/icons-material';
import Sidebar from './Sidebar';
import { useValue } from '../context/ContextProvider';
import {
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Button,
  CircularProgress
} from '@mui/material';
import axios from 'axios';

const links = [
  { name: 'home', path: '/' },
  { name: 'categorie', path: '/categorie' },
  { name: 'shop', path: '/shop' },
  { name: 'produit', path: '/about' },
  { name: 'A Propos', path: '/about' },
  { name: 'contact', path: '/contact' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const dropdownRef = useRef();
  const location = useLocation();
  const navigate = useNavigate();
  const reduxDispatch = useReduxDispatch();
  const { state: { currentUser }, dispatch: ctxDispatch } = useValue();
  const totalQuantity = useSelector(s => s.cart.totalQuantity);

  const [profileData, setProfileData] = useState({ name: '', avatar: '' });

  useEffect(() => {
    if (currentUser) {
      setProfileData({ name: currentUser.name, avatar: currentUser.avatar });
    }
  }, [currentUser]);

  useEffect(() => {
    const handleClickOutside = e => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const openProfileModal = () => {
    setProfileModalOpen(true);
    setMenuOpen(false);
  };
  const closeProfileModal = () => setProfileModalOpen(false);

  const handleProfileChange = e => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleProfileSave = async () => {
    setProfileLoading(true);
    try {
      const { data } = await axios.put(
        'http://localhost:8000/api/profile',
        { name: profileData.name, avatar: profileData.avatar },
        { headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` } }
      );
      ctxDispatch({ type: 'UPDATE_USER', payload: data.user });
      localStorage.setItem('currentUser', JSON.stringify(data.user));
      closeProfileModal();
    } catch (err) {
      console.error('Profile update error', err);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleLogout = () => {
    if (!window.confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) return;
    reduxDispatch({ type: 'auth/logout' });
    ctxDispatch({ type: 'LOGOUT' });
    localStorage.removeItem('currentUser');
    localStorage.removeItem('auth_token');
    navigate('/');
  };

  return (
    <>
      <header className="fixed w-full bg-white shadow-md z-50">
        <div className="container mx-auto px-4 flex items-center justify-between h-16 text-gray-900">
          <button className="xl:hidden p-2" onClick={() => setIsOpen(true)}>
            <MenuIcon fontSize="large" />
          </button>
          <Link to="/" className="text-2xl font-bold max-xl:hidden">
            <img src="./images/shopnakay.jpg" alt="shopnakay" className="w-12 h-12 rounded-full" />
          </Link>
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
            <Link to="/cart" className="relative flex items-center p-2 hover:text-green-500 transition">
              <ShoppingCart />
              {totalQuantity > 0 && (
                <>
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 opacity-75 animate-ping" />
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-600 text-white text-xs font-bold flex items-center justify-center">
                    {totalQuantity}
                  </span>
                </>
              )}
            </Link>
            {!currentUser ? (
              <Link to="/auth" className="px-4 py-2 bg-green-500 text-white rounded">
                Se connecter
              </Link>
            ) : (
              <div ref={dropdownRef} className="relative">
                <Avatar src={`http://localhost:8000/${currentUser?.avatar}`} className="cursor-pointer" onClick={() => setMenuOpen(o => !o)} />
                {menuOpen && (
                  <ul className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg">
                    <li>
                      <button className="w-full text-left px-4 py-2 hover:bg-gray-100" onClick={openProfileModal}>
                        Changer profil
                      </button>
                    </li>
                    <li>
                      <Link to="/dashboard" className="block px-4 py-2 hover:bg-gray-100" onClick={() => setMenuOpen(false)}>
                        Dashboard
                      </Link>
                    </li>
                    <li>
                      <button className="w-full text-left px-4 py-2 hover:bg-gray-100" onClick={handleLogout}>
                        Logout
                      </button>
                    </li>
                  </ul>
                )}
              </div>
            )}
          </nav>
        </div>
        <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />
      </header>

      <Dialog open={profileModalOpen} onClose={closeProfileModal} fullWidth maxWidth="xs">
        <DialogTitle>Modifier le profil</DialogTitle>
        <DialogContent>
          {profileData.avatar && (
            <div className="flex justify-center mb-4">
              <img
                src={`http://localhost:8000/${profileData.avatar}`}
                alt="Avatar actuel"
                className="w-20 h-20 rounded-full object-cover"
              />
            </div>
          )}
          <TextField
            label="Nom"
            name="name"
            fullWidth
            margin="dense"
            value={profileData.name}
            onChange={handleProfileChange}
          />
          <TextField
            label="Avatar URL (chemin relatif)"
            name="avatar"
            fullWidth
            margin="dense"
            value={profileData.avatar}
            onChange={handleProfileChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeProfileModal} disabled={profileLoading}>Annuler</Button>
          <Button onClick={handleProfileSave} disabled={profileLoading} color="primary">
            {profileLoading ? <CircularProgress size={20} /> : 'Enregistrer'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
