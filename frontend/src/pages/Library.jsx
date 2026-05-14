import { useState, useEffect } from 'react';
import { Search, Filter, FileText, Download, Trash2, Eye, ExternalLink, Database } from 'lucide-react';

export default function Library() {
  const [documents, setDocuments] = useState([]); 
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFiles = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError("SESIÓN_EXPIRADA: Por favor, vuelve a iniciar sesión.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('http://127.0.0.1:8000/ingest/files', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
          if (response.status === 401) throw new Error("401");
          throw new Error(`Servidor respondió con status: ${response.status}`);
        }

        const data = await response.json();

        if (Array.isArray(data)) {
          setDocuments(data);
          if (data.length > 0) setSelectedFile(data[0]);
        } else {
          setDocuments([]);
        }
      } catch (err) {
        console.error("Error cargando librería:", err);
        if (err.message === "401") {
          setError("ACCESO_DENEGADO: Tu sesión ha caducado.");
        } else {
          setError("CONEXIÓN_FALLIDA: No se pudo contactar con el backend.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto h-screen flex flex-col">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Knowledge Library</h1>
          <p className="text-gray-500 font-mono text-sm uppercase tracking-tighter">
            Managed repository of processed source entities.
          </p>
        </div>
        <div className="flex gap-2">
          <div className="bg-white border border-blueprint-grid rounded-md flex items-center px-3 py-2 shadow-sm">
            <Search size={16} className="text-gray-400 mr-2" />
            <input type="text" placeholder="Search resources..." className="bg-transparent outline-none text-xs font-mono w-48" />
          </div>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8 overflow-hidden mb-8">
        {/* LISTA DE ARCHIVOS (Izquierda) */}
        <div className="lg:col-span-2 overflow-auto space-y-4 pr-4 custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center mt-20 text-gray-400 font-mono">
              <p className="animate-pulse">SYNCHRONIZING_RESOURCES...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 p-6 rounded-lg text-red-600 font-mono text-xs">
              <p className="font-bold mb-2">CRITICAL_ERROR:</p>
              <p>{error}</p>
              <button 
                onClick={() => window.location.href = '/auth'}
                className="mt-4 text-red-700 underline font-bold"
              >
                RE-AUTHENTICATE_SYSTEM
              </button>
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center p-20 border-2 border-dashed border-blueprint-grid rounded-xl text-gray-400 font-mono text-xs">
              NO_DOCUMENTS_FOUND_IN_USER_SCOPE
            </div>
          ) : (
            documents.map((file) => (
              <button 
                key={file.id}
                onClick={() => setSelectedFile(file)}
                className={`w-full text-left p-4 rounded-lg border transition-all duration-200 ${
                  selectedFile?.id === file.id 
                    ? 'border-blueprint-blue bg-blue-50 ring-1 ring-blueprint-blue shadow-md' 
                    : 'border-blueprint-grid hover:bg-gray-50 bg-white'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded ${file.status === 'Processed' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    <FileText size={20} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-gray-900">{file.name}</h3>
                    <div className="flex gap-4 mt-1">
                      <span className="text-[10px] font-mono text-gray-400 uppercase">{file.size || 'N/A'}</span>
                      <span className="text-[10px] font-mono text-blue-500 font-bold uppercase">
                        {file.nodes || 0} Nodes Extracted
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>

        {/* PANEL DE DETALLE (Derecha) */}
        <div className="bg-white border border-blueprint-grid rounded-xl shadow-sm overflow-hidden flex flex-col">
          {selectedFile ? (
            <>
              <div className="p-6 border-b border-blueprint-grid bg-blueprint-bg">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-white border border-blueprint-grid rounded flex items-center justify-center text-blueprint-blue shadow-sm">
                    <FileText size={24} />
                  </div>
                  <span className="text-[10px] font-mono bg-green-100 text-green-600 px-2 py-1 rounded font-bold uppercase">
                    {selectedFile.status}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-gray-900 break-words leading-tight">{selectedFile.name}</h2>
              </div>
              
              <div className="p-6 flex-1 space-y-6 overflow-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 border border-blueprint-grid rounded bg-gray-50">
                    <p className="text-[10px] font-mono text-gray-400 uppercase mb-1">Confidence</p>
                    <p className="text-sm font-bold text-gray-900">98.2%</p>
                  </div>
                  <div className="p-3 border border-blueprint-grid rounded bg-gray-50">
                    <p className="text-[10px] font-mono text-gray-400 uppercase mb-1">Process Date</p>
                    <p className="text-sm font-bold text-gray-900">{selectedFile.date || 'Today'}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <button 
                    onClick={() => window.location.href = '/canvas'}
                    className="w-full flex items-center justify-between p-3 border border-blueprint-grid rounded hover:bg-blue-50 hover:border-blueprint-blue transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <Database size={16} className="text-blueprint-blue" />
                      <span className="text-xs font-bold uppercase tracking-tighter">Explore Associated Graph</span>
                    </div>
                    <ExternalLink size={14} className="text-gray-300 group-hover:text-blueprint-blue" />
                  </button>
                </div>
              </div>

              <div className="p-4 bg-gray-50 border-t border-blueprint-grid flex gap-2">
                <button className="flex-1 bg-white border border-blueprint-grid py-2 rounded text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors">
                  <Download size={14} /> Download
                </button>
                <button className="p-2 border border-red-200 text-red-500 rounded hover:bg-red-50 transition-colors">
                  <Trash2 size={18} />
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-300 p-12">
              <Eye size={48} strokeWidth={1} className="mb-4" />
              <p className="font-mono text-[10px] uppercase text-center">Select a resource to inspect metadata</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}