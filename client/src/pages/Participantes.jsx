import { useState, useEffect, useCallback } from 'react';
import { Users, Search, CheckCircle, XCircle, Clock, Eye, Ban, RefreshCw, Crown, AlertTriangle, Timer } from 'lucide-react';
import api, { getUploadUrl } from '../utils/api';

const AUTO_REFRESH_INTERVAL = 15000;

const Participantes = () => {
  const [participantes, setParticipantes] = useState([]);
  const [usuariosComPendencia, setUsuariosComPendencia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchParticipantes = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filtroStatus !== 'todos') params.append('status', filtroStatus);

      const [usersRes, pendenciasRes] = await Promise.all([
        api.get(`/users?${params.toString()}`),
        api.get('/users/usuarios-pendencias')
      ]);
      
      setParticipantes(usersRes.data.users || []);
      setUsuariosComPendencia(pendenciasRes.data.usuarios || []);
    } catch (error) {
      console.error('Erro ao carregar participantes:', error);
    } finally {
      setLoading(false);
    }
  }, [filtroStatus]);

  useEffect(() => {
    fetchParticipantes();
  }, [fetchParticipantes]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchParticipantes();
    }, AUTO_REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [fetchParticipantes]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchParticipantes();
    }, 300);
    return () => clearTimeout(debounce);
  }, [search, fetchParticipantes]);

  const atualizarStatus = async (id, status) => {
    setActionLoading(id);
    try {
      await api.patch(`/users/${id}/status`, { status });
      await fetchParticipantes();
      setSelectedUser(null);
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      alert(error.response?.data?.error || 'Erro ao atualizar status');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ativa': return 'bg-green-100 text-green-700 border border-green-200';
      case 'pendente': return 'bg-amber-100 text-amber-700 border border-amber-200';
      case 'inativa': return 'bg-gray-100 text-gray-600 border border-gray-200';
      case 'bloqueada': return 'bg-red-100 text-red-700 border border-red-200';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'ativa': return <CheckCircle className="text-green-500" size={16} />;
      case 'pendente': return <Clock className="text-amber-500" size={16} />;
      case 'bloqueada': return <Ban className="text-red-500" size={16} />;
      default: return <XCircle className="text-gray-500" size={16} />;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'ativa': return 'Ativa';
      case 'pendente': return 'Pendente';
      case 'inativa': return 'Inativa';
      case 'bloqueada': return 'Bloqueada';
      default: return status;
    }
  };

  const hasPendencia = (userId) => {
    return usuariosComPendencia.some(p => p.user_id === userId && p.pendencias > 0);
  };

  const filteredParticipantes = search
    ? participantes.filter(p => 
        p.nome?.toLowerCase().includes(search.toLowerCase()) ||
        p.email?.toLowerCase().includes(search.toLowerCase())
      )
    : participantes;

  const pendentesCount = participantes.filter(p => p.status === 'pendente').length;
  const comPendenciaCount = usuariosComPendencia.filter(p => p.pendencias > 0).length;

  return (
    <div className="space-y-8">
      <div className="stat-card">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div>
              <h2 className="text-xl font-semibold text-text-primary flex items-center gap-2">
                <Users className="text-rose-500" size={22} />
                Participantes
              </h2>
              <p className="text-text-secondary text-sm mt-1 flex items-center gap-2 flex-wrap">
                Gerencie as participantes do grupo
                {pendentesCount > 0 && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold border border-amber-200">
                    <Clock size={12} />
                    {pendentesCount} pendente{pendentesCount > 1 ? 's' : ''}
                  </span>
                )}
                {comPendenciaCount > 0 && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold border border-red-200">
                    <AlertTriangle size={12} />
                    {comPendenciaCount} com pendência
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <div className="relative flex-1 lg:flex-none">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
              <input 
                type="text" 
                placeholder="Buscar..." 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
                className="input pl-11 w-full lg:w-64" 
              />
            </div>
            <select 
              value={filtroStatus} 
              onChange={(e) => setFiltroStatus(e.target.value)} 
              className="input w-full sm:w-40"
            >
              <option value="todos">Todos ({participantes.length})</option>
              <option value="ativa">Ativas</option>
              <option value="pendente">Pendentes</option>
              <option value="inativa">Inativas</option>
              <option value="bloqueada">Bloqueadas</option>
            </select>
            <button 
              onClick={fetchParticipantes}
              className="p-3 text-text-secondary hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
              title="Atualizar"
            >
              <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </div>

      {comPendenciaCount > 0 && (
        <div className="stat-card bg-red-50 border-2 border-red-200">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="text-red-500" size={28} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-red-700 text-lg flex items-center gap-2">
                <Timer size={18} />
                Usuárias com Pendência Hoje
              </h3>
              <p className="text-red-600 text-sm mt-1 mb-4">
                Estas usuárias não completaram as tarefas dentro do horário (08:00 - 22:00).
              </p>
              <div className="flex flex-wrap gap-2">
                {usuariosComPendencia.filter(p => p.pendencias > 0).map((p) => (
                  <div key={p.user_id} className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 border border-red-200 rounded-xl text-red-700 text-sm font-medium">
                    <AlertTriangle size={14} />
                    <span className="font-semibold">{p.nome}</span>
                    <span className="bg-red-500 text-white px-2 py-0.5 rounded-full text-xs">{p.pendencias} PENDENTE</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-14 w-14 border-4 border-rose-300 border-t-transparent"></div>
        </div>
      ) : filteredParticipantes.length === 0 ? (
        <div className="stat-card text-center py-16">
          <div className="w-20 h-20 bg-cream-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <Users className="text-text-muted" size={40} />
          </div>
          <p className="text-text-secondary text-lg">Nenhuma participante encontrada</p>
        </div>
      ) : (
        <div className="stat-card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-cream-50 border-b border-cream-200">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Participante</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Email</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Status</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Pendência</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Data</th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-100">
                {filteredParticipantes.map((participante) => (
                  <tr key={participante.id} className={`hover:bg-cream-50 transition-all ${participante.status === 'pendente' ? 'bg-amber-50/50' : ''} ${hasPendencia(participante.id) ? 'bg-red-50/30' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        {participante.foto_perfil ? (
                          <img src={getUploadUrl(participante.foto_perfil)} alt={participante.nome} className="w-11 h-11 rounded-xl object-cover shadow-sm border-2 border-cream-200" />
                        ) : (
                          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-rose-200 to-rose-400 flex items-center justify-center text-white font-bold text-sm shadow-sm border-2 border-cream-200">
                            {participante.nome?.charAt(0)?.toUpperCase()}
                          </div>
                        )}
                        <span className="font-semibold text-text-primary">{participante.nome}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-text-secondary">{participante.email}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold capitalize ${getStatusBadge(participante.status)}`}>
                        {getStatusIcon(participante.status)}
                        {getStatusLabel(participante.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {hasPendencia(participante.id) ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 rounded-xl text-xs font-bold border border-red-200">
                          <AlertTriangle size={14} />
                          1 PENDENTE
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-600 rounded-xl text-xs font-medium">
                          <CheckCircle size={14} />
                          OK
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-text-secondary text-sm">{new Date(participante.created_at).toLocaleDateString('pt-BR')}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {participante.status === 'pendente' && (
                          <>
                            <button 
                              onClick={() => atualizarStatus(participante.id, 'ativa')} 
                              disabled={actionLoading === participante.id} 
                              className="p-2.5 text-green-600 hover:bg-green-50 rounded-xl transition-all shadow-sm bg-green-100"
                              title="Aprovar"
                            >
                              <CheckCircle size={18} />
                            </button>
                            <button 
                              onClick={() => atualizarStatus(participante.id, 'bloqueada')} 
                              disabled={actionLoading === participante.id} 
                              className="p-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-all shadow-sm bg-red-100"
                              title="Reprovar"
                            >
                              <XCircle size={18} />
                            </button>
                          </>
                        )}
                        {participante.status === 'ativa' && (
                          <button 
                            onClick={() => atualizarStatus(participante.id, 'inativa')} 
                            disabled={actionLoading === participante.id} 
                            className="p-2.5 text-gray-600 hover:bg-gray-100 rounded-xl transition-all shadow-sm"
                            title="Inativar"
                          >
                            <Ban size={18} />
                          </button>
                        )}
                        <button 
                          onClick={() => setSelectedUser(participante)} 
                          className="p-2.5 text-rose-500 hover:bg-rose-50 rounded-xl transition-all shadow-sm bg-rose-100"
                          title="Ver detalhes"
                        >
                          <Eye size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedUser && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl">
            <div className="text-center mb-6">
              {selectedUser.foto_perfil ? (
                <img src={getUploadUrl(selectedUser.foto_perfil)} alt={selectedUser.nome} className="w-20 h-20 rounded-2xl object-cover mx-auto shadow-lg border-4 border-cream-200" />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-rose-300 to-rose-500 flex items-center justify-center text-white font-bold text-3xl mx-auto shadow-lg border-4 border-cream-200">
                  {selectedUser.nome?.charAt(0)?.toUpperCase()}
                </div>
              )}
              <h3 className="text-xl font-bold text-text-primary mt-4">{selectedUser.nome}</h3>
              <p className="text-text-secondary text-sm mt-1">{selectedUser.email}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm mb-6">
              <div className="p-4 bg-cream-50 rounded-xl">
                <p className="text-text-muted text-xs mb-1">WhatsApp</p>
                <p className="font-semibold text-text-primary">{selectedUser.whatsapp || '-'}</p>
              </div>
              <div className="p-4 bg-cream-50 rounded-xl">
                <p className="text-text-muted text-xs mb-1">Status</p>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold capitalize ${getStatusBadge(selectedUser.status)}`}>
                  {getStatusIcon(selectedUser.status)}
                  {getStatusLabel(selectedUser.status)}
                </span>
              </div>
              <div className="p-4 bg-cream-50 rounded-xl col-span-2">
                <p className="text-text-muted text-xs mb-1">Pendência Hoje</p>
                {hasPendencia(selectedUser.id) ? (
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-100 text-red-700 rounded-xl text-sm font-bold border border-red-200">
                    <AlertTriangle size={16} />
                    1 PENDENTE
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-600 rounded-xl text-sm font-medium">
                    <CheckCircle size={16} />
                    Sem pendência
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-3">
              {selectedUser.status === 'pendente' && (
                <>
                  <button 
                    onClick={() => atualizarStatus(selectedUser.id, 'ativa')} 
                    disabled={actionLoading}
                    className="flex-1 btn-success py-3"
                  >
                    Aprovar
                  </button>
                  <button 
                    onClick={() => atualizarStatus(selectedUser.id, 'bloqueada')} 
                    disabled={actionLoading}
                    className="flex-1 btn-danger py-3"
                  >
                    Reprovar
                  </button>
                </>
              )}
              {selectedUser.status === 'ativa' && (
                <button 
                  onClick={() => atualizarStatus(selectedUser.id, 'inativa')} 
                  disabled={actionLoading}
                  className="flex-1 btn-secondary py-3"
                >
                  Inativar
                </button>
              )}
              <button onClick={() => setSelectedUser(null)} className="flex-1 btn-secondary py-3">Fechar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Participantes;
