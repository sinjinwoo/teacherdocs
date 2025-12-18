import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import AdminPage from './pages/AdminPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <Header />

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>

        <footer className="bg-white border-t border-slate-200 py-8 mt-auto">
          <div className="max-w-7xl mx-auto px-4 text-center text-slate-400 text-sm flex flex-col gap-2">
            <span>&copy; 2024 AbsentDoc. All rights reserved.</span>
            <Link to="/admin" className="text-slate-300 hover:text-indigo-400 text-xs transition-colors">Admin Access</Link>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
