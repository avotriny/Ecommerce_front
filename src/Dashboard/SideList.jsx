import React, { useState, useMemo, useEffect } from 'react';
import { useValue } from '../context/ContextProvider';
import { useNavigate } from 'react-router-dom';
import { GiBed } from 'react-icons/gi';
import { FiBell, FiChevronLeft, FiLogOut, FiUser, FiHome, FiPackage } from 'react-icons/fi';

const SideList = ({ open, setOpen }) => {
  const { state: { currentUser } } = useValue();
  const [selectedLink, setSelectedLink] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      navigate('/401', { replace: true });
    }
  }, [currentUser, navigate]);

  const handleLogout = () => navigate('/');

  const list = useMemo(() => {
    if (currentUser?.role === 'admin') {
      return [
        { id: 1, title: 'User', icon: <FiUser className="h-6 w-6 text-gray-600" />, link: 'user' },
        { id: 2, title: 'Main', icon: <FiHome className="h-6 w-6 text-gray-600" />, link: 'main' },
        { id: 3, title: 'Categorie', icon: <GiBed className="h-6 w-6 text-gray-600" />, link: 'categorie' },
        { id: 4, title: 'Produit', icon: <FiBell className="h-6 w-6 text-gray-600" />, link: 'produit' },
      ];
    }
    return [
      { id: 5, title: 'Commande', icon: <FiPackage className="h-6 w-6 text-gray-600" />, link: 'commande' },
    ];
  }, [currentUser]);

  return (
    <div className={`flex flex-col bg-white h-full transition-width duration-300 ${open ? 'w-60' : 'w-16'}`}>      
      <div className="flex items-center justify-end p-2">
        <button onClick={() => setOpen(false)}>
          <FiChevronLeft className="h-5 w-5 text-gray-600" />
        </button>
      </div>
      <nav className="flex-1 overflow-auto">
        <ul>
          {list.map(item => (
            <li key={item.id} className="mb-2">
              <button
                className={`flex items-center w-full px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors ${selectedLink === item.link ? 'bg-gray-300' : ''}`}
                onClick={() => {
                  navigate(`/dashboard/${item.link}`);
                  setSelectedLink(item.link);
                }}
              >
                {item.icon}
                <span className={`${open ? 'ml-3 text-gray-800' : 'sr-only'}`}>{item.title}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
      <div className="px-4 mt-4 text-center">
        <img
          src={currentUser?.avatar}
          alt={currentUser?.name}
          className={`rounded-full object-cover ${open ? 'h-24 w-24' : 'h-10 w-10'}`}
        />
        {open && (
          <>
            <p className="mt-2 text-gray-800 font-semibold">{currentUser?.name}</p>
            <p className="text-sm text-gray-600">{currentUser?.role}</p>
            <p className="text-sm text-gray-600">{currentUser?.email}</p>
          </>
        )}
        <button onClick={handleLogout} className="mt-2 inline-flex items-center p-1 rounded hover:bg-gray-200">
          <FiLogOut className="h-5 w-5 text-gray-600" />
        </button>
      </div>
    </div>
  );
};

export default SideList;