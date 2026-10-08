import React, { useState, useEffect } from 'react';
import { usePage, useNavigate } from '../context/RouterContext';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft,
  Trophy,
  Calendar,
  Users,
  Gamepad2,
  MapPin,
  Clock,
  Crown,
  Swords,
  Shield,
  CheckCircle2,
  Loader2,
  UserPlus,
  Edit3,
  Trash2,
  ClipboardList,
  Flag,
  AlertCircle,
  ChevronRight,
  Medal,
  CalendarDays,
  UserRound,
  GitBranch,
  MessageCircle,
  Monitor,
  Crosshair,
  Timer,
  UsersRound,
  BarChart3,
  Sparkles,
  Info,
} from 'lucide-react';
import API from '../services/api';

// ============================================================
// CONVERSION DES URLs PEXELS
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
  if (url.includes('images.pexels.com')) return url;
  return url;
};

// ============================================================
// FORMATAGE DES DATES
// ============================================================
const formatDate = (dateStr) => {
  if (!dateStr) return 'Non défini';
  return new Date(dateStr).toLocaleString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// ============================================================
// COMPTE À REBOURS INTELLIGENT
// ============================================================
const getTimeRemaining = (startDate) => {
  const now = new Date();
  const start = new Date(startDate);
  const diff = start - now;
  if (diff <= 0) return null;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  return { days, hours, minutes, seconds };
};

const TournamentCountdown = ({ startDate, status }) => {
  const [timeLeft, setTimeLeft] = useState(getTimeRemaining(startDate));

  useEffect(() => {
    if (!timeLeft) return;
    const timer = setInterval(() => {
      const updated = getTimeRemaining(startDate);
      if (!updated) {
        setTimeLeft(null);
        clearInterval(timer);
      } else {
        setTimeLeft(updated);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [startDate]);

  if (status === 'completed') {
    return (
      <div className="rounded-xl border border-white/[0.06] bg-[#06101c] p-5 text-center">
        <p className="text-sm font-medium text-gray-400">🏁 Tournoi terminé</p>
      </div>
    );
  }

  if (!timeLeft) {
    return (
      <div className="rounded-xl border border-white/[0.06] bg-[#06101c] p-5 text-center">
        <p className="text-sm font-medium text-amber-400">Le tournoi a commencé !</p>
      </div>
    );
  }

  const values = [
    { value: String(timeLeft.days).padStart(2, '0'), label: 'Jours' },
    { value: String(timeLeft.hours).padStart(2, '0'), label: 'Heures' },
    { value: String(timeLeft.minutes).padStart(2, '0'), label: 'Minutes' },
    { value: String(timeLeft.seconds).padStart(2, '0'), label: 'Secondes' },
  ];

  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#06101c] p-5">
      <h3 className="mb-4 text-base font-semibold text-white">Le tournoi commence dans</h3>
      <div className="grid grid-cols-4 gap-2">
        {values.map((item) => (
          <div key={item.label} className="rounded-lg border border-white/[0.04] bg-[#0a1524] px-2 py-3 text-center">
            <p className="text-xl font-semibold text-white">{item.value}</p>
            <p className="mt-1 text-[10px] text-slate-500">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================
// COMPOSANTS D'INTERFACE
// ============================================================

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-center justify-between gap-3 py-2 border-b border-white/[0.05] last:border-0">
    <div className="flex items-center gap-2">
      <Icon size={16} className="text-slate-400 shrink-0" />
      <span className="text-sm text-slate-300">{label}</span>
    </div>
    <span className="text-sm font-medium text-white truncate max-w-[140px]">{value}</span>
  </div>
);

const ParticipantItem = ({ participant, isCurrentUser }) => {
  const getInitials = (name) => {
    if (!name) return '?';
    return name.charAt(0).toUpperCase();
  };

  const getColor = (name) => {
    const colors = [
      'bg-violet-500', 'bg-cyan-500', 'bg-emerald-500', 'bg-amber-500',
      'bg-pink-500', 'bg-indigo-500', 'bg-teal-500', 'bg-rose-500',
      'bg-blue-500', 'bg-purple-500', 'bg-orange-500', 'bg-red-500'
    ];
    let hash = 0;
    const str = name || '?';
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className="flex items-center gap-3">
      {participant.avatar ? (
        <img
          src={participant.avatar}
          alt={participant.username}
          className="h-9 w-9 rounded-full border border-white/10 object-cover shrink-0"
        />
      ) : (
        <div className={`h-9 w-9 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 ${getColor(participant.username || '?')}`}>
          {getInitials(participant.username)}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-slate-200">{participant.username}</p>
        <p className="text-[11px] text-slate-500">Niveau {participant.level || '?'}</p>
      </div>
      {isCurrentUser ? (
        <span className="rounded-lg bg-violet-600/90 px-3 py-1 text-xs font-semibold text-white shrink-0">Vous</span>
      ) : (
        <span className="rounded-lg bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-400 shrink-0">Inscrit</span>
      )}
    </div>
  );
};

// ============================================================
// COMPOSANT BRACKET
// ============================================================
const BracketMatch = ({ match, isFinal = false }) => {
  if (!match) {
    return (
      <div className={`${isFinal ? 'border-2 border-amber-500/30 bg-gradient-to-br from-amber-950/20 to-violet-950/20' : 'border border-white/5 bg-[#0a1524]'} rounded-xl overflow-hidden shadow-lg p-4`}>
        {isFinal && (
          <div className="text-center mb-2">
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">🏆 Finale</span>
          </div>
        )}
        <div className="text-center py-2">
          <span className="text-sm text-slate-400">À déterminer</span>
        </div>
        <div className="flex justify-center py-1">
          <span className="text-xs text-slate-500">VS</span>
        </div>
        <div className="text-center py-2">
          <span className="text-sm text-slate-400">À déterminer</span>
        </div>
      </div>
    );
  }

  // Extraire les noms des joueurs/équipes
  const player1 = match.player1_username || match.player1?.username || match.team1_name || match.team1?.name || 'À déterminer';
  const player2 = match.player2_username || match.player2?.username || match.team2_name || match.team2?.name || 'À déterminer';

  // Extraire le vainqueur
  const winner = match.winner || match.winner_player?.username || match.winner_team?.name || null;

  // Extraire les scores
  const score1 = match.score_player1 !== undefined && match.score_player1 !== null
    ? match.score_player1
    : (match.score_team1 !== undefined && match.score_team1 !== null ? match.score_team1 : null);
  const score2 = match.score_player2 !== undefined && match.score_player2 !== null
    ? match.score_player2
    : (match.score_team2 !== undefined && match.score_team2 !== null ? match.score_team2 : null);

  const isWinner1 = winner && winner === player1;
  const isWinner2 = winner && winner === player2;

  const getScoreDisplay = (score) => {
    if (score === undefined || score === null || score === 0) return '-';
    return score;
  };

  return (
    <div className={`${isFinal ? 'border-2 border-amber-500/30 bg-gradient-to-br from-amber-950/20 to-violet-950/20' : 'border border-white/5 bg-[#0a1524]'} rounded-xl overflow-hidden shadow-lg`}>
      <div className="px-4 py-3">
        {isFinal && (
          <div className="text-center mb-2">
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">🏆 Finale</span>
          </div>
        )}
        <div className={`flex items-center justify-between ${isWinner1 ? 'bg-emerald-500/20 border border-emerald-500/30 rounded-lg px-3 py-2' : 'px-3 py-2'}`}>
          <span className="text-sm font-medium text-slate-200 truncate">{player1}</span>
          <span className={`text-sm font-bold ${isWinner1 ? 'text-emerald-400' : 'text-slate-400'}`}>
            {getScoreDisplay(score1)}
          </span>
          {isWinner1 && <CheckCircle2 size={14} className="text-emerald-400 ml-2 shrink-0" />}
          {isFinal && isWinner1 && <Crown size={14} className="text-amber-400 ml-2 shrink-0" />}
        </div>
        <div className="flex justify-center py-1">
          <span className="text-xs text-slate-500">VS</span>
        </div>
        <div className={`flex items-center justify-between ${isWinner2 ? 'bg-emerald-500/20 border border-emerald-500/30 rounded-lg px-3 py-2' : 'px-3 py-2'}`}>
          <span className="text-sm font-medium text-slate-200 truncate">{player2}</span>
          <span className={`text-sm font-bold ${isWinner2 ? 'text-emerald-400' : 'text-slate-400'}`}>
            {getScoreDisplay(score2)}
          </span>
          {isWinner2 && <CheckCircle2 size={14} className="text-emerald-400 ml-2 shrink-0" />}
          {isFinal && isWinner2 && <Crown size={14} className="text-amber-400 ml-2 shrink-0" />}
        </div>
      </div>
    </div>
  );
};

// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================
const TournamentDetail = () => {
  const page = usePage();
  const navigate = useNavigate();
  const { user } = useAuth();
  const tournamentId = page.split('/')[1];

  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('Aperçu');

  const isCoach = user?.role === 'coach';

  // ============================================================
  // CHARGEMENT DES DONNÉES
  // ============================================================
  useEffect(() => {
    const fetchData = async () => {
      if (!tournamentId) return;
      try {
        setLoading(true);
        setError('');

        const [tournRes, leaderRes] = await Promise.all([
          API.get(`/tournaments/${tournamentId}/`),
          API.get(`/tournaments/${tournamentId}/leaderboard/`).catch(() => ({ data: [] })),
        ]);

        const data = tournRes.data;
        setTournament(data);

        // Vérifier si l'utilisateur est inscrit
        // On compare le username de l'utilisateur avec celui des participants
        const username = user?.username;
        const userInParticipants = data.participants?.some(
          (p) => p.player_username === username || p.username === username
        );
        setIsRegistered(!!userInParticipants);

        setLeaderboard(leaderRes.data || []);
      } catch (err) {
        console.error('Erreur chargement:', err);
        setError('Impossible de charger les détails du tournoi.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tournamentId, user]);

  // ============================================================
  // INSCRIPTION
  // ============================================================
  const handleRegister = async () => {
    try {
      setJoining(true);
      await API.post(`/tournaments/${tournamentId}/register/`);
      alert('✅ Inscription réussie !');
      setIsRegistered(true);
      const res = await API.get(`/tournaments/${tournamentId}/`);
      setTournament(res.data);
    } catch (err) {
      console.error(err);
      alert('❌ Erreur lors de l\'inscription. Vérifie que le tournoi est ouvert.');
    } finally {
      setJoining(false);
    }
  };

  // ============================================================
  // SUPPRESSION
  // ============================================================
  const handleDelete = async () => {
    if (window.confirm('Voulez-vous vraiment supprimer ce tournoi ?')) {
      try {
        await API.delete(`/tournaments/${tournamentId}/`);
        navigate('tournaments');
      } catch (err) {
        alert('Erreur lors de la suppression.');
      }
    }
  };

  // ============================================================
  // RENDU
  // ============================================================
  if (loading) {
    return (
      <div className="min-h-screen bg-[#020817] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-violet-500 animate-spin mx-auto" />
          <p className="text-slate-400 mt-4">Chargement du tournoi...</p>
        </div>
      </div>
    );
  }

  if (error || !tournament) {
    return (
      <div className="min-h-screen bg-[#020817] flex items-center justify-center text-red-400">
        <div className="text-center">
          <AlertCircle className="mx-auto mb-3 w-12 h-12" />
          <p>{error || 'Tournoi introuvable'}</p>
          <button
            onClick={() => navigate('tournaments')}
            className="mt-4 rounded-xl bg-violet-600 px-5 py-2 text-sm text-white transition hover:bg-violet-500"
          >
            Retour aux tournois
          </button>
        </div>
      </div>
    );
  }

  // ===== STATUT =====
  const statusMap = {
    upcoming: { label: 'À venir', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    ongoing: { label: 'En cours', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    completed: { label: 'Terminé', color: 'bg-gray-500/10 text-gray-400 border-gray-500/20' },
  };
  const statusInfo = statusMap[tournament.status] || statusMap.upcoming;

  const participants = tournament.participants || [];
  const maxParticipants = tournament.max_participants || 0;
  const rawMatches = tournament.matches || [];

  // ===== CORRECTION DES MATCHS : si pas de round_name, on les assigne =====
  const getRoundName = (match, index) => {
    if (match.round_name && match.round_name.trim() !== '') return match.round_name;
    // Si on a 3 matchs, on suppose que les 2 premiers sont demi-finales et le dernier finale
    const total = rawMatches.length;
    if (total === 3) {
      if (index === 0) return 'Demi-finale 1';
      if (index === 1) return 'Demi-finale 2';
      if (index === 2) return 'Finale';
    }
    return `Match ${match.match_number || index + 1}`;
  };

  const matches = rawMatches.map((m, index) => ({
    ...m,
    round_name: getRoundName(m, index),
  }));

  const finalMatch = matches.find((m) => m.round_name === 'Finale');
  const semiFinals = matches.filter(
    (m) => m.round_name?.includes('Demi') || m.round_name === 'Semi-finale'
  );

  const isCompleted = tournament.status === 'completed';
  const coverImage = getDirectImageUrl(tournament.image) ||
    'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1600&q=80';

  const tabs = ['Aperçu', 'Règles', 'Participants', 'Arbre du tournoi', 'Scores'];
  const title = tournament.name || tournament.title || 'Tournoi eSportsConnect';

  // ===== INFO UTILISATEUR POUR "VOUS" =====
  const username = user?.username;

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
                  {title}
                </h1>
                <p className="text-slate-500 text-sm mt-1">
                  Détails du tournoi
                </p>
              </div>
              <button
                onClick={() => navigate('tournaments')}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 transition font-bold flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Retour aux tournois
              </button>
            </div>
          </div>
        </header>

        <div className="max-w-[1450px] mx-auto px-5 md:px-8 py-6">

          {/* ===== CONTENU PRINCIPAL ===== */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">

            {/* ===== COLONNE GAUCHE ===== */}
            <div className="space-y-6 min-w-0">

              {/* HERO */}
              <div className="relative overflow-hidden rounded-2xl border border-violet-500/20 bg-[#080f1d]">
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-40"
                  style={{ backgroundImage: `url('${coverImage}')` }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#080f1d] via-[#080f1d]/90 to-transparent" />
                <div className="relative z-10 p-6 md:p-8">
                  <span className={`inline-block px-3 py-1.5 rounded-lg border text-xs font-bold ${statusInfo.color}`}>
                    {statusInfo.label}
                  </span>
                  <h1 className="mt-4 text-2xl md:text-4xl font-black text-white">{title}</h1>
                  <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-300">
                    <span className="flex items-center gap-1.5"><Gamepad2 size={16} className="text-violet-400" /> {tournament.game}</span>
                    <span className="flex items-center gap-1.5"><Crosshair size={16} /> {tournament.category || 'Général'}</span>
                    <span className="flex items-center gap-1.5"><Timer size={16} /> {tournament.level || 'Débutant'}</span>
                  </div>
                  <p className="mt-4 text-sm text-slate-300 max-w-2xl">{tournament.description}</p>
                  <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-black/30 rounded-xl px-4 py-3 border border-white/5">
                      <div className="flex items-center gap-2 text-white text-sm"><CalendarDays size={16} /> {formatDate(tournament.start_date).split(',')[0]}</div>
                      <p className="text-xs text-slate-400 mt-0.5">{formatDate(tournament.start_date).split(',')[1]?.trim()}</p>
                    </div>
                    <div className="bg-black/30 rounded-xl px-4 py-3 border border-white/5">
                      <div className="flex items-center gap-2 text-white text-sm"><CalendarDays size={16} /> {formatDate(tournament.end_date).split(',')[0]}</div>
                      <p className="text-xs text-slate-400 mt-0.5">{formatDate(tournament.end_date).split(',')[1]?.trim()}</p>
                    </div>
                    <div className="bg-black/30 rounded-xl px-4 py-3 border border-white/5">
                      <div className="flex items-center gap-2 text-white text-sm"><Users size={16} /> {participants.length} / {maxParticipants}</div>
                      <p className="text-xs text-slate-400 mt-0.5">Participants</p>
                    </div>
                    <div className="bg-black/30 rounded-xl px-4 py-3 border border-white/5">
                      <div className="flex items-center gap-2 text-white text-sm"><Medal size={16} className="text-amber-400" /> {tournament.prize_pool > 0 ? `${tournament.prize_pool} DH` : 'À définir'}</div>
                      <p className="text-xs text-slate-400 mt-0.5">Prix total</p>
                    </div>
                  </div>

                  {/* TABS */}
                  <div className="mt-6 -mb-8 flex overflow-x-auto gap-1 border-b border-white/5">
                    {tabs.map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-3 text-sm font-medium transition border-b-2 whitespace-nowrap ${
                          activeTab === tab
                            ? 'border-violet-400 text-violet-300'
                            : 'border-transparent text-slate-400 hover:text-white'
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* ===== CONTENU DES ONGLETS ===== */}
              <div className="rounded-2xl border border-white/5 bg-[#080f1d] p-6 md:p-8">
                {activeTab === 'Aperçu' && (
                  <>
                    {/* ===== SECTION "À PROPOS" ===== */}
                    <div>
                      <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <Info size={20} className="text-violet-400" />
                        À propos du tournoi
                      </h2>
                      
                      <p className="text-sm text-slate-300 leading-relaxed mb-6">
                        {tournament.description}
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-[#0a1524] rounded-xl p-4 border border-white/5">
                          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                            <GitBranch size={14} />
                            Format du tournoi
                          </div>
                          <span className="text-sm font-semibold text-white capitalize">
                            {tournament.tournament_format?.replace('_', ' ') || 'Non défini'}
                          </span>
                        </div>

                        <div className="bg-[#0a1524] rounded-xl p-4 border border-white/5">
                          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                            <Swords size={14} />
                            Format des matchs
                          </div>
                          <span className="inline-block px-3 py-1 rounded-lg bg-violet-500/20 text-violet-300 text-sm font-bold uppercase">
                            {tournament.match_format || 'BO1'}
                          </span>
                        </div>

                        <div className="bg-[#0a1524] rounded-xl p-4 border border-white/5">
                          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                            <Users size={14} />
                            Format des équipes
                          </div>
                          <span className="text-sm font-semibold text-white capitalize">
                            {tournament.format || 'Solo'}
                          </span>
                        </div>

                        <div className="bg-[#0a1524] rounded-xl p-4 border border-white/5">
                          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                            <MapPin size={14} />
                            Lieu
                          </div>
                          <span className="text-sm font-semibold text-white">
                            {tournament.lieu || 'En ligne'}
                          </span>
                        </div>

                        <div className="bg-[#0a1524] rounded-xl p-4 border border-white/5">
                          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                            <CalendarDays size={14} />
                            Délai d'inscription
                          </div>
                          <span className="text-sm font-semibold text-white">
                            {tournament.registration_deadline ? formatDate(tournament.registration_deadline) : 'Non défini'}
                          </span>
                        </div>

                        <div className="bg-[#0a1524] rounded-xl p-4 border border-white/5">
                          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                            <Clock size={14} />
                            Statut
                          </div>
                          <span className={`inline-block px-3 py-1 rounded-lg text-sm font-bold ${statusInfo.color}`}>
                            {statusInfo.label}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* ===== BRACKET (avec données réelles ou fallback) ===== */}
                    <div className="mt-8 pt-6 border-t border-white/5">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                          <Crown size={20} className="text-amber-400" />
                          Arbre du tournoi
                        </h3>
                        <button 
                          onClick={() => setActiveTab('Arbre du tournoi')} 
                          className="text-xs text-violet-400 hover:text-violet-300 transition flex items-center gap-1"
                        >
                          Voir détail <ChevronRight size={14} />
                        </button>
                      </div>

                      <div className="overflow-x-auto pb-4">
                        <div className="flex items-stretch justify-center gap-6 min-w-[700px]">

                          {/* Demi-finale 1 */}
                          <div className="flex-1 flex flex-col items-center">
                            <p className="text-xs font-medium text-slate-400 mb-3">Demi-finale 1</p>
                            <BracketMatch match={semiFinals[0]} isFinal={false} />
                          </div>

                          {/* Flèches de connexion */}
                          <div className="flex flex-col items-center justify-center gap-6">
                            <div className="w-8 h-0.5 bg-violet-500/50" />
                            <div className="text-violet-400 text-2xl">➜</div>
                            <div className="w-8 h-0.5 bg-violet-500/50" />
                          </div>

                          {/* Finale */}
                          <div className="flex-1 flex flex-col items-center">
                            <p className="text-xs font-medium text-amber-400 mb-3">🏆 Finale</p>
                            <BracketMatch match={finalMatch} isFinal={true} />
                          </div>

                          {/* Flèches de connexion */}
                          <div className="flex flex-col items-center justify-center gap-6">
                            <div className="w-8 h-0.5 bg-violet-500/50" />
                            <div className="text-violet-400 text-2xl">←</div>
                            <div className="w-8 h-0.5 bg-violet-500/50" />
                          </div>

                          {/* Demi-finale 2 */}
                          <div className="flex-1 flex flex-col items-center">
                            <p className="text-xs font-medium text-slate-400 mb-3">Demi-finale 2</p>
                            <BracketMatch match={semiFinals[1]} isFinal={false} />
                          </div>

                        </div>
                      </div>

                      {/* Légende */}
                      <div className="mt-6 flex flex-wrap gap-4 justify-center text-xs text-slate-500 border-t border-white/5 pt-4">
                        <span className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-emerald-500/30 border border-emerald-500/50"></span> Vainqueur
                        </span>
                        <span className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-slate-600/30 border border-slate-500/50"></span> En attente
                        </span>
                        <span className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-amber-500/30 border border-amber-500/50"></span> Finale
                        </span>
                      </div>
                    </div>
                  </>
                )}

                {activeTab === 'Règles' && (
                  <div>
                    <h2 className="text-lg font-bold text-white mb-4">Règles du tournoi</h2>
                    {tournament.rules ? (
                      <div className="p-4 bg-[#050b16] rounded-xl border border-white/5 text-sm text-slate-300 whitespace-pre-wrap">{tournament.rules}</div>
                    ) : (
                      <p className="text-sm text-slate-400">Aucune règle spécifiée.</p>
                    )}
                  </div>
                )}

                {activeTab === 'Participants' && (
                  <div>
                    <h2 className="text-lg font-bold text-white mb-4">Participants ({participants.length}/{maxParticipants})</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {participants.length === 0 ? (
                        <p className="text-sm text-slate-400">Aucun participant pour le moment.</p>
                      ) : (
                        participants.map((p, idx) => {
                          // Déterminer si c'est l'utilisateur courant
                          const isCurrentUser = p.player_username === username || p.username === username;
                          return (
                            <div key={p.id || idx} className="bg-[#050b16] rounded-xl border border-white/5 p-4">
                              <ParticipantItem 
                                participant={{ ...p, username: p.player_username || p.username }}
                                isCurrentUser={isCurrentUser}
                              />
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'Arbre du tournoi' && (
                  <div>
                    <h2 className="text-lg font-bold text-white mb-2">Arbre du tournoi</h2>
                    <p className="text-sm text-slate-400 mb-6">{tournament.tournament_format || 'Élimination directe'} · {tournament.match_format || 'BO1'}</p>
                    <div className="overflow-x-auto pb-2">
                      <div className="flex items-stretch justify-center gap-6 min-w-[750px]">
                        
                        {/* Demi-finales */}
                        <div className="flex-1 flex flex-col gap-6">
                          <p className="text-xs font-medium text-slate-400 text-center">Demi-finale 1</p>
                          <BracketMatch match={semiFinals[0]} isFinal={false} />
                          <div className="mt-4">
                            <p className="text-xs font-medium text-slate-400 text-center">Demi-finale 2</p>
                            <BracketMatch match={semiFinals[1]} isFinal={false} />
                          </div>
                        </div>

                        <div className="flex flex-col items-center justify-center gap-6">
                          <div className="w-8 h-0.5 bg-violet-500/50" />
                          <div className="text-violet-400 text-3xl">➜</div>
                          <div className="w-8 h-0.5 bg-violet-500/50" />
                        </div>

                        {/* Finale */}
                        <div className="flex-1 flex flex-col items-center justify-center">
                          <p className="text-xs font-medium text-amber-400 text-center mb-3">🏆 Finale</p>
                          <BracketMatch match={finalMatch} isFinal={true} />
                        </div>

                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'Scores' && (
                  <div>
                    <h2 className="text-lg font-bold text-white mb-4">Scores</h2>
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[500px] text-sm">
                        <thead className="bg-[#050b16] border-b border-white/5">
                          <tr>
                            <th className="text-left py-2.5 px-3 text-slate-400 font-medium">Match</th>
                            <th className="text-left py-2.5 px-3 text-slate-400 font-medium">Joueur 1</th>
                            <th className="text-left py-2.5 px-3 text-slate-400 font-medium">Joueur 2</th>
                            <th className="text-right py-2.5 px-3 text-slate-400 font-medium">Score</th>
                          </tr>
                        </thead>
                        <tbody>
                          {matches.length > 0 ? (
                            matches.map((m, i) => (
                              <tr key={i} className="border-b border-white/5">
                                <td className="py-2.5 px-3 text-slate-400">{m.round_name || `Match ${i+1}`}</td>
                                <td className="py-2.5 px-3 text-white">{m.player1_username || m.player1?.username || m.team1_name || m.team1?.name || 'N/A'}</td>
                                <td className="py-2.5 px-3 text-white">{m.player2_username || m.player2?.username || m.team2_name || m.team2?.name || 'N/A'}</td>
                                <td className="py-2.5 px-3 text-right text-violet-400 font-semibold">
                                  {m.score_player1 !== undefined && m.score_player2 !== undefined 
                                    ? `${m.score_player1} - ${m.score_player2}` 
                                    : (m.score_team1 !== undefined && m.score_team2 !== undefined ? `${m.score_team1} - ${m.score_team2}` : '-')}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="4" className="py-6 text-center text-slate-400">Aucun match enregistré.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ===== COLONNE DROITE ===== */}
            <div className="space-y-5 min-w-0">

              {/* Informations */}
              <div className="rounded-2xl border border-white/5 bg-[#080f1d] p-5">
                <h2 className="text-md font-bold text-white mb-4">Informations</h2>
                <div className="space-y-1">
                  <InfoRow icon={Gamepad2} label="Jeu" value={tournament.game} />
                  <InfoRow icon={Crosshair} label="Catégorie" value={tournament.category || 'Non définie'} />
                  <InfoRow icon={BarChart3} label="Niveau" value={tournament.level || 'Non défini'} />
                  <InfoRow icon={UserRound} label="Organisateur" value={tournament.organisateur || tournament.organizer_username || 'Non défini'} />
                  <InfoRow icon={MapPin} label="Lieu" value={tournament.lieu || 'Non défini'} />
                  <InfoRow icon={Monitor} label="Plateforme" value={tournament.platform || 'Non définie'} />
                  <InfoRow icon={Clock} label="Créé le" value={formatDate(tournament.created_at) || 'Non défini'} />
                </div>
              </div>

              {/* Participants mini */}
              <div className="rounded-2xl border border-white/5 bg-[#080f1d] p-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-md font-bold text-white">Participants ({participants.length}/{maxParticipants})</h2>
                  <button onClick={() => setActiveTab('Participants')} className="text-xs text-violet-400 hover:text-violet-300">Voir tous</button>
                </div>
                <div className="mt-4 space-y-3">
                  {participants.slice(0, 4).map((p, idx) => {
                    const isCurrentUser = p.player_username === username || p.username === username;
                    return (
                      <ParticipantItem 
                        key={p.id || idx} 
                        participant={{ ...p, username: p.player_username || p.username }}
                        isCurrentUser={isCurrentUser}
                      />
                    );
                  })}
                  {participants.length === 0 && <p className="text-sm text-slate-400">Aucun participant.</p>}
                </div>
              </div>

              {/* Countdown */}
              <TournamentCountdown startDate={tournament.start_date} status={tournament.status} />

              {/* Bouton inscription / coach */}
              <div className="rounded-2xl border border-violet-500/10 bg-[#080f1d] p-5">
                {!isCoach ? (
                  isCompleted ? (
                    <div className="flex items-center justify-center gap-2 py-3.5 text-gray-400 border border-gray-500/20 rounded-xl bg-gray-500/10 text-sm font-bold">
                      <Flag size={18} /> Tournoi terminé
                    </div>
                  ) : isRegistered ? (
                    <div className="flex items-center justify-center gap-2 py-3.5 text-emerald-400 border border-emerald-500/20 rounded-xl bg-emerald-500/10 text-sm font-bold">
                      <CheckCircle2 size={18} /> Tu participes
                    </div>
                  ) : (
                    <button
                      onClick={handleRegister}
                      disabled={joining}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-500 font-bold text-white flex items-center justify-center gap-2 hover:brightness-110 transition disabled:opacity-50"
                    >
                      {joining ? <Loader2 size={18} className="animate-spin" /> : <UserPlus size={18} />}
                      {joining ? 'Inscription...' : 'Participer au tournoi'}
                    </button>
                  )
                ) : (
                  <div className="space-y-3">
                    <button 
                      onClick={() => navigate(`edit-tournament/${tournamentId}`)} 
                      className="w-full py-3.5 rounded-xl bg-cyan-500/20 text-cyan-400 font-bold hover:bg-cyan-500/30 transition flex items-center justify-center gap-2"
                    >
                      <Edit3 size={18} /> Modifier
                    </button>
                    <button 
                      onClick={handleDelete} 
                      className="w-full py-3.5 rounded-xl bg-red-500/20 text-red-400 font-bold hover:bg-red-500/30 transition flex items-center justify-center gap-2"
                    >
                      <Trash2 size={18} /> Supprimer
                    </button>
                    <button 
                      onClick={() => navigate(`manage-tournament/${tournamentId}`)} 
                      className="w-full py-3.5 rounded-xl bg-purple-500/20 text-purple-400 font-bold hover:bg-purple-500/30 transition flex items-center justify-center gap-2"
                    >
                      <ClipboardList size={18} /> Gérer les matchs
                    </button>
                  </div>
                )}
              </div>

              {/* Classement */}
              {leaderboard.length > 0 && (
                <div className="rounded-2xl border border-white/5 bg-[#080f1d] p-5">
                  <h3 className="font-bold text-white flex items-center gap-2 mb-4">
                    <Medal size={18} className="text-amber-400" /> Classement
                  </h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {leaderboard.map((entry, idx) => (
                      <div key={entry.id || idx} className="flex items-center justify-between bg-black/30 rounded-xl px-3 py-2.5 text-sm">
                        <span className="text-slate-500 w-8">#{entry.rank || idx+1}</span>
                        <span className="text-white truncate flex-1 mx-2">{entry.player_name || entry.player_username}</span>
                        <span className="text-cyan-400 font-bold">{entry.points} pts</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ===== FOOTER ===== */}
        <div className="max-w-[1450px] mx-auto px-5 md:px-8 pb-6 pt-4 border-t border-white/5 text-center text-[10px] text-slate-600 tracking-[0.2em] font-light">
          <p>eSportsConnect • Détail du tournoi • © 2026</p>
        </div>

      </main>
    </div>
  );
};

export default TournamentDetail;