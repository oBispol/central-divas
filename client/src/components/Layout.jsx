import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Crown, LayoutDashboard, Image, CheckSquare, User, Users, BarChart3, Bell, LogOut, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/feed-do-dia': 'Feed do Dia',
  '/minhas-tarefas': 'Minhas Tarefas',
  '/perfil': 'Meu Perfil',
  '/participantes': 'Participantes',
  '/posts': 'Posts do Dia',
  '/tarefas': 'Tarefas',
  '/avisos': 'Avisos',
  '/relatorios': 'Relatórios',
};

const Sidebar = () => {
  const { user, isAdmin, logout } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    const updateDate = () => {
      const today = new Date();
      setCurrentDate(today.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }));
    };
    updateDate();
    const interval = setInterval(updateDate, 60000);
    return () => clearInterval(interval);
  }, []);

  const userMenuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/feed-do-dia', icon: Image, label: 'Feed do Dia' },
    { path: '/minhas-tarefas', icon: CheckSquare, label: 'Minhas Tarefas' },
    { path: '/perfil', icon: User, label: 'Meu Perfil' },
  ];

  const adminMenuItems = [
    { path: '/participantes', icon: Users, label: 'Participantes' },
    { path: '/posts', icon: Image, label: 'Posts do Dia' },
    { path: '/tarefas', icon: CheckSquare, label: 'Tarefas' },
    { path: '/avisos', icon: Bell, label: 'Avisos' },
    { path: '/relatorios', icon: BarChart3, label: 'Relatórios' },
  ];

  const menuItems = isAdmin ? [...userMenuItems, ...adminMenuItems] : userMenuItems;
  const pageTitle = pageTitles[location.pathname] || location.pathname.replace('/', '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return (
    <>
      <button 
        onClick={() => setMobileOpen(!mobileOpen)} 
        className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-white rounded-xl shadow-card border border-cream-200 hover:shadow-md transition-all"
      >
        {mobileOpen ? <X className="text-rose-500" size={24} /> : <Menu className="text-rose-500" size={24} />}
      </button>

      {mobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-all" 
          onClick={() => setMobileOpen(false)} 
        />
      )}

      <aside 
        className={`fixed top-0 left-0 h-full w-72 bg-gradient-to-b from-white to-cream-50 border-r border-cream-200 z-50 transition-all duration-300 shadow-lg lg:shadow-none ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-cream-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-rose-400 to-rose-600 rounded-2xl flex items-center justify-center shadow-md">
                <Crown className="text-white" size={24} />
              </div>
              <div>
                <h1 className="font-bold text-xl text-text-primary">Central Divas</h1>
                <p className="text-sm bg-gradient-to-r from-gold-500 to-gold-600 bg-clip-text text-transparent font-medium">2.0</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => (
              <NavLink 
                key={item.path} 
                to={item.path} 
                onClick={() => setMobileOpen(false)} 
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="p-4 border-t border-cream-100">
            <div className="flex items-center gap-3 mb-4 px-4 py-3 bg-cream-100 rounded-xl">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-rose-300 to-rose-500 flex items-center justify-center text-white font-bold shadow-sm">
                {user?.nome?.charAt(0)?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-text-primary truncate">{user?.nome}</p>
                <p className="text-xs text-text-muted">
                  {user?.tipo === 'superadmin' ? (
                    <span className="bg-gradient-to-r from-gold-500 to-gold-600 bg-clip-text text-transparent font-medium">Super Admin</span>
                  ) : user?.tipo === 'admin' ? (
                    <span className="text-purple-600 font-medium">Admin</span>
                  ) : (
                    'Usuária'
                  )}
                </p>
              </div>
            </div>
            <button 
              onClick={logout} 
              className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-all"
            >
              <LogOut size={20} />
              <span className="font-medium">Sair</span>
            </button>
          </div>
        </div>
      </aside>

      <main className="lg:ml-72 min-h-screen">
        <header className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-cream-100 px-6 lg:px-8 py-4 z-30 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-text-primary">{pageTitle}</h2>
            <span className="hidden sm:block text-sm text-text-muted capitalize">
              {currentDate}
            </span>
          </div>
        </header>

        <div className="p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </>
  );
};

export default Sidebar;
