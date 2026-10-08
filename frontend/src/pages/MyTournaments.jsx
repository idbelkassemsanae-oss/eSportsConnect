import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from '../context/RouterContext';
import {
  Trophy,
  Calendar,
  Users,
  ChevronRight,
  Clock,
  Crown,
  Swords,
  CheckCircle2,
  XCircle,
  Loader2,
  Gamepad2,
  TrendingUp,
  Medal,
  Star,
  Sparkles,
  ArrowRight,
  User,
} from 'lucide-react';
import API from '../services/api';

// ============================================================
// 1. CONFIGURATIONS
// ============================================================

// Configuration des statuts des tournois
const STATUS_CONFIG = {
  upcoming: {
    label: 'À VENIR',
    color: 'text-cyan-400',
    border: 'border-cyan-500/30',
    glow: 'shadow-cyan-500/10',
    dot: 'bg-cyan-400',
    bar: 'from-cyan-400 to-blue-500'
  },
  ongoing: {
    label: 'EN COURS',
    color: 'text-emerald-400',
    border: 'border-emerald-500/30',
    glow: 'shadow-emerald-500/10',
    dot: 'bg-emerald-400',
    bar: 'from-emerald-400 to-teal-500'
  },
  completed: {
    label: 'TERMINÉ',
    color: 'text-purple-400',
    border: 'border-purple-500/30',
    glow: 'shadow-purple-500/10',
    dot: 'bg-purple-400',
    bar: 'from-purple-400 to-pink-500'
  }
};

// Configuration des icônes de jeux
const GAME_ICONS = {
  'Valorant': '🔫',
  'League of Legends': '⚔️',
  'LoL': '⚔️',
  'CS:GO': '💣',
  'Fortnite': '🪂',
  'Rocket League': '🚗',
  'Overwatch': '🎯',
  'Dota 2': '🗡️',
  'PUBG': '🪂',
  'Apex Legends': '🔫',
  'FIFA': '⚽',
  'EA FC': '⚽',
};

// ============================================================
// 2. COMPOSANT PRINCIPAL
// ============================================================

