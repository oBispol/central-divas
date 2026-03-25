import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Crown, Mail, Lock, User, Phone, Eye, EyeOff, AlertCircle, Upload, X } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    whatsapp: '',
    senha: '',
    confirmarSenha: '',
  });
  const [fotoPerfil, setFotoPerfil] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef(null);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('A imagem deve ter no máximo 5MB');
        return;
      }
      setFotoPerfil(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const removePhoto = () => {
    setFotoPerfil(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.senha !== formData.confirmarSenha) {
      setError('As senhas não coincidem');
      return;
    }

    if (formData.senha.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setLoading(true);

    const data = {
      nome: formData.nome,
      email: formData.email,
      whatsapp: formData.whatsapp,
      senha: formData.senha,
    };

    if (fotoPerfil) {
      data.foto_perfil = fotoPerfil;
    }

    const result = await register(data);

    if (result.success) {
      setSuccess(result.message);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
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
            Junte-se à<br />
            <span className="text-cream-100">comunidade</span>
          </h2>
          <p className="text-white/80 text-lg max-w-md leading-relaxed">
            Cadastre-se e faça parte do grupo de engajamento mais ativo do Instagram. Complete tarefas, ganhe visibilidade e cresça juntas!
          </p>
        </div>

        <div className="relative z-10 space-y-5">
          <div className="flex items-center gap-4 text-white/90">
            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shadow">
              <span className="text-sm font-bold">1</span>
            </div>
            <span className="font-medium">Cadastre-se e aguarde aprovação</span>
          </div>
          <div className="flex items-center gap-4 text-white/90">
            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shadow">
              <span className="text-sm font-bold">2</span>
            </div>
            <span className="font-medium">Complete as tarefas diárias</span>
          </div>
          <div className="flex items-center gap-4 text-white/90">
            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shadow">
              <span className="text-sm font-bold">3</span>
            </div>
            <span className="font-medium">Cresça junto com a comunidade</span>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 overflow-y-auto">
        <div className="w-full max-w-md py-8">
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
            <h2 className="text-2xl font-bold text-text-primary mb-2">Criar sua conta</h2>
            <p className="text-text-secondary">Preencha seus dados para se cadastrar</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
              <AlertCircle className="text-red-500 flex-shrink-0" size={20} />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
              <span className="text-green-500 flex-shrink-0">✓</span>
              <p className="text-green-700 text-sm">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex justify-center mb-4">
              <div className="relative">
                {previewUrl ? (
                  <div className="relative">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-24 h-24 rounded-full object-cover border-4 border-cream-200 shadow-lg"
                    />
                    <button
                      type="button"
                      onClick={removePhoto}
                      className="absolute -top-1 -right-1 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-md"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <label className="w-24 h-24 rounded-full border-4 border-dashed border-cream-300 flex flex-col items-center justify-center cursor-pointer hover:border-rose-400 hover:bg-rose-50 transition-colors">
                    <Upload className="text-text-muted mb-1" size={20} />
                    <span className="text-xs text-text-muted">Foto</span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            <div>
              <label className="label">Nome completo</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
                <input
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  placeholder="Seu nome completo"
                  className="input pl-12"
                  required
                />
              </div>
            </div>

            <div>
              <label className="label">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="seu@email.com"
                  className="input pl-12"
                  required
                />
              </div>
            </div>

            <div>
              <label className="label">WhatsApp (opcional)</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
                <input
                  type="tel"
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={handleChange}
                  placeholder="(11) 99999-9999"
                  className="input pl-12"
                />
              </div>
            </div>

            <div>
              <label className="label">Senha</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="senha"
                  value={formData.senha}
                  onChange={handleChange}
                  placeholder="Mínimo 6 caracteres"
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

            <div>
              <label className="label">Confirmar senha</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="confirmarSenha"
                  value={formData.confirmarSenha}
                  onChange={handleChange}
                  placeholder="Repita a senha"
                  className="input pl-12"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3.5 text-base mt-6"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></span>
                  Cadastrando...
                </span>
              ) : (
                'Cadastrar'
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-text-secondary">
            Já tem uma conta?{' '}
            <Link to="/login" className="text-rose-500 font-semibold hover:text-rose-600 transition-colors">
              Entre
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
