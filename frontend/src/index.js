import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import App from './App';
import { AuthProvider } from './context/AutProvider';
import {FamProvider} from './context/FamProvider';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter basename='/calender'>
    <AuthProvider>
      <FamProvider>
      <Routes>
        <Route path="/*" element={<App/>}/>
      </Routes>
      </FamProvider>
    </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);