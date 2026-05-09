import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './layouts/Sidebar';
import Landing from './pages/Landing';
import Auth from './pages/Auth'; 
import Dashboard from './pages/Dashboard';
import Uploads from './pages/Uploads';
import Canvas from './pages/Canvas';
import Library from './pages/Library';


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

const Placeholder = ({ name }) => (
  <div className="flex-1 flex items-center justify-center">
    <h2 className="text-2xl font-mono text-gray-300">Sección {name} en construcción...</h2>
  </div>
);

function App() {
  return (
    <Router>
      <LayoutWrapper>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/canvas" element={<Canvas />} />
          <Route path="/uploads" element={<Uploads />} />
          <Route path="/library" element={<Library />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </LayoutWrapper>
    </Router>
  );
}

export default App;