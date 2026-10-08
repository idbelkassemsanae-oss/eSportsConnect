import React, { useState, useEffect } from 'react';
import { useNavigate } from '../context/RouterContext';
import { useAuth } from '../context/AuthContext';
import {
  Search,
  Grid3X3,
  List,
  Loader2,
  Play,
  Sparkles,
  Trophy,
  Users,
  Clock,
  Gamepad2,
  BookOpen,
  Star,
  User,
  ChevronDown,
  Filter,
  X
} from 'lucide-react';
import API from '../services/api';

// =================================================
// IMPORT DES IMAGES DE JEUX
// =================================================
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

// =================================================
// FONCTION MAPPING DES JEUX
// =================================================
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

// =================================================
// NORMALISATION DES NIVEAUX
// =================================================
const normalizeLevel = (level) => {
  if (!level) return 'Débutant';
  const levelMap = {
    'beginner': 'Débutant',
    'intermediate': 'Intermédiaire',
    'advanced': 'Avancé',
    'expert': 'Expert',
    'debutant': 'Débutant',
    'intermediaire': 'Intermédiaire',
    'avance': 'Avancé',
  };
  return levelMap[level.toLowerCase().trim()] || level;
};

// =================================================
// COMPOSANT CARTE (grille uniquement)
// =================================================
const CourseCard = ({ course, onClick }) => {
  const difficultyColors = {
    'Débutant': 'bg-green-500/10 text-green-400 border-green-500/20',
    'Intermédiaire': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    'Avancé': 'bg-red-500/10 text-red-400 border-red-500/20',
    'Expert': 'bg-purple-500/10 text-purple-400 border-purple-500/20'
  };

  const title = course.title || course.titre || 'Cours sans titre';
  const description = course.description || 'Aucune description';
  const game = course.game_name || course.game || course.jeu || 'Général';
  const level = normalizeLevel(course.difficulty_level || course.level || course.niveau);
  const duration = course.duration || course.duree || '30 min';
  const coach = course.coach_username || course.coach_name || 'Coach';
  const students = course.students_count || course.nombre_inscrits || 0;
  const image = getGameImage(game);

  return (
    <div
      onClick={() => onClick(course.id)}
      className="group cursor-pointer rounded-2xl border border-white/5 bg-[#080f1d] overflow-hidden hover:border-violet-500/30 hover:-translate-y-1 transition-all duration-300"
    >
      <div className="relative aspect-[16/9] overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
          onError={(e) => { e.currentTarget.src = heroBg; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080f1d] via-transparent to-transparent" />
        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-bold text-white">
            {course.type || 'Formation'}
          </span>
        </div>
        <div className="absolute top-3 right-3">
          <span className="px-2.5 py-1.5 rounded-lg bg-violet-600/80 backdrop-blur-md text-[10px] font-bold text-white flex items-center gap-1.5">
            <Gamepad2 className="w-3 h-3" />
            {game}
          </span>
        </div>
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
          <div className="w-14 h-14 rounded-full bg-violet-600/90 shadow-xl shadow-violet-900/40 flex items-center justify-center">
            <Play className="w-6 h-6 ml-1 text-white" fill="currentColor" />
          </div>
        </div>
      </div>
      <div className="p-5">
        <div className="flex items-center gap-2 mb-2">
          <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded border ${difficultyColors[level] || 'text-slate-400'}`}>
            {level}
          </span>
          <span className="text-slate-700">•</span>
          <span className="text-[10px] text-slate-600">{duration}</span>
        </div>
        <h3 className="text-lg font-bold line-clamp-1 group-hover:text-violet-300 transition">
          {title}
        </h3>
        <p className="text-sm text-slate-500 line-clamp-2 mt-2 leading-relaxed">
          {description}
        </p>
        <div className="flex items-center gap-3 mt-4">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-cyan-400 flex items-center justify-center text-xs font-bold text-white">
            {coach.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold truncate">{coach}</p>
            <p className="text-[10px] text-slate-600">Coach</p>
          </div>
        </div>
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              {students}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              {duration}
            </span>
          </div>
          <span className="text-xs text-violet-400 font-semibold group-hover:text-violet-300 transition">
            Voir →
          </span>
        </div>
      </div>
    </div>
  );
};

// =================================================
// FILTER SELECT
// =================================================
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
        <option key={option} value={option} className="bg-[#080f1d]">
          {option}
        </option>
      ))}
    </select>
    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 pointer-events-none" />
  </div>
);

// =================================================
// FILTER BADGE
// =================================================
const FilterBadge = ({ label, onRemove }) => (
  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-violet-500/10 border border-violet-500/15 text-violet-300 text-xs">
    {label}
    <button onClick={onRemove} className="hover:text-white transition">
      <X className="w-3 h-3" />
    </button>
  </span>
);

// =================================================
// EMPTY STATE
// =================================================
const EmptyCourses = ({ onReset, hasFilters }) => (
  <div className="rounded-2xl border border-dashed border-white/10 bg-[#080f1d] py-20 text-center">
    <div className="w-16 h-16 rounded-2xl bg-violet-500/10 text-violet-400 flex items-center justify-center mx-auto mb-4">
      <BookOpen className="w-8 h-8" />
    </div>
    <h3 className="text-xl font-bold">Aucun cours trouvé</h3>
    <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
      {hasFilters
        ? "Aucun cours ne correspond à vos critères de recherche."
        : "Les cours seront bientôt disponibles."}
    </p>
    {hasFilters && (
      <button
        onClick={onReset}
        className="mt-6 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 transition font-medium text-sm"
      >
        Réinitialiser les filtres
      </button>
    )}
  </div>
);

// =================================================
// PAGE PRINCIPALE
// =================================================
const Courses = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [allCourses, setAllCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('Tous');
  const [filterGame, setFilterGame] = useState('Tous');
  const [error, setError] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [gameOptions, setGameOptions] = useState(['Tous']);

  const levelOptions = ['Tous', 'Débutant', 'Intermédiaire', 'Avancé', 'Expert'];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      const coursesRes = await API.get('/courses/');
      const data = coursesRes.data;
      const results = data.results || data || [];
      setAllCourses(results);

      const gamesSet = new Set();
      results.forEach(course => {
        const game = course.game_name || course.game || course.jeu;
        if (game && typeof game === 'string' && game.trim() !== '') {
          gamesSet.add(game);
        }
      });

      try {
        const gamesRes = await API.get('/games/');
        if (gamesRes.data && Array.isArray(gamesRes.data)) {
          gamesRes.data.forEach(g => {
            if (g.name) gamesSet.add(g.name);
          });
        }
      } catch (e) {}

      setGameOptions(['Tous', ...Array.from(gamesSet).sort()]);

    } catch (err) {
      console.error('❌ Erreur:', err);
      setError('Impossible de charger les cours.');
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = React.useMemo(() => {
    return allCourses.filter((course) => {
      const title = course.title || course.titre || '';
      const description = course.description || '';
      const game = course.game_name || course.game || course.jeu || '';
      const level = normalizeLevel(course.difficulty_level || course.level || course.niveau || '');

      const matchesSearch =
        title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        game.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesGame = filterGame === 'Tous' || game === filterGame;
      const matchesLevel = filterDifficulty === 'Tous' || level === filterDifficulty;

      return matchesSearch && matchesGame && matchesLevel;
    });
  }, [allCourses, searchTerm, filterGame, filterDifficulty]);

  const handleCourseClick = (courseId) => {
    navigate(`course-detail/${courseId}`);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setFilterDifficulty('Tous');
    setFilterGame('Tous');
  };

  const hasFilters = searchTerm || filterDifficulty !== 'Tous' || filterGame !== 'Tous';

  if (loading && allCourses.length === 0) {
    return (
      <div className="min-h-screen bg-[#030914] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-violet-500 animate-spin mx-auto" />
          <p className="text-slate-400 mt-4">Chargement des cours...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030914] text-white">
      <main className="ml-0 md:ml-[250px] min-h-screen">

        {/* HEADER */}
        <header className="border-b border-white/5 bg-[#030914]/80 backdrop-blur-xl">
          <div className="max-w-[1450px] mx-auto px-5 md:px-8 py-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-violet-400 text-xs font-semibold uppercase tracking-wider mb-1">
                  <Sparkles className="w-4 h-4" />
                  eSportsConnect Academy
                </div>
                <h1 className="text-2xl md:text-3xl font-black tracking-tight">
                  Cours en ligne
                </h1>
                <p className="text-slate-500 text-sm mt-1">
                  Développez vos compétences et progressez dans vos jeux préférés.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="px-4 py-2.5 rounded-xl bg-violet-500/5 border border-violet-500/10">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-violet-400" />
                    <span className="text-sm font-semibold">{allCourses.length}</span>
                    <span className="text-xs text-slate-500">cours disponibles</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-[1450px] mx-auto px-5 md:px-8 py-6">

          {/* BANNER */}
          {!hasFilters && allCourses.length > 0 && (
            <section className="relative overflow-hidden rounded-2xl border border-violet-500/10 bg-[#080f1d] mb-6">
              <div className="absolute inset-0">
                <img
                  src={heroBg}
                  alt="eSports"
                  className="w-full h-full object-cover opacity-30"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#030914] via-[#030914]/80 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#030914] via-transparent to-transparent" />
              </div>
              <div className="relative z-10 min-h-[250px] flex items-center">
                <div className="max-w-xl px-6 md:px-8 py-8">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-400/20 text-violet-300 text-[10px] font-bold mb-4">
                    <Trophy className="w-3.5 h-3.5" />
                    BOOSTEZ VOTRE NIVEAU
                  </div>
                  <h2 className="text-2xl md:text-4xl font-black leading-tight">
                    Passez au niveau <span className="text-violet-400">supérieur</span>
                  </h2>
                  <p className="text-slate-400 text-sm mt-2 max-w-lg leading-relaxed">
                    Découvrez nos formations conçues pour améliorer votre gameplay et vos performances compétitives.
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* SEARCH + FILTERS */}
          <div className="rounded-2xl border border-white/5 bg-[#080f1d] p-4 mb-6">
            <div className="flex flex-col lg:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Rechercher un cours, un jeu..."
                  className="w-full rounded-xl bg-[#050b16] border border-white/10 pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500/60 transition"
                />
              </div>

              <div className="hidden lg:flex items-center gap-3">
                <FilterSelect
                  value={filterGame}
                  onChange={setFilterGame}
                  options={gameOptions}
                  icon={<Gamepad2 className="w-4 h-4" />}
                />
                <FilterSelect
                  value={filterDifficulty}
                  onChange={setFilterDifficulty}
                  options={levelOptions}
                  icon={<Trophy className="w-4 h-4" />}
                />
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden w-full py-2.5 rounded-xl border border-white/10 bg-white/[0.02] text-sm flex items-center justify-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Filtres
                {hasFilters && <span className="w-2 h-2 rounded-full bg-violet-500" />}
              </button>
            </div>

            {showFilters && (
              <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 pt-3 border-t border-white/5">
                <FilterSelect
                  value={filterGame}
                  onChange={setFilterGame}
                  options={gameOptions}
                  icon={<Gamepad2 className="w-4 h-4" />}
                />
                <FilterSelect
                  value={filterDifficulty}
                  onChange={setFilterDifficulty}
                  options={levelOptions}
                  icon={<Trophy className="w-4 h-4" />}
                />
              </div>
            )}
          </div>

          {/* FILTRES ACTIFS */}
          {hasFilters && (
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="text-xs text-slate-500">Filtres :</span>
              {searchTerm && (
                <FilterBadge label={`Recherche : ${searchTerm}`} onRemove={() => setSearchTerm('')} />
              )}
              {filterGame !== 'Tous' && (
                <FilterBadge label={`Jeu : ${filterGame}`} onRemove={() => setFilterGame('Tous')} />
              )}
              {filterDifficulty !== 'Tous' && (
                <FilterBadge label={`Niveau : ${filterDifficulty}`} onRemove={() => setFilterDifficulty('Tous')} />
              )}
              <button onClick={resetFilters} className="text-xs text-violet-400 hover:text-violet-300 transition ml-2">
                Tout effacer
              </button>
            </div>
          )}

          {/* RESULTS HEADER */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold">
                {hasFilters ? 'Résultats' : 'Toutes les formations'}
              </h2>
              <p className="text-xs text-slate-500">{filteredCourses.length} cours disponibles</p>
            </div>
          </div>

          {/* COURSES GRID */}
          {error ? (
            <div className="text-center py-8 text-red-400">
              <p>{error}</p>
              <button onClick={fetchData} className="mt-2 text-violet-400 hover:text-violet-300 text-sm">
                Réessayer
              </button>
            </div>
          ) : filteredCourses.length === 0 ? (
            <EmptyCourses onReset={resetFilters} hasFilters={hasFilters} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredCourses.map((course) => (
                <CourseCard key={course.id} course={course} onClick={handleCourseClick} />
              ))}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="max-w-[1450px] mx-auto px-5 md:px-8 pb-6 pt-4 border-t border-white/5 text-center text-[10px] text-slate-600 tracking-[0.2em] font-light">
          <p>eSportsConnect • Catalogue des cours • © 2026</p>
        </div>

      </main>
    </div>
  );
};

export default Courses;