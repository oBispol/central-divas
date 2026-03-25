import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Crown, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, senha);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex bg-cream-100">
      <div className="hidden lg:flex lg:w-1/2 gradient-rose p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-white/10 opacity-30"></div>
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/10 rounded-full"></div>
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white/10 rounded-full"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-xl">
              <Crown className="text-white" size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Central Divas</h1>
              <p className="text-white/70 font-medium">2.0</p>
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
            Potencialize seu<br />
            <span className="text-cream-100">engajamento</span>
          </h2>
          <p className="text-white/80 text-lg max-w-md leading-relaxed">
            A plataforma completa para gerenciar grupos de engajamento do Instagram com tarefas diárias e acompanhamento em tempo real.
          </p>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-4">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-11 h-11 rounded-full bg-cream-200/40 backdrop-blur-sm border-2 border-white/50 flex items-center justify-center text-white font-bold text-sm shadow-lg"
                >
                  {String.fromCharCode(64 + i)}
                </div>
              ))}
            </div>
            <p className="text-white/80 text-sm">
              Junte-se a <span className="font-bold text-white">+500</span> divas engajadas
            </p>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-14 h-14 gradient-rose rounded-2xl flex items-center justify-center shadow-lg">
              <Crown className="text-white" size={26} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-primary">Central Divas</h1>
              <p className="text-sm text-rose-500 font-medium">2.0</p>
            </div>
          </div>

          <div className="card mb-8">
            <div className="w-16 h-16 gradient-rose rounded-2xl flex items-center justify-center mb-6 shadow-lg">
              <Crown className="text-white" size={28} />
            </div>
            <h2 className="text-2xl font-bold text-text-primary mb-2">Bem-vinda de volta!</h2>
            <p className="text-text-secondary">Entre na sua conta para continuar</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
              <AlertCircle className="text-red-500 flex-shrink-0" size={20} />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="input pl-12"
                  required
                />
              </div>
            </div>

            <div>
              <label className="label">Senha</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="Sua senha"
                  className="input pl-12 pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3.5 text-base mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></span>
                  Entrando...
                </span>
              ) : (
                'Entrar'
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-text-secondary">
            Não tem uma conta?{' '}
            <Link to="/cadastro" className="text-rose-500 font-semibold hover:text-rose-600 transition-colors">
              Cadastre-se
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
