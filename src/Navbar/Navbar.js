import React, { useState } from 'react';
import { AppBar, Toolbar, IconButton, Badge, Typography, Button } from '@mui/material';
import { Menu, ShoppingCart, Lock } from '@mui/icons-material';
import { useValue } from '../context/ContextProvider';
import { useNavigate } from 'react-router-dom';
import Sidebar from './sidebar/Sidebar';
import UserIcons from './user/userIcon';
import { useSelector, useDispatch } from 'react-redux';
import { resetCartCount } from '../redux/cartSlice';

const Navbar = () => {
  const { state: { currentUser } } = useValue();
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cartCount = Math.max(0, useSelector((state) => state.cart.cartCount)); // Empêche les valeurs négatives

  const handleCartClick = () => {
    dispatch(resetCartCount());
    navigate('/cart');
  };

  return (
    <>
      <AppBar className="navbar">
        <Toolbar>
          <IconButton size="large" color="inherit" onClick={() => setIsOpen(true)}>
            <Menu />
          </IconButton>
          <Typography variant="h6" component="h1" sx={{ flexGrow: 1 }}>
            SINOHYDRO
          </Typography>
          <IconButton size="large" color="inherit" onClick={handleCartClick}>
            <Badge badgeContent={cartCount} color="secondary">
              <ShoppingCart />
            </Badge>
          </IconButton>
          {!currentUser ? (
            <Button color="inherit" startIcon={<Lock />} onClick={() => dispatch({ type: 'OPEN_LOGIN' })}>
              Login
            </Button>
          ) : (
            <UserIcons />
          )}
        </Toolbar>
      </AppBar>
      <Toolbar />
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />
    </>
  );
};

export default Navbar;
