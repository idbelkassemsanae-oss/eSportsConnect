// src/pages/PlayerDashboard.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from '../context/RouterContext';
import { useAuth } from '../context/AuthContext';
import {
  Trophy,
  BookOpen,
  Users,
  MessageSquare,
  BarChart3,
  Brain,
  Gamepad2,
  Bell,
  ChevronRight,
  Calendar,
  Target,
  TrendingUp,
  Flame,
  User,
  FileText,
} from 'lucide-react';
import API from '../services/api';

// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================
const PlayerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // ============================================================
  // ÉTATS
  // ============================================================
  const [stats, setStats] = useState(null);
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ============================================================
  // CHARGEMENT DES DONNÉES RÉELLES (API)
  // ============================================================
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, tournRes] = await Promise.all([
          API.get('/ai/stats/').catch(() => ({ data: null })),
          API.get('/tournaments/my-tournaments/').catch(() => ({ data: [] })),
        ]);
        setStats(statsRes.data);
        setTournaments(tournRes.data || []);
        setLoading(false);
      } catch (err) {
        console.error('Erreur chargement dashboard:', err);
        setError('Impossible de charger vos données.');
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ============================================================
  // EXTRACTION DES DONNÉES
  // ============================================================
  const totalMatches = stats?.total_matches || 0;
  const wins = stats?.wins || 0;
  const winRate = stats?.win_rate || 0;
  const points = stats?.points || 0;
  const level = stats?.level || 'Débutant';
  const xp = stats?.xp || 0;
  const nextLevelXp = stats?.next_level_xp || 1000;

  const skillStats = stats?.stats || {
    agilite: 0,
    endurance: 0,
    precision: 0,
    strategie: 0,
    travail_equipe: 0,
  };

  const xpPercentage = Math.min((xp / nextLevelXp) * 100, 100);

  // ============================================================
  // CHARGEMENT / ERREUR
  // ============================================================
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020617]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-violet-400 mt-4">Chargement...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020617] text-red-400">
        <div className="text-center">
          <p className="text-xl font-bold">❌ {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-violet-500 px-4 py-2 rounded-xl text-white hover:bg-violet-400 transition"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  // ============================================================
  // RENDU
  // ============================================================
  return (
    <div className="min-h-screen bg-[#020617] text-white">
      {/* ==========================================
          STRUCTURE IDENTIQUE À LA PAGE RESSOURCES
          - ml-0 md:ml-[250px] pour la sidebar
          - max-w-[1450px] mx-auto pour la largeur
          - px-5 md:px-8 pour les marges latérales
          - pt-16 pour compenser la navbar fixe (réduit)
      ========================================== */}
      <main className="ml-0 md:ml-[250px] min-h-screen">
        <div className="max-w-[1450px] mx-auto px-5 md:px-8 py-6 pt-16">

          {/* ======================================
              HEADER
          ====================================== */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-8">
            <div>
              <p className="text-sm text-violet-400 font-medium mb-1">
                Tableau de bord joueur
              </p>
              <h1 className="text-2xl sm:text-3xl font-bold">
                Bonjour, <span className="text-white">{user?.username || 'Joueur'}</span> 👋
              </h1>
              <p className="text-slate-500 mt-2">
                Voici un aperçu de ta progression eSport.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('inbox')}
                className="relative p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/5 transition"
              >
                <Bell size={19} className="text-slate-400" />
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-violet-500" />
              </button>
              <button
                onClick={() => navigate('profile')}
                className="px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 transition text-sm font-medium flex items-center gap-2"
              >
                <User size={17} />
                Mon profil
              </button>
            </div>
          </div>

          {/* ======================================
              STATISTIQUES PRINCIPALES
          ====================================== */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="p-5 rounded-2xl bg-[#08111f] border border-white/5">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
                  <Gamepad2 size={20} className="text-violet-400" />
                </div>
                <span className="text-xs text-emerald-400 flex items-center gap-1">
                  <TrendingUp size={13} />
                  +{totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0}%
                </span>
              </div>
              <p className="text-2xl font-bold mt-4">{totalMatches}</p>
              <p className="text-sm text-slate-500 mt-1">Matchs joués</p>
            </div>

            <div className="p-5 rounded-2xl bg-[#08111f] border border-white/5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <Trophy size={20} className="text-emerald-400" />
              </div>
              <p className="text-2xl font-bold mt-4">{wins}</p>
              <p className="text-sm text-slate-500 mt-1">Victoires</p>
            </div>

            <div className="p-5 rounded-2xl bg-[#08111f] border border-white/5">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                  <Target size={20} className="text-cyan-400" />
                </div>
                <span className="text-xs text-emerald-400">
                  {winRate >= 70 ? 'Excellent' : winRate >= 50 ? 'Bon' : 'À améliorer'}
                </span>
              </div>
              <p className="text-2xl font-bold mt-4">{winRate}%</p>
              <p className="text-sm text-slate-500 mt-1">Taux de victoire</p>
            </div>

            <div className="p-5 rounded-2xl bg-[#08111f] border border-white/5">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                <Flame size={20} className="text-orange-400" />
              </div>
              <p className="text-2xl font-bold mt-4">{tournaments.length}</p>
              <p className="text-sm text-slate-500 mt-1">Tournois participés</p>
            </div>
          </div>

          {/* ======================================
              GRILLE PRINCIPALE
          ====================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* ====================================
                COLONNE PRINCIPALE (2/3)
            ==================================== */}
            <div className="lg:col-span-2 space-y-6">
              {/* Compétences */}
              <section className="bg-[#08111f] border border-white/5 rounded-2xl p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <BarChart3 className="text-cyan-400" size={20} />
                  Mes compétences
                </h3>
                <div className="space-y-3">
                  {Object.entries(skillStats).map(([name, value], index) => {
                    const labels = {
                      agilite: 'Agilité',
                      endurance: 'Endurance',
                      precision: 'Précision',
                      strategie: 'Stratégie',
                      travail_equipe: "Travail d'équipe",
                    };
                    const colors = [
                      'from-cyan-400 to-cyan-600',
                      'from-blue-400 to-blue-600',
                      'from-purple-400 to-purple-600',
                      'from-pink-400 to-pink-600',
                      'from-orange-400 to-orange-600',
                    ];
                    return (
                      <div key={name}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-300">{labels[name] || name}</span>
                          <span className="font-bold text-white">{Math.round(value)}%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full bg-gradient-to-r ${colors[index % colors.length]} rounded-full transition-all duration-1000`}
                            style={{ width: `${Math.min(value, 100)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Prochains tournois */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-bold">Prochains tournois</h2>
                    <p className="text-xs text-slate-500 mt-1">Tes prochaines compétitions</p>
                  </div>
                  <button
                    onClick={() => navigate('my-tournaments')}
                    className="text-sm text-violet-400 hover:text-violet-300 flex items-center gap-1"
                  >
                    Mes tournois
                    <ChevronRight size={15} />
                  </button>
                </div>
                {tournaments.length === 0 ? (
                  <div className="bg-[#08111f] border border-white/5 rounded-2xl p-8 text-center text-slate-400">
                    <p>Aucun tournoi récent.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {tournaments.slice(0, 4).map((t) => (
                      <button
                        key={t.id}
                        onClick={() => navigate(`tournaments/${t.id}`)}
                        className="w-full flex items-center gap-4 p-4 rounded-xl bg-[#08111f] border border-white/5 hover:border-violet-500/20 hover:bg-[#0a1424] transition text-left"
                      >
                        <div className="w-11 h-11 shrink-0 rounded-xl bg-violet-500/10 flex items-center justify-center">
                          <Trophy size={20} className="text-violet-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm truncate">{t.name}</h3>
                          <p className="text-xs text-slate-500 mt-1">{t.game || 'eSport'}</p>
                        </div>
                        <div className="hidden sm:flex flex-col items-end">
                          <span className="text-sm font-medium">
                            {t.start_date ? new Date(t.start_date).toLocaleDateString() : 'À venir'}
                          </span>
                          <span className="text-xs text-slate-500 mt-1">
                            Rang: {t.my_rank ? `#${t.my_rank}` : 'N/A'}
                          </span>
                        </div>
                        <span
                          className={`
                            hidden md:block px-2.5 py-1 rounded-full text-[10px]
                            ${
                              t.status === 'completed'
                                ? 'bg-gray-500/10 text-gray-400'
                                : t.status === 'ongoing'
                                ? 'bg-emerald-500/10 text-emerald-400'
                                : 'bg-violet-500/10 text-violet-400'
                            }
                          `}
                        >
                          {t.status === 'completed' ? 'Terminé' : t.status === 'ongoing' ? 'En cours' : 'À venir'}
                        </span>
                        <ChevronRight size={17} className="text-slate-600" />
                      </button>
                    ))}
                  </div>
                )}
              </section>
            </div>

            {/* ====================================
                COLONNE DROITE (1/3)
            ==================================== */}
            <div className="space-y-6">
              {/* Profil / XP */}
              <section className="p-6 rounded-2xl bg-[#08111f] border border-white/5">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-900 flex items-center justify-center">
                      <User size={28} />
                    </div>
                    <span className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-md bg-violet-600 text-[10px] font-bold">
                      LVL {level}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold">{user?.username || 'Joueur'}</h3>
                    <p className="text-xs text-slate-500 mt-1">Joueur</p>
                    <div className="flex items-center gap-1 mt-2 text-yellow-400 text-xs">
                      <Trophy size={13} />
                      {points} pts
                    </div>
                  </div>
                </div>

                <div className="mt-7">
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-slate-400">Progression niveau</span>
                    <span className="text-violet-400 font-medium">
                      {xp.toLocaleString()} / {nextLevelXp.toLocaleString()} XP
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-violet-600 via-purple-500 to-cyan-400"
                      style={{ width: `${xpPercentage}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-600 mt-2">
                    Plus que {(nextLevelXp - xp).toLocaleString()} XP avant le niveau suivant.
                  </p>
                </div>

                <button
                  onClick={() => navigate('profile')}
                  className="mt-5 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-800 hover:border-violet-500/30 hover:bg-violet-500/5 transition text-sm"
                >
                  Voir mon profil
                  <ChevronRight size={15} />
                </button>
              </section>

              {/* Accès rapides */}
              <section>
                <h2 className="font-bold mb-4">Accès rapides</h2>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => navigate('resources')}
                    className="p-4 rounded-xl bg-[#08111f] border border-white/5 hover:border-violet-500/20 transition group text-left"
                  >
                    <FileText size={20} className="text-cyan-400 mb-3" />
                    <p className="text-sm font-medium">Ressources</p>
                    <p className="text-[10px] text-slate-600 mt-1">Guides & contenus</p>
                  </button>
                  <button
                    onClick={() => navigate('inbox')}
                    className="p-4 rounded-xl bg-[#08111f] border border-white/5 hover:border-violet-500/20 transition group text-left"
                  >
                    <MessageSquare size={20} className="text-violet-400 mb-3" />
                    <p className="text-sm font-medium">Messages</p>
                    <p className="text-[10px] text-slate-600 mt-1">Contacter un coach</p>
                  </button>
                  <button
                    onClick={() => navigate('leaderboard')}
                    className="p-4 rounded-xl bg-[#08111f] border border-white/5 hover:border-violet-500/20 transition group text-left"
                  >
                    <BarChart3 size={20} className="text-emerald-400 mb-3" />
                    <p className="text-sm font-medium">Classement</p>
                    <p className="text-[10px] text-slate-600 mt-1">Voir ton rang</p>
                  </button>
                  <button
                    onClick={() => navigate('dashboard-ia')}
                    className="p-4 rounded-xl bg-[#08111f] border border-white/5 hover:border-violet-500/20 transition group text-left"
                  >
                    <Brain size={20} className="text-purple-400 mb-3" />
                    <p className="text-sm font-medium">IA</p>
                    <p className="text-[10px] text-slate-600 mt-1">Analyse & conseils</p>
                  </button>
                </div>
              </section>

              {/* Bloc IA */}
              <button
                onClick={() => navigate('dashboard-ia')}
                className="w-full text-left relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-violet-900/40 via-[#08111f] to-cyan-950/20 border border-violet-500/10 hover:border-violet-500/30 transition group"
              >
                <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-violet-600/10 blur-2xl" />
                <div className="relative">
                  <div className="flex items-center justify-between">
                    <div className="w-11 h-11 rounded-xl bg-violet-500/20 flex items-center justify-center">
                      <Brain size={22} className="text-violet-400" />
                    </div>
                    <ChevronRight size={18} className="text-slate-600 group-hover:text-violet-400 transition" />
                  </div>
                  <h3 className="font-bold mt-5">Ton analyse IA</h3>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    Ton niveau progresse. Consulte ton analyse et découvre les points à améliorer.
                  </p>
                  <div className="flex items-center gap-3 mt-5">
                    <div className="text-2xl font-bold text-violet-400">
                      {winRate}
                      <span className="text-xs text-slate-500 font-normal">/100</span>
                    </div>
                    <div>
                      <p className="text-xs font-medium">Score IA</p>
                      <p className="text-[10px] text-emerald-400 mt-0.5">
                        {winRate >= 70 ? 'Excellent' : winRate >= 50 ? 'Bon' : 'À améliorer'}
                      </p>
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default PlayerDashboard;