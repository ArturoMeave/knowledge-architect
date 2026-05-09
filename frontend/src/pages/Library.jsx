import { useState } from 'react';
import { FileText, Search, Download, Eye, ExternalLink, X, Clock, ShieldCheck } from 'lucide-react';

export default function Library() {
    const [selectedFile, setSelectedFile] = useState(null);

    const files = [
        { id: 'LIB-001', name: 'Quarterly_Report_Q1.pdf', size: '2.4 MB', date: '2026-04-15', status: 'Verified' },
        { id: 'LIB-002', name: 'Market_Trends_Analysis.pdf', size: '1.8 MB', date: '2026-05-01', status: 'Verified' },
        { id: 'LIB-003', name: 'Technical_Specs_V4.pdf', size: '4.1 MB', date: '2026-05-07', status: 'Processing' },
    ];

    return (
    <div className="flex h-screen overflow-hidden bg-blueprint-bg">
      {/* SECCIÓN IZQUIERDA: La Tabla */}
      <div className={`flex-1 flex flex-col p-8 transition-all duration-500 ${selectedFile ? 'mr-96' : ''}`}>
        <header className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Document Library</h1>
            <p className="text-gray-500 font-mono text-sm uppercase tracking-tighter">Centralized repository for indexed source material.</p>
          </div>
          <div className="flex gap-2">
            <div className="bg-white border border-blueprint-grid rounded flex items-center px-3 py-2 shadow-sm">
              <Search size={14} className="text-gray-400 mr-2" />
              <input type="text" placeholder="Filter by ID or Name..." className="outline-none text-xs font-mono w-48" />
            </div>
          </div>
        </header>

        <div className="bg-white border border-blueprint-grid rounded-lg shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-blueprint-grid">
              <tr className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">
                <th className="px-6 py-4">Ref. ID</th>
                <th className="px-6 py-4">Document Name</th>
                <th className="px-6 py-4">Added Date</th>
                <th className="px-6 py-4">Capacity</th>
                <th className="px-6 py-4">Security</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blueprint-grid">
              {files.map((file) => (
                <tr 
                  key={file.id} 
                  className={`hover:bg-blue-50/50 transition-colors cursor-pointer ${selectedFile?.id === file.id ? 'bg-blue-50' : ''}`}
                  onClick={() => setSelectedFile(file)}
                >
                  <td className="px-6 py-4 font-mono text-xs text-blue-600">{file.id}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 rounded text-gray-400"><FileText size={16} /></div>
                      <span className="text-sm font-medium text-gray-700">{file.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-500">{file.date}</td>
                  <td className="px-6 py-4 text-xs text-gray-400">{file.size}</td>
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-1 text-[10px] font-bold text-green-500 uppercase">
                      <ShieldCheck size={12} /> {file.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 hover:bg-white rounded border border-transparent hover:border-blueprint-grid transition-all text-gray-400 hover:text-blueprint-blue">
                      <Download size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECCIÓN DERECHA: El Visor de PDF (Deep View) */}
      {selectedFile && (
        <div className="fixed top-0 right-0 w-[500px] h-full bg-white border-l border-blueprint-grid shadow-2xl z-30 animate-in slide-in-from-right duration-300 flex flex-col">
          <div className="p-6 border-b border-blueprint-grid flex justify-between items-center bg-gray-50">
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-gray-400" />
              <span className="text-[10px] font-mono text-gray-400 uppercase">Document Inspector</span>
            </div>
            <button onClick={() => setSelectedFile(null)} className="p-1 hover:bg-gray-200 rounded-full transition-colors">
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 bg-gray-200 flex flex-col items-center justify-center p-8">
            {/* Aquí es donde irá el visor de PDF real más adelante */}
            <div className="w-full h-full bg-white shadow-lg rounded-sm border border-gray-400 p-12 flex flex-col items-center text-center">
              <div className="w-20 h-1 bg-blueprint-blue mb-8"></div>
              <h3 className="text-xl font-serif text-gray-800 mb-4">{selectedFile.name}</h3>
              <div className="space-y-4 w-full">
                <div className="h-4 bg-gray-100 rounded w-full"></div>
                <div className="h-4 bg-gray-100 rounded w-5/6"></div>
                <div className="h-4 bg-gray-100 rounded w-full"></div>
                <div className="h-4 bg-gray-100 rounded w-4/6"></div>
              </div>
              <div className="mt-auto flex items-center gap-2 text-blueprint-blue font-mono text-[10px]">
                <ExternalLink size={12} /> SYSTEM_VIEWER_V1.0
              </div>
            </div>
          </div>

          <div className="p-6 bg-white border-t border-blueprint-grid">
            <button className="w-full bg-blueprint-blue text-white py-3 rounded font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2">
              Open Fullscreen Viewer <Eye size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}