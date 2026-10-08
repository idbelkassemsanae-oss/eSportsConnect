import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit3,
  Settings,
  Trophy,
  Gamepad2,
  Target,
  Star,
  TrendingUp,
  Clock,
  Award,
  Medal,
  Crown,
  Shield,
  Zap,
  Camera,
  LogOut,
  BookOpen,
  Users,
  MessageSquare,
  BarChart3,
  ChevronRight,
  Menu,
  X,
  UserCircle,
  Briefcase,
  GraduationCap,
  DollarSign,
  Globe,
  Check,
  XCircle,
  Save,
  Trash2,
  Upload,
  Plus
} from 'lucide-react';
import API from '../services/api';

// ============================================================
// COMPOSANTS RÉUTILISABLES
// ============================================================

const InfoItem = ({ icon: Icon, label, value }) => {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-violet-400">
        <Icon size={16} />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wider text-slate-600">{label}</p>
        <p className="mt-0.5 truncate text-sm font-medium text-slate-300">
          {value || 'Non renseigné'}
        </p>
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, description }) => {
  return (
    <div className="group rounded-2xl border border-white/5 bg-[#0a1220] p-5 transition duration-300 hover:-translate-y-1 hover:border-violet-500/20">
      <div className="flex items-start justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
          <Icon size={20} />
        </div>
        <TrendingUp size={15} className="text-emerald-400 opacity-70" />
      </div>
      <p className="mt-5 text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-black text-white">{value ?? 0}</p>
      <p className="mt-1 text-[11px] text-slate-600">{description}</p>
    </div>
  );
};

const GameCard = ({ name, level, rank, winrate, icon }) => {
  return (
    <div className="group rounded-2xl border border-white/5 bg-[#0a1220] p-4 transition hover:border-violet-500/20 hover:bg-[#0c1525]">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600/20 to-indigo-600/10 text-violet-300">
          {icon || <Gamepad2 size={19} />}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-white">{name}</h3>
          <p className="text-xs text-slate-500">{level}</p>
        </div>
        <ChevronRight size={16} className="text-slate-700 transition group-hover:text-violet-400" />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-white/[0.025] p-3">
          <p className="text-[10px] uppercase text-slate-600">Rang</p>
          <p className="mt-1 font-bold text-violet-300">{rank}</p>
        </div>
        <div className="rounded-xl bg-white/[0.025] p-3">
          <p className="text-[10px] uppercase text-slate-600">Winrate</p>
          <p className="mt-1 font-bold text-emerald-400">{winrate}</p>
        </div>
      </div>
    </div>
  );
};

const ActivityItem = ({ icon: Icon, title, description, time }) => {
  return (
    <div className="flex gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
        <Icon size={16} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-slate-300">{title}</p>
        <p className="mt-0.5 text-xs text-slate-600">{description}</p>
        <p className="mt-1 flex items-center gap-1 text-[10px] text-slate-700">
          <Clock size={10} /> {time}
        </p>
      </div>
    </div>
  );
};

const Badge = ({ children, color = 'violet' }) => {
  const colors = {
    violet: 'bg-violet-500/10 text-violet-300 border-violet-500/20',
    cyan: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
  };
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${colors[color]}`}>
      {children}
    </span>
  );
};

// ============================================================
// COMPOSANT INPUT FIELD
// ============================================================
const InputField = ({ label, name, value, onChange, placeholder, type = 'text', rows = null, helper, className = '' }) => {
  const baseClass = `w-full p-3 rounded-xl bg-[#070e1a] border border-white/10 focus:border-violet-400 focus:ring-1 focus:ring-violet-400/30 text-white outline-none transition-all placeholder-slate-600 ${className}`;
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-sm font-medium text-slate-300">{label}</label>}
      {type === 'textarea' ? (
        <textarea name={name} value={value || ''} onChange={onChange} placeholder={placeholder} rows={rows || 4} className={`${baseClass} resize-none`} />
      ) : (
        <input type={type} name={name} value={value || ''} onChange={onChange} placeholder={placeholder} className={baseClass} />
      )}
      {helper && <p className="text-xs text-slate-500">{helper}</p>}
    </div>
  );
};

// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================

