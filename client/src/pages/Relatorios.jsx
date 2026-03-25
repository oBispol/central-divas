import { useState, useEffect, useCallback } from 'react';
import { BarChart3, Trophy, TrendingUp, Users, Calendar, RefreshCw, Medal } from 'lucide-react';
import api, { getUploadUrl } from '../utils/api';
import { formatDateToInput } from '../utils/date';

const AUTO_REFRESH_INTERVAL = 20000;

const Relatorios = () => {
  const [ranking, setRanking] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filtroData, setFiltroData] = useState({
    inicio: formatDateToInput(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)),
    fim: formatDateToInput(),
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [rankingRes, statsRes] = await Promise.all([
        api.get(`/conclusoes/ranking?data_inicio=${filtroData.inicio}&data_fim=${filtroData.fim}`),
        api.get('/users/stats'),
      ]);
      setRanking(Array.isArray(rankingRes.data) ? rankingRes.data : []);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  }, [filtroData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const interval = setInterval(() => {
      console.log('🔄 Auto-refresh de Relatórios');
      fetchData();
    }, AUTO_REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [fetchData]);

  const getMedalEmoji = (position) => {
    switch (position) {
      case 0: return '👑';
      case 1: return '🥈';
      case 2: return '🥉';
      default: return null;
    }
  };

  const getMedalColor = (position) => {
    switch (position) {
      case 0: return 'gradient-gold text-white shadow-lg';
      case 1: return 'bg-gradient-to-br from-gray-300 to-gray-400 text-white';
      case 2: return 'bg-gradient-to-br from-amber-400 to-amber-500 text-white';
      default: return 'bg-cream-100 text-text-secondary';
    }
  };

  const getTipoBadge = (tipo) => {
    if (tipo === 'admin') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
          <Medal size={12} />
          Admin
        </span>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  const totalConclusoes = ranking.reduce((acc, r) => acc + parseInt(r.conclusoes_feitas || 0), 0);
  const mediaConclusoes = ranking.length > 0 ? Math.round(totalConclusoes / ranking.length) : 0;

  return (
    <div className="space-y-6">
      <div className="card card-hover">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 gradient-rose rounded-xl flex items-center justify-center shadow-md">
              <Trophy className="text-white" size={22} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-text-primary">Ranking de Participantes</h2>
              <p className="text-text-secondary text-sm mt-1">
                {ranking.length} participantes • {totalConclusoes} tarefas concluídas no período
              </p>
            </div>
            <button 
              onClick={fetchData}
              className="p-2 text-text-muted hover:text-rose-500 hover:bg-cream-100 rounded-lg transition-colors"
              title="Atualizar"
            >
              <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Calendar className="text-text-muted" size={16} />
              <input 
                type="date" 
                value={filtroData.inicio} 
                onChange={(e) => setFiltroData({ ...filtroData, inicio: e.target.value })} 
                className="input py-2" 
              />
            </div>
            <span className="text-text-muted">até</span>
            <input 
              type="date" 
              value={filtroData.fim} 
              onChange={(e) => setFiltroData({ ...filtroData, fim: e.target.value })} 
              className="input py-2" 
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card bg-gradient-to-br from-rose-400 to-rose-600 border-0 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">Total de Usuárias</p>
              <p className="text-3xl font-bold mt-1">{stats?.total || 0}</p>
            </div>
            <Users size={32} className="text-white/70" />
          </div>
        </div>
        <div className="card bg-gradient-to-br from-green-400 to-green-600 border-0 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">Contas Ativas</p>
              <p className="text-3xl font-bold mt-1">{stats?.ativas || 0}</p>
            </div>
            <TrendingUp size={32} className="text-white/70" />
          </div>
        </div>
        <div className="card bg-gradient-to-br from-purple-400 to-purple-600 border-0 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">Participantes</p>
              <p className="text-3xl font-bold mt-1">{ranking.length}</p>
            </div>
            <BarChart3 size={32} className="text-white/70" />
          </div>
        </div>
        <div className="card bg-gradient-to-br from-gold-400 to-gold-600 border-0 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">Média por Pessoa</p>
              <p className="text-3xl font-bold mt-1">{mediaConclusoes}</p>
            </div>
            <Trophy size={32} className="text-white/70" />
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-text-primary flex items-center gap-2">
            <Trophy className="text-rose-500" size={20} />
            Ranking Completo
          </h3>
          <span className="text-sm text-text-muted">
            Período: {new Date(filtroData.inicio + 'T00:00:00').toLocaleDateString('pt-BR')} a {new Date(filtroData.fim + 'T00:00:00').toLocaleDateString('pt-BR')}
          </span>
        </div>

        {ranking.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-cream-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="text-text-muted" size={36} />
            </div>
            <p className="text-text-secondary">Nenhum dado disponível para o período selecionado</p>
          </div>
        ) : (
          <div className="space-y-3">
            {ranking.map((participante, index) => (
              <div
                key={participante.id}
                className={`flex items-center gap-4 p-4 rounded-xl transition-all hover:shadow-lg hover:scale-[1.01] ${
                  index === 0 
                    ? 'bg-gradient-to-r from-gold-50 to-amber-50 border-2 border-gold-300' 
                    : index === 1 
                    ? 'bg-gradient-to-r from-gray-50 to-cream-50 border-2 border-gray-200'
                    : index === 2 
                    ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300'
                    : 'bg-cream-50 hover:bg-cream-100 border-2 border-transparent'
                }`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${getMedalColor(index)}`}>
                  {getMedalEmoji(index) || (
                    <span className="text-text-muted">{index + 1}</span>
                  )}
                </div>

                <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0 shadow-md border-2 border-white">
                  {participante.foto_perfil ? (
                    <img src={getUploadUrl(participante.foto_perfil)} alt={participante.nome} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-rose-300 to-rose-500 flex items-center justify-center text-white font-bold text-xl">
                      {participante.nome?.charAt(0)?.toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-text-primary text-lg truncate">{participante.nome}</p>
                    {getTipoBadge(participante.tipo)}
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                      participante.status === 'ativa' ? 'bg-green-100 text-green-700'
                      : participante.status === 'pendente' ? 'bg-amber-100 text-amber-700' 
                      : 'bg-cream-200 text-text-secondary'
                    }`}>
                      {participante.status}
                    </span>
                  </div>
                  <p className="text-sm text-text-muted">
                    Membro desde {new Date(participante.created_at).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}
                  </p>
                </div>

                <div className="text-right flex-shrink-0">
                  <div className="flex items-baseline gap-1">
                    <p className={`text-3xl font-bold ${parseInt(participante.conclusoes_feitas) > 0 ? 'text-rose-500' : 'text-text-muted'}`}>
                      {participante.conclusoes_feitas || 0}
                    </p>
                    <span className="text-sm text-text-muted">tarefas</span>
                  </div>
                  <p className="text-xs text-text-muted">
                    {participante.total_conclusoes || 0} interações
                  </p>
                </div>

                {index < 3 && (
                  <Trophy 
                    size={28} 
                    className={`flex-shrink-0 ${
                      index === 0 ? 'text-gold-500 animate-pulse' 
                      : index === 1 ? 'text-gray-400' 
                      : 'text-amber-400'
                    }`} 
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {ranking.length > 10 && (
        <div className="card bg-gradient-to-r from-rose-50 to-gold-50 border-rose-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
              <Users className="text-rose-500" size={24} />
            </div>
            <div>
              <p className="font-semibold text-text-primary">Total de {ranking.length} participantes no ranking</p>
              <p className="text-sm text-text-secondary">
                Continue engajando para subir de posição!
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="text-center text-xs text-text-muted flex items-center justify-center gap-2">
        <RefreshCw size={12} className="animate-spin" />
        <span>Atualização automática a cada {AUTO_REFRESH_INTERVAL / 1000} segundos</span>
      </div>
    </div>
  );
};

export default Relatorios;
