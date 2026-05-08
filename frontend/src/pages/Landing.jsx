import { ArrowRight, Zap, Database, Share2 } from 'lucide-react'; // <-- Corregido aquí
import { Link } from 'react-router-dom';
import FeatureCard from '../components/FeatureCard';

export default function Landing() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-20">
      {/* Hero Section */}
      <div className="text-center mb-20">
        <h1 className="text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
          Transforma tus documentos en <br />
          <span className="text-blueprint-blue font-mono text-4xl">mapas de conocimiento vivos</span>
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-10">
          Una plataforma estructural diseñada para investigadores y analistas. 
          Extrae la densidad de información y descubre relaciones latentes sin la complejidad visual innecesaria.
        </p>
        <div className="flex gap-4 justify-center">
          <Link to="/auth" className="bg-blueprint-blue text-white px-8 py-3 rounded-md font-semibold flex items-center gap-2 hover:bg-blue-700 transition-all">
            Comenzar Proyecto <ArrowRight size={18} /> {/* <-- Corregido aquí también */}
          </Link>
          <button className="px-8 py-3 rounded-md font-semibold border border-blueprint-grid bg-white text-gray-700 hover:bg-gray-50">
            Leer Manifiesto
          </button>
        </div>
      </div>

      {/* Metodología */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <FeatureCard 
          icon={Database} 
          title="Sube tus PDFs" 
          desc="Ingesta masiva de documentos en un entorno seguro. El sistema normaliza y estructura el texto sin alterar la fuente original."
        />
        <FeatureCard 
          icon={Zap} 
          title="IA que extrae conexiones" 
          desc="Nuestros modelos analizan semánticamente el corpus, identificando entidades, postulados y relaciones cruzadas."
        />
        <FeatureCard 
          icon={Share2} 
          title="Navega visualmente" 
          desc="Interacciona con un grafo topológico de tu conocimiento. Utiliza vistas ortogonales para entender el panorama general."
        />
      </div>
    </div>
  );
}