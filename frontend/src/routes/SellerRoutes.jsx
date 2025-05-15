import React from 'react';
import { Routes, Route } from 'react-router-dom';
import SellerLayout from '../layouts/SellerLayout';
import MyProducts from '../components/seller/MyProducts';
import StoreSettings from '../pages/seller/StoreSettings';
import Listing from '../pages/seller/Listing';
import Dashboard from '../pages/seller/Dashboard';
import TestPage from '../pages/seller/TestPage';

const SellerRoutes = () => {
  return (
    <SellerLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="listing" element={<Listing />} />
        <Route path="products" element={<MyProducts />} />
        <Route path="store-settings" element={<StoreSettings />} />
        <Route path="test" element={<TestPage />} />
      </Routes>
    </SellerLayout>
  );
};

export default SellerRoutes;
