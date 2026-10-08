import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from '../context/RouterContext';
import { useAuth } from '../context/AuthContext';
import {
  Trophy,
  Search,
  Crown,
  Medal,
  Target,
  Gamepad2,
  TrendingUp,
  Users,
  Award,
  Flame,
  MapPin,
  Calendar,
  ChevronRight,
  RefreshCw,
  Loader2,
  AlertCircle,
  BarChart3,
  Activity,
  Star,
  Sparkles,
} from 'lucide-react';
import API from '../services/api';

// ============================================================
// CONFIGURATION DES NIVEAUX
// ============================================================
const LEVEL_CONFIG = {
  Expert: {
    color: 'from-red-600 to-orange-500',
    text: 'text-red-400',
    border: 'border-red-500/40',
    bg: 'bg-red-500/10',
    glow: 'shadow-red-500/20',
  },
  Avancé: {
    color: 'from-purple-600 to-pink-500',
    text: 'text-purple-400',
    border: 'border-purple-500/40',
    bg: 'bg-purple-500/10',
    glow: 'shadow-purple-500/20',
  },
  Intermédiaire: {
    color: 'from-blue-600 to-cyan-500',
    text: 'text-blue-400',
    border: 'border-blue-500/40',
    bg: 'bg-blue-500/10',
    glow: 'shadow-blue-500/20',
  },
  Débutant: {
    color: 'from-green-500 to-emerald-400',
    text: 'text-green-400',
    border: 'border-green-500/40',
    bg: 'bg-green-500/10',
    glow: 'shadow-green-500/20',
  },
};

const getLevelConfig = (level) => LEVEL_CONFIG[level] || LEVEL_CONFIG.Débutant;

// ============================================================
// ✅ FONCTION UTILITAIRE : Rôle affiché selon user.role
// ============================================================
const getRoleLabel = (role) => {
  if (role === 'coach') return 'Coach';
  if (role === 'admin') return 'Administrateur';
  return 'Joueur';
};

// ============================================================
// COMPOSANTS DE CARTES
// ============================================================

const RankBadge = ({ rank }) => {
  let className = 'border-slate-800 bg-slate-900 text-slate-400';
  if (rank === 1) className = 'border-yellow-500/20 bg-yellow-500/10 text-yellow-400';
  else if (rank === 2) className = 'border-slate-400/20 bg-slate-400/10 text-slate-300';
  else if (rank === 3) className = 'border-orange-500/20 bg-orange-500/10 text-orange-400';

  return (
    <div className={`flex shrink-0 items-center justify-center rounded-lg border font-bold h-9 w-9 text-xs ${className}`}>
      {rank <= 3 ? (
        rank === 1 ? <Crown size={15} /> : <Medal size={15} />
      ) : (
        `#${rank}`
      )}
    </div>
  );
};

