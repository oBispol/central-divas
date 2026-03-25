import { useState, useEffect, useCallback } from 'react';
import { CheckCircle, Clock, XCircle, Calendar, TrendingUp, RefreshCw, Sparkles } from 'lucide-react';
import api from '../utils/api';

const AUTO_REFRESH_INTERVAL = 15000;

const MinhasTarefas = () => {
  const [conclusoes, setConclusoes] = useState([]);
  const [estatisticas, setEstatisticas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('todas');

  const fetchData = useCallback(async () => {
    try {
      const [conclusoesRes, estatisticasRes] = await Promise.all([
        api.get('/conclusoes'),
        api.get('/conclusoes/estatisticas'),
      ]);

      setConclusoes(Array.isArray(conclusoesRes.data) ? conclusoesRes.data : []);
      setEstatisticas(estatisticasRes.data);
    } catch (error) {
      console.error('Erro ao carregar tarefas:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchData();
    }, AUTO_REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [fetchData]);

  const filteredConclusoes = conclusoes.filter((c) => {
    if (filtro === 'todas') return true;
    return c.status === filtro;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'concluida': return <CheckCircle className="text-green-500" size={22} />;
      case 'rejeitada': return <XCircle className="text-red-500" size={22} />;
      default: return <Clock className="text-amber-500" size={22} />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'concluida': return 'bg-green-100 text-green-700 border border-green-200';
      case 'rejeitada': return 'bg-red-100 text-red-700 border border-red-200';
      default: return 'bg-amber-100 text-amber-700 border border-amber-200';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'concluida': return 'Concluída';
      case 'rejeitada': return 'Rejeitada';
      default: return 'Pendente';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-14 w-14 border-4 border-rose-300 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-semibold">✅ Concluídas</p>
              <p className="text-4xl font-bold text-text-primary mt-2">{estatisticas?.concluidas || 0}</p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center shadow-sm">
              <CheckCircle className="text-green-500" size={28} />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-600 text-sm font-semibold">⏳ Pendentes</p>
              <p className="text-4xl font-bold text-text-primary mt-2">{estatisticas?.pendentes || 0}</p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl flex items-center justify-center shadow-sm">
              <Clock className="text-amber-500" size={28} />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-600 text-sm font-semibold">❌ Rejeitadas</p>
              <p className="text-4xl font-bold text-text-primary mt-2">{estatisticas?.rejeitadas || 0}</p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-red-100 to-pink-100 rounded-2xl flex items-center justify-center shadow-sm">
              <XCircle className="text-red-500" size={28} />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-rose-600 text-sm font-semibold">📊 Total</p>
              <p className="text-4xl font-bold text-text-primary mt-2">{estatisticas?.total || 0}</p>
            </div>
            <div className="w-14 h-14 gradient-rose rounded-2xl flex items-center justify-center shadow-sm">
              <TrendingUp className="text-white" size={28} />
            </div>
          </div>
        </div>
      </div>

      <div className="stat-card">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-xl font-semibold text-text-primary flex items-center gap-2">
                <Sparkles className="text-rose-500" size={20} />
                Histórico de Tarefas
              </h2>
              <p className="text-text-secondary text-sm mt-1">Todas as suas tarefas</p>
            </div>
            <button 
              onClick={fetchData}
              className="p-2 text-text-secondary hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
              title="Atualizar"
            >
              <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {['todas', 'concluida', 'pendente', 'rejeitada'].map((status) => (
              <button
                key={status}
                onClick={() => setFiltro(status)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  filtro === status 
                    ? 'gradient-rose text-white shadow-sm' 
                    : 'bg-cream-100 text-text-secondary hover:bg-rose-50 hover:text-rose-600'
                }`}
              >
                {status === 'todas' ? 'Todas' : getStatusLabel(status)}
              </button>
            ))}
          </div>
        </div>

        {filteredConclusoes.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-cream-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <Calendar className="text-text-muted" size={40} />
            </div>
            <p className="text-text-secondary text-lg">Nenhuma tarefa encontrada</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredConclusoes.map((conclusao) => (
              <div 
                key={conclusao.id} 
                className="flex items-center gap-4 p-5 bg-cream-50 rounded-2xl hover:bg-cream-100 transition-all border border-cream-100"
              >
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm border border-cream-200">
                  {getStatusIcon(conclusao.status)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-text-primary capitalize">{conclusao.tarefa_tipo || conclusao.tipo}</p>
                  <p className="text-sm text-text-secondary truncate mt-1">{conclusao.tarefa_descricao || 'Tarefa'}</p>
                  {conclusao.post_link && (
                    <a 
                      href={conclusao.post_link} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-sm text-rose-500 hover:underline font-medium"
                    >
                      Ver post ↗
                    </a>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  <span className={`inline-block px-4 py-2 rounded-xl text-sm font-semibold capitalize ${getStatusBadge(conclusao.status)}`}>
                    {getStatusLabel(conclusao.status)}
                  </span>
                  <p className="text-xs text-text-muted mt-2">
                    {new Date(conclusao.data_conclusao).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MinhasTarefas;
