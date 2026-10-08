import React, { useState, useEffect } from 'react';
import { useNavigate } from '../context/RouterContext';
import { useAuth } from '../context/AuthContext';
import { 
  FaSearch, FaBell, FaPlay, FaCalendarAlt, FaUsers, FaClock,
  FaTrophy, FaBook, FaChartLine, FaFileAlt, FaEnvelope,
  FaBolt, FaCrown, FaArrowRight, FaUser, FaGamepad,
  FaRocket, FaStar, FaMedal, FaFire, FaTimes
} from 'react-icons/fa';
import API from '../services/api';
import NotificationBell from '../components/NotificationBell'; // ✅ Import du composant

// =================================================
// IMPORT DES IMAGES
// =================================================
import heroBg from '../assets/banners/hero-bg.png';
import tournamentBg from '../assets/banners/tournament-bg.png';

// === Logos des jeux ===
import amongUsImg from '../assets/games/AmongUs.png';
import apexImg from '../assets/games/ApexLegends.png';
import codImg from '../assets/games/CallofDuty.png';
import csgoImg from '../assets/games/CSGO.png';
import dota2Img from '../assets/games/Dota2.png';
import fifaImg from '../assets/games/FIFA.png';
import fortniteImg from '../assets/games/Fortnite.png';
import freefireImg from '../assets/games/FreeFire.png';
import genshinImg from '../assets/games/GenshinImpact.png';
import hearthstoneImg from '../assets/games/Hearthstone.png';
import lolImg from '../assets/games/LeagueofLegends.png';
import magicImg from '../assets/games/MagicTheGathering.png';
import minecraftImg from '../assets/games/Minecraft.png';
import mobileLegendsImg from '../assets/games/MobileLegends.png';
import mortalKombatImg from '../assets/games/MortalKombat.png';
import nba2kImg from '../assets/games/NBA2K.png';
import overwatchImg from '../assets/games/Overwatch2.png';
import pubgImg from '../assets/games/PUBG.png';
import rainbowSixImg from '../assets/games/RainbowSixSiege.png';
import rocketLeagueImg from '../assets/games/RocketLeague.png';
import starcraftImg from '../assets/games/StarCraftII.png';
import streetFighterImg from '../assets/games/StreetFighter.png';
import smashBrosImg from '../assets/games/SuperSmashBros.png';
import tekkenImg from '../assets/games/Tekken.png';
import valorantImg from '../assets/games/valorant.png';
import wildRiftImg from '../assets/games/WildRift.png';
import wowImg from '../assets/games/WorldofWarcraft.png';

