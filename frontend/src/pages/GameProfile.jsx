import React, { useState, useEffect } from 'react';
import { usePage, useNavigate } from '../context/RouterContext';
import { useAuth } from '../context/AuthContext';
import {
  Gamepad2,
  Trophy,
  Target,
  Star,
  Zap,
  Shield,
  Sword,
  Crosshair,
  Users,
  Clock,
  TrendingUp,
  Award,
  Medal,
  Edit3,
  Save,
  X,
  ChevronRight,
  Flame,
  BarChart3,
  Activity,
  Crown,
  Sparkles,
  CheckCircle2,
  Plus,
  Trash2,
  MapPin,
  User,
  Hash,
  Layers,
  RefreshCw,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import API from '../services/api';

// ============================================================
// COMPOSANTS DE CARTES (réutilisables)
// ============================================================

const StatCard = ({ icon: Icon, title, value, subtitle, iconColor = 'text-violet-400' }) => {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 transition hover:border-violet-500/20">
      <div className="mb-4 flex items-center justify-between">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800/80 ${iconColor}`}>
          <Icon size={20} />
        </div>
      </div>
      <p className="text-sm text-slate-500">{title}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
    </div>
  );
};

const GameCard = ({ game, active }) => {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border p-5 transition ${
        active
          ? 'border-violet-500/40 bg-violet-950/20'
          : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
      }`}
    >
      {active && (
        <div className="absolute right-4 top-4">
          <CheckCircle2 size={18} className="text-violet-400" />
        </div>
      )}
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800 text-2xl">
          {game.icon || '🎮'}
        </div>
        <div>
          <h3 className="font-bold">{game.name}</h3>
          <p className="text-xs text-slate-500">Niveau {game.level}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-slate-950/60 p-3">
          <p className="text-xs text-slate-500">Rang</p>
          <p className="mt-1 text-sm font-semibold">{game.rank || 'Non classé'}</p>
        </div>
        <div className="rounded-lg bg-slate-950/60 p-3">
          <p className="text-xs text-slate-500">Points</p>
          <p className="mt-1 text-sm font-semibold">{game.points || 0}</p>
        </div>
        <div className="rounded-lg bg-slate-950/60 p-3">
          <p className="text-xs text-slate-500">Matchs</p>
          <p className="mt-1 text-sm font-semibold">{game.matches || 0}</p>
        </div>
        <div className="rounded-lg bg-slate-950/60 p-3">
          <p className="text-xs text-slate-500">Win Rate</p>
          <p className="mt-1 text-sm font-semibold text-emerald-400">{game.win_rate || game.winRate || 0}%</p>
        </div>
      </div>
    </div>
  );
};

