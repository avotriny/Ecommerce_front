import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Loading from './Loading';
import Notification from './Notification';
import PageTransition from './utils/PageTransition';
import Client from './Client';
import Dashboard from './Dashboard/Dashboard';
import { NotFoundPage } from './NotFoundPage';
import { ForbiddenPage } from './ForbiddenPage';
import { UnauthorizedPage } from './UnauthorizedPage';
import Login from './Auth/Auth';
import RegistrationVerify from './Auth/RegistrationVerify';
import RegistrationConfirm from './Auth/RegistrationConfirm';
import axios from 'axios';

axios.defaults.baseURL = 'http://localhost:8000/';
axios.defaults.headers.post['Content-Type'] = 'application/json';
axios.defaults.headers.post['Accept'] = 'application/json';
axios.defaults.withCredentials = true;
axios.interceptors.request.use(function(config) {  
    const token = localStorage.getItem('auth_token'); 
    config.headers.Authorization = token ? `Bearer ${token}` : '';
    return config;
});

export default function App() {
  return (
    <Router>
      <Loading />
      <Notification />
      <PageTransition>
        <Routes>
          <Route path="/dashboard/*" element={<Dashboard />} />
          <Route path="/*" element={<Client />} />
          <Route path="/401" element={<UnauthorizedPage />} />
          <Route path="/403" element={<ForbiddenPage />} />
          <Route path="*" element={<NotFoundPage />} />
          <Route path="/auth" element={<Login />} />
          <Route path="/registration/verify" element={<RegistrationVerify />} />
          <Route path="/registration/confirm" element={<RegistrationConfirm />} />
        </Routes>
      </PageTransition>
    </Router>
  );
}