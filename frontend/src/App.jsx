import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './layouts/Sidebar'; // <-- Importante: layouts, no components
import Landing from './pages/Landing';

// Pantallas temporales
const Placeholder = ({ name }) => (
  <div className="flex-1 flex items-center justify-center">
    <h2 className="text-2xl font-mono text-gray-300">Sección {name} en construcción...</h2>
  </div>
);

function App() {
  const isAuthenticated = true; 

  return (
    <Router>
      <div className="flex min-h-screen">
        {isAuthenticated && <Sidebar />}
        
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/dashboard" element={<Placeholder name="Dashboard" />} />
            <Route path="/canvas" element={<Placeholder name="Knowledge Canvas" />} />
            <Route path="/uploads" element={<Placeholder name="Uploads" />} />
            <Route path="/library" element={<Placeholder name="Library" />} />
            <Route path="/settings" element={<Placeholder name="Settings" />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;