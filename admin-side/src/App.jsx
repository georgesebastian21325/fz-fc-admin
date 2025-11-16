import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminLoginPage from './pages/AdminLoginPage';
import SideBar from './global/SideBar';
import AdminProtectedRoute from './admin-side-components/AdminProtectedRoute';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AdminLoginPage />} />
        <Route path="/admin" element={<SideBar />} />
        <Route
          path="/admin"
          element={
            <AdminProtectedRoute>
              <SideBar />
            </AdminProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
