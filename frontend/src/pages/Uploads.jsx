import { useState } from 'react';
import { Upload, X, Check, RefreshCw, FileText, Languages, Gauge, MessageSquare, AlertCircle } from 'lucide-react';

export default function Uploads() {
  // Estados de control de flujo
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [step, setStep] = useState('setup'); // setup | confirming | processing | result
  
  // Estados de configuración (Sincronizados con el Backend Form)
  const [level, setLevel] = useState('2');
  const [tone, setTone] = useState('academic');
  const [language, setLanguage] = useState('es');
  const [specs, setSpecs] = useState('');

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) setFile(selected);
  };

  const executeProcess = async () => {
    setStep('processing');
    setIsUploading(true);

    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('level', level);
    formData.append('tone', tone);
    formData.append('language', language);
    formData.append('specs', specs);

    try {
      const response = await fetch('http://127.0.0.1:8000/ingest/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (response.ok) {
        setStep('result');
      } else {
        alert("Error crítico en la síntesis. Verifica el formato del archivo.");
        setStep('setup');
      }
    } catch (error) {
      alert("Error de conexión con el núcleo de IA.");
      setStep('setup');
    } finally {
      setIsUploading(false);
    }
  };

  const resetProcess = () => {
    setFile(null);
    setStep('setup');
    setSpecs('');
  };

  return (
    <div className="p-8 max-w-5xl mx-auto min-h-[90vh] flex flex-col justify-center">
      
      {/* 1. SECCIÓN DE CONFIGURACIÓN INICIAL */}
      {step === 'setup' && (
        <div className="space-y-10 animate-in fade-in duration-500">
          <header className="text-center space-y-2">
            <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase">Ingestión de Conocimiento</h1>
            <p className="text-gray-400 font-mono text-xs tracking-widest">Ajusta los parámetros de extracción estructural</p>
          </header>

          {/* Selectores de IA */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-[10px] font-mono font-bold text-gray-500 uppercase"><Gauge size={14}/> Nivel de Resumen</label>
              <select value={level} onChange={(e) => setLevel(e.target.value)} className="w-full p-4 border-2 border-blueprint-grid rounded-xl bg-white text-sm font-medium outline-none focus:border-blueprint-blue transition-colors cursor-pointer">
                <option value="1">Nivel 1: Conceptos Clave</option>
                <option value="2">Nivel 2: Análisis Profundo</option>
                <option value="3">Nivel 3: Síntesis de Experto</option>
              </select>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-2 text-[10px] font-mono font-bold text-gray-500 uppercase"><MessageSquare size={14}/> Tono del Análisis</label>
              <select value={tone} onChange={(e) => setTone(e.target.value)} className="w-full p-4 border-2 border-blueprint-grid rounded-xl bg-white text-sm font-medium outline-none focus:border-blueprint-blue transition-colors cursor-pointer">
                <option value="academic">Profesor / Académico</option>
                <option value="friendly">Compañero / Cercano</option>
                <option value="simple">Simplificado (ELI5)</option>
              </select>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-2 text-[10px] font-mono font-bold text-gray-500 uppercase"><Languages size={14}/> Idioma de Salida</label>
              <select value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full p-4 border-2 border-blueprint-grid rounded-xl bg-white text-sm font-medium outline-none focus:border-blueprint-blue transition-colors cursor-pointer">
                <option value="es">Castellano</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>

          {/* Dropzone Principal */}
          <div className="relative">
            <input type="file" id="file-upload" className="hidden" onChange={handleFileChange} accept=".pdf,.xlsx,.csv" />
            <label htmlFor="file-upload" className={`border-2 border-dashed rounded-3xl p-20 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${file ? 'border-blueprint-blue bg-blue-50/50' : 'border-blueprint-grid hover:border-blueprint-blue bg-white'}`}>
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${file ? 'bg-blueprint-blue text-white' : 'bg-gray-100 text-gray-400'}`}>
                <Upload size={28} />
              </div>
              <h2 className="text-xl font-bold text-gray-900">{file ? file.name : 'Selecciona tu fuente de datos'}</h2>
              <p className="text-gray-400 text-xs font-mono mt-2">Soporta PDF, EXCEL y CSV</p>
            </label>
          </div>

          {/* Instrucciones Adicionales */}
          <div className="space-y-3">
            <label className="text-[10px] font-mono font-bold text-gray-500 uppercase">Especificaciones para la IA</label>
            <textarea 
              value={specs}
              onChange={(e) => setSpecs(e.target.value)}
              placeholder="Ej: Ignora la bibliografía y céntrate en las fórmulas químicas..."
              className="w-full p-5 border-2 border-blueprint-grid rounded-2xl bg-gray-50 text-sm outline-none focus:bg-white focus:border-blueprint-blue h-28 transition-all resize-none"
            />
          </div>

          {file && (
            <button onClick={() => setStep('confirming')} className="w-full bg-blueprint-blue text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-100 hover:-translate-y-1 transition-all">
              Inicializar Procesamiento
            </button>
          )}
        </div>
      )}

      {/* 2. PASO DE CONFIRMACIÓN (Modal de Interrupción) */}
      {step === 'confirming' && (
        <div className="max-w-md mx-auto bg-white border-4 border-blueprint-blue p-10 rounded-[40px] shadow-2xl animate-in zoom-in duration-300">
          <div className="flex justify-center mb-6 text-blueprint-blue">
            <AlertCircle size={48} />
          </div>
          <h2 className="text-2xl font-black text-center mb-2">¿REVISAR SPECS?</h2>
          <p className="text-center text-gray-500 text-sm mb-8">Confirma si el enfoque de nivel <span className="font-bold text-gray-900">{level}</span> y tono <span className="font-bold text-gray-900">{tone}</span> es el correcto antes de la extracción.</p>
          
          <div className="flex flex-col gap-3">
            <button onClick={executeProcess} className="w-full bg-blueprint-blue text-white py-4 rounded-xl font-bold text-xs uppercase tracking-widest">SÍ, PROCEDER</button>
            <button onClick={() => setStep('setup')} className="w-full bg-white border-2 border-blueprint-grid py-4 rounded-xl font-bold text-xs uppercase tracking-widest text-gray-400 hover:text-gray-600">NO, CAMBIAR ALGO</button>
          </div>
        </div>
      )}

      {/* 3. ANIMACIÓN DE ESCÁNER DINÁMICO */}
      {step === 'processing' && (
        <div className="flex flex-col items-center justify-center space-y-10 animate-in fade-in">
          <div className="relative w-48 h-48 flex items-center justify-center">
            <div className="absolute inset-0 border-[6px] border-blueprint-blue/10 rounded-full"></div>
            <div className="absolute inset-0 border-[6px] border-t-blueprint-blue rounded-full animate-spin"></div>
            <FileText size={60} className="text-blueprint-blue animate-pulse" />
          </div>
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-mono font-black text-blueprint-blue tracking-tighter">AI_SYNTHESIZING_DATA</h2>
            <p className="text-gray-400 font-mono text-[10px] uppercase">Esto puede tardar unos segundos dependiendo del tamaño</p>
            <div className="w-64 h-2 bg-gray-100 rounded-full mx-auto overflow-hidden">
              <div className="h-full bg-blueprint-blue animate-[loading_3s_infinite]"></div>
            </div>
          </div>
        </div>
      )}

      {/* 4. RESULTADO Y OPCIÓN DE REPETIR */}
      {step === 'result' && (
        <div className="max-w-2xl mx-auto bg-white border border-blueprint-grid p-12 rounded-[40px] text-center space-y-8 animate-in slide-in-from-bottom-8">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <Check size={40} />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-black tracking-tighter">SÍNTESIS COMPLETADA</h2>
            <p className="text-gray-500 font-medium">El mapa mental y el resumen visual ya están disponibles en tu Canvas.</p>
          </div>

          <div className="flex flex-col md:flex-row gap-4 pt-4">
            <button onClick={() => window.location.href='/canvas'} className="flex-[2] bg-gray-900 text-white py-4 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-black transition-colors">
              Explorar en Canvas
            </button>
            <button onClick={resetProcess} className="flex-1 border-2 border-red-100 text-red-500 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-red-50 flex items-center justify-center gap-2 transition-all">
              <RefreshCw size={14} /> Repetir
            </button>
          </div>
        </div>
      )}
    </div>
  );
}