import React, { createContext, useReducer, useContext, useEffect } from 'react';
import reducer from './Reducer';

const initialState = {
  currentUser: JSON.parse(localStorage.getItem('currentUser')) || null,
  loading: false,
  alert: { open: false, severity: 'info', message: '' },

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