const Profile = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const [diplomaFile, setDiplomaFile] = useState(null);
  const [diplomaTitle, setDiplomaTitle] = useState('');

  // ============================================================
  // CHARGEMENT DU PROFIL
  // ============================================================
  useEffect(() => {
    if (user) {
      API.get('/accounts/profile/')
        .then(res => {
          setProfileData(res.data);
          setEditForm(res.data);
          setLoading(false);
        })
        .catch(err => {
          console.error("Erreur API profil:", err);
          setLoading(false);
        });
    }
  }, [user]);

  // ============================================================
  // HANDLERS
  // ============================================================
  const handleEditClick = () => {
    setIsEditing(true);
    setEditForm(profileData);
    setRemoveAvatar(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditForm(profileData);
    setAvatarFile(null);
    setAvatarPreview(null);
    setRemoveAvatar(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditForm({ ...editForm, [name]: value });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
      setRemoveAvatar(false);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    setRemoveAvatar(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const formData = new FormData();
      for (const key in editForm) {
        if (editForm[key] !== null && editForm[key] !== undefined) {
          if (key === 'experience_years' || key === 'hourly_rate') {
            formData.append(key, Number(editForm[key]) || 0);
          } else {
            formData.append(key, editForm[key]);
          }
        }
      }
      if (avatarFile) formData.append('avatar', avatarFile);
      if (removeAvatar) formData.append('remove_avatar', 'true');

      await API.put('/accounts/profile/update/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const res = await API.get('/accounts/profile/');
      setProfileData(res.data);
      setEditForm(res.data);
      setAvatarFile(null);
      setAvatarPreview(null);
      setRemoveAvatar(false);
      setIsEditing(false);
      alert("✅ Profil mis à jour avec succès !");
    } catch (error) {
      console.error("Erreur sauvegarde:", error);
      alert("❌ Erreur lors de la sauvegarde");
    }
    setSaving(false);
  };

  const handleUploadDiploma = async () => {
    if (!diplomaFile) return;
    const formData = new FormData();
    formData.append('file', diplomaFile);
    formData.append('title', diplomaTitle || 'Diplôme');
    await API.post('/accounts/diplomas/upload/', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    alert("✅ Diplôme ajouté !");
    setDiplomaFile(null);
    setDiplomaTitle('');
    const res = await API.get('/accounts/profile/');
    setProfileData(res.data);
  };

  const handleDeleteDiploma = async (id) => {
    await API.delete(`/accounts/diplomas/delete/${id}/`);
    alert("🗑️ Diplôme supprimé !");
    const res = await API.get('/accounts/profile/');
    setProfileData(res.data);
  };

  // ============================================================
  // RENDU
  // ============================================================
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020817]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-violet-400 mt-4">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020817] text-red-400">
        Profil introuvable
      </div>
    );
  }

  const isCoach = profileData.role === 'coach';
  const firstName = profileData.first_name || profileData.username || 'Utilisateur';
  const lastName = profileData.last_name || '';
  const username = profileData.username || '';
  const email = profileData.email || 'email@example.com';
  const avatar = avatarPreview || profileData.avatar || null;
  const level = profileData.skill_level || 'Débutant';
  const xp = profileData.experience_years || 0;
  const xpNext = 10;
  const xpProgress = Math.min(Math.round((xp / xpNext) * 100), 100);

  // Utilisation directe des données de l'API (sans valeurs par défaut fictives)
  const tournamentsCount = profileData.tournaments_count ?? 0;
  const wins = profileData.wins ?? 0;
  const points = profileData.points ?? 0;
  const averageScore = profileData.average_score ?? 0;

  return (
    <div className="min-h-screen bg-[#020817] text-white">
      <main className="ml-0 md:ml-[250px] min-h-screen px-4 md:px-8 py-6">

        {/* ===== HEADER ===== */}
        <div className="relative mb-6 overflow-hidden rounded-3xl border border-violet-500/10 bg-gradient-to-br from-violet-950/50 via-[#0b1324] to-[#07101f]">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-violet-600/10 blur-3xl" />
          <div className="absolute -bottom-32 left-1/3 h-64 w-64 rounded-full bg-indigo-600/10 blur-3xl" />

          <div className="relative p-6 md:p-8">
            <div className="flex flex-col gap-7 md:flex-row md:items-center">
              {/* Avatar */}
              <div className="relative mx-auto md:mx-0">
                <div className="h-28 w-28 overflow-hidden rounded-3xl border-2 border-violet-500/30 bg-gradient-to-br from-violet-600 to-indigo-700 p-[2px] shadow-2xl shadow-violet-950/40">
                  <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-[22px] bg-[#0a1220] text-4xl font-black text-violet-300">
                    {avatar ? (
                      <img src={avatar} alt="Avatar" className="h-full w-full object-cover" />
                    ) : (
                      firstName.charAt(0).toUpperCase()
                    )}
                  </div>
                </div>
                {isEditing && (
                  <>
                    <label
                      htmlFor="avatar-upload"
                      className="absolute -bottom-2 -right-2 flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border-4 border-[#0b1324] bg-violet-600 text-white shadow-lg hover:bg-violet-500 transition"
                    >
                      <Camera size={15} />
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarChange}
                      />
                    </label>
                    {avatar && (
                      <button
                        onClick={handleRemoveAvatar}
                        className="absolute -bottom-2 -right-12 flex h-9 w-9 items-center justify-center rounded-xl border-4 border-[#0b1324] bg-red-600/80 text-white shadow-lg hover:bg-red-500 transition"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </>
                )}
              </div>

              {/* Informations */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-wrap items-center justify-center gap-2 md:justify-start">
                  <Badge color="violet">
                    {isCoach ? '🏅 Coach' : '🎮 Joueur'}
                  </Badge>
                  <Badge color="amber">
                    <Crown size={11} className="mr-1" />
                    Niveau {level}
                  </Badge>
                </div>

                <h2 className="mt-3 text-3xl font-black text-white md:text-4xl">
                  {firstName} {lastName}
                </h2>
                <p className="mt-1 text-sm font-medium text-violet-400">@{username}</p>
                <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-500 md:mx-0">
                  {profileData.bio || 'Passionné de compétition eSport et membre de la communauté eSportsConnect.'}
                </p>

                <div className="mt-5 flex flex-wrap justify-center gap-3 md:justify-start">
                  {!isEditing ? (
                    <button
                      onClick={handleEditClick}
                      className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-violet-500"
                    >
                      <Edit3 size={15} /> Modifier le profil
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-emerald-500 disabled:opacity-50"
                      >
                        <Check size={15} /> {saving ? 'Enregistrement...' : 'Enregistrer'}
                      </button>
                      <button
                        onClick={handleCancel}
                        className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-2.5 text-xs font-semibold text-slate-300 transition hover:bg-white/[0.08]"
                      >
                        <X size={15} /> Annuler
                      </button>
                    </>
                  )}
                  {isCoach && (
                    <button
                      onClick={() => window.location.href = '/coach-dashboard'}
                      className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-2.5 text-xs font-semibold text-slate-300 transition hover:bg-white/[0.08] hover:text-white"
                    >
                      <Trophy size={15} /> Espace Coach
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* XP Progress */}
            <div className="mt-8 rounded-2xl border border-white/5 bg-black/10 p-5">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-400">Progression du niveau</p>
                  <p className="mt-1 text-[11px] text-slate-600">{xp} XP / {xpNext} XP</p>
                </div>
                <span className="text-sm font-black text-violet-400">{xpProgress}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-violet-600 to-indigo-500 transition-all duration-700"
                  style={{ width: `${xpProgress}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ===== STATISTIQUES (DONNÉES RÉELLES) ===== */}
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard 
            icon={Trophy} 
            label="Tournois" 
            value={tournamentsCount} 
            description="Participations" 
          />
          <StatCard 
            icon={Target} 
            label="Victoires" 
            value={wins} 
            description="Tournois remportés" 
          />
          <StatCard 
            icon={Award} 
            label="Points" 
            value={points} 
            description="Classement général" 
          />
          <StatCard 
            icon={Star} 
            label="Score moyen" 
            value={averageScore} 
            description="Performance globale" 
          />
        </section>

        {/* ===== CONTENU PRINCIPAL ===== */}
        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_330px]">
          {/* Colonne gauche */}
          <div className="space-y-6">

            {/* Informations personnelles */}
            <section className="rounded-2xl border border-white/5 bg-[#0a1220] p-5 md:p-6">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-white">Informations personnelles</h2>
                  <p className="mt-1 text-xs text-slate-600">Vos informations de compte</p>
                </div>
                {isEditing && (
                  <button
                    onClick={handleCancel}
                    className="rounded-xl bg-white/[0.04] p-2 text-slate-500 hover:text-white"
                  >
                    <Edit3 size={16} />
                  </button>
                )}
              </div>
              {!isEditing ? (
                <div className="grid gap-3 md:grid-cols-2">
                  <InfoItem icon={User} label="Nom complet" value={`${firstName} ${lastName}`} />
                  <InfoItem icon={User} label="Pseudo" value={`@${username}`} />
                  <InfoItem icon={Mail} label="Email" value={email} />
                  <InfoItem icon={Phone} label="Téléphone" value={profileData.phone || '+212 6 XX XX XX XX'} />
                  <InfoItem icon={MapPin} label="Région" value={profileData.region || 'Maroc'} />
                  <InfoItem icon={Calendar} label="Membre depuis" value={profileData.date_joined ? new Date(profileData.date_joined).toLocaleDateString('fr-FR') : '2026'} />
                </div>
              ) : (
                <div className="grid gap-3 md:grid-cols-2">
                  <InputField label="Prénom" name="first_name" value={editForm.first_name} onChange={handleChange} placeholder="Prénom" />
                  <InputField label="Nom" name="last_name" value={editForm.last_name} onChange={handleChange} placeholder="Nom" />
                  <InputField label="Téléphone" name="phone" value={editForm.phone} onChange={handleChange} placeholder="Téléphone" />
                  <InputField label="Région" name="region" value={editForm.region} onChange={handleChange} placeholder="Région" />
                  <InputField label="Bio" name="bio" value={editForm.bio} onChange={handleChange} placeholder="Bio" type="textarea" rows={2} className="md:col-span-2" />
                </div>
              )}
            </section>

            {/* Section joueur */}
            {!isCoach && (
              <>
                <section className="rounded-2xl border border-white/5 bg-[#0a1220] p-5 md:p-6">
                  <div className="mb-6 flex items-center justify-between">
                    <div>
                      <h2 className="font-bold text-white">Informations de jeu</h2>
                      <p className="mt-1 text-xs text-slate-600">Vos performances par jeu</p>
                    </div>
                  </div>
                  {!isEditing ? (
                    <div className="space-y-3">
                      <InfoItem icon={Gamepad2} label="Jeu principal" value={profileData.main_game} />
                      <InfoItem icon={Gamepad2} label="Jeux préférés" value={profileData.favorite_games} />
                      <InfoItem icon={Shield} label="Plateforme" value={profileData.platform} />
                      <InfoItem icon={Target} label="Niveau" value={profileData.skill_level} />
                      <InfoItem icon={Clock} label="Expérience" value={`${profileData.experience_years || 0} ans`} />
                      <InfoItem icon={Award} label="Objectifs" value={profileData.objectives} />
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <InputField label="Jeu principal" name="main_game" value={editForm.main_game} onChange={handleChange} placeholder="Jeu principal" />
                      <InputField label="Jeux préférés" name="favorite_games" value={editForm.favorite_games} onChange={handleChange} placeholder="Jeux préférés" />
                      <InputField label="Plateforme" name="platform" value={editForm.platform} onChange={handleChange} placeholder="Plateforme" />
                      <InputField label="Niveau" name="skill_level" value={editForm.skill_level} onChange={handleChange} placeholder="Niveau" />
                      <InputField label="Expérience (années)" name="experience_years" value={editForm.experience_years} onChange={handleChange} placeholder="Expérience" type="number" />
                      <InputField label="Objectifs" name="objectives" value={editForm.objectives} onChange={handleChange} placeholder="Objectifs" type="textarea" rows={2} />
                    </div>
                  )}
                </section>

                <section className="rounded-2xl border border-white/5 bg-[#0a1220] p-5 md:p-6">
                  <h2 className="mb-4 font-bold text-white">Badges obtenus</h2>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[
                      { icon: Trophy, name: "Premier tournoi" },
                      { icon: Medal, name: "Top 10" },
                      { icon: Crown, name: "Champion" },
                      { icon: Star, name: "Joueur 5★" }
                    ].map((badge) => {
                      const Icon = badge.icon;
                      return (
                        <div key={badge.name} className="group flex flex-col items-center rounded-2xl border border-white/5 bg-white/[0.02] p-4 text-center transition hover:border-violet-500/20">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-violet-600/20 to-indigo-600/10 text-violet-400">
                            <Icon size={21} />
                          </div>
                          <p className="mt-3 text-xs font-semibold text-slate-400">{badge.name}</p>
                        </div>
                      );
                    })}
                  </div>
                </section>
              </>
            )}

            {/* Section coach */}
            {isCoach && (
              <>
                <section className="rounded-2xl border border-white/5 bg-[#0a1220] p-5 md:p-6">
                  <div className="mb-6 flex items-center gap-3">
                    <Briefcase className="text-violet-400" size={20} />
                    <div>
                      <h2 className="font-bold text-white">Expertise Coach</h2>
                      <p className="text-xs text-slate-600">Vos compétences</p>
                    </div>
                  </div>
                  {!isEditing ? (
                    <div className="space-y-3">
                      <InfoItem icon={Target} label="Spécialité" value={profileData.specialty} />
                      <InfoItem icon={Gamepad2} label="Jeux maîtrisés" value={profileData.mastered_games} />
                      <InfoItem icon={Clock} label="Expérience" value={`${profileData.experience_years || 0} ans`} />
                      <InfoItem icon={Calendar} label="Disponibilités" value={profileData.availability} />
                      <InfoItem icon={DollarSign} label="Tarif horaire" value={profileData.hourly_rate ? `${profileData.hourly_rate} DH` : 'Non renseigné'} />
                      <div className="flex justify-between items-start text-sm py-2 border-b border-white/5 last:border-0">
                        <span className="text-slate-400">Liens</span>
                        <div className="text-right">
                          {profileData.portfolio_links ? (
                            profileData.portfolio_links.split(/[\n,]+/).map((link, i) => (
                              link.trim() && (
                                <a key={i} href={link.trim()} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline block text-xs">
                                  <Globe size={12} className="inline mr-1" /> Lien {i+1}
                                </a>
                              )
                            ))
                          ) : <span className="text-slate-500">Aucun lien</span>}
                        </div>
                      </div>
                      <InfoItem icon={User} label="Bio" value={profileData.bio} />
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <InputField label="Spécialité" name="specialty" value={editForm.specialty} onChange={handleChange} placeholder="Spécialité" />
                      <InputField label="Jeux maîtrisés" name="mastered_games" value={editForm.mastered_games} onChange={handleChange} placeholder="Jeux maîtrisés" />
                      <InputField label="Expérience (années)" name="experience_years" value={editForm.experience_years} onChange={handleChange} placeholder="Expérience" type="number" />
                      <InputField label="Disponibilités" name="availability" value={editForm.availability} onChange={handleChange} placeholder="Ex: Lundi, Mardi" helper="Séparez par des virgules" />
                      <InputField label="Tarif horaire" name="hourly_rate" value={editForm.hourly_rate} onChange={handleChange} placeholder="Tarif" type="number" />
                      <InputField label="Liens (un par ligne)" name="portfolio_links" value={editForm.portfolio_links} onChange={handleChange} placeholder="https://..." type="textarea" rows={2} />
                      <InputField label="Bio" name="bio" value={editForm.bio} onChange={handleChange} placeholder="Bio" type="textarea" rows={2} />
                    </div>
                  )}
                </section>

                {/* Diplômes */}
                <section className="rounded-2xl border border-white/5 bg-[#0a1220] p-5 md:p-6">
                  <div className="mb-6 flex items-center gap-3">
                    <GraduationCap className="text-violet-400" size={20} />
                    <div>
                      <h2 className="font-bold text-white">Diplômes</h2>
                      <p className="text-xs text-slate-600">Vos certifications</p>
                    </div>
                  </div>
                  <div className="space-y-2 mb-4">
                    {profileData.diplomas && profileData.diplomas.length > 0 ? (
                      profileData.diplomas.map(doc => (
                        <div key={doc.id} className="flex justify-between items-center bg-black/30 p-3 rounded-xl border border-white/10">
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-slate-400">📄</span>
                            <span className="text-white">{doc.title}</span>
                          </div>
                          <button onClick={() => handleDeleteDiploma(doc.id)} className="text-red-400 hover:text-red-300 transition">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))
                    ) : <p className="text-slate-500 text-sm">Aucun diplôme ajouté.</p>}
                  </div>
                  {isEditing && (
                    <div className="space-y-3">
                      <InputField label="Nom du diplôme" value={diplomaTitle} onChange={(e) => setDiplomaTitle(e.target.value)} placeholder="Nom du diplôme" />
                      <div className="flex items-center justify-center w-full">
                        <label className="flex items-center justify-center gap-2 w-full p-4 rounded-xl border-2 border-dashed border-white/20 bg-black/30 hover:bg-purple-500/10 cursor-pointer transition">
                          <Upload size={16} className="text-purple-400" />
                          <span className="text-slate-300 text-sm">{diplomaFile ? diplomaFile.name : "Choisir un fichier PDF"}</span>
                          <input type="file" accept=".pdf" className="hidden" onChange={(e) => setDiplomaFile(e.target.files[0])} />
                        </label>
                      </div>
                      <button onClick={handleUploadDiploma} className="w-full bg-purple-500 hover:bg-purple-400 text-black py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition">
                        <Plus size={16} /> Ajouter le diplôme
                      </button>
                    </div>
                  )}
                </section>
              </>
            )}
          </div>

          {/* Colonne droite */}
          <aside className="space-y-6">

            {/* Niveau / XP */}
            <section className="relative overflow-hidden rounded-2xl border border-violet-500/10 bg-gradient-to-br from-violet-950/40 to-[#0a1220] p-5">
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-violet-500/10 blur-2xl" />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500">Niveau actuel</p>
                    <h3 className="mt-1 text-3xl font-black text-white">{level}</h3>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-600/20 text-violet-400">
                    <Shield size={22} />
                  </div>
                </div>
                <div className="mt-5 h-2 rounded-full bg-white/5">
                  <div className="h-full rounded-full bg-gradient-to-r from-violet-600 to-indigo-500" style={{ width: `${xpProgress}%` }} />
                </div>
                <div className="mt-2 flex justify-between text-[10px] text-slate-600">
                  <span>{xp} XP</span>
                  <span>{xpNext} XP</span>
                </div>
              </div>
            </section>

            {/* Activité récente */}
            <section className="rounded-2xl border border-white/5 bg-[#0a1220] p-5">
              <div className="mb-6">
                <h2 className="font-bold">Activité récente</h2>
                <p className="mt-1 text-xs text-slate-600">Vos dernières actions</p>
              </div>
              <div className="space-y-5">
                <ActivityItem icon={Trophy} title="Participation au tournoi" description="PUBG Winter Cup" time="Il y a 2 heures" />
                <ActivityItem icon={BookOpen} title="Cours terminé" description="PUBG - Les fondamentaux" time="Hier" />
                <ActivityItem icon={Award} title="Nouveau badge obtenu" description="Top 10" time="Il y a 2 jours" />
                <ActivityItem icon={TrendingUp} title="Classement amélioré" description="+5 positions" time="Il y a 3 jours" />
              </div>
            </section>

            {/* Actions rapides */}
            <section className="rounded-2xl border border-white/5 bg-[#0a1220] p-5">
              <h2 className="mb-4 font-bold">Actions rapides</h2>
              <div className="space-y-2">
                <button onClick={() => window.location.href = '/tournaments'} className="flex w-full items-center gap-3 rounded-xl bg-white/[0.02] p-3 text-sm text-slate-400 hover:bg-white/[0.05] hover:text-white">
                  <Trophy size={17} className="text-violet-400" /> Trouver un tournoi <ChevronRight size={15} className="ml-auto" />
                </button>
                <button onClick={() => window.location.href = '/courses'} className="flex w-full items-center gap-3 rounded-xl bg-white/[0.02] p-3 text-sm text-slate-400 hover:bg-white/[0.05] hover:text-white">
                  <BookOpen size={17} className="text-cyan-400" /> Découvrir les cours <ChevronRight size={15} className="ml-auto" />
                </button>
                <button onClick={() => window.location.href = '/inbox'} className="flex w-full items-center gap-3 rounded-xl bg-white/[0.02] p-3 text-sm text-slate-400 hover:bg-white/[0.05] hover:text-white">
                  <MessageSquare size={17} className="text-emerald-400" /> Mes messages <ChevronRight size={15} className="ml-auto" />
                </button>
              </div>
            </section>

          </aside>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-white/5 text-center text-[10px] text-slate-600 tracking-[0.2em] font-light">
          <p>eSportsConnect • Mon profil • © 2026</p>
        </div>

      </main>
    </div>
  );
};

export default Profile;