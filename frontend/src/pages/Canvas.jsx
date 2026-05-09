import { useState, useMemo } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { Search, ZoomIn, ZoomOut, Maximize, X, FileText, Activity } from 'lucide-react';

export default function Canvas() {
    const [selectedNode, setSelectedNode] = useState(null);

    //datos de prueba
    const graphData = useMemo(() => ({
        nodes: [
      { id: '1', name: 'Strategic Roadmap', type: 'STRATEGY', val: 20 },
      { id: '2', name: 'Global Market Expansion', type: 'ENTITY', val: 15 },
      { id: '3', name: 'Protocol Alpha', type: 'PROTOCOL', val: 12 },
      { id: '4', name: 'Acme Corp', type: 'COMPANY', val: 18 },
      { id: '5', name: 'Q3 Earnings', type: 'EVENT', val: 10 },
    ],
    links: [
      { source: '1', target: '2' },
      { source: '2', target: '4' },
      { source: '1', target: '3' },
      { source: '4', target: '5' },
    ] 
  }), [])

  return (
    <div className="h-screen flex flex-col overflow-hidden relative">
      {/* Barra de Herramientas Superior */}
      <div className="absolute top-6 left-6 right-6 z-10 flex justify-between items-center pointer-events-none">
        <div className="flex gap-2 pointer-events-auto">
          <div className="bg-white border border-blueprint-grid rounded-md flex items-center px-3 py-2 shadow-sm">
            <Search size={16} className="text-gray-400 mr-2" />
            <input type="text" placeholder="Query Graph..." className="bg-transparent outline-none text-xs font-mono w-48" />
          </div>
        </div>
        <div className="flex gap-2 pointer-events-auto bg-white border border-blueprint-grid rounded-md p-1 shadow-sm">
          <button className="p-2 hover:bg-gray-100 rounded text-gray-500"><ZoomIn size={18} /></button>
          <button className="p-2 hover:bg-gray-100 rounded text-gray-500"><ZoomOut size={18} /></button>
          <button className="p-2 hover:bg-gray-100 rounded text-gray-500"><Maximize size={18} /></button>
        </div>
      </div>

      {/* El Lienzo del Grafo */}
      <div className="flex-1 bg-blueprint-bg cursor-grab active:cursor-grabbing">
        <ForceGraph2D
          graphData={graphData}
          nodeLabel="name"
          nodeColor={node => node.type === 'STRATEGY' ? '#0052cc' : '#94a3b8'}
          nodeRelSize={6}
          linkColor={() => '#e5e7eb'}
          linkWidth={1.5}
          onNodeClick={(node) => setSelectedNode(node)}
          // Aquí dibujamos los nodos como cajitas de Stich
          nodeCanvasObject={(node, ctx, globalScale) => {
            const label = node.name;
            const fontSize = 12 / globalScale;
            ctx.font = `${fontSize}px Inter`;
            const textWidth = ctx.measureText(label).width;
            const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.5);

            ctx.fillStyle = 'white';
            ctx.strokeStyle = node.type === 'STRATEGY' ? '#0052cc' : '#e5e7eb';
            ctx.lineWidth = 2 / globalScale;
            ctx.beginPath();
            ctx.roundRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2, ...bckgDimensions, 2 / globalScale);
            ctx.fill();
            ctx.stroke();

            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#1e293b';
            ctx.fillText(label, node.x, node.y);
          }}
        />
      </div>

      {/* Panel de Inspección (Deep Inspection) - Se desliza desde la derecha */}
      {selectedNode && (
        <div className="absolute top-0 right-0 w-96 h-full bg-white border-l border-blueprint-grid shadow-2xl z-20 animate-in slide-in-from-right duration-300">
          <div className="p-6 h-full flex flex-col">
            <div className="flex justify-between items-start mb-8">
              <div>
                <span className="text-[10px] font-mono text-blueprint-blue font-bold uppercase tracking-widest">Node Inspection</span>
                <h2 className="text-xl font-bold text-gray-900">{selectedNode.name}</h2>
              </div>
              <button onClick={() => setSelectedNode(null)} className="p-1 hover:bg-gray-100 rounded text-gray-400">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6 flex-1 overflow-auto">
              <div className="bg-blueprint-bg p-4 rounded-md border border-blueprint-grid">
                <p className="text-[10px] font-mono text-gray-400 uppercase mb-2">Source Evidence</p>
                <p className="text-sm text-gray-600 italic leading-relaxed">
                  "The expansion into APAC markets will necessitate a complete restructuring of our supply chain logistics, focusing on Sector 7..."
                </p>
                <button className="mt-4 flex items-center gap-2 text-blueprint-blue text-xs font-bold hover:underline">
                  <FileText size={14} /> VIEW ORIGINAL PDF (PG. 12)
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 border border-blueprint-grid rounded">
                  <p className="text-[10px] font-mono text-gray-400 uppercase">Entity Type</p>
                  <p className="text-sm font-bold text-gray-800">{selectedNode.type}</p>
                </div>
                <div className="p-3 border border-blueprint-grid rounded">
                  <p className="text-[10px] font-mono text-gray-400 uppercase">Confidence</p>
                  <p className="text-sm font-bold text-green-600">98.4%</p>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-blueprint-grid">
              <button className="w-full bg-gray-900 text-white py-3 rounded font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                <Activity size={16} /> Run Connection Analysis
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  
}