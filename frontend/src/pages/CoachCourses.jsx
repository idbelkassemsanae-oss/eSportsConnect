import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from '../context/RouterContext';
import { useAuth } from '../context/AuthContext';
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  Eye,
  Users,
  Clock,
  Trophy,
  BookOpen,
  Filter,
  ChevronDown,
  Sparkles,
  Gamepad2,
  User,
  Calendar,
  Play,
  UserPlus,
  CheckCircle2
} from 'lucide-react';
import API from '../services/api';

// ============================================================
// IMPORT DES IMAGES DE JEUX
// ============================================================
import heroBg from '../assets/banners/hero-bg.png';
import valorantImg from '../assets/games/valorant.png';
import lolImg from '../assets/games/LeagueofLegends.png';
import csgoImg from '../assets/games/CSGO.png';
import dota2Img from '../assets/games/Dota2.png';
import fortniteImg from '../assets/games/Fortnite.png';
import overwatchImg from '../assets/games/Overwatch2.png';
import rocketLeagueImg from '../assets/games/RocketLeague.png';
import pubgImg from '../assets/games/PUBG.png';
import codImg from '../assets/games/CallofDuty.png';
import fifaImg from '../assets/games/FIFA.png';
import amongUsImg from '../assets/games/AmongUs.png';
import apexImg from '../assets/games/ApexLegends.png';
import freefireImg from '../assets/games/FreeFire.png';
import genshinImg from '../assets/games/GenshinImpact.png';
import hearthstoneImg from '../assets/games/Hearthstone.png';
import magicImg from '../assets/games/MagicTheGathering.png';
import minecraftImg from '../assets/games/Minecraft.png';
import mobileLegendsImg from '../assets/games/MobileLegends.png';
import mortalKombatImg from '../assets/games/MortalKombat.png';
import nba2kImg from '../assets/games/NBA2K.png';
import rainbowSixImg from '../assets/games/RainbowSixSiege.png';
import starcraftImg from '../assets/games/StarCraftII.png';
import streetFighterImg from '../assets/games/StreetFighter.png';
import smashBrosImg from '../assets/games/SuperSmashBros.png';
import tekkenImg from '../assets/games/Tekken.png';
import wildRiftImg from '../assets/games/WildRift.png';
import wowImg from '../assets/games/WorldofWarcraft.png';

// ============================================================
// FONCTION MAPPING DES JEUX
// ============================================================
const getGameImage = (gameName) => {
  if (!gameName || typeof gameName !== 'string') return heroBg;
  const normalized = gameName.toLowerCase().replace(/[^a-z0-9]/g, '');
  const mapping = {
    'amongus': amongUsImg,
    'apexlegends': apexImg,
    'callofduty': codImg,
    'csgo': csgoImg,
    'dota2': dota2Img,
    'fifa': fifaImg,
    'fortnite': fortniteImg,
    'freefire': freefireImg,
    'genshinimpact': genshinImg,
    'hearthstone': hearthstoneImg,
    'leagueoflegends': lolImg,
    'magicthegathering': magicImg,
    'minecraft': minecraftImg,
    'mobilelegends': mobileLegendsImg,
    'mortalkombat': mortalKombatImg,
    'nba2k': nba2kImg,
    'overwatch2': overwatchImg,
    'overwatch': overwatchImg,
    'pubg': pubgImg,
    'rainbowsixsiege': rainbowSixImg,
    'rocketleague': rocketLeagueImg,
    'starcraftii': starcraftImg,
    'streetfighter': streetFighterImg,
    'supersmashbros': smashBrosImg,
    'tekken': tekkenImg,
    'valorant': valorantImg,
    'wildrift': wildRiftImg,
    'worldofwarcraft': wowImg,
  };
  return mapping[normalized] || heroBg;
};

// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================
const CoachCourses = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      const res = await API.get('/courses/mine/');
      const data = Array.isArray(res.data) ? res.data : (res.data.results || []);
      setCourses(data);
    } catch (err) {
      console.error("Erreur API cours:", err);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleDelete = async (id) => {
    if (!window.confirm('Voulez-vous vraiment supprimer ce cours ?')) return;
    try {
      await API.delete(`/courses/${id}/`);
      setCourses(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la suppression du cours.');
    }
  };

  const filteredCourses = useMemo(() => {
    let filtered = courses;
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(c => 
        (c.title || '').toLowerCase().includes(searchLower) ||
        (c.description || '').toLowerCase().includes(searchLower) ||
        (c.game_name || c.game || c.jeu || '').toLowerCase().includes(searchLower)
      );
    }
    if (status === 'active') {
      filtered = filtered.filter(c => c.is_active !== false);
    } else if (status === 'inactive') {
      filtered = filtered.filter(c => c.is_active === false);
    }
    return filtered;
  }, [courses, search, status]);

  // Calcul des totaux
  const totalStudents = courses.reduce((acc, c) => acc + (c.students_count || 0), 0);
  const totalCourses = courses.length;
  const activeCourses = courses.filter(c => c.is_active !== false).length;

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

  return (
    <div className="min-h-screen bg-[#020817] text-white">
      <main className="ml-0 md:ml-[250px] min-h-screen px-4 md:px-8 py-6">

        {/* ===== HEADER ===== */}
        <div className="relative overflow-hidden mb-8 rounded-3xl bg-gradient-to-r from-violet-950/30 via-purple-950/20 to-cyan-950/30 p-8 border border-white/5">
          <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse animation-delay-200" />
          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-violet-400 text-xs font-semibold uppercase tracking-wider mb-2">
                <Sparkles className="w-4 h-4" />
                Espace Coach
              </div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                Mes cours
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                Gérez vos formations et accompagnez vos joueurs.
              </p>
            </div>
            <button
              onClick={() => navigate('create-course')}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-500 hover:from-violet-500 hover:to-purple-400 transition px-5 py-3 text-sm font-bold shadow-lg shadow-violet-600/20"
            >
              <Plus size={18} />
              Créer un cours
            </button>
          </div>
        </div>

        {/* ===== STATISTIQUES ===== */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-white">{totalCourses}</p>
            <p className="text-xs text-slate-500 uppercase tracking-wider">Total cours</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-emerald-400">{activeCourses}</p>
            <p className="text-xs text-slate-500 uppercase tracking-wider">Actifs</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-amber-400">{courses.length - activeCourses}</p>
            <p className="text-xs text-slate-500 uppercase tracking-wider">Inactifs</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-cyan-400">{totalStudents}</p>
            <p className="text-xs text-slate-500 uppercase tracking-wider">Étudiants</p>
          </div>
        </div>

        {/* ===== BARRE DE RECHERCHE ===== */}
        <div className="rounded-2xl border border-white/5 bg-white/5 backdrop-blur-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="text"
                placeholder="Rechercher un cours..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl bg-[#050b16] border border-white/10 pl-12 pr-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-500/60 transition"
              />
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="appearance-none rounded-xl bg-[#050b16] border border-white/10 pl-9 pr-10 py-3 text-sm text-white focus:outline-none focus:border-violet-500/60"
                >
                  <option value="all">Tous</option>
                  <option value="active">Actifs</option>
                  <option value="inactive">Inactifs</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
              </div>
              <button
                onClick={fetchCourses}
                className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition"
                title="Rafraîchir"
              >
                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* ===== LISTE DES COURS ===== */}
        {filteredCourses.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-[#080f1d] py-20 text-center">
            <BookOpen className="w-16 h-16 text-slate-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold">Aucun cours trouvé</h3>
            <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
              {search || status !== 'all'
                ? 'Aucun cours ne correspond à vos critères.'
                : 'Commencez par créer votre premier cours.'}
            </p>
            {!search && status === 'all' && (
              <button
                onClick={() => navigate('create-course')}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-500 transition px-5 py-3 text-sm font-bold"
              >
                <Plus size={17} />
                Créer un cours
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredCourses.map((course) => {
              const isActive = course.is_active !== false;
              const game = course.game_name || course.game || course.jeu || 'Général';
              const level = course.difficulty_level || course.niveau || course.level || 'Débutant';
              const duration = course.duration || course.duree || '30';
              const students = course.students_count || 0;
              const image = getGameImage(game);

              return (
                <div
                  key={course.id}
                  className="group rounded-2xl border border-white/5 bg-[#080f1d] overflow-hidden hover:border-violet-500/30 hover:-translate-y-1 transition-all duration-300"
                >
                  {/* Image du jeu */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={image}
                      alt={game}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      onError={(e) => { e.currentTarget.src = heroBg; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#080f1d] via-transparent to-transparent" />
                    
                    {/* Badge statut */}
                    <div className="absolute top-4 left-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${
                        isActive
                          ? 'bg-emerald-500/80 text-white border-emerald-500/30'
                          : 'bg-amber-500/80 text-white border-amber-500/30'
                      }`}>
                        {isActive ? 'Actif' : 'Inactif'}
                      </span>
                    </div>
                    
                    {/* Nom du jeu */}
                    <div className="absolute bottom-4 left-4 right-4">
                      <span className="px-3 py-1 rounded-lg bg-black/60 backdrop-blur-md text-xs font-bold text-white flex items-center gap-1.5 w-fit">
                        <Gamepad2 className="w-3.5 h-3.5 text-violet-400" />
                        {game}
                      </span>
                    </div>

                    {/* Icône play au survol */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                      <div className="w-16 h-16 rounded-full bg-violet-600/90 shadow-xl shadow-violet-900/40 flex items-center justify-center backdrop-blur-sm">
                        <Play className="w-7 h-7 ml-1 text-white" fill="currentColor" />
                      </div>
                    </div>
                  </div>

                  {/* Corps de la carte */}
                  <div className="p-5">
                    <h3 className="font-bold text-lg text-white group-hover:text-violet-300 transition line-clamp-1">
                      {course.title}
                    </h3>
                    <p className="text-sm text-slate-500 line-clamp-2 mt-1 min-h-[40px]">
                      {course.description || 'Aucune description'}
                    </p>

                    {/* Badges informations */}
                    <div className="flex flex-wrap gap-2 mt-4">
                      <span className="rounded-lg bg-white/[0.04] px-2.5 py-1 text-[11px] text-slate-400">
                        {level}
                      </span>
                      <span className="flex items-center gap-1 rounded-lg bg-white/[0.04] px-2.5 py-1 text-[11px] text-slate-400">
                        <Clock size={12} />
                        {duration} min
                      </span>
                      {/* Affichage du nombre d'étudiants avec icône */}
                      <span className="flex items-center gap-1 rounded-lg bg-cyan-500/10 text-cyan-400 px-2.5 py-1 text-[11px] font-semibold">
                        <Users size={12} />
                        {students}
                      </span>
                      {course.price > 0 && (
                        <span className="flex items-center gap-1 rounded-lg bg-yellow-500/10 text-yellow-400 px-2.5 py-1 text-[11px] font-semibold">
                          {course.price} DH
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="mt-5 flex gap-2 border-t border-white/5 pt-4">
                      <button
                        onClick={() => navigate(`course-detail/${course.id}`)}
                        className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] py-2.5 text-xs font-medium text-slate-300 transition"
                      >
                        <Eye size={15} />
                        Voir
                      </button>
                      <button
                        onClick={() => navigate(`edit-course/${course.id}`)}
                        className="px-3 py-2.5 rounded-xl bg-violet-600/10 hover:bg-violet-600/20 text-violet-400 transition"
                      >
                        <Edit3 size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(course.id)}
                        className="px-3 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    {/* Lien vers les demandes avec compteur */}
                    <div className="mt-3 flex justify-end">
                      <button
                        onClick={() => navigate(`coach-requests/${course.id}`)}
                        className="text-xs text-cyan-400 hover:text-cyan-300 transition flex items-center gap-1.5"
                      >
                        <UserPlus size={13} />
                        Demandes
                        {/* On peut ajouter un compteur si on récupère les demandes, mais on ne les a pas dans ce contexte */}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ===== PIED DE PAGE ===== */}
        <div className="mt-12 pt-6 border-t border-white/5 text-center text-[10px] text-slate-600 tracking-[0.2em] font-light">
          <p>eSportsConnect • Mes cours • © 2026</p>
        </div>

      </main>
    </div>
  );
};

export default CoachCourses;