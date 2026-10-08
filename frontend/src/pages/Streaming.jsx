// src/pages/Streaming.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from '../context/RouterContext';
import { useAuth } from '../context/AuthContext';
import {
  Play, Radio, Users, Eye, Clock, Calendar, Trophy, Gamepad2,
  Search, Filter, ChevronRight, Flame, Star, Video, Tv,
  MessageSquare, Heart, Share2, MoreHorizontal, User,
  LayoutDashboard, BookOpen, BarChart3, Brain, FileText,
  Settings, LogOut, Menu, X, Zap, Circle, Bell,
} from 'lucide-react';
import { FaTwitch, FaUserPlus, FaUserMinus } from 'react-icons/fa';

import API from '../services/api';

const Streaming = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // =====================================================
  // ÉTATS (API RÉELLE)
  // =====================================================
  const [streamers, setStreamers] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [myProfile, setMyProfile] = useState(null);
  const [following, setFollowing] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [twitchUsername, setTwitchUsername] = useState('');
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // =====================================================
  // UI ÉTATS (design)
  // =====================================================
  const [activeTab, setActiveTab] = useState('live');
  const [selectedGame, setSelectedGame] = useState('Tous');

  // =====================================================
  // CHARGEMENT DES DONNÉES
  // =====================================================
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [streamersRes, profileRes, followingRes, notifRes, tournRes] = await Promise.all([
          API.get('/streaming/list/'),
          API.get('/streaming/profile/').catch(() => ({ data: null })),
          API.get('/streaming/following/').catch(() => ({ data: [] })),
          API.get('/streaming/notifications/').catch(() => ({ data: [] })),
          API.get('/tournaments/?status=upcoming&status=ongoing').catch(() => ({ data: [] })),
        ]);
        setStreamers(streamersRes.data || []);
        setTournaments(tournRes.data || []);
        setMyProfile(profileRes.data || null);
        setFollowing(followingRes.data || []);
        setNotifications(notifRes.data || []);
        setLoading(false);
      } catch (err) {
        console.error('Erreur chargement streaming:', err);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // =====================================================
  // FONCTIONS MÉTIER
  // =====================================================
  const connectTwitch = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/streaming/connect/', { twitch_username: twitchUsername });
      setMyProfile(res.data);
      setShowConnectModal(false);
      setTwitchUsername('');
      alert('✅ Compte Twitch connecté !');
    } catch (err) {
      alert('❌ Erreur lors de la connexion.');
    }
  };

  const toggleFollow = async (streamerId, isFollowed) => {
    try {
      if (isFollowed) {
        await API.post(`/streaming/unfollow/${streamerId}/`);
      } else {
        await API.post(`/streaming/follow/${streamerId}/`);
      }
      const [streamersRes, followingRes] = await Promise.all([
        API.get('/streaming/list/'),
        API.get('/streaming/following/'),
      ]);
      setStreamers(streamersRes.data);
      setFollowing(followingRes.data);
    } catch (err) {
      alert('❌ Erreur');
    }
  };

  const refreshStatus = async () => {
    try {
      const res = await API.post('/streaming/refresh/');
      setMyProfile(res.data);
      alert('🔄 Statut rafraîchi !');
    } catch (err) {
      alert('❌ Erreur');
    }
  };

  // =====================================================
  // FILTRES & DÉRIVÉES
  // =====================================================

  // ✅ Liste des streamers SANS soi-même (pour la liste et les chaînes populaires)
  const otherStreamers = useMemo(() => {
    if (!myProfile?.id) return streamers;
    return streamers.filter(s => s.id !== myProfile.id);
  }, [streamers, myProfile]);

  // ✅ Liste filtrée
  const filteredStreamers = useMemo(() => {
    let result = [...otherStreamers];
    if (filter === 'online') result = result.filter(s => s.is_online);
    if (filter === 'offline') result = result.filter(s => !s.is_online);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(s =>
        s.username?.toLowerCase().includes(q) ||
        s.stream_game?.toLowerCase().includes(q)
      );
    }
    if (selectedGame !== 'Tous') {
      result = result.filter(s => s.stream_game === selectedGame);
    }
    return result;
  }, [otherStreamers, filter, searchQuery, selectedGame]);

  // Jeux disponibles
  const games = useMemo(() => {
    const g = new Set(streamers.map(s => s.stream_game).filter(Boolean));
    return ['Tous', ...Array.from(g)];
  }, [streamers]);

  // ✅ STATISTIQUES : inclure TOUS les streamers (y compris soi-même)
  const stats = useMemo(() => {
    const total = streamers.length;
    const online = streamers.filter(s => s.is_online).length;
    const viewers = streamers.reduce((acc, s) => acc + (s.viewer_count || 0), 0);
    const tournamentCount = tournaments.length;
    return { total, online, viewers, tournamentCount };
  }, [streamers, tournaments]);

  // ✅ CHAÎNES POPULAIRES : exclure soi-même
  const popularChannels = useMemo(() => {
    return [...otherStreamers]
      .sort((a, b) => (b.viewer_count || 0) - (a.viewer_count || 0))
      .slice(0, 4)
      .map(s => ({
        id: s.id,
        name: s.username,
        category: s.stream_game || 'Streaming',
        followers: s.followers ? `${s.followers/1000}K` : '0',
        viewers: s.viewer_count || 0,
        verified: false,
        avatar: s.avatar || null,
      }));
  }, [otherStreamers]);

  // ✅ STREAMS EN DIRECT : exclure soi-même (pour la liste)
  const liveStreams = useMemo(() => {
    return filteredStreamers.filter(s => s.is_online);
  }, [filteredStreamers]);

  // =====================================================
  // DÉCONNEXION
  // =====================================================
  const handleLogout = async () => {
    try {
      if (logout) await logout();
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      navigate('login');
    } catch (error) {
      navigate('login');
    }
  };

  // =====================================================
  // RENDU
  // =====================================================
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-cyan-500/20 rounded-full" />
            <div className="absolute inset-0 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-cyan-400 text-lg font-light tracking-[0.3em]">CHARGEMENT</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <main className="ml-0 md:ml-[250px] min-h-screen">

        {/* ===== HEADER ===== */}
        <header className="border-b border-white/5 bg-[#020817]/80 backdrop-blur-xl">
          <div className="max-w-[1450px] mx-auto px-5 md:px-8 py-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-violet-400 text-xs font-semibold uppercase tracking-wider mb-1">
                  <Tv className="w-4 h-4" />
                  eSports Streaming
                </div>
                <h1 className="text-2xl md:text-3xl font-black tracking-tight">Streaming</h1>
                <p className="text-slate-500 text-sm mt-1">
                  Regarde les compétitions et les joueurs de la communauté en direct.
                </p>
              </div>
              <div className="flex items-center gap-3">
                {myProfile?.twitch_username ? (
                  <button
                    onClick={refreshStatus}
                    className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-sm flex items-center gap-2 hover:border-cyan-500/30 transition"
                  >
                    <FaTwitch className="text-purple-400" />
                    {myProfile.twitch_username} {myProfile.is_online && '🟢'}
                  </button>
                ) : (
                  <button
                    onClick={() => setShowConnectModal(true)}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-black px-5 py-2 rounded-xl font-bold flex items-center gap-2 hover:scale-105 transition"
                  >
                    <FaTwitch /> Connecter Twitch
                  </button>
                )}
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-[1450px] mx-auto px-5 md:px-8 py-6">

          {/* ===== MES STREAMS ===== */}
          {myProfile?.is_online && (
            <div className="mb-6 p-5 rounded-2xl bg-gradient-to-r from-violet-900/40 to-purple-900/30 border border-violet-500/30">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-600 to-purple-900 flex items-center justify-center text-lg font-bold">
                    {myProfile.username?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      <p className="text-sm font-bold text-white">Vous êtes en direct !</p>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      {myProfile.stream_title || 'Stream en cours'} • {myProfile.viewer_count || 0} spectateurs
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => navigate(`streaming/${myProfile.id}`)}
                  className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-sm font-semibold transition flex items-center gap-2"
                >
                  <Play size={16} />
                  Voir mon stream
                </button>
              </div>
            </div>
          )}

          {/* ===== NOTIFICATIONS ===== */}
          {notifications.length > 0 && (
            <div className="bg-gradient-to-r from-purple-900/20 to-cyan-900/20 border border-purple-500/30 rounded-2xl p-4 mb-6">
              <div className="flex items-center gap-3">
                <Bell className="text-yellow-400 text-xl" />
                <p className="text-sm text-gray-300">
                  <span className="font-bold">{notifications.length}</span> notification{notifications.length > 1 ? 's' : ''}
                  {notifications.map((n, i) => (
                    <span key={i} className="ml-2 text-purple-300">{n.message}</span>
                  ))}
                </p>
              </div>
            </div>
          )}

          {/* ===== STATISTIQUES ===== */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StreamingStat
              icon={Radio}
              label="En direct"
              value={stats.online}
              detail="streams actuellement"
              iconClass="text-red-400"
              bgClass="bg-red-500/10"
            />
            <StreamingStat
              icon={Eye}
              label="Spectateurs"
              value={formatViewers(stats.viewers)}
              detail="en ce moment"
              iconClass="text-cyan-400"
              bgClass="bg-cyan-500/10"
            />
            <StreamingStat
              icon={Trophy}
              label="Tournois"
              value={stats.tournamentCount}
              detail="compétitions live"
              iconClass="text-violet-400"
              bgClass="bg-violet-500/10"
            />
            <StreamingStat
              icon={Users}
              label="Streamers"
              value={stats.total}
              detail="en direct aujourd'hui"
              iconClass="text-emerald-400"
              bgClass="bg-emerald-500/10"
            />
          </div>

          {/* ===== FILTRES ===== */}
          <div className="flex flex-col lg:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un stream ou un joueur..."
                className="w-full h-12 pl-11 pr-4 rounded-xl bg-[#08111f] border border-white/5 text-white placeholder:text-slate-600 outline-none focus:border-violet-500/50 transition"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1">
              {games.map((game) => (
                <button
                  key={game}
                  onClick={() => setSelectedGame(game)}
                  className={`whitespace-nowrap px-4 py-2.5 rounded-xl text-sm transition border ${
                    selectedGame === game
                      ? 'bg-violet-600 border-violet-500 text-white'
                      : 'bg-[#08111f] border-white/5 text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
                >
                  {game}
                </button>
              ))}
            </div>
          </div>

          {/* ===== TABS ===== */}
          <div className="flex items-center gap-1 border-b border-white/5 mb-7">
            <button
              onClick={() => setActiveTab('live')}
              className={`px-5 py-3 text-sm font-medium border-b-2 transition ${
                activeTab === 'live'
                  ? 'text-white border-violet-500'
                  : 'text-slate-500 border-transparent hover:text-slate-300'
              }`}
            >
              <span className="flex items-center gap-2">
                <Radio size={16} />
                En direct
              </span>
            </button>
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`px-5 py-3 text-sm font-medium border-b-2 transition ${
                activeTab === 'upcoming'
                  ? 'text-white border-violet-500'
                  : 'text-slate-500 border-transparent hover:text-slate-300'
              }`}
            >
              <span className="flex items-center gap-2">
                <Calendar size={16} />
                À venir
              </span>
            </button>
          </div>

          {/* =================================================
              CONTENU
          ================================================= */}
          {activeTab === 'live' && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-7">
              {/* Streams en direct */}
              <div className="xl:col-span-2">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      En direct maintenant
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      {liveStreams.length} streams disponibles
                    </p>
                  </div>
                  <button className="text-sm text-slate-500 hover:text-white flex items-center gap-1">
                    <Filter size={15} />
                    Filtrer
                  </button>
                </div>

                {liveStreams.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {liveStreams.map((stream) => (
                      <StreamCard
                        key={stream.id}
                        stream={stream}
                        isFollowed={following.some(f => f.streamer === stream.id)}
                        onFollowToggle={toggleFollow}
                        onClick={() => navigate(`streaming/${stream.id}`)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl bg-[#08111f] border border-white/5 p-12 text-center">
                    <Search size={35} className="mx-auto text-slate-700 mb-4" />
                    <h3 className="font-semibold">Aucun stream en direct</h3>
                    <p className="text-sm text-slate-600 mt-2">Reviens plus tard ou connecte ton compte Twitch.</p>
                  </div>
                )}
              </div>

              {/* Chaînes populaires */}
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="text-xl font-bold">Chaînes populaires</h2>
                    <p className="text-xs text-slate-500 mt-1">Les streamers de la communauté</p>
                  </div>
                  <Flame size={19} className="text-orange-400" />
                </div>
                <div className="space-y-3">
                  {popularChannels.length > 0 ? (
                    popularChannels.map((channel, index) => (
                      <ChannelCard key={channel.id} channel={channel} position={index + 1} />
                    ))
                  ) : (
                    <div className="rounded-2xl bg-[#08111f] border border-white/5 p-6 text-center">
                      <p className="text-sm text-slate-500">Aucune autre chaîne</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'upcoming' && (
            <div>
              <div className="mb-5">
                <h2 className="text-xl font-bold">Prochaines diffusions</h2>
                <p className="text-xs text-slate-500 mt-1">Ne manque aucun événement de la communauté.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                <div className="col-span-full rounded-2xl bg-[#08111f] border border-white/5 p-8 text-center">
                  <Calendar size={35} className="mx-auto text-slate-700 mb-4" />
                  <h3 className="font-semibold">Aucune diffusion planifiée</h3>
                  <p className="text-sm text-slate-600 mt-2">Les prochains streams seront affichés ici.</p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* ===== FOOTER ===== */}
        <div className="max-w-[1450px] mx-auto px-5 md:px-8 pb-6 pt-4 border-t border-white/5 text-center text-[10px] text-slate-600 tracking-[0.2em] font-light">
          <p>eSportsConnect • Streaming • © 2026</p>
        </div>

      </main>

      {/* =================================================
          MODAL CONNEXION TWITCH
      ================================================= */}
      {showConnectModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a2e] border border-white/10 rounded-2xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <FaTwitch className="text-purple-400" /> Connecter Twitch
              </h3>
              <button onClick={() => setShowConnectModal(false)} className="text-gray-400 hover:text-white transition">
                ✕
              </button>
            </div>
            <form onSubmit={connectTwitch} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Nom d'utilisateur Twitch</label>
                <input
                  type="text"
                  value={twitchUsername}
                  onChange={(e) => setTwitchUsername(e.target.value)}
                  placeholder="ex: shroud"
                  className="w-full p-3 bg-black/40 border border-white/10 rounded-xl text-white focus:border-purple-400/50 focus:outline-none transition"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-black py-3 rounded-xl font-bold hover:scale-105 transition"
              >
                <FaTwitch className="inline mr-2" /> Connecter
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// =====================================================
// COMPOSANTS
// =====================================================
const StreamingStat = ({ icon: Icon, label, value, detail, iconClass, bgClass }) => (
  <div className="p-5 rounded-2xl bg-[#08111f] border border-white/5">
    <div className="flex items-center justify-between">
      <div className={`w-10 h-10 rounded-xl ${bgClass} flex items-center justify-center`}>
        <Icon size={20} className={iconClass} />
      </div>
      {label === 'En direct' && (
        <span className="flex items-center gap-1 text-[10px] text-red-400">
          <Circle size={7} fill="currentColor" /> LIVE
        </span>
      )}
    </div>
    <p className="text-2xl font-bold mt-4">{value}</p>
    <p className="text-sm text-slate-400 mt-1">{label}</p>
    <p className="text-[10px] text-slate-600 mt-1">{detail}</p>
  </div>
);

const StreamCard = ({ stream, isFollowed, onFollowToggle, onClick }) => {
  const thumbnail = stream.thumbnail || stream.avatar || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80';

  return (
    <div onClick={onClick} className="group cursor-pointer rounded-2xl overflow-hidden bg-[#08111f] border border-white/5 hover:border-violet-500/30 transition">
      <div className="relative aspect-video overflow-hidden">
        <img src={thumbnail} alt={stream.username} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        {stream.is_online && (
          <>
            <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-600 text-white text-[10px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> LIVE
            </div>
            <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2 py-1 rounded-md bg-black/70 backdrop-blur text-xs text-white">
              <Eye size={12} /> {formatViewers(stream.viewer_count || 0)}
            </div>
          </>
        )}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
          <div className="w-14 h-14 rounded-full bg-violet-600/90 flex items-center justify-center shadow-xl">
            <Play size={22} fill="currentColor" />
          </div>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-sm leading-snug line-clamp-2 group-hover:text-violet-300 transition">
          {stream.stream_title || 'Stream en direct'}
        </h3>
        <div className="flex items-center gap-2 mt-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-purple-900 flex items-center justify-center shrink-0">
            <User size={15} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <p className="text-xs font-medium truncate">{stream.username}</p>
            </div>
            <p className="text-[10px] text-slate-600">{stream.stream_game || 'eSport'}</p>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onFollowToggle(stream.id, isFollowed); }}
            className={`ml-auto px-2 py-1 rounded-lg text-[10px] font-bold transition flex items-center gap-1 ${
              isFollowed
                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                : 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30'
            }`}
          >
            {isFollowed ? <FaUserMinus size={10} /> : <FaUserPlus size={10} />}
            {isFollowed ? 'Suivi' : 'Suivre'}
          </button>
        </div>
      </div>
    </div>
  );
};

const ChannelCard = ({ channel, position }) => (
  <div className="flex items-center gap-3 p-4 rounded-xl bg-[#08111f] border border-white/5 hover:border-violet-500/20 transition">
    <span className="w-5 text-xs text-slate-600 text-center">{position}</span>
    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-purple-900 flex items-center justify-center shrink-0">
      <User size={17} />
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-1">
        <p className="text-sm font-medium truncate">{channel.name}</p>
        {channel.verified && <span className="text-violet-400 text-[10px]">✓</span>}
      </div>
      <p className="text-[10px] text-slate-600 truncate mt-1">{channel.category}</p>
    </div>
    <div className="text-right">
      <p className="text-xs text-white">{formatViewers(channel.viewers)}</p>
      <p className="text-[9px] text-slate-600">viewers</p>
    </div>
  </div>
);

const formatViewers = (viewers) => {
  if (viewers >= 1000) return `${(viewers / 1000).toFixed(1)}K`;
  return viewers.toString();
};

export default Streaming;