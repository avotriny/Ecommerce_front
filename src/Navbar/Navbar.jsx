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
  CircularProgress,
  Badge,
  IconButton
} from '@mui/material';
import axios from 'axios';

const links = [
  { name: 'home', path: '/' },
  { name: 'categorie', path: '/categorie' },
  { name: 'shop', path: '/shop' },
  { name: 'produit', path: '/produit' },
  { name: 'A Propos', path: '/about' },
  { name: 'contact', path: '/contact' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [loadingLogout, setLoadingLogout] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);

  const dropdownRef = useRef();
  const location = useLocation();
  const navigate = useNavigate();
  const reduxDispatch = useReduxDispatch();
  const { state: { currentUser }, dispatch: ctxDispatch } = useValue();
  const totalQuantity = useSelector(s => s.cart.totalQuantity);

  // Préremplissage du formulaire de profil
const [profileName, setProfileName] = useState('');
  useEffect(() => {
    if (currentUser) {
      setProfileName(currentUser.name || '');
      setAvatarFile(null);
    }
  }, [currentUser]);

  // Fermer dropdown
  useEffect(() => {
    const handleClickOutside = e => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handlers
  const openProfileModal = () => { setProfileModalOpen(true); setMenuOpen(false); };
  const closeProfileModal = () => setProfileModalOpen(false);
  const handleNameChange = e => setProfileName(e.target.value);
  const handleFileChange = e => setAvatarFile(e.target.files[0]);

  // Sauvegarde profil
  const handleProfileSave = async () => {
    if (!profileName.trim()) {
      alert('Le nom est requis.');
      return;
    }
    if (!avatarFile) {
      alert('Veuillez sélectionner une image d\'avatar.');
      return;
    }
    setProfileLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', profileName);
      formData.append('avatar', avatarFile);
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`
        }
      };
      const { data } = await axios.post(
        'http://localhost:8000/api/profile',
        formData,
        config
      );
      ctxDispatch({ type: 'UPDATE_USER', payload: data.user });
      localStorage.setItem('currentUser', JSON.stringify(data.user));
      closeProfileModal();
    } catch (err) {
      console.error('Profile update error', err);
      alert('Erreur lors de la mise à jour du profil.');
    } finally {
      setProfileLoading(false);
    }
  };
  const handleLogout = async () => {
    const ok = window.confirm('Êtes-vous sûr de vouloir vous déconnecter ?');
    if (!ok) return;

    setLoadingLogout(true);
    try {
      ctxDispatch({ type: 'LOGOUT' });
      localStorage.removeItem('auth_token');
      setMenuOpen(false);
      navigate('/');
    } catch (err) {
      console.error('Logout error', err);
    } finally {
      setLoadingLogout(false);
    }
  };

  return (
    <>
      <header className="fixed w-full bg-white shadow-md z-50">
        <div className="container mx-auto px-4 flex items-center justify-between h-16">
          {/* Burger + Logo */}
          <div className="flex items-center gap-4">
            <button className="xl:hidden p-2" onClick={() => setIsOpen(true)}>
              <MenuIcon fontSize="large" />
            </button>
            <Link to="/" className="flex items-center">
              <img
                src="./images/shopnakay.jpg"
                alt="shopnakay"
                className="w-10 h-10 rounded-full mr-2"
              />
              <span className="text-2xl font-bold text-green-700">
                Shop'nakay
              </span>
            </Link>
          </div>

          {/* Liens + actions */}
          <nav className="flex items-center space-x-6">
            <div className="hidden xl:flex space-x-8">
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
            </div>

            {/* Panier */}
            <Link to="/cart" className="relative">
              <Badge badgeContent={totalQuantity} color="error">
                <ShoppingCart fontSize="large" />
              </Badge>
            </Link>

            {/* Avatar / Menu */}
            <div ref={dropdownRef} className="relative">
<IconButton
  onClick={() => setMenuOpen(o => !o)}
  disabled={loadingLogout}
>
  {currentUser ? (
    <Avatar
      src={`http://localhost:8000/storage/${currentUser.avatar}`}
      alt={currentUser.name}
    >
      {currentUser.name.charAt(0).toUpperCase()}
    </Avatar>
  ) : (
    <Avatar />
  )}
</IconButton>
              {menuOpen && (
                <ul className="absolute right-0 mt-2 w-40 bg-white border rounded shadow-lg">
                  {!currentUser && (
                    <li>
                      <Link
                        to="/auth"
                        className="block px-4 py-2 hover:bg-gray-100"
                        onClick={() => setMenuOpen(false)}
                      >
                        Se connecter
                      </Link>
                    </li>
                  )}
                  {currentUser && (
                    <>
                      <li>
                        <button
                          className="w-full text-left px-4 py-2 hover:bg-gray-100"
                          onClick={openProfileModal}
                        >
                          Modifier profil
                        </button>
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
                          className="w-full flex items-center justify-between px-4 py-2 hover:bg-gray-100"
                          onClick={handleLogout}
                        >
                          {loadingLogout ? 'Déconnexion...' : 'Logout'}
                        </button>
                      </li>
                    </>
                  )}
                </ul>
              )}
            </div>
          </nav>
        </div>
        <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />
      </header>


      {currentUser && (
        <Dialog open={profileModalOpen} onClose={closeProfileModal} fullWidth maxWidth="xs">
        <DialogTitle>Modifier le profil</DialogTitle>
        <img src={`http://localhost:8000/storage/${currentUser.avatar}`} className='ml-20 rounded-full w-14 h-14 p-2'/>
        <DialogContent>
          <TextField
            label="Nom"
            fullWidth
            margin="dense"
            value={profileName}
            onChange={handleNameChange}
          />
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="mt-2"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeProfileModal} disabled={profileLoading}>Annuler</Button>
          <Button onClick={handleProfileSave} disabled={profileLoading} color="primary">
            {profileLoading ? <CircularProgress size={20} /> : 'Enregistrer'}
          </Button>
        </DialogActions>
      </Dialog>)}
    </>
  );
}
