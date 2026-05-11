import { useState, useEffect } from 'react'; // Paso 1: Importamos herramientas de estado y efectos
import { Activity, Database, Network, TrendingUp, CheckCircle } from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, trend, color }) => (
  <div className="bg-white p-6 border border-blueprint-grid rounded-lg shadow-sm">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-2 rounded-md ${color} bg-opacity-10 text-${color.split('-')[1]}-600`}>
        <Icon size={20} />
      </div>
      <span className="text-[10px] font-mono text-green-500 font-bold">{trend}</span>
    </div>
    <h3 className="text-gray-500 text-xs font-mono uppercase tracking-wider">{label}</h3>
    <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
  </div>
);

const ActivityItem = ({ title, time, type }) => (
  <div className="flex items-center gap-4 py-3 border-b border-blueprint-grid last:border-0">
    <div className={`w-2 h-2 rounded-full ${type === 'success' ? 'bg-green-400' : 'bg-blue-400'}`}></div>
    <div className="flex-1">
      <p className="text-sm font-medium text-gray-800">{title}</p>
      <p className="text-[10px] text-gray-400 font-mono uppercase">{time}</p>
    </div>
    <CheckCircle size={14} className="text-gray-300" />
  </div>
);

export default function Dashboard() {
  // Paso 2: Creamos "cubos" (estados) para guardar los números reales
  const [stats, setStats] = useState({ nodes: 0, edges: 0 });

  // Paso 3: Al entrar a la página, llamamos al backend
  useEffect(() => {
    const fetchStats = async () => {
      const token = localStorage.getItem('token'); // Recuperamos tu carnet de identidad
      try {
        const response = await fetch('http://127.0.0.1:8000/graph/data', {
          headers: {
            'Authorization': `Bearer ${token}` // Le demostramos al portero quiénes somos
          }
        });
        const data = await response.json();
        
        // Paso 4: Contamos los elementos que nos ha devuelto Neo4j
        setStats({
          nodes: data.nodes.length,
          edges: data.edges.length
        });
      } catch (error) {
        console.error("No se pudieron cargar las estadísticas reales:", error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Global Metrics</h1>
        <p className="text-gray-500 font-mono text-sm uppercase tracking-tighter">
          Real-time overview of extracted knowledge structures.
        </p>
      </header>

      {/* Fila de Tarjetas con datos REALES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard 
          icon={Database} 
          label="Total Nodes" 
          value={stats.nodes.toLocaleString()} // Usamos .toLocaleString() para poner los puntos de los miles
          trend="+100%" 
          color="bg-blue-500"
        />
        <StatCard 
          icon={Network} 
          label="Extracted Relationships" 
          value={stats.edges.toLocaleString()} 
          trend="+100%" 
          color="bg-indigo-500"
        />
        <StatCard 
          icon={TrendingUp} 
          label="Avg. Confidence" 
          value="98.2%" // Esto lo dejaremos fijo hasta que el backend calcule promedios
          trend="HIGH" 
          color="bg-emerald-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 border border-blueprint-grid rounded-lg shadow-sm">
          <h2 className="text-sm font-mono uppercase text-gray-400 mb-6 flex items-center gap-2">
            <Activity size={16} /> Knowledge Growth Velocity
          </h2>
          <div className="h-64 w-full bg-blueprint-bg rounded flex items-end justify-between px-4 pb-2 gap-2">
            {[40, 70, 45, 90, 65, 80, 30, 50, 85, 60].map((h, i) => (
              <div key={i} className="bg-blueprint-blue bg-opacity-20 hover:bg-opacity-50 transition-all w-full rounded-t" style={{ height: `${h}%` }}></div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 border border-blueprint-grid rounded-lg shadow-sm">
          <h2 className="text-sm font-mono uppercase text-gray-400 mb-6">System Activity</h2>
          <div className="space-y-1">
            <ActivityItem title="Connection to Neo4j Active" time="Just now" type="success" />
            <ActivityItem title="User session validated" time="Active" type="info" />
          </div>
        </div>
      </div>
    </div>
  );
}