/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Buy from './pages/Buy';
import Sell from './pages/Sell';
import AltoPadrao from './pages/AltoPadrao';
import About from './pages/About';
import Contact from './pages/Contact';
import PropertyDetail from './pages/PropertyDetail';
import Favorites from './pages/Favorites';
import CategoryResults from './pages/CategoryResults';
import BrokerDashboard from './pages/BrokerDashboard';
import BrokerProfile from './pages/BrokerProfile';
import PurchaseProposal from './pages/PurchaseProposal';
import { PropertyProvider } from './context/PropertyContext';
import { BrokerProvider } from './context/BrokerContext';
import { CondoProvider } from './context/CondoContext';
import CondoDetail from './pages/CondoDetail';
import Condos from './pages/Condos';
import ErrorBoundary from './components/ErrorBoundary';
import SiteLoader from './components/SiteLoader';

export default function App() {
  return (
    <ErrorBoundary>
      <SiteLoader />
      <PropertyProvider>
        <BrokerProvider>
          <CondoProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Layout />}>
                  <Route index element={<Home />} />
                  <Route path="comprar" element={<Buy />} />
                  <Route path="alugar" element={<Buy />} />
                  <Route path="lancamentos" element={<Buy />} />
                  <Route path="permuta" element={<Buy />} />
                  <Route path="vender" element={<Sell />} />
                  <Route path="condominios" element={<Condos />} />
                  <Route path="condominio/:id" element={<CondoDetail />} />
                  <Route path="exclusivos" element={<Buy />} />
                  <Route path="sobre" element={<About />} />
                  <Route path="contato" element={<Contact />} />
                  <Route path="imovel/:id" element={<PropertyDetail />} />
                  <Route path="categoria/:slug" element={<CategoryResults />} />
                  <Route path="favoritos" element={<Favorites />} />
                  <Route path="corretor/:id" element={<BrokerProfile />} />
                  <Route path="admin" element={<BrokerDashboard />} />
                  <Route path="dashboard-corretor" element={<Navigate to="/admin" replace />} />
                  <Route path="proposta-compra/:id" element={<PurchaseProposal />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </CondoProvider>
        </BrokerProvider>
      </PropertyProvider>
    </ErrorBoundary>
  );
}
