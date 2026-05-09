import {useState} from 'react';
import {Upload, FileText, CheckCircle, AlertCircle, FileType} from 'lucide-react';

export default function Uploads() {
    const [isUploading, setIsUploading] = useState(false);
    const [showSummary, setShowSummary] = useState(false);

    const handleUpload = () => {
        setIsUploading(true);
        setTimeout(()=> {
            setIsUploading(false);
            setShowSummary(true);
        }, 2000);
    };

    return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Knowledge Ingestion</h1>
        <p className="text-gray-500 font-mono text-sm uppercase">Upload source data to begin structural extraction.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* LADO IZQUIERDO: Zona de Carga y Tabla */}
        <div className="space-y-6">
          <div 
            onClick={handleUpload}
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer ${
              isUploading ? 'border-blueprint-blue bg-blue-50' : 'border-blueprint-grid hover:border-blueprint-blue bg-white'
            }`}
          >
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-blueprint-bg rounded-full flex items-center justify-center mb-4">
                <Upload className={isUploading ? 'text-blueprint-blue animate-bounce' : 'text-gray-400'} size={32} />
              </div>
              <h2 className="text-lg font-bold text-gray-900">
                {isUploading ? 'Processing Document...' : 'Upload Source Data'}
              </h2>
              <p className="text-sm text-gray-500 mt-2">Drag and drop PDF, TXT or CSV files here.</p>
            </div>
          </div>

          {/* Mini Repositorio (Tabla estilo Stich) */}
          <div className="bg-white border border-blueprint-grid rounded-lg overflow-hidden">
            <div className="p-4 border-b border-blueprint-grid bg-gray-50">
              <h3 className="text-xs font-mono uppercase font-bold text-gray-500">Recent Documents</h3>
            </div>
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-400 font-mono text-[10px] uppercase">
                <tr>
                  <th className="px-4 py-2">ID</th>
                  <th className="px-4 py-2">Filename</th>
                  <th className="px-4 py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blueprint-grid">
                <tr className="hover:bg-blue-50/30 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-gray-400">DOC-001A9</td>
                  <td className="px-4 py-3 font-medium">Research_Paper_V2.pdf</td>
                  <td className="px-4 py-3"><span className="text-green-500 flex items-center gap-1 font-bold text-[10px]"><CheckCircle size={12}/> INDEXED</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* LADO DERECHO: Resumen Editorial (Solo se ve al subir) */}
        <div className="bg-white border border-blueprint-grid rounded-xl shadow-sm overflow-hidden flex flex-col">
          {!showSummary ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-300 p-12">
              <FileType size={48} strokeWidth={1} className="mb-4" />
              <p className="font-mono text-xs uppercase">Awaiting source ingestion...</p>
            </div>
          ) : (
            <div className="p-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex justify-between items-start mb-8">
                <span className="bg-blue-100 text-blueprint-blue px-2 py-1 rounded text-[10px] font-bold font-mono uppercase tracking-widest">Synthesis Complete</span>
                <span className="text-[10px] font-mono text-gray-400 uppercase">Generated: May 08, 2026</span>
              </div>
              
              <h2 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">Strategic Realignment & Protocol Analysis</h2>
              
              <div className="prose prose-sm text-gray-600 space-y-4">
                <p className="italic border-l-4 border-blueprint-blue pl-4 py-1 bg-blueprint-bg">
                  "The synchronization of distributed bases reveals a 14% discrepancy in quarterly reports, directly affecting semantic integrity."
                </p>
                <p>
                  El análisis inicial revela una divergencia significativa en los protocolos de comunicación. Las redundancias en el almacenamiento superan el 42%, lo que indica una ineficiencia estructural.
                </p>
                <div className="grid grid-cols-2 gap-4 mt-8">
                  <div className="p-4 bg-gray-50 rounded border border-blueprint-grid">
                    <h4 className="text-[10px] font-mono uppercase text-gray-400 mb-2 font-bold">Key Drivers</h4>
                    <ul className="text-xs list-disc pl-4 space-y-1">
                      <li>Material degradation</li>
                      <li>Inconsistent telemetry</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-gray-50 rounded border border-blueprint-grid">
                    <h4 className="text-[10px] font-mono uppercase text-gray-400 mb-2 font-bold">Confidence Score</h4>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                        <div className="bg-green-500 h-full w-[94%]"></div>
                      </div>
                      <span className="text-[10px] font-bold text-green-600">94%</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <button className="w-full mt-10 bg-blueprint-blue text-white py-3 rounded font-bold uppercase text-xs tracking-widest hover:bg-blue-700 transition-all">
                Explorar en el Grafo
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}