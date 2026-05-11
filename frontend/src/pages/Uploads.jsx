import { useState } from 'react';
import { Upload, CheckCircle, FileType } from 'lucide-react';

export default function Uploads() {
    const [isUploading, setIsUploading] = useState(false);
    const [showSummary, setShowSummary] = useState(false);

    // FUNCIÓN REAL: Envía el PDF a tu backend de Python
    const handleFileChange = async (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;

        setIsUploading(true);
        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const response = await fetch('http://127.0.0.1:8000/ingest/upload', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            if (response.ok) {
                setShowSummary(true);
            } else {
                alert("Error en el procesamiento del archivo");
            }
        } catch (error) {
            alert("No se pudo conectar con el servidor de Python");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Knowledge Ingestion</h1>
                <p className="text-gray-500 font-mono text-sm uppercase">Upload source data to begin structural extraction.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    {/* INPUT INVISIBLE */}
                    <input 
                        type="file" 
                        id="file-upload" 
                        className="hidden" 
                        onChange={handleFileChange} 
                        accept=".pdf"
                    />
                    
                    {/* El label ahora actúa como el botón de carga */}
                    <label 
                        htmlFor="file-upload"
                        className={`border-2 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer block ${
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
                            <p className="text-sm text-gray-500 mt-2">Click to select a PDF from your computer.</p>
                        </div>
                    </label>

                    {/* Tabla de documentos (por ahora estática) */}
                    <div className="bg-white border border-blueprint-grid rounded-lg overflow-hidden">
                        <div className="p-4 border-b border-blueprint-grid bg-gray-50">
                            <h3 className="text-xs font-mono uppercase font-bold text-gray-500">System Status</h3>
                        </div>
                        <div className="p-4 text-sm text-gray-400 font-mono">
                            READY_FOR_INGESTION
                        </div>
                    </div>
                </div>

                {/* Panel de Resumen IA */}
                <div className="bg-white border border-blueprint-grid rounded-xl shadow-sm overflow-hidden flex flex-col">
                    {!showSummary ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-300 p-12">
                            <FileType size={48} strokeWidth={1} className="mb-4" />
                            <p className="font-mono text-xs uppercase text-center">Awaiting document analysis...</p>
                        </div>
                    ) : (
                        <div className="p-8 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="flex justify-between items-start mb-8">
                                <span className="bg-blue-100 text-blueprint-blue px-2 py-1 rounded text-[10px] font-bold font-mono uppercase tracking-widest">Analysis Success</span>
                            </div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">Knowledge Graph Updated</h2>
                            <p className="text-gray-600 mb-6 italic border-l-4 border-blueprint-blue pl-4">
                                El documento ha sido procesado. Los nodos y relaciones han sido inyectados en tu grafo de Neo4j.
                            </p>
                            <button onClick={() => window.location.href='/canvas'} className="w-full bg-blueprint-blue text-white py-3 rounded font-bold uppercase text-xs tracking-widest">
                                Ver en el Canvas
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}