// =================================================
// FONCTION DE NORMALISATION + MAPPING
// =================================================
const getGameImage = (gameName) => {
  if (!gameName || typeof gameName !== 'string') {
    return heroBg;
  }

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
// COMPOSANTS RÉUTILISABLES
// =================================================
const Stat = ({ value, label, color }) => (
  <div className="rounded-xl bg-[#0d1729] p-3 text-center">
    <p className={`text-2xl font-bold ${color}`}>{value}</p>
    <p className="mt-1 text-[10px] text-slate-500">{label}</p>
  </div>
);

const QuickResource = ({ icon, title, description, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-3 rounded-xl border border-slate-800 bg-[#091121] p-4 text-left transition hover:-translate-y-0.5 hover:border-violet-700"
  >
    <div className="text-slate-300">{icon}</div>
    <div>
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-1 text-[10px] text-slate-500">{description}</p>
    </div>
  </button>
);

const MiniTournament = ({ name, date, status }) => (
  <div className="border-b border-slate-800 py-3 last:border-0">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-sm font-medium">{name}</p>
        <p className="mt-1 text-[10px] text-slate-500">{date}</p>
      </div>
      <span
        className={`whitespace-nowrap rounded-md px-2 py-1 text-[9px] ${
          status === 'Complet'
            ? 'bg-red-950 text-red-400'
            : 'bg-blue-950 text-blue-400'
        }`}
      >
        {status}
      </span>
    </div>
  </div>
);

const Activity = ({ text, time }) => (
  <div className="mb-4 flex gap-3">
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-800">
      🎮
    </div>
    <div>
      <p className="text-xs leading-5 text-slate-300">{text}</p>
      <p className="mt-1 text-[10px] text-slate-600">{time}</p>
    </div>
  </div>
);

// =================================================
// PAGE PRINCIPALE
// =================================================
const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [tournaments, setTournaments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tournRes, coursesRes, statsRes, notifRes] = await Promise.all([
          API.get('/tournaments/?status=upcoming'),
          API.get('/courses/'),
          API.get('/ai/stats/').catch(() => ({ data: null })),
          API.get('/tournaments/notifications/').catch(() => ({ data: [] })),
        ]);

        setTournaments(tournRes.data || []);
        setCourses(coursesRes.data || []);
        setStats(statsRes.data);
        setNotifications(notifRes.data || []);
        setLoading(false);
      } catch (err) {
        console.error('❌ Erreur chargement home:', err);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#030914]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-violet-400 mt-4">Chargement...</p>
        </div>
      </div>
    );
  }

  // =================================================
  // FILTRAGE DES TOURNOIS À VENIR
  // =================================================
  const upcomingTournaments = tournaments
    .filter(t => t.status === 'upcoming')
    .sort((a, b) => {
      if (a.start_date && b.start_date) {
        return new Date(a.start_date) - new Date(b.start_date);
      }
      return a.name.localeCompare(b.name);
    });

  // =================================================
  // FILTRAGE PAR RECHERCHE
  // =================================================
  const filteredTournaments = upcomingTournaments.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // =================================================
  // FORMATAGE DES DATES
  // =================================================
  const formatDate = (dateString) => {
    if (!dateString) return 'À venir';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    if (hours === 0 && minutes === '00') {
      return `${day}/${month}/${year}`;
    }
    return `${day}/${month}/${year} - ${hours}:${minutes}`;
  };

  // =================================================
  // COURS RECOMMANDÉS
  // =================================================
  const recommendedCourses = courses.slice(0, 4);

  return (
    <div className="min-h-screen bg-[#030914] text-white">
      <main className="ml-0 md:ml-[250px] min-h-screen px-4 sm:px-7 py-6">

        {/* ===== HEADER ===== */}
        <header className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-[29px] font-bold tracking-tight">
              Bonjour, {user?.username || 'Invité'} ! 👋
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Prêt à améliorer ton gameplay aujourd'hui ?
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* Bouton Recherche */}
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="text-slate-400 transition hover:text-white"
              aria-label="Rechercher"
            >
              <FaSearch size={25} />
            </button>

            {/* ✅ Composant NotificationBell (affiche les notifications) */}
            <NotificationBell />

            {/* Bouton Notifications (ancien, supprimé) */}
            {/* <button ...> ... </button> */}
          </div>
        </header>

        {/* ===== BARRE DE RECHERCHE (toggle) ===== */}
        {showSearch && (
          <div className="mb-6 flex items-center gap-3 bg-[#091121] border border-slate-800 rounded-xl px-4 py-2">
            <FaSearch className="text-slate-500" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un tournoi..."
              className="flex-1 bg-transparent text-white placeholder-slate-500 outline-none py-2"
              autoFocus
            />
            <button
              onClick={() => {
                setSearchQuery('');
                setShowSearch(false);
              }}
              className="text-slate-500 hover:text-white transition"
            >
              <FaTimes size={18} />
            </button>
          </div>
        )}

        {/* ===== GRILLE PRINCIPALE ===== */}
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_325px] gap-6">

          {/* ===== COLONNE GAUCHE ===== */}
          <div className="min-w-0">

            {/* ===== HERO ===== */}
            <section className="relative mb-7 h-[260px] overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-r from-indigo-950 to-purple-950">
              <img
                src={heroBg}
                alt="Tournoi eSport"
                className="absolute inset-0 h-full w-full object-cover opacity-50"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#07102b] via-[#07102b]/90 to-transparent" />
              <div className="relative z-10 flex h-full max-w-[570px] flex-col justify-center px-9">
                <span className="mb-3 w-fit rounded-full bg-violet-700/30 px-3 py-1 text-xs font-medium text-violet-300">
                  À LA UNE
                </span>
                <h2 className="text-4xl font-bold">
                  {filteredTournaments[0]?.name || 'Valorant Cup #1'}
                </h2>
                <p className="mt-3 max-w-[430px] text-sm leading-6 text-slate-300">
                  {filteredTournaments[0]?.description || 'Participe à notre grand tournoi et montre ton talent !'}
                </p>
                <button
                  onClick={() => filteredTournaments[0] && navigate(`tournaments/${filteredTournaments[0].id}`)}
                  className="mt-5 flex w-fit items-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-purple-700 px-5 py-3 text-sm font-semibold transition hover:scale-[1.02]"
                >
                  Voir les détails
                  <FaArrowRight size={16} />
                </button>
              </div>
            </section>

            {/* ===== COURS RECOMMANDÉS ===== */}
            <section className="mb-8">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FaPlay className="text-purple-400" size={22} />
                  <h2 className="text-xl font-bold">Cours recommandés</h2>
                </div>
                <button
                  onClick={() => navigate('courses')}
                  className="text-sm font-medium text-violet-400 hover:text-violet-300"
                >
                  Voir tout
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {recommendedCourses.map((course) => {
                  const gameName = course.game_name || course.game?.name || 'Général';
                  const imageSrc = getGameImage(gameName);
                  return (
                    <div
                      key={course.id}
                      onClick={() => navigate(`course-detail/${course.id}`)}
                      className="overflow-hidden rounded-xl border border-slate-800 bg-[#091121] transition duration-200 hover:-translate-y-1 hover:border-violet-700 cursor-pointer"
                    >
                      <div className="relative h-[125px]">
                        <img
                          src={imageSrc}
                          alt={course.title}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = heroBg;
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                        <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded bg-black/70 px-2 py-1 text-[11px]">
                          <FaPlay size={10} />
                          {course.duration || '30:00'}
                        </div>
                      </div>
                      <div className="p-3">
                        <p className="mb-1 text-[9px] font-bold text-red-400">
                          {gameName}
                        </p>
                        <h3 className="text-sm font-semibold line-clamp-1">{course.title}</h3>
                        {course.description && (
                          <p className="mt-1 text-xs text-slate-500 line-clamp-2">{course.description}</p>
                        )}
                        <span className="mt-2 inline-block rounded-md bg-slate-800 px-2 py-1 text-[10px] text-slate-400">
                          {course.difficulty_level || 'Débutant'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* ===== TOURNOIS À VENIR (filtrés) ===== */}
            <section className="mb-8">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FaMedal className="text-yellow-400" size={22} />
                  <h2 className="text-xl font-bold">Tournois à venir</h2>
                </div>
                <button
                  onClick={() => navigate('tournaments')}
                  className="text-sm font-medium text-violet-400 hover:text-violet-300"
                >
                  Voir tout
                </button>
              </div>

              {filteredTournaments.length === 0 ? (
                <div className="rounded-xl border border-slate-800 bg-[#091121] p-8 text-center">
                  <p className="text-slate-400">
                    {searchQuery ? 'Aucun tournoi ne correspond à votre recherche.' : 'Aucun tournoi à venir pour le moment.'}
                  </p>
                  <button
                    onClick={() => navigate('tournaments')}
                    className="mt-4 text-sm text-violet-400 hover:text-violet-300"
                  >
                    Voir tous les tournois
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {filteredTournaments.map((tournament) => {
                    const participants = tournament.participants_count || 0;
                    const maxParticipants = tournament.max_participants || 16;
                    const isFull = participants >= maxParticipants;
                    const gameName = tournament.game_name || tournament.game || 'Jeu';
                    return (
                      <div
                        key={tournament.id}
                        onClick={() => navigate(`tournaments/${tournament.id}`)}
                        className="overflow-hidden rounded-xl border border-slate-800 bg-[#091121] cursor-pointer hover:border-violet-700 transition"
                      >
                        <div className="relative h-[125px]">
                          <img
                            src={tournamentBg}
                            alt={tournament.name}
                            className="h-full w-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                          <div className="absolute bottom-3 left-3">
                            <p className="text-[10px] font-bold text-violet-300">
                              {gameName}
                            </p>
                            <h3 className="text-lg font-bold">{tournament.name}</h3>
                          </div>
                        </div>
                        <div className="p-4">
                          <div className="mb-4 flex items-center justify-between text-[11px] text-slate-400">
                            <span className="flex items-center gap-1">
                              <FaCalendarAlt size={13} />
                              {formatDate(tournament.start_date)}
                            </span>
                            <span>En ligne</span>
                            <span className="flex items-center gap-1">
                              <FaUsers size={13} />
                              {participants}/{maxParticipants}
                            </span>
                          </div>
                          <button
                            className={`w-full rounded-lg py-2.5 text-sm font-semibold ${
                              isFull
                                ? 'bg-purple-950 text-pink-400'
                                : 'bg-gradient-to-r from-violet-600 to-purple-700'
                            }`}
                          >
                            {isFull ? 'Complet' : "S'inscrire"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* ===== RESSOURCES RAPIDES ===== */}
            <section>
              <div className="mb-4 flex items-center gap-3">
                <FaStar className="text-yellow-400" size={21} />
                <h2 className="text-xl font-bold">Ressources rapides</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <QuickResource
                  icon={<FaBook size={23} />}
                  title="Guides"
                  description="Conseils et astuces"
                  onClick={() => navigate('resources')}
                />
                <QuickResource
                  icon={<FaPlay size={23} />}
                  title="Vidéos"
                  description="Tutoriels & analyses"
                  onClick={() => navigate('resources')}
                />
                <QuickResource
                  icon={<FaFileAlt size={23} />}
                  title="Documents"
                  description="PDF & stratégies"
                  onClick={() => navigate('resources')}
                />
                <QuickResource
                  icon={<FaEnvelope size={23} />}
                  title="Communauté"
                  description="Forums & discussions"
                  onClick={() => navigate('inbox')}
                />
              </div>
            </section>
          </div>

          {/* ===== SIDEBAR DROITE ===== */}
          <div className="space-y-4">

            {/* PROFIL */}
            <div className="rounded-2xl border border-slate-800 bg-[#091121] p-5">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-700 via-purple-950 to-black text-3xl">
                  🎮
                </div>
                <div>
                  <h3 className="font-bold">{user?.username || 'Invité'}</h3>
                  <span className="mt-1 inline-block rounded-md bg-violet-700 px-2 py-1 text-xs font-semibold">
                    Niveau {stats?.level || 1}
                  </span>
                </div>
              </div>
              <div className="mt-4">
                <div className="mb-2 flex justify-between text-xs text-slate-400">
                  <span>XP</span>
                  <span>{stats?.points || 0} / 3500 XP</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full w-[70%] rounded-full bg-gradient-to-r from-violet-600 to-purple-500"
                    style={{ width: `${Math.min((stats?.points || 0) / 3500 * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* STATISTIQUES */}
            <div className="rounded-2xl border border-slate-800 bg-[#091121] p-5">
              <div className="mb-4 flex items-center gap-2">
                <FaChartLine size={19} className="text-blue-400" />
                <h3 className="font-semibold">Mes statistiques</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Stat value={stats?.wins || 0} label="Victoires" color="text-cyan-300" />
                <Stat value={stats?.losses || 0} label="Défaites" color="text-red-400" />
                <Stat value={`${stats?.win_rate || 0}%`} label="Taux de victoire" color="text-sky-300" />
                <Stat value={stats?.total_matches || 0} label="Total matchs" color="text-blue-300" />
              </div>
              <button
                onClick={() => navigate('dashboard-ia')}
                className="mt-4 w-full rounded-lg bg-slate-800 py-2.5 text-sm font-medium transition hover:bg-slate-700"
              >
                Voir mes statistiques
              </button>
            </div>

            {/* PROCHAINS TOURNOIS (mini) */}
            <div className="rounded-2xl border border-slate-800 bg-[#091121] p-5">
              <div className="mb-4 flex items-center gap-2">
                <FaCalendarAlt size={18} className="text-violet-400" />
                <h3 className="font-semibold">Prochains tournois</h3>
              </div>
              {filteredTournaments.length === 0 ? (
                <p className="text-sm text-slate-400">Aucun tournoi à venir.</p>
              ) : (
                filteredTournaments.slice(0, 3).map((t) => (
                  <MiniTournament
                    key={t.id}
                    name={t.name}
                    date={formatDate(t.start_date)}
                    status={(t.participants_count || 0) >= (t.max_participants || 16) ? 'Complet' : 'Inscription ouverte'}
                  />
                ))
              )}
              <button
                onClick={() => navigate('tournaments')}
                className="mt-3 w-full rounded-lg bg-slate-800 py-2.5 text-sm font-medium hover:bg-slate-700"
              >
                Voir tous les tournois
              </button>
            </div>

            {/* ACTIVITÉ */}
            <div className="rounded-2xl border border-slate-800 bg-[#091121] p-5">
              <div className="mb-4 flex items-center gap-2">
                <FaBolt size={18} className="text-violet-400" />
                <h3 className="font-semibold">Activité récente</h3>
              </div>
              {notifications.slice(0, 2).map((n) => (
                <Activity
                  key={n.id}
                  text={n.message}
                  time={`Il y a ${Math.floor((new Date() - new Date(n.created_at)) / (1000 * 60 * 60))} heures`}
                />
              ))}
              {notifications.length === 0 && (
                <p className="text-sm text-slate-400">Aucune activité récente.</p>
              )}
              <button
                onClick={() => navigate('inbox')}
                className="mt-2 w-full rounded-lg bg-slate-800 py-2.5 text-sm font-medium hover:bg-slate-700"
              >
                Voir toute l'activité
              </button>
            </div>

          </div>
        </div>

      </main>
    </div>
  );
};

export default Home;