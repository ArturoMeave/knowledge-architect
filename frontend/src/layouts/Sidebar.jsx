import {LayoutDashboard, Network, UploadCloud, Library, Settings} from 'lucide-react';
import {Link, useLocation} from 'react-router-dom';

const SidebarItem = ({icon: Icon, to, active}) => (
    <Link
      to={to}
      className={`flex items-center gap-3 px-4 py-3 rounded-md transition-all ${
      active 
        ? 'bg-blueprint-blue text-white shadow-md' 
        : 'text-gray-500 hover:bg-gray-100'
    }`}
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium">{to.charAt(0).toUpperCase() + to.slice(1)}</span>
    </Link>
  );
  
export default function Sidebar(){
    const location = useLocation();

    return(
        <aside className="w-64 border-r border-blueprint-grid h-screen sticky top-0 bg-white/80 backdrop-blur-sm flex flex-col p-4">
      <div className="mb-10 px-2">
        <h2 className="text-blueprint-blue font-bold text-lg font-mono">KNOWLEDGE ARCHITECT</h2>
        <p className="text-[10px] text-gray-400 font-mono">V1.0.0-STABLE</p>
      </div>

      <nav className="flex flex-col gap-2 flex-1">
        <SidebarItem icon={LayoutDashboard} label="Dashboard" to="/dashboard" active={location.pathname === '/dashboard'} />
        <SidebarItem icon={Network} label="Knowledge Canvas" to="/canvas" active={location.pathname === '/canvas'} />
        <SidebarItem icon={UploadCloud} label="Uploads" to="/uploads" active={location.pathname === '/uploads'} />
        <SidebarItem icon={Library} label="Library" to="/library" active={location.pathname === '/library'} />
      </nav>

      <div className="pt-4 border-t border-blueprint-grid">
        <SidebarItem icon={Settings} label="Settings" to="/settings" active={location.pathname === '/settings'} />
      </div>
    </aside>
    );
}