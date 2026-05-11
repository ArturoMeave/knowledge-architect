import { useState } from 'react';
import { ArrowRight, Lock, Mail, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (isLogin) {
        const formData = new FormData();
        formData.append('username', email);
        formData.append('password', password);

        const response = await fetch('http://127.0.0.1:8000/auth/login', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();
        if (response.ok) {
          localStorage.setItem('token', data.access_token);
          navigate('/dashboard');
        } else {
          alert(data.detail || "Error en el acceso");
        }
      } else {
        const response = await fetch('http://127.0.0.1:8000/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, full_name: name }),
        });

        if (response.ok) {
          setIsLogin(true);
          alert("Registro completado. Ahora inicia sesión.");
        } else {
          const errorData = await response.json();
          alert(errorData.detail || "Error al registrarse");
        }
      }
    } catch (error) {
      alert("No se pudo conectar con el servidor.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white border border-blueprint-grid rounded-lg shadow-xl overflow-hidden">
        <div className="bg-blueprint-blue p-6 text-white">
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-mono text-xs tracking-widest uppercase opacity-80">System Access</h2>
            <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
          </div>
          <h1 className="text-2xl font-bold font-mono">
            {isLogin ? 'INITIALIZE_CONNECTION' : 'CREATE_NEW_ENTITY'}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {!isLogin && (
            <div className="space-y-2">
              <label className="text-xs font-mono text-gray-500 uppercase">Identification [Name]</label>
              <div className="relative">
                <User className="absolute left-3 top-3 text-gray-400" size={18} />
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Arturo Vega"
                  className="w-full pl-10 pr-4 py-2 border border-blueprint-grid rounded focus:border-blueprint-blue outline-none font-mono text-sm"
                  required
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-mono text-gray-500 uppercase">Network Address [Email]</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="analista@dominio.com"
                className="w-full pl-10 pr-4 py-2 border border-blueprint-grid rounded focus:border-blueprint-blue outline-none font-mono text-sm"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-mono text-gray-500 uppercase">Security Key [Password]</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2 border border-blueprint-grid rounded focus:border-blueprint-blue outline-none font-mono text-sm"
                required
              />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-blueprint-blue text-white py-3 rounded font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all uppercase tracking-tighter"
          >
            {isLogin ? 'Execute Login' : 'Register Entity'} <ArrowRight size={18} />
          </button>

          <div className="text-center pt-4 border-t border-blueprint-grid">
            <button 
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-xs font-mono text-blueprint-blue hover:underline"
            >
              {isLogin ? '>_ REQUEST_ACCESS_ID' : '>_ BACK_TO_TERMINAL'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}