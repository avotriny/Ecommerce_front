import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { CssBaseline } from '@mui/material';
import { Provider } from 'react-redux';
import store from './redux/store';
import ContextProvider from './context/ContextProvider';
import './index.css';

createRoot(document.getElementById('root')).render(
  <>
    <ContextProvider>
      <Provider store={store}>
        <App />
      </Provider>
    </ContextProvider>
  </>
);
