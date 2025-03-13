// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginForm from './pages/login/Login';
import Panelempresa from './pages/empresa/Createempresa/panelempresa';
import Homepanel from './pages/home/homepanel/Homepanel';
import PuntoventaPrincipal from './pages/Puntoventa/PuntoventaPrincipal';
import Mediosdepagoprincipal from './pages/Mediosdepago/Mediopagosprincipal';
import StartingAmountForm from './pages/Caja/StartingAmountForm';
import ProtectedRoute from './ProtectedRoute';
export const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route path="/empresa" element={<Panelempresa />} />
        <Route path="/punto" element={<PuntoventaPrincipal />} />
        <Route path="/medios" element={<Mediosdepagoprincipal />} />
        <Route path="/caja" element={<StartingAmountForm />} />

        <Route
          path='/app'
          element={
            <ProtectedRoute>
          <Homepanel/>
          </ProtectedRoute>
          }
          />
      </Routes>
    </Router>
  );
};

export default App;