import App from './App';
import React, { Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import './i18n';
const LoadingScreen = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500"></div>
  </div>
);
createRoot(document.getElementById('root')).render(
<BrowserRouter>
<Suspense fallback={<LoadingScreen />}>
    <App />
  </Suspense>
  </BrowserRouter>,
    

);