const MyTournaments = () => {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('Tous');
  const navigate = useNavigate();

  // ============================================================
  // 3. EFFET : CHARGEMENT DES DONNÉES
  // ============================================================

  useEffect(() => {
    API.get('/tournaments/my-tournaments/')
      .then(res => {
        setTournaments(res.data);
        setLoading(false);
      })
      .catch(() => {
        setTournaments([]);
        setLoading(false);
      });
  }, []);

  // ============================================================
  // 4. CALCUL DES STATISTIQUES
  // ============================================================

  const totalTournaments = tournaments.length;
  const totalPoints = tournaments.reduce((acc, t) => acc + (t.my_points || 0), 0);
  const completedTournaments = tournaments.filter(t => t.status === 'completed').length;
  const ongoingTournaments = tournaments.filter(t => t.status === 'ongoing').length;
  const victories = tournaments.filter(t => t.my_rank === 1).length;

  // ============================================================
  // 5. FILTRAGE
  // ============================================================

  const filtered = useMemo(() => {
    if (filter === 'Tous') return tournaments;
    return tournaments.filter(t => {
      const status = t.status || '';
      if (filter === 'À venir') return status === 'upcoming';
      if (filter === 'En cours') return status === 'ongoing';
      if (filter === 'Terminé') return status === 'completed';
      return true;
    });
  }, [tournaments, filter]);

  // ============================================================
  // 6. FONCTIONS UTILITAIRES
  // ============================================================

  const getStatusConfig = (status) => STATUS_CONFIG[status] || STATUS_CONFIG.upcoming;

  const getRankInfo = (rank) => {
    if (!rank) return { label: 'NON CLASSÉ', color: 'text-gray-500', emoji: null, bg: 'bg-gray-500/10' };
    if (rank === 1) return { label: `#${rank}`, color: 'text-yellow-400', emoji: '👑', bg: 'bg-yellow-500/20' };
    if (rank === 2) return { label: `#${rank}`, color: 'text-gray-300', emoji: '🥈', bg: 'bg-gray-400/20' };
    if (rank === 3) return { label: `#${rank}`, color: 'text-orange-400', emoji: '🥉', bg: 'bg-orange-500/20' };
    return { label: `#${rank}`, color: 'text-cyan-400', emoji: null, bg: 'bg-cyan-500/10' };
  };

  const getGameIcon = (gameName) => GAME_ICONS[gameName] || '🎮';

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Date non définie';
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  // ============================================================
  // 7. COMPOSANTS INTERNES
  // ============================================================

  // --- 7.1. Loader ---
  const Loader = () => (
    <div className="flex min-h-[300px] items-center justify-center">
      <Loader2 className="animate-spin text-violet-500" size={40} />
    </div>
  );

  // --- 7.2. État vide ---
  const EmptyState = () => (
    <div className="rounded-2xl border border-dashed border-white/10 bg-[#080f1d] py-20 text-center">
      <Trophy className="mx-auto mb-4 text-slate-700" size={45} />
      <h2 className="text-lg font-bold text-white">Aucun tournoi</h2>
      <p className="mt-2 text-sm text-slate-500">
        Tu ne participes actuellement à aucun tournoi.
      </p>
      <button
        onClick={() => navigate('tournaments')}
        className="mt-5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-500 px-6 py-3 text-sm font-bold text-white hover:brightness-110 transition"
      >
        Découvrir les tournois
      </button>
    </div>
  );

  // --- 7.3. Carte d'un tournoi ---
  const TournamentCard = ({ tournament, index }) => {
    const status = getStatusConfig(tournament.status);
    const rankInfo = getRankInfo(tournament.my_rank);
    const gameIcon = getGameIcon(tournament.game);
    const animationDelay = index * 80;

    return (
      <div
        className={`group relative bg-[#08111f] border ${status.border} rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${status.glow} cursor-pointer overflow-hidden`}
        style={{ animationDelay: `${animationDelay}ms` }}
        onClick={() => navigate(`tournaments/${tournament.id}`)}
      >
        {/* Effet de lueur au survol */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

        {/* Badge de statut */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <span className={`text-[10px] font-bold tracking-[0.15em] ${status.color}`}>
            {status.label}
          </span>
          <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${status.dot}`}></span>
        </div>

        <div className="relative">
          {/* Titre et icône */}
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-xl text-black shadow-lg shadow-violet-500/20 flex-shrink-0">
              <Trophy size={22} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-white group-hover:text-violet-300 transition truncate">
                {tournament.name}
              </h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-sm">{gameIcon}</span>
                <span className="text-[10px] text-gray-500 uppercase tracking-wider">
                  {tournament.game || 'Compétition'}
                </span>
              </div>
            </div>
          </div>

          {/* Rang et points */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className={`${rankInfo.bg} rounded-xl p-3 text-center border border-white/5`}>
              <p className="text-[9px] text-gray-500 uppercase tracking-[0.15em] font-semibold">Rang</p>
              <div className="flex items-center justify-center gap-1 mt-1">
                {rankInfo.emoji && <span className="text-base">{rankInfo.emoji}</span>}
                <p className={`font-bold text-lg ${rankInfo.color}`}>
                  {rankInfo.label}
                </p>
              </div>
            </div>
            <div className="bg-black/30 rounded-xl p-3 text-center border border-white/5">
              <p className="text-[9px] text-gray-500 uppercase tracking-[0.15em] font-semibold">Points</p>
              <p className="font-bold text-lg text-cyan-400">
                {tournament.my_points || 0}
              </p>
            </div>
          </div>

          {/* Barre de progression */}
          {tournament.my_points > 0 && (
            <div className="mt-4">
              <div className="flex justify-between text-[9px] text-gray-500 uppercase tracking-[0.1em] mb-1">
                <span>Progression</span>
                <span>{Math.min(tournament.my_points * 10, 100)}%</span>
              </div>
              <div className="w-full h-1 bg-gray-800/50 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${status.bar} rounded-full transition-all duration-1000`}
                  style={{ width: `${Math.min(tournament.my_points * 10, 100)}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Pied de carte */}
          <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between">
            <span className="text-[10px] text-gray-500 flex items-center gap-2 tracking-wide">
              <Calendar size={12} className="text-purple-400" />
              <span>{formatDate(tournament.start_date)}</span>
            </span>
            <span className="text-[10px] text-violet-400 group-hover:text-violet-300 transition flex items-center gap-1 tracking-wide">
              Détails <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
            </span>
          </div>
        </div>
      </div>
    );
  };

  // ============================================================
  // 8. RENDU PRINCIPAL
  // ============================================================

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-[#020817] text-white">
      <main className="ml-0 md:ml-[250px] min-h-screen">

        {/* ===== HEADER ===== */}
        <header className="border-b border-white/5 bg-[#020817]/80 backdrop-blur-xl">
          <div className="max-w-[1450px] mx-auto px-5 md:px-8 py-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-violet-400 text-xs font-semibold uppercase tracking-wider mb-1">
                  <Trophy size={16} />
                  Espace joueur
                </div>
                <h1 className="text-2xl md:text-3xl font-black tracking-tight">
                  Mes tournois
                </h1>
                <p className="text-slate-500 text-sm mt-1">
                  Suis tes compétitions, tes prochains matchs et tes résultats.
                </p>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-[1450px] mx-auto px-5 md:px-8 py-6">

          {/* ===== STATISTIQUES ===== */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="rounded-2xl border border-white/5 bg-[#08111f] p-5">
              <Trophy size={20} className="mb-3 text-violet-400" />
              <p className="text-2xl font-black">{totalTournaments}</p>
              <p className="text-xs text-slate-500">Participations</p>
            </div>
            <div className="rounded-2xl border border-white/5 bg-[#08111f] p-5">
              <Swords size={20} className="mb-3 text-cyan-400" />
              <p className="text-2xl font-black">{ongoingTournaments}</p>
              <p className="text-xs text-slate-500">En cours</p>
            </div>
            <div className="rounded-2xl border border-white/5 bg-[#08111f] p-5">
              <Crown size={20} className="mb-3 text-yellow-400" />
              <p className="text-2xl font-black">{victories}</p>
              <p className="text-xs text-slate-500">Victoires</p>
            </div>
            <div className="rounded-2xl border border-white/5 bg-[#08111f] p-5">
              <Star size={20} className="mb-3 text-amber-400" />
              <p className="text-2xl font-black">{totalPoints}</p>
              <p className="text-xs text-slate-500">Points totaux</p>
            </div>
          </section>

          {/* ===== FILTRES ===== */}
          <section className="mb-6 flex flex-wrap gap-2">
            {['Tous', 'À venir', 'En cours', 'Terminé'].map((item) => (
              <button
                key={item}
                onClick={() => setFilter(item)}
                className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                  filter === item
                    ? 'bg-gradient-to-r from-violet-600 to-purple-500 text-white'
                    : 'border border-white/5 bg-[#08111f] text-slate-400 hover:text-white'
                }`}
              >
                {item}
              </button>
            ))}
          </section>

          {/* ===== LISTE DES TOURNOIS ===== */}
          {filtered.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filtered.map((tournament, index) => (
                <TournamentCard key={tournament.id} tournament={tournament} index={index} />
              ))}
            </div>
          )}

          {/* ===== FOOTER ===== */}
          <div className="mt-12 pt-6 border-t border-white/5 text-center text-[10px] text-slate-600 tracking-[0.2em] font-light">
            <p>eSportsConnect • Mes tournois • © 2026</p>
          </div>

        </div>
      </main>

      {/* Styles pour les animations */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeInUp {
          opacity: 0;
          animation: fadeInUp 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default MyTournaments;