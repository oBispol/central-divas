import { useState, useEffect, useCallback, useMemo } from 'react';
import { ExternalLink, CheckCircle, Circle, Calendar, AlertTriangle, Flame, RefreshCw, Sparkles, PartyPopper, Timer } from 'lucide-react';
import api from '../utils/api';
import { formatDateToInput, formatDateToBRFromInput, parseInputDate } from '../utils/date';

const AUTO_REFRESH_INTERVAL = 15000;

const FeedDoDia = () => {
  const [posts, setPosts] = useState([]);
  const [tarefas, setTarefas] = useState([]);
  const [conclusoes, setConclusoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(formatDateToInput());
  const [completingTask, setCompletingTask] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [visitedPosts, setVisitedPosts] = useState(new Set());
  const [cronStatus, setCronStatus] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const [postsRes, tarefasRes, conclusoesRes, statusRes] = await Promise.all([
        api.get(`/posts/feed-do-dia?data=${selectedDate}`),
        api.get('/tarefas?ativa=true'),
        api.get(`/conclusoes/minhas-tarefas?data=${selectedDate}`),
        api.get('/status'),
      ]);

      setPosts(Array.isArray(postsRes.data) ? postsRes.data : []);
      setTarefas(Array.isArray(tarefasRes.data) ? tarefasRes.data : []);
      setConclusoes(Array.isArray(conclusoesRes.data) ? conclusoesRes.data : []);
      setCronStatus(statusRes.data?.cron);
    } catch (error) {
      console.error('Erro ao carregar feed:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    setLoading(true);
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (selectedDate !== formatDateToInput()) return;
    
    const interval = setInterval(() => {
      fetchData();
    }, AUTO_REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [fetchData, selectedDate]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const isTaskCompleted = (postId, tarefaId) => {
    return conclusoes.some(
      (c) => c.post_id === postId && c.tarefa_id === tarefaId && c.status === 'concluida'
    );
  };

  const getPostProgress = (postId) => {
    const totalTarefas = tarefas.length;
    const concluidas = tarefas.filter(t => isTaskCompleted(postId, t.id)).length;
    return { concluidas, total: totalTarefas, percentage: totalTarefas > 0 ? Math.round((concluidas / totalTarefas) * 100) : 0 };
  };

  const getGlobalProgress = () => {
    if (posts.length === 0) return { concluidas: 0, total: 0 };
    
    let totalConcluidas = 0;
    let totalTarefas = 0;
    
    posts.forEach(post => {
      tarefas.forEach(tarefa => {
        totalTarefas++;
        if (isTaskCompleted(post.id, tarefa.id)) totalConcluidas++;
      });
    });
    
    return { 
      concluidas: totalConcluidas, 
      total: totalTarefas,
      percentage: totalTarefas > 0 ? Math.round((totalConcluidas / totalTarefas) * 100) : 0,
      isComplete: totalTarefas > 0 && totalConcluidas === totalTarefas,
      isNearComplete: totalTarefas > 0 && totalConcluidas >= totalTarefas * 0.7
    };
  };

  const handleVisitPost = (postId) => {
    setVisitedPosts(prev => new Set([...prev, postId]));
    window.open(posts.find(p => p.id === postId)?.link, '_blank');
  };

  const handleCompletarTarefa = async (postId, tarefaId, tipo) => {
    if (!visitedPosts.has(postId)) {
      alert('Clique em "Ir para post" primeiro para acessar o post no Instagram!');
      return;
    }
    
    if (isTaskCompleted(postId, tarefaId)) return;
    
    setCompletingTask(`${postId}-${tarefaId}`);
    try {
      await api.post('/conclusoes', {
        post_id: postId,
        tarefa_id: tarefaId,
        tipo: tipo,
      });
      
      const tarefa = tarefas.find(t => t.id === tarefaId);
      setSuccessMessage(`Tarefa "${tarefa?.tipo || tipo}" marcada como concluída! ✨`);
      
      await fetchData();
    } catch (error) {
      alert(error.response?.data?.error || 'Erro ao completar tarefa');
    } finally {
      setCompletingTask(null);
    }
  };

  const progresso = getGlobalProgress();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-14 w-14 border-4 border-rose-300 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {successMessage && (
        <div className="fixed top-6 right-6 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-4 rounded-2xl shadow-lg flex items-center gap-3 z-50 animate-bounce">
          <CheckCircle size={24} />
          <span className="font-medium">{successMessage}</span>
        </div>
      )}

      <div className="stat-card">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-text-primary flex items-center gap-2">
              <Sparkles className="text-rose-500" size={22} />
              Feed do Dia
            </h2>
            <p className="text-text-secondary text-sm mt-1">Interaja com os posts e complete suas tarefas</p>
          </div>
          <div className="flex items-center gap-3 w-full lg:w-auto">
            <div className="relative flex-1 lg:flex-none">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
              <input 
                type="date" 
                lang="pt-BR"
                value={selectedDate} 
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setVisitedPosts(new Set());
                }} 
                className="input pl-11 w-full lg:w-auto"
              />
            </div>
            <button
              onClick={() => { fetchData(); setVisitedPosts(new Set()); }}
              className="p-3 text-text-secondary hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
              title="Atualizar"
            >
              <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </div>

      {selectedDate === formatDateToInput() && cronStatus?.isDiaUtil && (
        <div className={`stat-card ${
          cronStatus.status === 'ativo' 
            ? 'bg-gradient-to-r from-rose-50 to-gold-50 border-2 border-rose-200' 
            : cronStatus.status === 'encerrado'
            ? 'bg-red-50 border-2 border-red-200'
            : 'bg-cream-100 border-2 border-cream-200'
        }`}>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                cronStatus.status === 'ativo' 
                  ? 'bg-rose-100' 
                  : cronStatus.status === 'encerrado'
                  ? 'bg-red-100'
                  : 'bg-cream-200'
              }`}>
                <Timer className={`${
                  cronStatus.status === 'ativo' 
                    ? 'text-rose-500' 
                    : cronStatus.status === 'encerrado'
                    ? 'text-red-500'
                    : 'text-text-muted'
                }`} size={28} />
              </div>
              <div>
                <p className={`font-bold text-lg ${
                  cronStatus.status === 'ativo' 
                    ? 'text-rose-700' 
                    : cronStatus.status === 'encerrado'
                    ? 'text-red-700'
                    : 'text-text-secondary'
                }`}>
                  {cronStatus.status === 'ativo' && '⏰ Horário de Tarefas'}
                  {cronStatus.status === 'encerrado' && '⏱️ Horário Encerrado'}
                  {cronStatus.status === 'nao_iniciado' && '🌙 Aguardando Início'}
                  {cronStatus.status === 'fora_do_horario' && '🌙 Fora do Horário'}
                  {cronStatus.status === 'fim_de_semana' && '🎉 Fim de Semana'}
                </p>
                <p className={`text-sm ${
                  cronStatus.status === 'ativo' 
                    ? 'text-rose-600' 
                    : cronStatus.status === 'encerrado'
                    ? 'text-red-600'
                    : 'text-text-muted'
                }`}>
                  {cronStatus.status === 'ativo' && `Termina às 22:00 • Tempo restante: ${cronStatus.tempoRestanteFormatado}`}
                  {cronStatus.status === 'encerrado' && 'O prazo para completar as tarefas foi encerrado.'}
                  {cronStatus.status === 'nao_iniciado' && 'O horário de tarefas inicia às 08:00.'}
                  {cronStatus.status === 'fim_de_semana' && 'Horário de tarefas: Segunda a Sexta, 08:00 - 22:00.'}
                  {cronStatus.status === 'fora_do_horario' && 'Horário de tarefas: Segunda a Sexta, 08:00 - 22:00.'}
                </p>
              </div>
            </div>
            {cronStatus.status === 'ativo' && (
              <div className="text-right">
                <div className="text-3xl font-bold text-rose-600 font-mono">
                  {cronStatus.tempoRestanteFormatado}
                </div>
                <p className="text-xs text-rose-500">restante</p>
              </div>
            )}
          </div>
        </div>
      )}

      {posts.length > 0 && (
        <div className="stat-card bg-gradient-to-r from-rose-50 to-cream-100 border-rose-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-rose-600 text-sm font-medium flex items-center gap-2">
                <Sparkles size={16} />
                Progresso de Hoje
              </p>
              <p className="text-4xl font-bold text-text-primary mt-2">
                {progresso.concluidas}/{progresso.total} tarefas
              </p>
            </div>
            <div className="w-full sm:w-56">
              <div className="h-5 bg-white rounded-full overflow-hidden shadow-inner border border-cream-200">
                <div 
                  className={`h-full rounded-full transition-all duration-700 ${
                    progresso.isComplete ? 'bg-gradient-to-r from-green-400 to-green-500' 
                    : progresso.percentage >= 70 ? 'gradient-rose' 
                    : 'bg-gradient-to-r from-rose-300 to-rose-400'
                  }`}
                  style={{ width: `${progresso.percentage}%` }}
                />
              </div>
              <p className="text-sm text-text-secondary mt-2 text-right font-medium">{progresso.percentage}% concluído</p>
            </div>
          </div>
        </div>
      )}

      {!progresso.isComplete && progresso.total > 0 && (
        <div className={`stat-card ${progresso.isNearComplete ? 'bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200' : 'bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200'}`}>
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl flex items-center justify-center">
              {progresso.isNearComplete ? (
                <Flame className="text-orange-500" size={28} />
              ) : (
                <AlertTriangle className="text-amber-500" size={28} />
              )}
            </div>
            <div>
              <p className={`font-bold text-xl ${progresso.isNearComplete ? 'text-orange-700' : 'text-amber-700'}`}>
                {progresso.isNearComplete ? '🔥 Falta pouco!' : '⚠️ Tarefas pendentes'}
              </p>
              <p className={`text-sm mt-1 ${progresso.isNearComplete ? 'text-orange-600' : 'text-amber-600'}`}>
                {progresso.isNearComplete 
                  ? 'Você está quase lá! Complete suas tarefas para garantir sua posição.' 
                  : 'Você ainda não completou suas tarefas de hoje. Acesse os posts e interaja!'}
              </p>
            </div>
          </div>
        </div>
      )}

      {progresso.isComplete && posts.length > 0 && (
        <div className="stat-card bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center">
              <PartyPopper className="text-green-500" size={28} />
            </div>
            <div>
              <p className="font-bold text-xl text-green-700">🎉 Parabéns!</p>
              <p className="text-sm mt-1 text-green-600">Você completou todas as tarefas do dia! Continue assim!</p>
            </div>
          </div>
        </div>
      )}

      {posts.length === 0 ? (
        <div className="stat-card text-center py-16">
          <div className="w-20 h-20 bg-cream-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <Calendar className="text-text-muted" size={40} />
          </div>
          <h3 className="text-xl font-semibold text-text-primary">Nenhum post hoje</h3>
          <p className="text-text-secondary mt-2">Não há posts agendados para este dia.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => {
            const postProgress = getPostProgress(post.id);
            const allCompleted = postProgress.concluidas === postProgress.total && postProgress.total > 0;

            return (
              <div key={post.id} className={`stat-card card-hover transition-all ${allCompleted ? 'border-green-200 bg-gradient-to-br from-white to-green-50' : ''}`}>
                <div className="flex flex-col sm:flex-row items-start justify-between gap-5">
                  <div className="flex-1">
                    {post.caption && <p className="text-text-primary leading-relaxed">{post.caption}</p>}
                    <p className="text-sm text-text-muted mt-3">
                      Postado por <span className="font-medium text-text-secondary">{post.criado_por_nome || 'Admin'}</span> em {new Date(post.data_post).toLocaleDateString('pt-BR')}
                    </p>
                    
                    {postProgress.total > 0 && (
                      <div className="flex items-center gap-3 mt-4">
                        {allCompleted ? (
                          <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-xl text-sm font-semibold">
                            <CheckCircle size={16} />
                            ✅ Todas concluídas
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 rounded-xl text-sm font-semibold">
                            <Circle size={16} />
                            ⏳ {postProgress.concluidas}/{postProgress.total} concluídas
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col items-end gap-3">
                    <button 
                      onClick={() => handleVisitPost(post.id)}
                      className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold transition-all shadow-sm ${
                        visitedPosts.has(post.id) 
                          ? 'bg-gradient-to-r from-green-400 to-green-500 text-white hover:from-green-500 hover:to-green-600' 
                          : 'gradient-rose text-white hover:shadow-md'
                      }`}
                    >
                      <ExternalLink size={18} />
                      <span>{visitedPosts.has(post.id) ? 'Post Visitado ✓' : 'Ir para post'}</span>
                    </button>
                    {visitedPosts.has(post.id) && !allCompleted && (
                      <p className="text-sm text-green-600 font-medium flex items-center gap-1">
                        <Sparkles size={14} />
                        Agora você pode marcar!
                      </p>
                    )}
                  </div>
                </div>

                <div className="border-t border-cream-200 pt-5 mt-5">
                  <h4 className="text-sm font-semibold text-text-secondary mb-4">Tarefas:</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {tarefas.map((tarefa) => {
                      const completed = isTaskCompleted(post.id, tarefa.id);
                      const isLoading = completingTask === `${post.id}-${tarefa.id}`;
                      const canClick = visitedPosts.has(post.id) && !completed;

                      return (
                        <button
                          key={tarefa.id}
                          onClick={() => handleCompletarTarefa(post.id, tarefa.id, tarefa.tipo)}
                          disabled={completed || isLoading || !canClick}
                          className={`p-5 rounded-2xl border-2 transition-all ${
                            completed
                              ? 'border-green-200 bg-gradient-to-br from-green-50 to-white cursor-default'
                              : canClick
                                ? 'border-rose-200 bg-gradient-to-br from-rose-50 to-white hover:border-rose-400 hover:shadow-md cursor-pointer'
                                : 'border-cream-200 bg-cream-50 cursor-not-allowed opacity-60'
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            {completed ? (
                              <CheckCircle className="text-green-500 flex-shrink-0" size={28} />
                            ) : isLoading ? (
                              <div className="w-7 h-7 border-3 border-rose-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                            ) : (
                              <Circle className={`flex-shrink-0 ${canClick ? 'text-rose-400' : 'text-cream-300'}`} size={28} />
                            )}
                            <div className="text-left flex-1">
                              <p className={`font-semibold capitalize ${completed ? 'text-green-700' : 'text-text-primary'}`}>
                                {tarefa.tipo}
                              </p>
                              <p className="text-sm mt-1">
                                {completed ? '✨ Concluído!' : canClick ? '+1 ponto' : 'Visitar post primeiro'}
                              </p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FeedDoDia;
