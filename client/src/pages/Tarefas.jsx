import { useState, useEffect, useCallback } from 'react';
import { CheckSquare, Plus, Trash2, Edit2, X, ThumbsUp, MessageCircle, UserPlus, Sparkles, AlertCircle } from 'lucide-react';
import api from '../utils/api';

const Tarefas = () => {
  const [tarefas, setTarefas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTarefa, setEditingTarefa] = useState(null);
  const [formData, setFormData] = useState({ tipo: 'curtir', descricao: '', pontos: 1, ativa: true });
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchTarefas = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/tarefas');
      setTarefas(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Erro ao carregar tarefas:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTarefas(); }, [fetchTarefas]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    
    if (!formData.descricao.trim()) {
      setFormError('A descrição é obrigatória');
      return;
    }

    setSaving(true);
    try {
      if (editingTarefa) {
        await api.put(`/tarefas/${editingTarefa.id}`, formData);
      } else {
        await api.post('/tarefas', formData);
      }
      await fetchTarefas();
      setShowModal(false);
      setEditingTarefa(null);
      setFormData({ tipo: 'curtir', descricao: '', pontos: 1, ativa: true });
    } catch (error) {
      setFormError(error.response?.data?.error || 'Erro ao salvar tarefa');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja excluir esta tarefa?')) return;
    try {
      await api.delete(`/tarefas/${id}`);
      await fetchTarefas();
    } catch (error) {
      console.error('Erro ao excluir tarefa:', error);
    }
  };

  const toggleAtiva = async (tarefa) => {
    try {
      await api.put(`/tarefas/${tarefa.id}`, { ativa: !tarefa.ativa });
      await fetchTarefas();
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
    }
  };

  const getTipoIcon = (tipo) => {
    switch (tipo) {
      case 'curtir': return <ThumbsUp className="text-blue-500" size={22} />;
      case 'comentar': return <MessageCircle className="text-green-500" size={22} />;
      case 'seguir': return <UserPlus className="text-purple-500" size={22} />;
      default: return <CheckSquare className="text-gray-500" size={22} />;
    }
  };

  const getTipoColor = (tipo) => {
    switch (tipo) {
      case 'curtir': return 'from-blue-50 to-white border-blue-200';
      case 'comentar': return 'from-green-50 to-white border-green-200';
      case 'seguir': return 'from-purple-50 to-white border-purple-200';
      default: return 'from-gray-50 to-white border-gray-200';
    }
  };

  return (
    <div className="space-y-8">
      <div className="stat-card">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-text-primary flex items-center gap-2">
              <CheckSquare className="text-rose-500" size={22} />
              Tarefas
            </h2>
            <p className="text-text-secondary text-sm mt-1">Configure as tarefas do grupo</p>
          </div>
          <button onClick={() => { setEditingTarefa(null); setFormData({ tipo: 'curtir', descricao: '', pontos: 1, ativa: true }); setFormError(''); setShowModal(true); }} className="btn-primary flex items-center gap-2">
            <Plus size={18} />
            Nova Tarefa
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-14 w-14 border-4 border-rose-300 border-t-transparent"></div>
        </div>
      ) : tarefas.length === 0 ? (
        <div className="stat-card text-center py-16">
          <div className="w-20 h-20 bg-cream-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckSquare className="text-text-muted" size={40} />
          </div>
          <h3 className="text-xl font-semibold text-text-primary">Nenhuma tarefa cadastrada</h3>
          <button onClick={() => setShowModal(true)} className="btn-primary mt-5">Adicionar primeira tarefa</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {tarefas.map((tarefa) => (
            <div key={tarefa.id} className={`stat-card border-2 bg-gradient-to-br ${getTipoColor(tarefa.tipo)} ${!tarefa.ativa ? 'opacity-60' : ''}`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm border border-cream-200">{getTipoIcon(tarefa.tipo)}</div>
                  <div>
                    <p className="font-bold text-text-primary capitalize">{tarefa.tipo}</p>
                    <p className="text-sm text-text-secondary">{tarefa.pontos} ponto(s)</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-xl text-xs font-bold ${tarefa.ativa ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-gray-100 text-gray-500'}`}>
                  {tarefa.ativa ? 'Ativa' : 'Inativa'}
                </span>
              </div>
              <p className="text-text-secondary text-sm mb-5">{tarefa.descricao}</p>
              <div className="flex items-center gap-2 pt-4 border-t border-cream-100">
                <button onClick={() => toggleAtiva(tarefa)} className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${tarefa.ativa ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}>
                  {tarefa.ativa ? 'Desativar' : 'Ativar'}
                </button>
                <button onClick={() => { setEditingTarefa(tarefa); setFormData({ tipo: tarefa.tipo, descricao: tarefa.descricao, pontos: tarefa.pontos, ativa: tarefa.ativa }); setFormError(''); setShowModal(true); }} className="p-2.5 text-text-muted hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all">
                  <Edit2 size={16} />
                </button>
                <button onClick={() => handleDelete(tarefa.id)} className="p-2.5 text-text-muted hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-text-primary flex items-center gap-2">
                <Sparkles className="text-rose-500" size={20} />
                {editingTarefa ? 'Editar Tarefa' : 'Nova Tarefa'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-2 text-text-muted hover:text-text-primary hover:bg-cream-100 rounded-lg transition-all"><X size={20} /></button>
            </div>

            {formError && (
              <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700 text-sm">
                <AlertCircle size={18} />
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="label">Tipo de Tarefa</label>
                <select value={formData.tipo} onChange={(e) => setFormData({ ...formData, tipo: e.target.value })} className="input" required>
                  <option value="curtir">Curtir</option>
                  <option value="comentar">Comentar</option>
                  <option value="seguir">Seguir</option>
                </select>
              </div>
              <div>
                <label className="label">Descrição</label>
                <textarea value={formData.descricao} onChange={(e) => { setFormData({ ...formData, descricao: e.target.value }); setFormError(''); }} placeholder="Descreva a tarefa..." className="input min-h-[80px] resize-none" required />
              </div>
              <div>
                <label className="label">Pontos</label>
                <input type="number" value={formData.pontos} onChange={(e) => setFormData({ ...formData, pontos: parseInt(e.target.value) || 1 })} min="1" className="input" />
              </div>
              <div className="flex items-center gap-3 p-4 bg-cream-50 rounded-xl">
                <input type="checkbox" id="ativa" checked={formData.ativa} onChange={(e) => setFormData({ ...formData, ativa: e.target.checked })} className="w-5 h-5 text-rose-500 rounded" />
                <label htmlFor="ativa" className="text-text-primary font-medium">Tarefa ativa</label>
              </div>
              <div className="flex gap-3 pt-3">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 btn-secondary py-3" disabled={saving}>Cancelar</button>
                <button type="submit" className="flex-1 btn-primary py-3" disabled={saving}>{saving ? 'Salvando...' : (editingTarefa ? 'Salvar' : 'Adicionar')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tarefas;
