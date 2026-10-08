import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from '../context/RouterContext';
import { useAuth } from '../context/AuthContext';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Edit3,
  Eye,
  Gamepad2,
  Grid3X3,
  List,
  Loader2,
  Plus,
  Search,
  Sparkles,
  Trash2,
  Users,
  Video,
  FileText,
  ArrowRight,
  Hourglass,
  XCircle,
  Award,
  TrendingUp,
  Zap
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
// COMPOSANTS RÉUTILISABLES
// ============================================================

const StatCard = ({ icon, label, value, color = 'violet' }) => {
  const colors = {
    violet: 'from-violet-500/20 to-purple-500/10 border-violet-500/20',
    emerald: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/20',
    amber: 'from-amber-500/20 to-yellow-500/10 border-amber-500/20',
    rose: 'from-rose-500/20 to-pink-500/10 border-rose-500/20',
    cyan: 'from-cyan-500/20 to-blue-500/10 border-cyan-500/20'
  };

  const iconColors = {
    violet: 'text-violet-400',
    emerald: 'text-emerald-400',
    amber: 'text-amber-400',
    rose: 'text-rose-400',
    cyan: 'text-cyan-400'
  };

  return (
    <div className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br ${colors[color]} backdrop-blur-sm p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-${color}-500/5 group`}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-${color}-500/5 rounded-full blur-2xl -translate-y-10 translate-x-10" />
      <div className="relative z-10 flex items-start justify-between">
        <div>
          <p className="text-3xl md:text-4xl font-black text-white">{value}</p>
          <p className="text-sm text-slate-400 mt-1.5 font-medium">{label}</p>
        </div>
        <div className={`w-12 h-12 rounded-2xl bg-white/5 backdrop-blur-sm flex items-center justify-center ${iconColors[color]} group-hover:scale-110 transition-transform`}>
          {React.cloneElement(icon, { className: 'w-6 h-6' })}
        </div>
      </div>
    </div>
  );
};

const FilterSelect = ({ value, onChange, options }) => (
  <div className="flex p-1 rounded-xl bg-[#050b16] border border-white/5">
    {options.map(([val, label]) => (
      <button
        key={val}
        onClick={() => onChange(val)}
        className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
          value === val
            ? 'bg-gradient-to-r from-violet-600 to-purple-500 text-white shadow-lg shadow-violet-500/25'
            : 'text-slate-500 hover:text-white'
        }`}
      >
        {label}
      </button>
    ))}
  </div>
);

const ViewToggle = ({ view, onChange }) => (
  <div className="hidden sm:flex p-1 rounded-xl bg-[#050b16] border border-white/5">
    <button
      onClick={() => onChange('grid')}
      className={`p-2 rounded-lg transition ${
        view === 'grid'
          ? 'bg-gradient-to-r from-violet-600 to-purple-500 text-white shadow-lg shadow-violet-500/25'
          : 'text-slate-500 hover:text-white'
      }`}
    >
      <Grid3X3 className="w-4 h-4" />
    </button>
    <button
      onClick={() => onChange('list')}
      className={`p-2 rounded-lg transition ${
        view === 'list'
          ? 'bg-gradient-to-r from-violet-600 to-purple-500 text-white shadow-lg shadow-violet-500/25'
          : 'text-slate-500 hover:text-white'
      }`}
    >
      <List className="w-4 h-4" />
    </button>
  </div>
);

// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================

