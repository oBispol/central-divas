import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { Crown, CheckCircle2, Clock, TrendingUp, Users, Image, Bell, AlertCircle, ArrowRight, Trophy, RefreshCw, Sparkles, Timer, AlertTriangle } from 'lucide-react';

const AUTO_REFRESH_INTERVAL = 15000;

const StatCard = ({ icon: Icon, label, value, color, iconBg }) => (
  <div className="stat-card card-hover">
    <div className="flex items-center justify-between">
      <div className={`w-14 h-14 rounded-2xl ${iconBg} flex items-center justify-center shadow-sm`}>
        <Icon className="text-white" size={26} />
      </div>
    </div>
    <p className="text-3xl font-bold text-text-primary mt-4">{value}</p>
    <p className="text-text-secondary text-sm mt-1">{label}</p>
  </div>
);

const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState(null);
  const [progresso, setProgresso] = useState(null);
  const [avisos, setAvisos] = useState([]);
  const [pendencias, setPendencia] = useState(null);
  const [cronStatus, setCronStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const promises = [api.get('/conclusoes/progresso'), api.get('/avisos/ativos'), api.get('/status')];
      if (isAdmin) promises.push(api.get('/users/stats'));
      if (!isAdmin) promises.push(api.get('/users/minhas-pendencias'));
      
      const results = await Promise.all(promises);
      setProgresso(results[0].data);
      setAvisos(results[1].data || []);
      setCronStatus(results[2].data?.cron);
      if (isAdmin && results[3]) setStats(results[3].data);
      if (!isAdmin && results[3]) setPendencia(results[3].data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchData();
    }, AUTO_REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-14 w-14 border-4 border-rose-300 border-t-transparent"></div>
      </div>
    );
  }

  const progressoPercent = progresso?.total_tarefas > 0 
    ? Math.round((progresso.tarefas_concluidas / progresso.total_tarefas) * 100) 
    : 0;

  const isHorarioAtivo = cronStatus?.status === 'ativo';

  return (
    <div className="space-y-8">
      <div className="gradient-rose rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-white/10 opacity-30"></div>
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full"></div>
        <div className="absolute -bottom-5 -left-5 w-32 h-32 bg-white/10 rounded-full"></div>
        
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <p className="text-white/80 text-sm font-medium">Olá, seja bem-vinda!</p>
            <h1 className="text-3xl font-bold mt-1">{user?.nome}</h1>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/20 rounded-full text-sm font-medium">
                <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></span>
                {user?.status === 'ativa' ? 'Conta ativa' : 'Aguardando aprovação'}
              </span>
              {isHorarioAtivo && (
                <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/20 rounded-full text-sm font-medium">
                  <Timer size={14} />
                  Termina às 22:00
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
              <Crown className="text-white" size={40} />
            </div>
            <button 
              onClick={fetchData}
              className="p-3 bg-white/20 hover:bg-white/30 rounded-xl transition-all"
              title="Atualizar"
            >
              <RefreshCw size={20} className={`text-white ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {isAdmin && stats && (
          <>
            <StatCard icon={Users} label="Total de Usuárias" value={stats.total || 0} iconBg="bg-gradient-to-br from-blue-400 to-blue-600" />
            <StatCard icon={CheckCircle2} label="Contas Ativas" value={stats.ativas || 0} iconBg="bg-gradient-to-br from-green-400 to-green-600" />
            <StatCard icon={Clock} label="Aguardando" value={stats.pendentes || 0} iconBg="bg-gradient-to-br from-amber-400 to-orange-500" />
            <StatCard icon={Trophy} label="Administradoras" value={stats.admins || 0} iconBg="bg-gradient-to-br from-purple-400 to-purple-600" />
          </>
        )}

        {!isAdmin && (
          <>
            <StatCard icon={CheckCircle2} label="Tarefas Concluídas" value={progresso?.tarefas_concluidas || 0} iconBg="bg-gradient-to-br from-green-400 to-green-600" />
            <StatCard icon={TrendingUp} label="Progresso do Dia" value={`${progressoPercent}%`} iconBg="gradient-rose" />
            <StatCard icon={Image} label="Posts do Dia" value={progresso?.total_tarefas ? Math.ceil(progresso.total_tarefas / 3) : '-'} iconBg="bg-gradient-to-br from-blue-400 to-blue-600" />
            <StatCard icon={Bell} label="Avisos" value={avisos.length} iconBg="bg-gradient-to-br from-amber-400 to-orange-500" />
          </>
        )}
      </div>

      {!isAdmin && pendencias?.hoje?.pendencias > 0 && (
        <div className="stat-card bg-red-50 border-2 border-red-200">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center">
              <AlertTriangle className="text-red-500" size={28} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-red-700 text-lg flex items-center gap-2">
                <AlertCircle size={18} />
                Pendência Registrada
              </h3>
              <p className="text-red-600 mt-1">
                Você não completou as tarefas do dia. Isso conta como <strong>1 pendência</strong>.
              </p>
              <p className="text-red-500 text-sm mt-2">
                Total de pendências: <strong>{pendencias.total_pendencias}</strong>
              </p>
            </div>
          </div>
        </div>
      )}

      {!isAdmin && isHorarioAtivo && progresso?.total_tarefas > 0 && progressoPercent < 100 && (
        <div className="stat-card bg-gold-50 border-2 border-gold-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gold-700 flex items-center gap-2">
              <Timer className="text-gold-500" size={18} />
              Tempo para completar tarefas
            </h3>
            <span className="badge badge-gold">
              {cronStatus?.tempoRestanteFormatado || '--:--'}
            </span>
          </div>
          <p className="text-gold-600 text-sm">
            Faltam <strong>{progresso.total_tarefas - progresso.tarefas_concluidas}</strong> tarefas. 
            Correr para não ficar com pendência!
          </p>
        </div>
      )}

      {!isAdmin && progresso?.total_tarefas > 0 && (
        <div className="stat-card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-text-primary flex items-center gap-2">
              <Sparkles className="text-rose-500" size={18} />
              Progresso de Hoje
            </h3>
            <span className="text-sm text-text-secondary">{progresso.tarefas_concluidas}/{progresso.total_tarefas} tarefas</span>
          </div>
          <div className="h-4 bg-cream-100 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-700 ${
                progressoPercent === 100 
                  ? 'bg-gradient-to-r from-green-400 to-green-500' 
                  : progressoPercent >= 70 
                  ? 'gradient-rose' 
                  : 'bg-gradient-to-r from-rose-300 to-rose-400'
              }`}
              style={{ width: `${progressoPercent}%` }}
            />
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-xs text-text-muted">0%</span>
            <span className="text-xs text-text-muted">100%</span>
          </div>
        </div>
      )}

      {avisos.length > 0 && (
        <div className="stat-card">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-text-primary flex items-center gap-2">
              <Bell className="text-rose-500" size={18} />
              Avisos Importantes
            </h3>
            {isAdmin && <Link to="/avisos" className="text-rose-500 text-sm font-medium hover:underline flex items-center gap-1">Gerenciar <ArrowRight size={14} /></Link>}
          </div>
          <div className="space-y-3">
            {avisos.slice(0, 3).map((aviso) => (
              <div key={aviso.id} className={`p-4 rounded-xl border ${
                aviso.tipo === 'warning' ? 'bg-amber-50 border-amber-200' 
                : aviso.tipo === 'error' ? 'bg-red-50 border-red-200' 
                : aviso.tipo === 'success' ? 'bg-green-50 border-green-200' 
                : 'bg-blue-50 border-blue-200'
              }`}>
                <div className="flex items-start gap-3">
                  <Bell className={`flex-shrink-0 mt-0.5 ${
                    aviso.tipo === 'warning' ? 'text-amber-500' 
                    : aviso.tipo === 'error' ? 'text-red-500' 
                    : aviso.tipo === 'success' ? 'text-green-500' 
                    : 'text-blue-500'
                  }`} size={18} />
                  <div>
                    <p className="font-medium text-text-primary">{aviso.titulo}</p>
                    <p className="text-sm text-text-secondary mt-1">{aviso.mensagem}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!isAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link to="/feed-do-dia" className="stat-card card-hover group">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-text-primary group-hover:text-rose-600 transition-colors">Feed do Dia</h3>
                <p className="text-text-secondary text-sm mt-1">Veja os posts para interagir</p>
              </div>
              <div className="w-14 h-14 bg-rose-100 rounded-2xl flex items-center justify-center group-hover:bg-rose-500 transition-all shadow-sm group-hover:shadow-md">
                <Image className="text-rose-500 group-hover:text-white transition-colors" size={26} />
              </div>
            </div>
          </Link>
          <Link to="/minhas-tarefas" className="stat-card card-hover group">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-text-primary group-hover:text-rose-600 transition-colors">Minhas Tarefas</h3>
                <p className="text-text-secondary text-sm mt-1">Acompanhe seu progresso</p>
              </div>
              <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center group-hover:bg-green-500 transition-all shadow-sm group-hover:shadow-md">
                <CheckCircle2 className="text-green-500 group-hover:text-white transition-colors" size={26} />
              </div>
            </div>
          </Link>
        </div>
      )}

      {user?.status === 'pendente' && (
        <div className="stat-card bg-amber-50 border-amber-200">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center">
              <AlertCircle className="text-amber-500" size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-amber-800">Conta aguardando aprovação</h3>
              <p className="text-amber-700 mt-1">Sua conta foi criada e está aguardando aprovação de uma administradora.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
