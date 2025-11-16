import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminLogin from './pages/AdminLogin';
import SideBar from './global/SideBar';
import AdminProtectedRoute from './global/AdminProtectedRoute';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AdminLogin />} />
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
