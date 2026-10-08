import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from '../context/RouterContext';
import { useAuth } from '../context/AuthContext';  // ✅ Import ajouté
import {
  Search,
  Trophy,
  Calendar,
  Users,
  Clock,
  Gamepad2,
  ChevronRight,
  Plus,
  Flame,
  Swords,
  Loader2,
  Sparkles,
  ChevronDown,
  X,
  ArrowUpRight,
  Star
} from 'lucide-react';
import API from '../services/api';

// ============================================================
// LISTE COMPLÈTE DES JEUX SUPPORTÉS
// ============================================================
const ALL_GAMES = [
  'Valorant', 'League of Legends', 'CS:GO', 'Dota 2', 'Fortnite',
  'PUBG', 'Apex Legends', 'Overwatch 2', 'Call of Duty', 'Rainbow Six Siege',
  'Rocket League', 'FIFA', 'NBA 2K', 'Mortal Kombat', 'Street Fighter',
  'Tekken', 'Super Smash Bros', 'Minecraft', 'Among Us', 'Genshin Impact',
  'World of Warcraft', 'StarCraft II', 'Hearthstone', 'Magic: The Gathering',
  'Free Fire', 'Mobile Legends', 'Wild Rift'
];

// ============================================================
// CONVERSION DES URLs PEXELS EN URLs D'IMAGES DIRECTES
// ============================================================
const getDirectImageUrl = (url) => {
  if (!url) return null;

  if (url.includes('pexels.com/photo/')) {
    const match = url.match(/pexels\.com\/photo\/(\d+)/);
    if (match) {
      const photoId = match[1];
      return `https://images.pexels.com/photos/${photoId}/pexels-photo-${photoId}.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2`;
    }
  }

  if (url.includes('images.pexels.com')) {
    return url;
  }

  return url;
};

// ============================================================
// FONCTIONS UTILITAIRES
// ============================================================
const formatDate = (dateStr) => {
  if (!dateStr) return 'Date non définie';
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const getStatusLabel = (status) => {
  const map = { upcoming: 'À venir', ongoing: 'En cours', completed: 'Terminé' };
  return map[status] || status || 'À venir';
};

const getStatusColor = (status) => {
  const map = {
    upcoming: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    ongoing: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    completed: 'bg-slate-500/10 text-slate-400 border-slate-500/20'
  };
  return map[status] || map.upcoming;
};

// ============================================================
// FILTER SELECT
// ============================================================
const FilterSelect = ({ value, onChange, options, icon }) => (
  <div className="relative min-w-[160px]">
    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-violet-400">
      {React.cloneElement(icon, { className: 'w-4 h-4' })}
    </div>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full appearance-none rounded-xl bg-[#050b16] border border-white/10 pl-10 pr-9 py-2.5 text-sm text-slate-300 focus:outline-none focus:border-violet-500/60 transition cursor-pointer"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value} className="bg-[#080f1d]">
          {option.label}
        </option>
      ))}
    </select>
    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 pointer-events-none" />
  </div>
);

