import { useState, useEffect } from 'react';
import { Bell, Plus, Trash2, Edit2, X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import api from '../utils/api';

const Avisos = () => {
  const [avisos, setAvisos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAviso, setEditingAviso] = useState(null);
  const [formData, setFormData] = useState({ titulo: '', mensagem: '', tipo: 'info', ativo: true });
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchAvisos(); }, []);

  const fetchAvisos = async () => {
    try {
      setLoading(true);
      const response = await api.get('/avisos');
      setAvisos(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Erro ao carregar avisos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    
    if (!formData.titulo.trim() || !formData.mensagem.trim()) {
      setFormError('Título e mensagem são obrigatórios');
      return;
    }

    setSaving(true);
    try {
      if (editingAviso) {
        await api.put(`/avisos/${editingAviso.id}`, formData);
      } else {
        await api.post('/avisos', formData);
      }
      await fetchAvisos();
      setShowModal(false);
      setEditingAviso(null);
      setFormData({ titulo: '', mensagem: '', tipo: 'info', ativo: true });
    } catch (error) {
      console.error('Erro ao salvar aviso:', error);
      setFormError(error.response?.data?.error || 'Erro ao salvar aviso');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja excluir este aviso?')) return;
    try {
      await api.delete(`/avisos/${id}`);
      await fetchAvisos();
    } catch (error) {
      console.error('Erro ao excluir aviso:', error);
    }
  };

  const toggleAtivo = async (aviso) => {
    try {
      await api.put(`/avisos/${aviso.id}`, { ativo: !aviso.ativo });
      await fetchAvisos();
    } catch (error) {
      console.error('Erro ao atualizar aviso:', error);
    }
  };

  const getTipoConfig = (tipo) => {
    switch (tipo) {
      case 'success': return { icon: CheckCircle, bg: 'bg-green-50 border-green-200', text: 'text-green-700', iconColor: 'text-green-500' };
      case 'warning': return { icon: AlertTriangle, bg: 'bg-yellow-50 border-yellow-200', text: 'text-yellow-700', iconColor: 'text-yellow-500' };
      case 'error': return { icon: AlertCircle, bg: 'bg-red-50 border-red-200', text: 'text-red-700', iconColor: 'text-red-500' };
      default: return { icon: Info, bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700', iconColor: 'text-blue-500' };
    }
  };

  const tipos = [
    { value: 'info', icon: Info, label: 'Info' },
    { value: 'success', icon: CheckCircle, label: 'Sucesso' },
    { value: 'warning', icon: AlertTriangle, label: 'Alerta' },
    { value: 'error', icon: AlertCircle, label: 'Erro' },
  ];

  return (
    <div className="space-y-6">
      <div className="card card-hover">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 gradient-rose rounded-xl flex items-center justify-center shadow-md">
              <Bell className="text-white" size={22} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-text-primary">Avisos</h2>
              <p className="text-text-secondary text-sm">Comunique as participantes</p>
            </div>
          </div>
          <button onClick={() => { setEditingAviso(null); setFormData({ titulo: '', mensagem: '', tipo: 'info', ativo: true }); setFormError(''); setShowModal(true); }} className="btn-primary flex items-center gap-2">
            <Plus size={18} />
            Novo Aviso
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-rose-300 border-t-transparent"></div>
        </div>
      ) : avisos.length === 0 ? (
        <div className="card text-center py-12">
          <div className="w-20 h-20 bg-cream-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bell className="text-text-muted" size={36} />
          </div>
          <p className="text-text-secondary">Nenhum aviso cadastrado</p>
          <button onClick={() => setShowModal(true)} className="btn-primary mt-4">Criar primeiro aviso</button>
        </div>
      ) : (
        <div className="space-y-4">
          {avisos.map((aviso) => {
            const config = getTipoConfig(aviso.tipo);
            const Icon = config.icon;
            return (
              <div key={aviso.id} className={`card border-2 ${config.bg} ${!aviso.ativo ? 'opacity-60' : ''} card-hover`}>
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-white shadow-sm ${config.iconColor}`}>
                    <Icon size={22} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className={`font-semibold text-lg ${config.text}`}>{aviso.titulo}</h3>
                        <p className={`mt-2 text-sm ${config.text} leading-relaxed`}>{aviso.mensagem}</p>
                        <p className="mt-3 text-xs text-text-muted flex items-center gap-2">
                          <span>Por {aviso.criado_por_nome || 'Admin'}</span>
                          <span>•</span>
                          <span>{new Date(aviso.created_at).toLocaleDateString('pt-BR')}</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button onClick={() => toggleAtivo(aviso)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${aviso.ativo ? 'bg-cream-200 text-text-secondary hover:bg-cream-300' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}>
                          {aviso.ativo ? 'Ocultar' : 'Exibir'}
                        </button>
                        <button onClick={() => { setEditingAviso(aviso); setFormData({ titulo: aviso.titulo, mensagem: aviso.mensagem, tipo: aviso.tipo, ativo: aviso.ativo }); setFormError(''); setShowModal(true); }} className="p-2 text-text-muted hover:text-rose-500 hover:bg-cream-100 rounded-lg transition-colors"><Edit2 size={16} /></button>
                        <button onClick={() => handleDelete(aviso.id)} className="p-2 text-text-muted hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${editingAviso ? 'bg-rose-100' : 'bg-gold-100'}`}>
                  <Bell className={editingAviso ? 'text-rose-500' : 'text-gold-600'} size={20} />
                </div>
                <h3 className="text-lg font-semibold text-text-primary">{editingAviso ? 'Editar Aviso' : 'Novo Aviso'}</h3>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 text-text-muted hover:text-text-secondary hover:bg-cream-100 rounded-lg transition-colors"><X size={20} /></button>
            </div>

            {formError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2">
                <AlertCircle size={16} />
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Título</label>
                <input type="text" value={formData.titulo} onChange={(e) => { setFormData({ ...formData, titulo: e.target.value }); setFormError(''); }} placeholder="Título do aviso" className="input" required />
              </div>
              <div>
                <label className="label">Mensagem</label>
                <textarea value={formData.mensagem} onChange={(e) => { setFormData({ ...formData, mensagem: e.target.value }); setFormError(''); }} placeholder="Conteúdo do aviso..." className="input min-h-[100px] resize-none" required />
              </div>
              <div>
                <label className="label">Tipo</label>
                <div className="grid grid-cols-4 gap-2">
                  {tipos.map(({ value, icon: Icon, label }) => (
                    <button key={value} type="button" onClick={() => setFormData({ ...formData, tipo: value })} className={`p-3 rounded-xl border-2 flex flex-col items-center gap-1.5 transition-colors ${formData.tipo === value ? 'border-rose-500 bg-rose-50' : 'border-cream-200 hover:border-cream-300'}`}>
                      <Icon size={18} className={formData.tipo === value ? 'text-rose-500' : 'text-text-muted'} />
                      <span className="text-xs font-medium">{label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="ativo" checked={formData.ativo} onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })} className="w-4 h-4 text-rose-500 rounded" />
                <label htmlFor="ativo" className="text-sm text-text-secondary">Aviso ativo</label>
              </div>
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 btn-secondary py-2.5" disabled={saving}>Cancelar</button>
                <button type="submit" className="flex-1 btn-primary py-2.5" disabled={saving}>{saving ? 'Salvando...' : (editingAviso ? 'Salvar' : 'Publicar')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Avisos;