const Avatar = ({ username, size = 'medium' }) => {
  const initials = username ? username.slice(0, 2).toUpperCase() : 'ES';
  const sizes = {
    small: 'h-8 w-8 text-[10px]',
    medium: 'h-10 w-10 text-xs',
    large: 'h-14 w-14 text-sm',
    xl: 'h-20 w-20 text-lg',
  };
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full border border-violet-500/20 bg-gradient-to-br from-violet-600/70 to-indigo-700/70 font-bold text-white ${sizes[size]}`}
    >
      {initials}
    </div>
  );
};

const WinRate = ({ value }) => {
  let textClass = 'text-slate-300';
  if (value >= 70) textClass = 'text-emerald-400';
  else if (value >= 50) textClass = 'text-yellow-400';
  else textClass = 'text-red-400';
  return <span className={`text-sm font-semibold ${textClass}`}>{value}%</span>;
};

// ============================================================
// COMPOSANT TOP PLAYER CARD - DESIGN "TROP CLASSE"
// ============================================================
const TopPlayerCard = ({ player, position, champion = false }) => {
  const levelConfig = getLevelConfig(player.level);
  const medals = {
    1: { emoji: '👑', label: 'Champion', glow: 'shadow-yellow-500/40' },
    2: { emoji: '🥈', label: 'Vice-champion', glow: 'shadow-slate-400/30' },
    3: { emoji: '🥉', label: 'Troisième', glow: 'shadow-orange-400/30' },
  };

  const medal = medals[position];

  const podiumStyles = {
    1: {
      bg: 'bg-gradient-to-br from-yellow-500/20 via-amber-500/10 to-transparent',
      border: 'border-yellow-500/40',
      glow: 'shadow-yellow-500/30',
      text: 'text-yellow-400',
      accent: 'from-yellow-400 to-amber-500',
    },
    2: {
      bg: 'bg-gradient-to-br from-slate-400/20 via-slate-500/10 to-transparent',
      border: 'border-slate-400/40',
      glow: 'shadow-slate-400/30',
      text: 'text-slate-300',
      accent: 'from-slate-300 to-slate-400',
    },
    3: {
      bg: 'bg-gradient-to-br from-orange-500/20 via-amber-500/10 to-transparent',
      border: 'border-orange-400/40',
      glow: 'shadow-orange-400/30',
      text: 'text-orange-400',
      accent: 'from-orange-400 to-amber-500',
    },
  };

  const style = podiumStyles[position];

  const podiumHeight = position === 1 ? 'h-[380px]' : position === 2 ? 'h-[320px]' : 'h-[280px]';
  const podiumScale = position === 1 ? 'scale-100' : position === 2 ? 'scale-[0.95]' : 'scale-[0.90]';

  return (
    <div className={`relative ${podiumHeight} flex flex-col items-center justify-end ${podiumScale} transition-all duration-500`}>
      <div className={`absolute -bottom-20 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full blur-3xl ${style.glow} opacity-50`} />

      <div className="relative z-20 -mb-4">
        <div
          className={`flex h-14 w-14 items-center justify-center rounded-full border-2 ${style.border} bg-black/60 backdrop-blur-xl shadow-2xl ${style.glow}`}
        >
          <span className="text-3xl">{medal.emoji}</span>
        </div>
        {champion && (
          <div className="absolute -top-6 -right-6 animate-pulse">
            <Sparkles size={20} className="text-yellow-400" />
          </div>
        )}
      </div>

      <div
        className={`relative z-10 w-full rounded-3xl border ${style.border} ${style.bg} backdrop-blur-sm p-6 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl ${style.glow}`}
      >
        <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-white/5 blur-2xl" />

        {champion && (
          <div className="absolute -top-3 -right-3 flex items-center gap-1 rounded-full bg-yellow-500/20 border border-yellow-500/30 px-3 py-1 text-[10px] font-bold text-yellow-400 backdrop-blur-sm">
            <Star size={12} />
            CHAMPION
          </div>
        )}

        <div className="relative flex justify-center">
          <div className="relative">
            <div className={`absolute inset-0 rounded-full blur-xl ${style.glow} opacity-60`} />
            <div
              className={`relative flex h-24 w-24 items-center justify-center rounded-full border-2 ${style.border} bg-gradient-to-br ${style.accent} text-3xl font-black text-white shadow-2xl`}
            >
              {player.player_name.charAt(0).toUpperCase()}
              {champion && (
                <div className="absolute -top-1 -right-1">
                  <Crown size={20} className="text-yellow-400" />
                </div>
              )}
            </div>
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-16 h-1 rounded-full bg-gradient-to-r from-transparent via-white/30 to-transparent" />
          </div>
        </div>

        <div className="mt-4 text-center">
          <h3 className={`text-xl font-bold text-white ${champion ? 'text-2xl' : ''}`}>
            {player.player_name}
          </h3>
          <div className="mt-1 flex items-center justify-center gap-2 text-sm text-slate-400">
            <Gamepad2 size={14} className="text-violet-400" />
            {player.game || 'eSport'}
          </div>
        </div>

        <div className="mt-3 flex justify-center">
          <span
            className={`rounded-full border ${levelConfig.border} ${levelConfig.bg} px-3 py-1 text-[10px] font-bold ${levelConfig.text}`}
          >
            {player.level || 'Débutant'}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="rounded-xl bg-black/40 border border-white/5 p-2 text-center backdrop-blur-sm">
            <p className="text-sm font-bold text-violet-400">{player.points}</p>
            <p className="text-[10px] text-slate-500">Points</p>
          </div>
          <div className="rounded-xl bg-black/40 border border-white/5 p-2 text-center backdrop-blur-sm">
            <p className="text-sm font-bold text-emerald-400">{player.wins || 0}</p>
            <p className="text-[10px] text-slate-500">Victoires</p>
          </div>
          <div className="rounded-xl bg-black/40 border border-white/5 p-2 text-center backdrop-blur-sm">
            <p className="text-sm font-bold text-amber-400">{player.matches || 0}</p>
            <p className="text-[10px] text-slate-500">Matchs</p>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between rounded-xl bg-black/40 border border-white/5 p-2 px-3">
          <span className="text-[10px] text-slate-500">Win Rate</span>
          <span className="text-sm font-bold text-emerald-400">{player.win_rate || player.winRate || 0}%</span>
        </div>

        <div className="mt-3 text-center">
          <span className={`text-[10px] font-bold uppercase tracking-[0.15em] ${style.text}`}>
            {medal.label}
          </span>
        </div>

        <div className="absolute inset-0 rounded-3xl bg-gradient-to-t from-white/5 via-transparent to-transparent pointer-events-none" />
      </div>

      <div className="relative z-0 -mt-8 w-full">
        <div className="h-8 w-full rounded-b-3xl bg-gradient-to-t from-black/60 to-transparent border-x border-b border-white/5" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 rounded-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>
    </div>
  );
};

// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================
const Leaderboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState('');
  const [season, setSeason] = useState('Saison 2026');

  // ============================================================
  // CHARGEMENT DES DONNÉES
  // ============================================================
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const res = await API.get('/tournaments/global-leaderboard/');
        setPlayers(res.data);
        setError(null);
      } catch (err) {
        console.error('Erreur chargement classement:', err);
        setError('Impossible de charger le classement. Veuillez réessayer.');
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  // ============================================================
  // FILTRES
  // ============================================================
  const filteredPlayers = useMemo(() => {
    let result = [...players];
    if (search.trim()) {
      const query = search.toLowerCase();
      result = result.filter((p) => p.player_name?.toLowerCase().includes(query));
    }
    return result.sort((a, b) => b.points - a.points);
  }, [players, search]);

  const topThree = filteredPlayers.slice(0, 3);

  // ============================================================
  // STATISTIQUES
  // ============================================================
  const totalPlayers = players.length;
  const totalPoints = players.reduce((acc, p) => acc + (p.points || 0), 0);
  const experts = players.filter((p) => p.level === 'Expert').length;
  const debutants = players.filter((p) => p.level === 'Débutant').length;

  // ============================================================
  // RENDU
  // ============================================================
  if (loading) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center bg-[#020617] text-white">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-violet-500" />
          <p className="text-slate-400">Chargement du classement...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center bg-[#020617] text-white">
        <div className="text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-400" />
          <p className="text-xl font-bold text-red-400">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-xl bg-violet-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-violet-500 transition"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  // ============================================================
  // COMPOSANT LEADERBOARD ROW
  // ============================================================
  const LeaderboardRow = ({ player, index, isCurrentUser }) => {
    const position = index + 1;
    const levelConfig = getLevelConfig(player.level);

    return (
      <tr
        className={`border-b border-slate-800/80 transition last:border-0 ${
          isCurrentUser ? 'bg-violet-500/5' : 'hover:bg-slate-800/30'
        }`}
      >
        <td className="px-5 py-5"><RankBadge rank={position} /></td>
        <td className="px-5 py-5">
          <div className="flex items-center gap-3">
            <Avatar username={player.player_name} size="medium" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{player.player_name}</span>
                {isCurrentUser && (
                  <span className="rounded-full bg-violet-500/10 px-2 py-0.5 text-[10px] font-medium text-violet-400">
                    Vous
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-slate-600">{player.level || 'Débutant'}</p>
            </div>
          </div>
        </td>
        <td className="px-5 py-5">
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <Gamepad2 size={15} className="text-violet-400" />
            {player.game || 'eSport'}
          </div>
        </td>
        <td className="px-5 py-5 text-sm text-slate-400">{player.matches || 0}</td>
        <td className="px-5 py-5">
          <span className="text-sm font-medium text-emerald-400">{player.wins || 0}</span>
        </td>
        <td className="px-5 py-5">
          <WinRate value={player.win_rate || player.winRate || 0} />
        </td>
        <td className="px-5 py-5">
          <span className="font-bold text-violet-400">{player.points}</span>
        </td>
      </tr>
    );
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <main className="ml-0 md:ml-[250px] min-h-screen">
        <div className="max-w-[1500px] mx-auto px-5 md:px-8 py-6">

          {/* ===== HEADER ===== */}
          <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2 text-sm text-violet-400">
                <Trophy size={18} />
                <span>Compétition</span>
              </div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Classement</h1>
              <p className="mt-2 text-slate-400">Découvre les meilleurs joueurs de la communauté eSportsConnect.</p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="flex w-fit items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm font-medium text-slate-300 transition hover:border-violet-500/40 hover:text-white"
            >
              <RefreshCw size={17} />
              Actualiser
            </button>
          </div>

          {/* ===== SEARCH ===== */}
          <div className="mb-8 flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search size={19} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher un joueur..."
                className="w-full rounded-xl border border-slate-800 bg-slate-900/50 py-3.5 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-violet-500/50"
              />
            </div>
          </div>

          {/* ===== SEASON BANNER ===== */}
          <section className="relative mb-8 overflow-hidden rounded-3xl border border-violet-500/20 bg-gradient-to-r from-violet-950/80 via-indigo-950/60 to-slate-950">
            <div className="absolute -right-20 -top-32 h-72 w-72 rounded-full bg-violet-600/20 blur-3xl" />
            <div className="absolute bottom-0 left-1/3 h-40 w-40 rounded-full bg-blue-600/10 blur-3xl" />
            <div className="relative flex flex-col justify-between gap-8 p-6 md:flex-row md:items-center md:p-8">
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/20">
                    <Crown size={19} className="text-yellow-400" />
                  </div>
                  <span className="text-sm font-medium text-violet-300">{season}</span>
                </div>
                <h2 className="text-2xl font-bold sm:text-3xl">Saison compétitive</h2>
                <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
                  Grimpe dans le classement, gagne des points et deviens le meilleur joueur de la communauté.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-3 sm:gap-5">
                <div className="min-w-[80px] rounded-xl border border-white/5 bg-black/20 p-4 text-center">
                  <p className="text-xl font-bold">{totalPlayers}</p>
                  <p className="mt-1 text-[11px] text-slate-500">Joueurs</p>
                </div>
                <div className="min-w-[80px] rounded-xl border border-white/5 bg-black/20 p-4 text-center">
                  <p className="text-xl font-bold">{totalPoints}</p>
                  <p className="mt-1 text-[11px] text-slate-500">Points</p>
                </div>
                <div className="min-w-[80px] rounded-xl border border-white/5 bg-black/20 p-4 text-center">
                  <p className="text-xl font-bold">{experts}</p>
                  <p className="mt-1 text-[11px] text-slate-500">Experts</p>
                </div>
              </div>
            </div>
          </section>

          {/* ===== TOP 3 ===== */}
          {topThree.length > 0 && (
            <section className="mt-24 mb-12">
              <div className="flex flex-col items-center justify-center gap-6 md:flex-row md:items-end md:gap-6 lg:gap-8">
                {topThree[1] && (
                  <div className="order-1 w-full max-w-[360px] md:order-1">
                    <TopPlayerCard player={topThree[1]} position={2} />
                  </div>
                )}

                {topThree[0] && (
                  <div className="order-2 w-full max-w-[420px] md:order-2 md:-mt-12">
                    <TopPlayerCard player={topThree[0]} position={1} champion />
                  </div>
                )}

                {topThree[2] && (
                  <div className="order-3 w-full max-w-[360px] md:order-3">
                    <TopPlayerCard player={topThree[2]} position={3} />
                  </div>
                )}
              </div>

              <div className="mt-8 flex justify-center">
                <div className="w-3/4 h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent" />
              </div>
            </section>
          )}

          {/* ===== TABLEAU ===== */}
          <div className="grid gap-6 xl:grid-cols-[1fr_330px]">
            <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40">
              <div className="flex flex-col justify-between gap-4 border-b border-slate-800 p-5 sm:flex-row sm:items-center">
                <div>
                  <h2 className="text-xl font-bold">Classement des joueurs</h2>
                  <p className="mt-1 text-sm text-slate-500">{filteredPlayers.length} joueur{filteredPlayers.length > 1 ? 's' : ''}</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Flame size={17} className="text-orange-400" />
                  Saison active
                </div>
              </div>

              {/* Desktop */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950/40 text-left text-xs uppercase tracking-wider text-slate-500">
                      <th className="px-5 py-4">Rang</th>
                      <th className="px-5 py-4">Joueur</th>
                      <th className="px-5 py-4">Jeu</th>
                      <th className="px-5 py-4">Matchs</th>
                      <th className="px-5 py-4">Victoires</th>
                      <th className="px-5 py-4">Win Rate</th>
                      <th className="px-5 py-4">Points</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPlayers.map((player, index) => (
                      <LeaderboardRow
                        key={player.player_id || index}
                        player={player}
                        index={index}
                        isCurrentUser={player.player_name === user?.username}
                      />
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile */}
              <div className="divide-y divide-slate-800 md:hidden">
                {filteredPlayers.map((player, index) => {
                  const isCurrentUser = player.player_name === user?.username;
                  return (
                    <div key={player.player_id || index} className={`p-4 ${isCurrentUser ? 'bg-violet-500/5' : ''}`}>
                      <div className="flex items-center gap-3">
                        <RankBadge rank={index + 1} />
                        <Avatar username={player.player_name} size="medium" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="truncate font-semibold">{player.player_name}</p>
                            {isCurrentUser && (
                              <span className="rounded-full bg-violet-500/10 px-2 py-0.5 text-[9px] text-violet-400">Vous</span>
                            )}
                          </div>
                          <p className="mt-1 truncate text-xs text-slate-500">{player.game || 'eSport'}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-violet-400">{player.points}</p>
                          <p className="text-xs text-slate-600">points</p>
                        </div>
                      </div>
                      <div className="mt-4 grid grid-cols-3 gap-2">
                        <div className="rounded-lg bg-slate-950/60 p-2 text-center">
                          <p className="text-sm font-semibold">{player.matches || 0}</p>
                          <p className="mt-1 text-[10px] text-slate-600">Matchs</p>
                        </div>
                        <div className="rounded-lg bg-slate-950/60 p-2 text-center">
                          <p className="text-sm font-semibold">{player.wins || 0}</p>
                          <p className="mt-1 text-[10px] text-slate-600">Victoires</p>
                        </div>
                        <div className="rounded-lg bg-slate-950/60 p-2 text-center">
                          <p className="text-sm font-semibold">{player.win_rate || player.winRate || 0}%</p>
                          <p className="mt-1 text-[10px] text-slate-600">Win Rate</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredPlayers.length === 0 && (
                <div className="p-12 text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-800">
                    <Search size={24} className="text-slate-500" />
                  </div>
                  <h3 className="font-semibold">Aucun joueur trouvé</h3>
                  <p className="mt-1 text-sm text-slate-500">Essaie de modifier ta recherche.</p>
                </div>
              )}
            </section>

            {/* ===== SIDEBAR ===== */}
            <aside className="space-y-6">
              {/* Ma position */}
              <section className="overflow-hidden rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-950/50 to-slate-900/60">
                <div className="p-6">
                  <div className="mb-5 flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-slate-500">Ton classement</p>
                      <h3 className="mt-1 text-xl font-bold">Ma position</h3>
                    </div>
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/10">
                      <Trophy size={21} className="text-yellow-400" />
                    </div>
                  </div>
                  <div className="mb-5 flex items-center gap-4">
                    <Avatar username={user?.username || 'Joueur'} size="large" />
                    <div>
                      <p className="font-bold">{user?.username || 'Joueur'}</p>
                      {/* ✅ Rôle dynamique selon user.role */}
                      <p className="text-sm text-slate-500">{getRoleLabel(user?.role)}</p>
                    </div>
                  </div>
                  <div className="mb-5 flex items-center justify-between rounded-xl bg-slate-950/60 p-4">
                    <div>
                      <p className="text-xs text-slate-500">Position</p>
                      <p className="mt-1 text-2xl font-bold text-violet-400">
                        #{players.findIndex(p => p.player_name === user?.username) + 1 || 'N/A'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500">Points</p>
                      <p className="mt-1 font-bold">{players.find(p => p.player_name === user?.username)?.points || 0}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('profile')}
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-medium text-slate-300 transition hover:border-violet-500/40 hover:text-white"
                  >
                    Voir mon profil
                    <ChevronRight size={16} />
                  </button>
                </div>
              </section>

              {/* Statistiques globales */}
              <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10">
                    <TrendingUp size={19} className="text-violet-400" />
                  </div>
                  <div>
                    <h3 className="font-bold">Statistiques</h3>
                    <p className="text-xs text-slate-500">Vue globale</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <Users size={17} className="text-violet-400" />
                      <span className="text-sm text-slate-400">Joueurs actifs</span>
                    </div>
                    <span className="text-sm font-bold text-white">{totalPlayers}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <BarChart3 size={17} className="text-violet-400" />
                      <span className="text-sm text-slate-400">Points totaux</span>
                    </div>
                    <span className="text-sm font-bold text-white">{totalPoints}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <Activity size={17} className="text-violet-400" />
                      <span className="text-sm text-slate-400">Experts</span>
                    </div>
                    <span className="text-sm font-bold text-white">{experts}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <Target size={17} className="text-violet-400" />
                      <span className="text-sm text-slate-400">Débutants</span>
                    </div>
                    <span className="text-sm font-bold text-white">{debutants}</span>
                  </div>
                </div>
              </section>
            </aside>
          </div>

          {/* ===== FOOTER ===== */}
          <div className="mt-10 pt-6 border-t border-white/5 text-center text-[10px] text-slate-600 tracking-[0.2em] font-light">
            <p>eSportsConnect • Classement • © 2026</p>
          </div>

        </div>
      </main>
    </div>
  );
};

export default Leaderboard;