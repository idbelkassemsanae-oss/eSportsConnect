import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from '../context/RouterContext';
import { 
  FaHome, FaBook, FaTrophy, FaGamepad, FaChartLine, 
  FaFolderOpen, FaMedal, FaEnvelope, FaUser, FaCog,
  FaCrown, FaChevronDown, FaSignOutAlt, FaPlusCircle,
  FaCalendarCheck, FaVideo, FaBookOpen, FaUserGraduate
} from 'react-icons/fa';
import NotificationBell from './NotificationBell';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('login');
  };

  const isActive = (path) => {
    const currentPath = window.location.pathname.replace('/', '');
    return currentPath === path || currentPath.startsWith(path + '/');
  };

  const isCoach = user?.role === 'coach';
  const isPlayer = user?.role === 'player';

  // =================================================
  // LIENS PAR RÔLE
  // =================================================

  const commonLinks = [
    { id: 'home', name: 'Accueil', path: 'home', icon: FaHome },
    { id: 'courses', name: 'Cours', path: 'courses', icon: FaBook },
    { id: 'tournaments', name: 'Tournois', path: 'tournaments', icon: FaTrophy },
    { id: 'leaderboard', name: 'Classement', path: 'leaderboard', icon: FaMedal },
  ];

  const playerLinks = [
    { id: 'dashboard', name: 'Tableau de bord', path: 'dashboard', icon: FaChartLine },
    { id: 'my-tournaments', name: 'Mon parcours', path: 'my-tournaments', icon: FaGamepad },
    { id: 'my-courses', name: 'Mes cours', path: 'my-courses', icon: FaBookOpen },
    { id: 'game-profile', name: 'Profil de jeu', path: 'game-profile', icon: FaUserGraduate },
    { id: 'dashboard-ia', name: 'Statistiques IA', path: 'dashboard-ia', icon: FaChartLine },
  ];

  const coachLinks = [
    { id: 'coach-dashboard', name: 'Tableau de bord coach', path: 'coach-dashboard', icon: FaChartLine },
    { id: 'coach-courses', name: 'Mes cours', path: 'coach-courses', icon: FaVideo },
    { id: 'create-course', name: 'Créer un cours', path: 'create-course', icon: FaPlusCircle },
    { id: 'create-tournament', name: 'Créer un tournoi', path: 'create-tournament', icon: FaCalendarCheck },
    { id: 'dashboard-ia', name: 'Statistiques IA', path: 'dashboard-ia', icon: FaChartLine },
  ];

  let menuItems = [...commonLinks];

  if (isPlayer) {
    menuItems = [...menuItems, ...playerLinks];
  } else if (isCoach) {
    menuItems = [...menuItems, ...coachLinks];
  }

  // Streaming placé en haut de la section "Profil"
  menuItems = [
    ...menuItems,
    { id: 'streaming', name: 'Streaming', path: 'streaming', icon: FaVideo },
    { id: 'resources', name: 'Ressources', path: 'resources', icon: FaFolderOpen },
    { id: 'inbox', name: 'Messages', path: 'inbox', icon: FaEnvelope },
    { id: 'profile', name: 'Profil', path: 'profile', icon: FaUser },
  ];

  // =================================================
  // COMPOSANT NAVLINK
  // =================================================

  const NavLink = ({ to, children, icon: Icon, onClick }) => {
    const active = isActive(to);
    return (
      <button
        onClick={() => {
          if (onClick) onClick();
          navigate(to);
        }}
        className={`group flex w-full items-center gap-4 rounded-xl px-4 py-3 text-[15px] transition-all duration-200 ${
          active
            ? 'bg-gradient-to-r from-violet-700 to-purple-700 text-white shadow-lg shadow-purple-900/20'
            : 'text-slate-400 hover:bg-slate-900 hover:text-white'
        }`}
      >
        <Icon
          size={20}
          className={`${
            active
              ? 'text-white'
              : 'text-slate-400 group-hover:text-violet-400'
          }`}
        />
        <span>{children}</span>
      </button>
    );
  };

  // =================================================
  // RENDU
  // =================================================

  return (
    <>
      {/* ===== DESKTOP SIDEBAR ===== */}
      <aside className="fixed left-0 top-0 z-50 hidden h-screen w-[250px] flex-col border-r border-slate-800 bg-[#050b18] text-white md:flex">

        {/* LOGO */}
        <div className="flex h-[84px] items-center border-b border-slate-800 px-7">
          <div className="mr-3 flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 shadow-lg shadow-purple-900/30">
            <FaGamepad size={21} />
          </div>
          <span className="text-[20px] font-bold tracking-tight">
            eSports<span className="text-violet-400">Connect</span>
          </span>
        </div>

        {/* MENU */}
        <nav className="flex-1 overflow-y-auto px-4 py-5">
          <div className="space-y-1.5">
            {menuItems.map((item) => (
              <NavLink key={item.id} to={item.path} icon={item.icon}>
                {item.name}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* ===== PROFIL EN BAS ===== */}
        <div className="border-t border-slate-800 p-4">
          <button
            onClick={() => navigate('profile')}
            className="flex w-full items-center gap-3 rounded-xl border border-slate-800 bg-[#091121] p-3 transition hover:border-violet-700"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-700 to-slate-900 text-lg">
              🎮
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold">
                {user?.username || 'Invité'}
              </p>
              <p className="text-xs text-slate-500">
                {isCoach ? 'Coach' : isPlayer ? 'Joueur' : 'Visiteur'}
              </p>
            </div>
            <FaChevronDown size={18} className="text-slate-500" />
          </button>

          {/* ===== DÉCONNEXION ===== */}
          <button
            onClick={handleLogout}
            className="mt-3 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-400 transition hover:bg-red-500/10"
          >
            <FaSignOutAlt size={18} />
            <span>Déconnexion</span>
          </button>
        </div>

      </aside>

      {/* ===== MOBILE NAVBAR ===== */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between border-b border-slate-800 bg-[#050b18] px-4 md:hidden">
        <button onClick={() => navigate('home')} className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 shadow-lg shadow-purple-900/30">
            <FaGamepad size={18} />
          </div>
          <span className="text-[16px] font-bold tracking-tight">
            eSports<span className="text-violet-400">Connect</span>
          </span>
        </button>

        <div className="flex items-center gap-3">
          {user && <NotificationBell />}
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="p-2 text-slate-400 hover:text-white"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </nav>

      {/* ===== MOBILE MENU ===== */}
      {isMobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="fixed bottom-0 left-0 right-0 z-50 max-h-[80vh] overflow-y-auto rounded-t-3xl bg-[#050b18] p-4 md:hidden">
            <div className="space-y-1.5">
              {menuItems.map((item) => (
                <NavLink
                  key={item.id}
                  to={item.path}
                  icon={item.icon}
                  onClick={() => setIsMobileOpen(false)}
                >
                  {item.name}
                </NavLink>
              ))}
              <button
                onClick={() => {
                  handleLogout();
                  setIsMobileOpen(false);
                }}
                className="flex w-full items-center gap-4 rounded-xl px-4 py-3 text-[15px] text-red-400 transition-all duration-200 hover:bg-red-500/10"
              >
                <FaSignOutAlt size={20} />
                <span>Déconnexion</span>
              </button>
            </div>

            <div className="mt-4 border-t border-slate-800 pt-4">
              <div className="flex items-center gap-3 rounded-xl bg-[#091121] p-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-700 to-slate-900 text-lg">
                  🎮
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-semibold">{user?.username || 'Invité'}</p>
                  <p className="text-xs text-slate-500">
                    {isCoach ? 'Coach' : isPlayer ? 'Joueur' : 'Visiteur'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Navbar;