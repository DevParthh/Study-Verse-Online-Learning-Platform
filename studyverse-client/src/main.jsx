import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SearchProvider } from './context/SearchContext'; // 1. Import
import router from './router';
import './index.css'; // Make sure your global CSS is imported

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <SearchProvider> {/* 2. Wrap the RouterProvider */}
        <RouterProvider router={router} />
      </SearchProvider>
    </AuthProvider>
  </React.StrictMode>
);