const AchievementCard = ({ achievement }) => {
  const unlocked = achievement.unlocked || achievement.is_unlocked;
  return (
    <div
      className={`rounded-xl border p-4 transition ${
        unlocked
          ? 'border-yellow-500/20 bg-yellow-500/5'
          : 'border-slate-800 bg-slate-950/30 opacity-50'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-2xl">
          {achievement.icon || '🏆'}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">{achievement.name || achievement.title}</h3>
            {unlocked && <CheckCircle2 size={15} className="shrink-0 text-emerald-400" />}
          </div>
          <p className="mt-1 text-xs leading-5 text-slate-500">{achievement.description}</p>
          {achievement.points && <p className="mt-1 text-[10px] text-slate-500">{achievement.points} pts</p>}
        </div>
      </div>
    </div>
  );
};

const PreferenceCard = ({ icon: Icon, label, value }) => {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/50 p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
        <Icon size={19} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-500">{label}</p>
        <p className="mt-1 truncate font-medium text-slate-200">{value || 'Non renseigné'}</p>
      </div>
    </div>
  );
};

// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================
const GameProfile = () => {
  const page = usePage();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [profiles, setProfiles] = useState([]);
  const [games, setGames] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [userAchievements, setUserAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    game: '',
    username: '',
    rank: '',
    preferred_role: '',
    preferred_agent: '',
    playstyle: '',
  });
  const [formErrors, setFormErrors] = useState({});

  // ============================================================
  // CHARGEMENT DES DONNÉES
  // ============================================================
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profilesRes, gamesRes, achievementsRes, userAchievRes] = await Promise.all([
          API.get('/game-profiles/profiles/'),
          API.get('/game-profiles/games/'),
          API.get('/game-profiles/achievements/'),
          API.get('/game-profiles/my-achievements/'),
        ]);
        setProfiles(profilesRes.data || []);
        setGames(gamesRes.data || []);
        setAchievements(achievementsRes.data || []);
        setUserAchievements(userAchievRes.data || []);
        setLoading(false);
      } catch (err) {
        console.error('Erreur chargement:', err);
        setError('Impossible de charger les données du profil de jeu.');
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ============================================================
  // CRÉER UN PROFIL (corrigé)
  // ============================================================
  const createProfile = async (e) => {
    e.preventDefault();
    setFormErrors({});

    // Vérifier qu'un jeu est sélectionné
    if (!formData.game) {
      alert('Veuillez sélectionner un jeu.');
      return;
    }

    // Préparer le payload : le champ 'game' doit être l'ID du jeu (entier)
    const payload = {
      game: parseInt(formData.game, 10), // Convertir en entier
      username: formData.username || '',
      rank: formData.rank || '',
      preferred_role: formData.preferred_role || '',
      preferred_agent: formData.preferred_agent || '',
      playstyle: formData.playstyle || '',
    };

    try {
      const res = await API.post('/game-profiles/profiles/', payload);
      setProfiles([...profiles, res.data]);
      setShowCreateForm(false);
      setFormData({ game: '', username: '', rank: '', preferred_role: '', preferred_agent: '', playstyle: '' });
      alert('✅ Profil créé avec succès !');
    } catch (err) {
      console.error('Erreur détaillée:', err.response?.data);
      if (err.response?.data) {
        const errors = err.response.data;
        // Afficher les erreurs de validation
        let message = '❌ Erreur lors de la création du profil :\n';
        for (const [field, msgs] of Object.entries(errors)) {
          const msg = Array.isArray(msgs) ? msgs.join(', ') : msgs;
          message += `\n${field}: ${msg}`;
        }
        alert(message);
        setFormErrors(errors);
      } else {
        alert('❌ Erreur lors de la création du profil.');
      }
    }
  };

  // ============================================================
  // SUPPRIMER UN PROFIL
  // ============================================================
  const deleteProfile = async (id) => {
    if (!window.confirm('Voulez-vous supprimer ce profil ?')) return;
    try {
      await API.delete(`/game-profiles/profiles/${id}/`);
      setProfiles(profiles.filter((p) => p.id !== id));
    } catch (err) {
      alert('❌ Erreur lors de la suppression.');
    }
  };

  // ============================================================
  // DÉFINIR COMME PRINCIPAL
  // ============================================================
  const setPrimary = async (id) => {
    try {
      await API.post(`/game-profiles/profiles/${id}/primary/`);
      setProfiles(profiles.map((p) => ({ ...p, is_primary: p.id === id })));
    } catch (err) {
      alert('❌ Erreur.');
    }
  };

  // ============================================================
  // RENDU
  // ============================================================
  if (loading) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center bg-[#020617] text-white">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-violet-500" />
          <p className="text-slate-400">Chargement du profil de jeu...</p>
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

  const primaryProfile = profiles.find((p) => p.is_primary);
  const unlockedCount = userAchievements.length;

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <main className="ml-0 md:ml-[250px] min-h-screen">
        <div className="max-w-[1500px] mx-auto px-5 md:px-8 py-6">

          {/* ===== HEADER ===== */}
          <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm text-violet-400">
                <Gamepad2 size={18} />
                <span>Profil gaming</span>
              </div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Mon profil de jeu</h1>
              <p className="mt-2 text-slate-400">Gère tes profils, statistiques et préférences gaming.</p>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-5 py-3 font-medium text-white shadow-lg shadow-violet-950/30 transition hover:brightness-110"
            >
              <Plus size={18} />
              Ajouter un jeu
            </button>
          </div>

          {/* ===== PROFIL PRINCIPAL ===== */}
          {primaryProfile && (
            <section className="relative mb-8 overflow-hidden rounded-3xl border border-violet-500/20 bg-gradient-to-br from-violet-950/70 via-slate-900 to-[#020617]">
              <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-violet-600/20 blur-3xl" />
              <div className="absolute -bottom-20 left-1/3 h-64 w-64 rounded-full bg-blue-600/10 blur-3xl" />

              <div className="relative grid gap-8 p-6 lg:grid-cols-[1fr_300px] lg:p-8">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                  <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-3xl border border-violet-400/30 bg-gradient-to-br from-violet-600 to-indigo-700 text-5xl shadow-2xl shadow-violet-900/30">
                    {primaryProfile.game_icon || '🎮'}
                  </div>

                  <div className="min-w-0">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-300">
                        Jeu principal
                      </span>
                      <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
                        Profil actif
                      </span>
                    </div>

                    <h2 className="text-3xl font-bold">{primaryProfile.game_name}</h2>
                    <p className="mt-1 text-lg text-slate-300">@{primaryProfile.username || 'Non défini'}</p>

                    <div className="mt-4 flex flex-wrap gap-3">
                      <div className="flex items-center gap-2 rounded-lg bg-black/20 px-3 py-2 text-sm">
                        <Crown size={16} className="text-yellow-400" />
                        <span>{primaryProfile.rank || 'Non classé'}</span>
                      </div>
                      <div className="flex items-center gap-2 rounded-lg bg-black/20 px-3 py-2 text-sm">
                        <Target size={16} className="text-red-400" />
                        <span>{primaryProfile.preferred_role || 'Non défini'}</span>
                      </div>
                      <div className="flex items-center gap-2 rounded-lg bg-black/20 px-3 py-2 text-sm">
                        <MapPin size={16} className="text-blue-400" />
                        <span>{primaryProfile.region || 'Non défini'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/5 bg-black/20 p-5 backdrop-blur-sm">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-sm text-slate-400">Niveau</span>
                    <span className="text-2xl font-bold text-violet-400">{primaryProfile.level || 1}</span>
                  </div>
                  <div className="mb-2 h-2 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500"
                      style={{ width: `${Math.min(primaryProfile.level * 5, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>XP actuelle</span>
                    <span>{Math.min(primaryProfile.level * 5, 100)}%</span>
                  </div>
                  <div className="mt-5 flex items-center justify-between border-t border-white/5 pt-4">
                    <span className="text-sm text-slate-400">Points</span>
                    <span className="font-bold text-white">{primaryProfile.points || 0}</span>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ===== STATISTIQUES ===== */}
          {primaryProfile && (
            <section className="mb-8">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">Statistiques</h2>
                  <p className="text-sm text-slate-500">Tes performances sur {primaryProfile.game_name}</p>
                </div>
                <BarChart3 className="text-violet-400" size={22} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                  icon={Trophy}
                  title="Victoires"
                  value={primaryProfile.wins || 0}
                  subtitle={`${primaryProfile.win_rate || 0}% de win rate`}
                  iconColor="text-yellow-400"
                />
                <StatCard
                  icon={Target}
                  title="Win Rate"
                  value={`${primaryProfile.win_rate || 0}%`}
                  subtitle={`${(primaryProfile.wins || 0) + (primaryProfile.losses || 0)} matchs`}
                  iconColor="text-emerald-400"
                />
                <StatCard
                  icon={Crosshair}
                  title="K/D"
                  value={
                    (primaryProfile.losses || 0) > 0
                      ? ((primaryProfile.kills || 0) / (primaryProfile.losses || 0)).toFixed(2)
                      : '0.00'
                  }
                  subtitle={`${primaryProfile.kills || 0} kills`}
                  iconColor="text-red-400"
                />
                <StatCard
                  icon={Award}
                  title="MVP"
                  value={primaryProfile.mvp || 0}
                  subtitle="MVP obtenus"
                  iconColor="text-violet-400"
                />
              </div>
            </section>
          )}

          {/* ===== LISTE DES PROFILS ===== */}
          <section className="mb-8">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Mes jeux</h2>
                <p className="text-sm text-slate-500">Tes profils gaming</p>
              </div>
            </div>
            {profiles.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 bg-slate-900/30 py-12 text-center">
                <Gamepad2 className="mx-auto text-slate-600" size={48} />
                <p className="mt-4 text-slate-400">Aucun profil de jeu</p>
                <p className="text-sm text-slate-500">Ajoute ton premier jeu pour commencer.</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {profiles.map((profile) => (
                  <div
                    key={profile.id}
                    className={`relative overflow-hidden rounded-2xl border p-5 transition ${
                      profile.is_primary
                        ? 'border-violet-500/40 bg-violet-950/20'
                        : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
                    }`}
                  >
                    {profile.is_primary && (
                      <div className="absolute right-4 top-4">
                        <CheckCircle2 size={18} className="text-violet-400" />
                      </div>
                    )}
                    <div className="mb-5 flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800 text-2xl">
                        {profile.game_icon || '🎮'}
                      </div>
                      <div>
                        <h3 className="font-bold">{profile.game_name}</h3>
                        <p className="text-xs text-slate-500">@{profile.username || 'Non défini'}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="rounded-lg bg-slate-950/60 p-2">
                        <p className="font-bold text-cyan-400">{profile.wins || 0}</p>
                        <p className="text-slate-500">V</p>
                      </div>
                      <div className="rounded-lg bg-slate-950/60 p-2">
                        <p className="font-bold text-red-400">{profile.losses || 0}</p>
                        <p className="text-slate-500">D</p>
                      </div>
                      <div className="rounded-lg bg-slate-950/60 p-2">
                        <p className="font-bold text-yellow-400">{profile.win_rate || 0}%</p>
                        <p className="text-slate-500">WR</p>
                      </div>
                    </div>

                    <div className="mt-3 flex gap-2 pt-3 border-t border-white/5">
                      <button
                        onClick={() => setPrimary(profile.id)}
                        className="flex-1 text-xs text-violet-400 hover:text-violet-300 transition"
                      >
                        {profile.is_primary ? '✅ Principal' : 'Définir principal'}
                      </button>
                      <button
                        onClick={() => deleteProfile(profile.id)}
                        className="text-xs text-red-400 hover:text-red-300 transition"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ===== RÉALISATIONS ===== */}
          <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Réalisations</h2>
                <p className="mt-1 text-sm text-slate-500">
                  {unlockedCount} / {achievements.length} débloquées
                </p>
              </div>
              <Medal className="text-yellow-400" size={24} />
            </div>

            {userAchievements.length === 0 ? (
              <p className="text-sm text-slate-400">Aucune réalisation débloquée.</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {userAchievements.map((ua) => (
                  <AchievementCard
                    key={ua.id}
                    achievement={{
                      ...ua.achievement_details,
                      unlocked: true,
                    }}
                  />
                ))}
              </div>
            )}
          </section>

          {/* ===== MODAL CRÉATION PROFIL (corrigé) ===== */}
          {showCreateForm && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-[#1a1a2e] border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl shadow-black/50">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-white">Ajouter un jeu</h3>
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className="text-slate-400 hover:text-white transition"
                  >
                    <X size={20} />
                  </button>
                </div>
                <form onSubmit={createProfile} className="space-y-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Jeu *</label>
                    <select
                      required
                      value={formData.game}
                      onChange={(e) => setFormData({ ...formData, game: e.target.value })}
                      className="w-full p-2 bg-black/40 border border-white/10 rounded-xl text-white focus:border-violet-400/50 focus:outline-none transition"
                    >
                      <option value="">Sélectionner un jeu</option>
                      {games.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.name}
                        </option>
                      ))}
                    </select>
                    {formErrors.game && (
                      <p className="text-xs text-red-400 mt-1">{formErrors.game}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Pseudo in-game</label>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="w-full p-2 bg-black/40 border border-white/10 rounded-xl text-white focus:border-violet-400/50 focus:outline-none transition"
                    />
                    {formErrors.username && (
                      <p className="text-xs text-red-400 mt-1">{formErrors.username}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Rang</label>
                    <input
                      type="text"
                      value={formData.rank}
                      onChange={(e) => setFormData({ ...formData, rank: e.target.value })}
                      className="w-full p-2 bg-black/40 border border-white/10 rounded-xl text-white focus:border-violet-400/50 focus:outline-none transition"
                    />
                    {formErrors.rank && (
                      <p className="text-xs text-red-400 mt-1">{formErrors.rank}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Rôle préféré</label>
                    <input
                      type="text"
                      value={formData.preferred_role}
                      onChange={(e) => setFormData({ ...formData, preferred_role: e.target.value })}
                      className="w-full p-2 bg-black/40 border border-white/10 rounded-xl text-white focus:border-violet-400/50 focus:outline-none transition"
                    />
                    {formErrors.preferred_role && (
                      <p className="text-xs text-red-400 mt-1">{formErrors.preferred_role}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Agent/Personnage préféré</label>
                    <input
                      type="text"
                      value={formData.preferred_agent}
                      onChange={(e) => setFormData({ ...formData, preferred_agent: e.target.value })}
                      className="w-full p-2 bg-black/40 border border-white/10 rounded-xl text-white focus:border-violet-400/50 focus:outline-none transition"
                    />
                    {formErrors.preferred_agent && (
                      <p className="text-xs text-red-400 mt-1">{formErrors.preferred_agent}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Style de jeu</label>
                    <input
                      type="text"
                      value={formData.playstyle}
                      onChange={(e) => setFormData({ ...formData, playstyle: e.target.value })}
                      className="w-full p-2 bg-black/40 border border-white/10 rounded-xl text-white focus:border-violet-400/50 focus:outline-none transition"
                    />
                    {formErrors.playstyle && (
                      <p className="text-xs text-red-400 mt-1">{formErrors.playstyle}</p>
                    )}
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white py-2.5 rounded-xl font-bold transition hover:brightness-110"
                  >
                    Créer le profil
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* ===== FOOTER ===== */}
          <div className="mt-10 pt-6 border-t border-white/5 text-center text-[10px] text-slate-600 tracking-[0.2em] font-light">
            <p>eSportsConnect • Profil de jeu • © 2026</p>
          </div>

        </div>
      </main>
    </div>
  );
};

export default GameProfile;