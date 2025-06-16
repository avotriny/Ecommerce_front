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