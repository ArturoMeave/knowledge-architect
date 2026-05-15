import { Network, UploadCloud, Library, Settings, LogOut } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx'; 

const SidebarItem = ({ icon: Icon, to, label, active }) => (
  <Link
    to={to}
    className={`flex items-center gap-3 px-4 py-3 rounded-md transition-all ${
      active 
        ? 'bg-blueprint-blue text-white shadow-md' 
        : 'text-gray-500 hover:bg-gray-100'
    }`}
  >
    <Icon className="w-5 h-5" />
    <span className="font-medium">{label}</span>
  </Link>
);

export default function Sidebar() {
  const location = useLocation();
  const { logout } = useAuth(); // Extraemos la función de cierre de sesión

  return (
   <aside className="w-64 border-r border-blueprint-grid h-screen sticky top-0 bg-white/80 backdrop-blur-sm flex flex-col p-4 pt-8">

      {/* Navegación Principal: El corazón de la herramienta */}
      <nav className="flex flex-col gap-2 flex-1">
        {/* Aquí está el acceso al Canvas que faltaba */}
        <SidebarItem 
          icon={Network} 
          label="Knowledge Canvas" 
          to="/canvas" 
          active={location.pathname === '/canvas'} 
        />
        
        <SidebarItem 
          icon={UploadCloud} 
          label="Uploads" 
          to="/uploads" 
          active={location.pathname === '/uploads'} 
        />
        
        <SidebarItem 
          icon={Library} 
          label="Library" 
          to="/library" 
          active={location.pathname === '/library'} 
        />
      </nav>

      {/* Acciones de Cuenta y Configuración */}
      <div className="pt-4 border-t border-blueprint-grid space-y-2">
        <SidebarItem 
          icon={Settings} 
          label="Settings" 
          to="/settings" 
          active={location.pathname === '/settings'} 
        />
        
        <button 
          onClick={logout} 
          className="w-full flex items-center gap-3 px-4 py-3 rounded-md text-red-500 hover:bg-red-50 transition-all font-medium"
        >
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}