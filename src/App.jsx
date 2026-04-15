import { useEffect } from 'react';
import { Routes, Route, Link, NavLink, useLocation } from 'react-router-dom';
import { Shield, Waves } from 'lucide-react';
import Landing from './pages/Landing.jsx';
import Dashboard from './pages/Dashboard.jsx';
import { socket } from './lib/socket';

export default function App() {
  const location = useLocation();
  const isLanding = location.pathname === '/';

  useEffect(() => {
    document.body.classList.toggle('landing-bg', isLanding);
    return () => {
      document.body.classList.remove('landing-bg');
    };
  }, [isLanding]);

  // Connect to Socket.IO for real-time updates
  useEffect(() => {
    socket.connect();
    
    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <div className="w-2 h-8 bg-teal-600 rounded-sm"></div>
                <div className="w-2 h-6 bg-teal-500 rounded-sm mt-1"></div>
                <div className="w-2 h-4 bg-teal-400 rounded-sm mt-2"></div>
              </div>
              <span className="text-xl font-bold text-gray-900">FloodGuard</span>
            </Link>

            {/* Navigation */}
            <nav className="flex items-center gap-8">
              <NavLink
                to="/"
                className={({isActive}) => isActive
                  ? 'text-gray-900 font-medium flex items-center gap-2'
                  : 'text-gray-600 hover:text-gray-900 transition-colors font-medium flex items-center gap-2'
                }
              >
                <Shield className="w-4 h-4" />
                Home
              </NavLink>
              <Link
                to="/dashboard"
                className="px-4 py-2 bg-teal-600 text-white rounded-full font-medium hover:bg-teal-700 transition-colors"
              >
                Dashboard
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="*" element={<Landing />} />
        </Routes>
      </main>

      <footer className="bg-secondary border-t border-custom mt-auto">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-concrete rounded flex items-center justify-center">
                <Waves className="text-white" size={14} />
              </div>
              <span className="text-sm font-medium text-primary">FloodGuard</span>
            </div>
            <div className="text-sm text-secondary">
              Early warning system for Gaborone, Botswana
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
