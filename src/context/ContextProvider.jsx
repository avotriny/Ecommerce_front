import React, { createContext, useReducer, useContext, useEffect } from 'react';
import reducer from './Reducer';

const initialState = {
  currentUser: JSON.parse(localStorage.getItem('currentUser')) || null,
  openLogin: false,
  loading: false,
  alert: { open: false, severity: 'info', message: '' },
  profile: { open: false, file: null, photo_url: '' },
  images: [],
  details: { nom_prod: '', desc_prod: '', prix_prod: '', stock_prod: '', poids_prod: '', origin_prod: '', cat_id: '' },
  addedImages: [],
  deletedImages: [],
  updatedProduit: null,
  filteredProduits: [],
  section: 0,
  produits: [],
  produit: null,
  categories: [],
  users: [],
  cart: [],
  cartCount: 0, 
  total: 0,
  commandes: [],
  commande: null,
};

const Context = createContext();

export const useValue = () => useContext(Context);

const ContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);


  useEffect(() => {
    localStorage.setItem('currentUser', JSON.stringify(state.currentUser));
  }, [state.currentUser]);

  return (
    <Context.Provider value={{ state, dispatch }}>
      {children}
    </Context.Provider>
  );
};

export default ContextProvider;
