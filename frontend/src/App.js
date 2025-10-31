import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import ExplorePage from './pages/ExplorePage';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/explore/:siteId" element={<ExplorePage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;