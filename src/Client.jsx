// Client.jsx
import React from 'react';
import Navbar from './Navbar/Navbar';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Accueil from './components/Accueil/accueil';
import Shop from './components/Shop/Shop';
import Cart from './components/Cart/Cart';
import OrdersMap from './components/Carte/Carte';

const Client = () => {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Accueil />} />
        <Route path="shop" element={<Shop />} />
        <Route path="cart" element={<Cart />} />
        <Route path="carte" element={<OrdersMap />} />
      </Routes>
    </>
  );
};

export default Client;