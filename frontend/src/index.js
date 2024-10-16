import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import App from './App';
import { AuthProvider } from './context/AutProvider';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter basename='/cal'>
    <AuthProvider>
      <Routes>
        <Route path="/*" element={<App/>}/>
      </Routes>
    </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);