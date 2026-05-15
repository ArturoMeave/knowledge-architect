import { useState, useEffect } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { FileText, Layers, Download, Trash2, BookOpen, MousePointer2 } from 'lucide-react';

export default function Canvas() {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [selectedNode, setSelectedNode] = useState(null);
  const [viewMode, setViewMode] = useState('mindmap'); 

  useEffect(() => {
    const fetchGraph = async () => {
      const token = localStorage.getItem('token');
      // Llamada al backend para obtener los datos jerárquicos
      const response = await fetch('http://127.0.0.1:8000/graph/data', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        // Mapeamos los datos para que el grafo sepa quién es quién
        setGraphData({
          nodes: data.nodes.map(n => ({ ...n, name: n.label })),
          links: data.edges
        });
        
        // Seleccionamos el nodo central por defecto si existe
        const central = data.nodes.find(n => n.type === 'CENTRAL');
        if (central) setSelectedNode(central);
      }
    };
    fetchGraph();
  }, []);

  return (
    <div className="h-screen flex flex-col bg-slate-50 overflow-hidden font-sans">
      {/* HEADER: Herramientas de control */}
      <header className="h-14 border-b border-blueprint-grid flex items-center justify-between px-6 shrink-0 bg-white z-20 shadow-sm">
        <div className="flex items-center gap-4">
          <h1 className="text-sm font-black font-mono uppercase tracking-widest text-blueprint-blue">Study_Mode_Active</h1>
        </div>
        <div className="flex gap-3">
          <button className="p-2 text-slate-400 hover:text-blueprint-blue transition-colors" title="Exportar PDF"><Download size={18} /></button>
          <button className="p-2 text-red-400 hover:text-red-600 transition-colors" title="Borrar Canvas"><Trash2 size={18} /></button>
        </div>
      </header>

      {/* ÁREA DUAL: Mapa a la izquierda, Contenido a la derecha */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* PANEL IZQUIERDO: El Mapa Mental Jerárquico */}
        <div className="w-3/5 relative border-r border-slate-200 bg-slate-50 shadow-inner">
          <ForceGraph2D
            graphData={graphData}
            width={window.innerWidth * 0.6}
            height={window.innerHeight - 56}
            // CONFIGURACIÓN DE ÁRBOL: Esto evita las "bolas" y crea jerarquía
            dagMode="radialout" // El tema central en medio y las ramas hacia afuera
            dagLevelDistance={120}
            backgroundColor="#f8fafc"
            linkColor={() => '#cbd5e1'}
            linkWidth={2}
            nodeRelSize={7}
            // DIBUJO PERSONALIZADO: Crea los "cuadritos" del mapa mental
            nodeCanvasObject={(node, ctx, globalScale) => {
              const label = node.name;
              const fontSize = node.type === 'CENTRAL' ? 14/globalScale : 11/globalScale;
              ctx.font = `${node.type === 'CENTRAL' ? '700' : '500'} ${fontSize}px Inter`;
              const textWidth = ctx.measureText(label).width;
              const bckgDimensions = [textWidth + 10, fontSize + 10];

              // Sombra y estilo del "botón" de la rama
              ctx.fillStyle = node.id === selectedNode?.id ? '#0052cc' : 'white';
              ctx.shadowColor = 'rgba(0,0,0,0.05)';
              ctx.shadowBlur = 5;
              
              ctx.beginPath();
              ctx.roundRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2, ...bckgDimensions, 5);
              ctx.fill();
              
              if (node.id !== selectedNode?.id) {
                ctx.strokeStyle = '#e2e8f0';
                ctx.lineWidth = 1/globalScale;
                ctx.stroke();
              }

              // Texto del concepto
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillStyle = node.id === selectedNode?.id ? 'white' : '#1e293b';
              ctx.fillText(label, node.x, node.y);
            }}
            onNodeClick={(node) => setSelectedNode(node)}
          />
        </div>

        {/* PANEL DERECHO: El Resumen de la Rama Seleccionada */}
        <div className="w-2/5 flex flex-col bg-white overflow-hidden shadow-2xl">
          {selectedNode ? (
            <div className="flex-1 overflow-auto p-10 space-y-8 animate-in slide-in-from-right-8 duration-500">
              <div className="space-y-2">
                <span className="text-[10px] font-bold font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded uppercase tracking-wider">
                  Rama: {selectedNode.type}
                </span>
                <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-tight">
                  {selectedNode.name}
                </h2>
              </div>

              <div className="prose prose-slate prose-lg">
                <p className="text-slate-600 leading-relaxed italic text-lg">
                  {selectedNode.summary || "La IA está procesando los detalles específicos de este concepto..."}
                </p>
              </div>

              {/* Botón de Fuente Original (Redirige al extracto) */}
              <div className="pt-10">
                <button className="w-full p-6 border-2 border-dashed border-slate-100 rounded-3xl flex flex-col items-center gap-3 group hover:border-blueprint-blue hover:bg-blue-50 transition-all">
                  <BookOpen className="text-slate-300 group-hover:text-blueprint-blue transition-colors" size={24} />
                  <div className="text-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-blueprint-blue">Validar Fuente Original</p>
                    <p className="text-xs text-slate-400">Ver fragmento del PDF subrayado</p>
                  </div>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-20 text-center space-y-4">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                <MousePointer2 size={32} />
              </div>
              <p className="font-mono text-[10px] text-slate-400 uppercase tracking-widest">Selecciona un punto en el mapa para estudiar su contenido</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}