import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './layouts/Sidebar';
import Landing from './pages/Landing';
import Auth from './pages/Auth'; 
import Dashboard from './pages/Dashboard';
import Uploads from './pages/Uploads';
import Canvas from './pages/Canvas';
import Library from './pages/Library';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

function LayoutWrapper({ children }) {
  const location = useLocation();
  const showSidebar = location.pathname !== '/' && location.pathname !== '/auth';

  return (
    <div className="flex min-h-screen">
      {showSidebar && <Sidebar />}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <LayoutWrapper>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            
            {/* Rutas Protegidas */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/canvas" element={<ProtectedRoute><Canvas /></ProtectedRoute>} />
            <Route path="/uploads" element={<ProtectedRoute><Uploads /></ProtectedRoute>} />
            <Route path="/library" element={<ProtectedRoute><Library /></ProtectedRoute>} />
            
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </LayoutWrapper>
      </Router>
    </AuthProvider>
  );
}

export default App;