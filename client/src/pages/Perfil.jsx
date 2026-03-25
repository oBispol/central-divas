import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Camera, AlertCircle, CheckCircle } from 'lucide-react';
import api, { getUploadUrl } from '../utils/api';

const Perfil = () => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    nome: user?.nome || '',
    whatsapp: user?.whatsapp || '',
  });
  const [fotoPerfil, setFotoPerfil] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(
    user?.foto_perfil ? getUploadUrl(user.foto_perfil) : null
  );
  const [senhaData, setSenhaData] = useState({
    senhaAtual: '',
    novaSenha: '',
    confirmarSenha: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSenhaChange = (e) => {
    setSenhaData({ ...senhaData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'A imagem deve ter no máximo 5MB' });
        return;
      }
      if (!file.type.startsWith('image/')) {
        setMessage({ type: 'error', text: 'Selecione um arquivo de imagem' });
        return;
      }
      setFotoPerfil(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const removePhoto = () => {
    setFotoPerfil(null);
    setPreviewUrl(user?.foto_perfil ? getUploadUrl(user.foto_perfil) : null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      if (formData.nome) formDataToSend.append('nome', formData.nome);
      if (formData.whatsapp) formDataToSend.append('whatsapp', formData.whatsapp);
      if (fotoPerfil) formDataToSend.append('foto_perfil', fotoPerfil);

      const response = await api.put(`/users/${user.id}`, formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const updatedUser = { ...user, ...response.data };
      updateUser(updatedUser);
      setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' });
      setFotoPerfil(null);
      
      if (response.data.foto_perfil) {
        setPreviewUrl(getUploadUrl(response.data.foto_perfil));
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Erro ao atualizar perfil' });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (senhaData.novaSenha !== senhaData.confirmarSenha) {
      setMessage({ type: 'error', text: 'As senhas não coincidem' });
      return;
    }

    if (senhaData.novaSenha.length < 6) {
      setMessage({ type: 'error', text: 'A nova senha deve ter pelo menos 6 caracteres' });
      return;
    }

    setLoading(true);

    try {
      await api.post('/auth/change-password', {
        senhaAtual: senhaData.senhaAtual,
        novaSenha: senhaData.novaSenha,
      });

      setMessage({ type: 'success', text: 'Senha alterada com sucesso!' });
      setSenhaData({ senhaAtual: '', novaSenha: '', confirmarSenha: '' });
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Erro ao alterar senha' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="card card-hover">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 gradient-rose rounded-xl flex items-center justify-center shadow-md">
            <Camera className="text-white" size={22} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-text-primary">Editar Perfil</h2>
            <p className="text-text-secondary text-sm">Atualize suas informações</p>
          </div>
        </div>

        {message.text && (
          <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            {message.type === 'success' ? <CheckCircle className="text-green-500 flex-shrink-0" size={20} /> : <AlertCircle className="text-red-500 flex-shrink-0" size={20} />}
            <p className={`text-sm ${message.type === 'success' ? 'text-green-700' : 'text-red-700'}`}>{message.text}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center">
            <div className="relative">
              {previewUrl ? (
                <div className="relative">
                  <img src={previewUrl} alt="Perfil" className="w-32 h-32 rounded-full object-cover border-4 border-cream-200 shadow-lg" />
                  <label htmlFor="foto" className="absolute bottom-0 right-0 w-10 h-10 bg-rose-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-rose-600 transition-colors shadow-lg">
                    <Camera className="text-white" size={18} />
                    <input id="foto" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                  </label>
                  <button type="button" onClick={removePhoto} className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-md">
                    <span className="text-xs font-bold">×</span>
                  </button>
                </div>
              ) : (
                <label className="w-32 h-32 rounded-full border-4 border-dashed border-cream-300 flex flex-col items-center justify-center cursor-pointer hover:border-rose-400 hover:bg-rose-50 transition-colors">
                  <Camera className="text-text-muted mb-1" size={28} />
                  <span className="text-xs text-text-muted">Adicionar</span>
                  <input id="foto" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </label>
              )}
            </div>
          </div>

          <div>
            <label className="label">Nome completo</label>
            <input type="text" name="nome" value={formData.nome} onChange={handleChange} className="input" />
          </div>

          <div>
            <label className="label">Email</label>
            <input type="email" value={user?.email || ''} disabled className="input bg-cream-100 cursor-not-allowed" />
            <p className="text-xs text-text-muted mt-1">O email não pode ser alterado</p>
          </div>

          <div>
            <label className="label">WhatsApp</label>
            <input type="tel" name="whatsapp" value={formData.whatsapp} onChange={handleChange} placeholder="(11) 99999-9999" className="input" />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-3">
            {loading ? 'Salvando...' : 'Salvar alterações'}
          </button>
        </form>
      </div>

      <div className="card card-hover">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gold-100 rounded-xl flex items-center justify-center shadow-sm">
            <span className="text-gold-600 text-xl">🔒</span>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-text-primary">Alterar senha</h2>
            <p className="text-text-secondary text-sm">Mantenha sua conta segura</p>
          </div>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="label">Senha atual</label>
            <input type="password" name="senhaAtual" value={senhaData.senhaAtual} onChange={handleSenhaChange} className="input" required />
          </div>
          <div>
            <label className="label">Nova senha</label>
            <input type="password" name="novaSenha" value={senhaData.novaSenha} onChange={handleSenhaChange} className="input" required />
          </div>
          <div>
            <label className="label">Confirmar nova senha</label>
            <input type="password" name="confirmarSenha" value={senhaData.confirmarSenha} onChange={handleSenhaChange} className="input" required />
          </div>
          <button type="submit" disabled={loading} className="btn-secondary w-full py-3">
            {loading ? 'Alterando...' : 'Alterar senha'}
          </button>
        </form>
      </div>

      <div className="card bg-cream-50 border-cream-300">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center">
            <span className="text-rose-500 text-lg">👤</span>
          </div>
          <h3 className="font-semibold text-text-primary">Informações da conta</h3>
        </div>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between items-center py-2 border-b border-cream-200">
            <span className="text-text-secondary">Tipo</span>
            <span className="badge badge-rose">
              {user?.tipo === 'superadmin' ? 'Super Administradora' : user?.tipo === 'admin' ? 'Administradora' : 'Usuária'}
            </span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-cream-200">
            <span className="text-text-secondary">Status</span>
            <span className={`badge ${
              user?.status === 'ativa' ? 'bg-green-100 text-green-700' 
              : user?.status === 'pendente' ? 'bg-amber-100 text-amber-700' 
              : 'bg-red-100 text-red-700'
            }`}>
              {user?.status === 'ativa' ? '● Ativa' : user?.status === 'pendente' ? '● Pendente' : '● Inativa'}
            </span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-text-secondary">Membro desde</span>
            <span className="text-text-primary font-medium">
              {user?.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }) : '-'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Perfil;