// ============================================================
// COMPOSANT CARTE TOURNOI
// ============================================================
const TournamentCard = ({ tournament, onClick }) => {
  const progress = tournament.max_participants > 0
    ? Math.min(100, (tournament.participants_count / tournament.max_participants) * 100)
    : 0;

  const rawImage = tournament.image || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1400&q=80';
  const image = getDirectImageUrl(rawImage);

  return (
    <div
      onClick={() => onClick(tournament.id)}
      className="group cursor-pointer rounded-2xl border border-white/5 bg-[#080f1d] overflow-hidden hover:border-violet-500/30 hover:-translate-y-1 transition-all duration-300"
    >
      <div className="relative aspect-[16/9] overflow-hidden">
        <img
          src={image}
          alt={tournament.name}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
          onError={(e) => {
            e.currentTarget.src = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1400&q=80';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080f1d] via-transparent to-transparent" />
        <div className="absolute top-3 left-3 flex gap-2">
          <span className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold border ${getStatusColor(tournament.status)}`}>
            {getStatusLabel(tournament.status)}
          </span>
        </div>
        <div className="absolute top-3 right-3">
          <span className="px-2.5 py-1.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-bold text-white">
            {tournament.match_format || 'BO1'}
          </span>
        </div>
        <div className="absolute bottom-3 left-3">
          <span className="px-2.5 py-1.5 rounded-lg bg-black/60 backdrop-blur-md text-[10px] font-bold text-white flex items-center gap-1.5">
            <Gamepad2 className="w-3.5 h-3.5" />
            {tournament.game || 'eSport'}
          </span>
        </div>
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
          <div className="w-14 h-14 rounded-full bg-violet-600/90 shadow-xl shadow-violet-900/40 flex items-center justify-center backdrop-blur-sm">
            <Trophy className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>

      <div className="p-5">
        <h3 className="font-bold text-lg text-white group-hover:text-violet-300 transition line-clamp-1">
          {tournament.name}
        </h3>
        <p className="text-sm text-slate-500 line-clamp-2 mt-1 min-h-[40px]">
          {tournament.description || 'Aucune description'}
        </p>
        <div className="flex flex-wrap gap-2 mt-4">
          <span className="flex items-center gap-1 rounded-lg bg-white/[0.04] px-2.5 py-1 text-[11px] text-slate-400">
            <Calendar className="w-3.5 h-3.5" />
            {formatDate(tournament.start_date)}
          </span>
          <span className="flex items-center gap-1 rounded-lg bg-white/[0.04] px-2.5 py-1 text-[11px] text-slate-400">
            <Users className="w-3.5 h-3.5" />
            {tournament.participants_count || 0}/{tournament.max_participants || 0}
          </span>
          {tournament.prize_pool > 0 && (
            <span className="flex items-center gap-1 rounded-lg bg-yellow-500/10 text-yellow-400 px-2.5 py-1 text-[11px] font-semibold">
              {tournament.prize_pool} DH
            </span>
          )}
        </div>

        <div className="mt-4">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-500">Inscriptions</span>
            <span className="text-violet-400">{Math.round(progress)}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-600 to-cyan-400 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <button className="mt-4 w-full py-2.5 rounded-xl bg-violet-600/20 text-violet-400 font-medium text-sm hover:bg-violet-600/30 transition group-hover:bg-violet-600 group-hover:text-white">
          Voir le tournoi →
        </button>
      </div>
    </div>
  );
};

// ============================================================
// FILTER BADGE
// ============================================================
const FilterBadge = ({ label, onRemove }) => (
  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-violet-500/10 border border-violet-500/15 text-violet-300 text-xs">
    {label}
    <button onClick={onRemove} className="hover:text-white transition">
      <X className="w-3 h-3" />
    </button>
  </span>
);

// ============================================================
// STAT CARD
// ============================================================
const StatCard = ({ icon: Icon, label, value, subtitle, color = 'violet' }) => {
  const colors = {
    violet: 'from-violet-500/20 to-purple-500/10 border-violet-500/20',
    cyan: 'from-cyan-500/20 to-blue-500/10 border-cyan-500/20',
    orange: 'from-orange-500/20 to-amber-500/10 border-orange-500/20',
  };
  const iconColors = {
    violet: 'text-violet-400',
    cyan: 'text-cyan-400',
    orange: 'text-orange-400',
  };
  return (
    <div className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br ${colors[color]} backdrop-blur-sm p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl group`}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-${color}-500/5 rounded-full blur-2xl -translate-y-10 translate-x-10" />
      <div className="relative z-10 flex items-start justify-between">
        <div>
          <p className="text-3xl md:text-4xl font-black text-white">{value}</p>
          <p className="text-sm text-slate-400 mt-1.5 font-medium">{label}</p>
          <p className="text-[10px] text-slate-600 mt-0.5">{subtitle}</p>
        </div>
        <div className={`w-12 h-12 rounded-2xl bg-white/5 backdrop-blur-sm flex items-center justify-center ${iconColors[color]} group-hover:scale-110 transition-transform`}>
          {React.cloneElement(Icon, { className: 'w-6 h-6' })}
        </div>
      </div>
    </div>
  );
};

// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================
const Tournaments = () => {
  const navigate = useNavigate();
  const { user } = useAuth();  // ✅ Récupérer l'utilisateur connecté

  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('Tous');
  const [filterGame, setFilterGame] = useState('Tous');

  const statusOptions = [
    { value: 'Tous', label: 'Tous' },
    { value: 'upcoming', label: 'À venir' },
    { value: 'ongoing', label: 'En cours' },
    { value: 'completed', label: 'Terminé' }
  ];

  // ✅ Vérifier si l'utilisateur peut créer un tournoi
  const canCreateTournament = user?.role === 'coach' || user?.role === 'admin' || user?.is_superuser;

  // ============================================================
  // CHARGEMENT DES DONNÉES
  // ============================================================
  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await API.get('/tournaments/');
      const data = Array.isArray(res.data) ? res.data : res.data.results || [];
      setTournaments(data);
    } catch (err) {
      console.error('Erreur chargement tournois:', err);
      setError('Impossible de charger les tournois.');
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // CONSTRUCTION DES OPTIONS DE JEUX
  // ============================================================
  const gameOptions = useMemo(() => {
    const existingGames = [...new Set(tournaments.map(t => t.game).filter(Boolean))];
    const allGames = [...new Set([...ALL_GAMES, ...existingGames])].sort();
    return [
      { value: 'Tous', label: 'Tous' },
      ...allGames.map(g => ({ value: g, label: g }))
    ];
  }, [tournaments]);

  // ============================================================
  // FILTRAGE FRONTEND
  // ============================================================
  const filteredTournaments = useMemo(() => {
    return tournaments.filter((tournament) => {
      const matchesSearch =
        tournament.name?.toLowerCase().includes(search.toLowerCase()) ||
        tournament.game?.toLowerCase().includes(search.toLowerCase()) ||
        tournament.description?.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = filterStatus === 'Tous' || tournament.status === filterStatus;
      const matchesGame = filterGame === 'Tous' || tournament.game === filterGame;

      return matchesSearch && matchesStatus && matchesGame;
    });
  }, [tournaments, search, filterStatus, filterGame]);

  // ============================================================
  // STATISTIQUES
  // ============================================================
  const stats = useMemo(() => {
    const total = tournaments.length;
    const participants = tournaments.reduce((sum, t) => sum + (t.participants_count || 0), 0);
    const ongoing = tournaments.filter(t => t.status === 'ongoing').length;
    return { total, participants, ongoing };
  }, [tournaments]);

  const hasFilters = search || filterStatus !== 'Tous' || filterGame !== 'Tous';

  // ============================================================
  // RENDU
  // ============================================================
  if (loading) {
    return (
      <div className="min-h-screen bg-[#020817] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-violet-500 animate-spin mx-auto" />
          <p className="text-slate-400 mt-4">Chargement des tournois...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020817] text-white">
      <main className="ml-0 md:ml-[250px] min-h-screen">

        {/* ===== HEADER ===== */}
        <header className="border-b border-white/5 bg-[#020817]/80 backdrop-blur-xl">
          <div className="max-w-[1450px] mx-auto px-5 md:px-8 py-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-violet-400 text-xs font-semibold uppercase tracking-wider mb-1">
                  <Sparkles className="w-4 h-4" />
                  eSportsConnect Arena
                </div>
                <h1 className="text-2xl md:text-3xl font-black tracking-tight">
                  Tournois
                </h1>
                <p className="text-slate-500 text-sm mt-1">
                  Affronte la communauté, gagne de l'XP et prouve ta valeur.
                </p>
              </div>

              {/* ✅ Bouton visible UNIQUEMENT pour Coach et Admin */}
              {canCreateTournament && (
                <button
                  onClick={() => navigate('create-tournament')}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-500 hover:from-violet-500 hover:to-purple-400 transition font-bold flex items-center gap-2 shadow-lg shadow-violet-600/20"
                >
                  <Plus className="w-4 h-4" />
                  Créer un tournoi
                </button>
              )}
            </div>
          </div>
        </header>

        <div className="max-w-[1450px] mx-auto px-5 md:px-8 py-6">

          {/* ===== STATISTIQUES ===== */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <StatCard icon={<Trophy />} label="Tournois disponibles" value={stats.total} subtitle="Compétitions" color="violet" />
            <StatCard icon={<Users />} label="Participants" value={stats.participants} subtitle="Joueurs inscrits" color="cyan" />
            <StatCard icon={<Flame />} label="En cours" value={stats.ongoing} subtitle="Tournois actifs" color="orange" />
          </div>

          {/* ===== SEARCH + FILTERS ===== */}
          <div className="rounded-2xl border border-white/5 bg-white/5 backdrop-blur-sm p-4 mb-6">
            <div className="flex flex-col lg:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Rechercher un tournoi..."
                  className="w-full rounded-xl bg-[#050b16] border border-white/10 pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500/60 transition"
                />
              </div>

              <div className="flex gap-3">
                <FilterSelect
                  value={filterStatus}
                  onChange={setFilterStatus}
                  options={statusOptions}
                  icon={<Clock className="w-4 h-4" />}
                />
                <FilterSelect
                  value={filterGame}
                  onChange={setFilterGame}
                  options={gameOptions}
                  icon={<Gamepad2 className="w-4 h-4" />}
                />
              </div>
            </div>
          </div>

          {/* ===== FILTRES ACTIFS ===== */}
          {hasFilters && (
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="text-xs text-slate-500">Filtres :</span>
              {search && <FilterBadge label={`Recherche : ${search}`} onRemove={() => setSearch('')} />}
              {filterStatus !== 'Tous' && (
                <FilterBadge
                  label={`Statut : ${statusOptions.find(s => s.value === filterStatus)?.label || filterStatus}`}
                  onRemove={() => setFilterStatus('Tous')}
                />
              )}
              {filterGame !== 'Tous' && (
                <FilterBadge label={`Jeu : ${filterGame}`} onRemove={() => setFilterGame('Tous')} />
              )}
              <button
                onClick={() => { setSearch(''); setFilterStatus('Tous'); setFilterGame('Tous'); }}
                className="text-xs text-violet-400 hover:text-violet-300 transition ml-2"
              >
                Tout effacer
              </button>
            </div>
          )}

          {/* ===== LISTE DES TOURNOIS ===== */}
          {error ? (
            <div className="text-center py-8 text-red-400">
              <p>{error}</p>
              <button onClick={fetchTournaments} className="mt-2 text-violet-400 hover:text-violet-300 text-sm">
                Réessayer
              </button>
            </div>
          ) : filteredTournaments.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 bg-[#080f1d] py-20 text-center">
              <Swords className="w-16 h-16 text-slate-500 mx-auto mb-4" />
              <h3 className="text-lg font-bold">Aucun tournoi trouvé</h3>
              <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
                {hasFilters
                  ? 'Aucun tournoi ne correspond à vos critères de recherche.'
                  : 'Aucun tournoi disponible pour le moment.'}
              </p>
              {hasFilters && (
                <button
                  onClick={() => { setSearch(''); setFilterStatus('Tous'); setFilterGame('Tous'); }}
                  className="mt-6 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 transition font-medium text-sm"
                >
                  Réinitialiser les filtres
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredTournaments.map((tournament) => (
                <TournamentCard
                  key={tournament.id}
                  tournament={tournament}
                  onClick={(id) => navigate(`tournaments/${id}`)}
                />
              ))}
            </div>
          )}
        </div>

        {/* ===== FOOTER ===== */}
        <div className="max-w-[1450px] mx-auto px-5 md:px-8 pb-6 pt-4 border-t border-white/5 text-center text-[10px] text-slate-600 tracking-[0.2em] font-light">
          <p>eSportsConnect • Tournois • © 2026</p>
        </div>

      </main>
    </div>
  );
};

export default Tournaments;