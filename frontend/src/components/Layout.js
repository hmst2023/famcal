import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

const Layout = () => {
  return (
    <div className='bg-stone-200 min-h-screen'>
      <div className="max-w-6xl mx-auto">
        <Header />
        <main>
            <Outlet />
        </main>
        <Footer />
      </div>
        
    </div>
  );
};

export default Layout;