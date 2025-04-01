import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import QRGenerator from './components/QRGenerator.jsx';
import Dashboard from './components/Dashboard.jsx';

const App = () => {
  return (
    <Router>
      <div className="container">
        <header className="my-4">
          <h1 className="text-center">DCS Dynamic QR Code Generator</h1>
        </header>
        <Routes>
          <Route path="/" element={<QRGenerator />} />
          <Route path="/dashboard/:id" element={<Dashboard />} />
          <Route path="/r/:trackingId" element={<QRGenerator />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;