const MyCourses = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [view, setView] = useState('grid');

  const isCoach = user?.role === 'coach';

  // ============================================================
  // CHARGEMENT DES DONNÉES
  // ============================================================
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const res = await API.get('/courses/my-courses/');
        setCourses(Array.isArray(res.data) ? res.data : []);
        setError(null);
      } catch (err) {
        console.error('Erreur chargement mes cours:', err);
        setCourses([]);
        setError('Impossible de charger vos cours.');
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  // ============================================================
  // STATISTIQUES
  // ============================================================
  const stats = useMemo(() => {
    const total = courses.length;
    const approved = courses.filter(c => c.status === 'approved' || !c.status).length;
    const pending = courses.filter(c => c.status === 'pending').length;
    const rejected = courses.filter(c => c.status === 'rejected').length;
    return { total, approved, pending, rejected };
  }, [courses]);

  // ============================================================
  // FILTRAGE
  // ============================================================
  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const title = course.title || course.titre || '';
      const searchMatch = title.toLowerCase().includes(search.toLowerCase());

      let statusMatch = true;
      if (filter === 'approved') statusMatch = course.status === 'approved' || !course.status;
      else if (filter === 'pending') statusMatch = course.status === 'pending';
      else if (filter === 'rejected') statusMatch = course.status === 'rejected';

      return searchMatch && statusMatch;
    });
  }, [courses, search, filter]);

  // ============================================================
  // GESTION DE LA DÉSINSCRIPTION
  // ============================================================
  const handleDelete = async (id) => {
    if (!window.confirm('Voulez-vous vraiment vous désinscrire de ce cours ?')) return;
    try {
      await API.delete(`/courses/${id}/enroll/`);
      setCourses(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la désinscription.');
    }
  };

  // ============================================================
  // RENDU
  // ============================================================
  if (loading) {
    return (
      <div className="min-h-screen bg-[#030712] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-violet-500 animate-spin mx-auto" />
          <p className="text-slate-400 mt-4">Chargement de vos cours...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#030712] flex items-center justify-center text-red-400">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030712] text-white">
      <main className="ml-0 md:ml-[250px] min-h-screen">

        {/* ===== HEADER AVEC BANDE DÉGRADÉE ===== */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-900/30 via-purple-900/20 to-cyan-900/20" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse animation-delay-200" />
          
          <div className="relative z-10 max-w-[1450px] mx-auto px-5 md:px-8 py-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 text-violet-400 text-xs font-semibold uppercase tracking-wider mb-2">
                  <Sparkles className="w-4 h-4" />
                  {isCoach ? 'Espace Coach' : 'Mon apprentissage'}
                </div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                  Mes cours
                </h1>
                <p className="text-slate-400 mt-2 text-lg font-light">
                  {isCoach
                    ? 'Gérez vos formations et accompagnez vos joueurs.'
                    : 'Suivez votre progression et vos apprentissages.'}
                </p>
              </div>
              {isCoach && (
                <button
                  onClick={() => navigate('create-course')}
                  className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-500 hover:from-violet-500 hover:to-purple-400 transition font-bold flex items-center justify-center gap-2 shadow-lg shadow-violet-600/30 hover:shadow-violet-500/40"
                >
                  <Plus className="w-5 h-5" />
                  Créer un cours
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-[1450px] mx-auto px-5 md:px-8 py-8">

          {/* ===== STATISTIQUES MODERNES ===== */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            <StatCard icon={<BookOpen />} label="Total des cours" value={stats.total} color="violet" />
            <StatCard icon={<CheckCircle2 />} label="Approuvés" value={stats.approved} color="emerald" />
            {stats.pending > 0 && (
              <StatCard icon={<Hourglass />} label="En attente" value={stats.pending} color="amber" />
            )}
            {stats.rejected > 0 && (
              <StatCard icon={<XCircle />} label="Refusés" value={stats.rejected} color="rose" />
            )}
          </div>

          {/* ===== TOOLBAR ===== */}
          <div className="rounded-2xl border border-white/5 bg-white/5 backdrop-blur-sm p-4 mb-6">
            <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
              <div className="relative flex-1 max-w-xl">
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
                <FilterSelect
                  value={filter}
                  onChange={setFilter}
                  options={[
                    ['all', 'Tous'],
                    ['approved', 'Approuvés'],
                    ['pending', 'En attente'],
                    ['rejected', 'Refusés']
                  ]}
                />
                <ViewToggle view={view} onChange={setView} />
              </div>
            </div>
          </div>

          {/* ===== LISTE DES COURS ===== */}
          {filteredCourses.length === 0 ? (
            <EmptyState
              search={search}
              onCreate={() => navigate('courses')}
              isCoach={isCoach}
            />
          ) : view === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  onView={() => navigate(`course-detail/${course.id}`)}
                  onEdit={isCoach ? () => navigate(`edit-course/${course.id}`) : undefined}
                  onDelete={isCoach ? () => handleDelete(course.id) : undefined}
                  isCoach={isCoach}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredCourses.map((course) => (
                <CourseListItem
                  key={course.id}
                  course={course}
                  onView={() => navigate(`course-detail/${course.id}`)}
                  onEdit={isCoach ? () => navigate(`edit-course/${course.id}`) : undefined}
                  onDelete={isCoach ? () => handleDelete(course.id) : undefined}
                  isCoach={isCoach}
                />
              ))}
            </div>
          )}
        </div>

        {/* ===== FOOTER ===== */}
        <div className="max-w-[1450px] mx-auto px-5 md:px-8 pb-6 pt-4 border-t border-white/5 text-center text-[10px] text-slate-600 tracking-[0.2em] font-light">
          <p>eSportsConnect • Mes cours • © 2026</p>
        </div>
      </main>
    </div>
  );
};

// ============================================================
// COMPOSANT CARTE (grille)
// ============================================================
const CourseCard = ({ course, onView, onEdit, onDelete, isCoach }) => {
  const title = course.title || course.titre || 'Cours sans titre';
  const game = course.game_name || course.jeu || course.game || 'Général';
  const level = course.difficulty_level || course.niveau || course.level || 'Débutant';
  const type = course.course_type || course.type || 'Formation';
  const status = course.status || null;
  const students = course.students_count || course.nombre_inscrits || 0;
  const image = getGameImage(game);

  const statusConfig = {
    pending: { label: 'En attente', bg: 'bg-yellow-500/15', text: 'text-yellow-400', border: 'border-yellow-500/20' },
    approved: { label: 'Approuvé', bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/20' },
    rejected: { label: 'Refusé', bg: 'bg-red-500/15', text: 'text-red-400', border: 'border-red-500/20' }
  };
  const statusInfo = status ? statusConfig[status] : statusConfig.approved;

  return (
    <article className="group relative rounded-2xl border border-white/5 bg-[#080f1d] overflow-hidden hover:border-violet-500/30 hover:shadow-xl hover:shadow-violet-500/5 transition-all duration-300">
      <div className="relative aspect-[16/9] overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
          onError={(e) => { e.currentTarget.src = heroBg; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080f1d] via-transparent to-transparent" />
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="px-2.5 py-1.5 rounded-lg bg-black/60 backdrop-blur-md text-xs font-semibold">
            {type}
          </span>
        </div>
        <div className="absolute top-3 right-3">
          <span className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase border ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border}`}>
            {statusInfo.label}
          </span>
        </div>
        <button
          onClick={onView}
          className="absolute bottom-3 right-3 w-9 h-9 rounded-xl bg-white/10 backdrop-blur-md hover:bg-violet-600 transition flex items-center justify-center"
        >
          <Eye className="w-4 h-4" />
        </button>
      </div>

      <div className="p-5">
        <h3 className="font-bold text-lg line-clamp-1 group-hover:text-violet-300 transition">
          {title}
        </h3>
        <p className="text-sm text-slate-500 line-clamp-2 mt-2 min-h-[40px]">
          {course.description || 'Découvrez cette formation eSports.'}
        </p>
        <div className="flex items-center gap-3 mt-4 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <Gamepad2 className="w-3.5 h-3.5 text-violet-400" />
            {game}
          </span>
          <span>•</span>
          <span>{level}</span>
        </div>
        <div className="flex items-center justify-between mt-5 pt-4 border-t border-white/5">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Users className="w-4 h-4" />
            {students} inscrits
          </div>
          <div className="flex items-center gap-1">
            {isCoach && (
              <>
                <button
                  onClick={onEdit}
                  className="w-9 h-9 rounded-lg hover:bg-violet-500/10 text-slate-500 hover:text-violet-400 transition flex items-center justify-center"
                  title="Modifier"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={onDelete}
                  className="w-9 h-9 rounded-lg hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition flex items-center justify-center"
                  title="Supprimer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};

// ============================================================
// COMPOSANT CARTE (liste)
// ============================================================
const CourseListItem = ({ course, onView, onEdit, onDelete, isCoach }) => {
  const title = course.title || course.titre || 'Cours sans titre';
  const game = course.game_name || course.jeu || course.game || 'Général';
  const status = course.status || null;
  const image = getGameImage(game);

  const statusLabel = status === 'pending' ? 'En attente' : status === 'rejected' ? 'Refusé' : 'Approuvé';
  const statusClass = status === 'pending' ? 'bg-yellow-500/10 text-yellow-400' :
                      status === 'rejected' ? 'bg-red-500/10 text-red-400' :
                      'bg-emerald-500/10 text-emerald-400';

  return (
    <div className="group rounded-2xl border border-white/5 bg-[#080f1d] p-4 flex flex-col md:flex-row md:items-center gap-4 hover:border-violet-500/30 hover:shadow-xl hover:shadow-violet-500/5 transition-all duration-300">
      <img
        src={image}
        alt={title}
        className="w-full md:w-36 h-24 rounded-xl object-cover group-hover:scale-105 transition duration-300"
        onError={(e) => { e.currentTarget.src = heroBg; }}
      />
      <div className="flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-bold group-hover:text-violet-300 transition">{title}</h3>
          <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${statusClass}`}>
            {statusLabel}
          </span>
        </div>
        <p className="text-sm text-slate-500 mt-1 line-clamp-1">
          {course.description || 'Formation eSports'}
        </p>
        <div className="flex gap-4 mt-3 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Gamepad2 className="w-3 h-3 text-violet-400" />
            {game}
          </span>
          <span>{course.difficulty_level || course.niveau || course.level || 'Débutant'}</span>
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            {course.students_count || course.nombre_inscrits || 0}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onView}
          className="px-3 py-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.07] text-slate-300 transition text-xs font-medium flex items-center gap-2"
        >
          <Eye className="w-4 h-4" />
          Voir
        </button>
        {isCoach && (
          <>
            <button
              onClick={onEdit}
              className="px-3 py-2 rounded-lg bg-violet-500/10 hover:bg-violet-500/20 text-violet-400 transition text-xs font-medium flex items-center gap-2"
            >
              <Edit3 className="w-4 h-4" />
              Modifier
            </button>
            <button
              onClick={onDelete}
              className="w-9 h-9 rounded-lg bg-red-500/5 hover:bg-red-500/10 text-red-400 flex items-center justify-center"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

// ============================================================
// ÉTAT VIDE
// ============================================================
const EmptyState = ({ search, onCreate, isCoach }) => (
  <div className="rounded-2xl border border-dashed border-white/10 bg-[#080f1d] py-20 text-center">
    <div className="w-16 h-16 rounded-2xl bg-violet-500/10 text-violet-400 flex items-center justify-center mx-auto mb-5">
      <BookOpen className="w-8 h-8" />
    </div>
    <h3 className="text-lg font-bold">
      {search ? 'Aucun cours trouvé' : 'Vous n\'avez pas encore de cours'}
    </h3>
    <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
      {search
        ? 'Essayez une autre recherche.'
        : isCoach
          ? 'Créez votre première formation et partagez votre expertise avec la communauté.'
          : 'Parcourez le catalogue et inscrivez-vous à des cours.'}
    </p>
    {!search && (
      <button
        onClick={onCreate}
        className="mt-6 px-5 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-purple-500 hover:from-violet-500 hover:to-purple-400 transition font-bold inline-flex items-center gap-2 shadow-lg shadow-violet-600/30"
      >
        {isCoach ? (
          <>
            <Plus className="w-5 h-5" />
            Créer mon premier cours
          </>
        ) : (
          <>
            <BookOpen className="w-5 h-5" />
            Découvrir les cours
          </>
        )}
      </button>
    )}
  </div>
);

export default MyCourses;