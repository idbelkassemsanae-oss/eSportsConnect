// src/pages/StreamDetail.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from '../context/RouterContext';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft, Eye, Users, Gamepad2, Calendar,
  Share2, Heart, Bell, Radio, Play, MessageSquare,
  ChevronRight, User, Flame, Tv
} from 'lucide-react';
import { FaTwitch, FaUserPlus, FaUserMinus, FaYoutube } from 'react-icons/fa';
import API from '../services/api';

const StreamDetail = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [streamer, setStreamer] = useState(null);
  const [otherStreamers, setOtherStreamers] = useState([]);
  const [myProfile, setMyProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);

  const streamerId = window.location.pathname.split('/').pop();

  // =====================================================
  // CHARGEMENT DES DONNÉES
  // =====================================================
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [streamerRes, listRes, followingRes, profileRes] = await Promise.all([
          API.get(`/streaming/list/${streamerId}/`).catch(() => ({ data: null })),
          API.get('/streaming/list/').catch(() => ({ data: [] })),
          API.get('/streaming/following/').catch(() => ({ data: [] })),
          API.get('/streaming/profile/').catch(() => ({ data: null })),
        ]);

        setStreamer(streamerRes.data);
        setMyProfile(profileRes.data);

        // ✅ Exclure le streamer affiché ET mon propre stream
        const myId = profileRes.data?.id;
        const others = (listRes.data || []).filter(
          s => s.id !== parseInt(streamerId) && s.id !== myId
        );
        setOtherStreamers(others.slice(0, 5));

        const followed = (followingRes.data || []).some(f => f.streamer === parseInt(streamerId));
        setIsFollowing(followed);

        setLoading(false);
      } catch (err) {
        console.error('Erreur chargement streamer:', err);
        setLoading(false);
      }
    };
    fetchData();
  }, [streamerId]);

  // =====================================================
  // SUIVRE / NE PLUS SUIVRE
  // =====================================================
  const toggleFollow = async () => {
    try {
      if (isFollowing) {
        await API.post(`/streaming/unfollow/${streamerId}/`);
      } else {
        await API.post(`/streaming/follow/${streamerId}/`);
      }
      setIsFollowing(!isFollowing);
    } catch (err) {
      alert('❌ Erreur');
    }
  };

  // =====================================================
  // EXTRAIRE L'ID YOUTUBE
  // =====================================================
  const getYouTubeId = (url) => {
    if (!url) return null;
    if (url.includes('youtube.com/watch?v=')) {
      return url.split('v=')[1].split('&')[0];
    }
    if (url.includes('youtu.be/')) {
      return url.split('youtu.be/')[1].split('?')[0];
    }
    if (url.includes('youtube.com/embed/')) {
      return url.split('embed/')[1].split('?')[0];
    }
    return null;
  };

  // =====================================================
  // CHARGEMENT
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

  // =====================================================
  // STREAMER INTROUVABLE
  // =====================================================
  if (!streamer) {
    return (
      <div className="min-h-screen bg-[#020617] text-white">
        <main className="ml-0 md:ml-[250px] min-h-screen">
          <div className="max-w-[1450px] mx-auto px-5 md:px-8 py-6">
            <button
              onClick={() => navigate('streaming')}
              className="mb-6 flex items-center gap-2 text-slate-400 hover:text-white transition"
            >
              <ArrowLeft size={20} />
              Retour aux streams
            </button>
            <div className="rounded-2xl bg-[#08111f] border border-white/5 p-16 text-center">
              <FaTwitch size={48} className="mx-auto text-slate-600 mb-4" />
              <h2 className="text-xl font-bold">Streamer introuvable</h2>
              <p className="text-sm text-slate-500 mt-2">Ce streamer n'existe pas ou a été supprimé.</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // =====================================================
  // DÉTERMINER LA SOURCE VIDÉO
  // =====================================================
  const youtubeId = streamer.youtube_video_id || getYouTubeId(streamer.thumbnail_url);
  const hasYouTubeVideo = !!youtubeId;
  const isMyOwnStream = myProfile?.id === streamer.id;

  // =====================================================
  // RENDU PRINCIPAL
  // =====================================================
  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <main className="ml-0 md:ml-[250px] min-h-screen">

        {/* ===== HEADER ===== */}
        <header className="border-b border-white/5 bg-[#020817]/80 backdrop-blur-xl">
          <div className="max-w-[1450px] mx-auto px-5 md:px-8 py-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('streaming')}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <div className="flex items-center gap-2 text-violet-400 text-xs font-semibold uppercase tracking-wider mb-1">
                  <Tv className="w-4 h-4" />
                  {isMyOwnStream ? 'Mon stream' : 'Stream en direct'}
                </div>
                <h1 className="text-2xl md:text-3xl font-black tracking-tight">
                  {streamer.username}
                </h1>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-[1450px] mx-auto px-5 md:px-8 py-6">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-7">

            {/* =================================================
                LECTEUR VIDÉO (2/3)
            ================================================= */}
            <div className="xl:col-span-2 space-y-6">

              {/* Lecteur vidéo */}
              <div className="relative rounded-2xl overflow-hidden bg-[#08111f] border border-white/5">
                <div className="relative aspect-video bg-black">
                  {streamer.is_online && hasYouTubeVideo ? (
                    // ✅ Vidéo YouTube
                    <iframe
                      src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=1&rel=0`}
                      className="absolute inset-0 w-full h-full"
                      frameBorder="0"
                      allowFullScreen
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      title={`Stream de ${streamer.username}`}
                    />
                  ) : streamer.is_online && streamer.twitch_username ? (
                    // ✅ Fallback Twitch
                    <iframe
                      src={`https://player.twitch.tv/?channel=${streamer.twitch_username}&parent=localhost&autoplay=true`}
                      className="absolute inset-0 w-full h-full"
                      frameBorder="0"
                      allowFullScreen
                      title={`Stream de ${streamer.twitch_username}`}
                    />
                  ) : (
                    // ❌ Hors ligne
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <div className="w-20 h-20 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto mb-4">
                          <FaTwitch size={36} className="text-purple-400" />
                        </div>
                        <p className="text-slate-400 text-lg font-semibold">Ce streamer est hors ligne</p>
                        <p className="text-sm text-slate-600 mt-2">
                          Reviens plus tard pour regarder son stream.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Badge LIVE */}
                {streamer.is_online && (
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold">
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    EN DIRECT
                  </div>
                )}

                {/* Badge plateforme */}
                {streamer.is_online && hasYouTubeVideo && (
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600/90 text-white text-xs font-bold">
                    <FaYoutube size={14} />
                    YouTube
                  </div>
                )}

                {/* Badge "C'est mon stream" */}
                {isMyOwnStream && (
                  <div className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600/90 text-white text-xs font-bold">
                    <User size={12} />
                    Mon stream
                  </div>
                )}
              </div>

              {/* Infos du streamer */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-[#08111f] border border-white/5 rounded-2xl p-5">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-600 to-purple-900 flex items-center justify-center text-xl font-bold shrink-0">
                    {streamer.username?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">{streamer.username}</h2>
                    <p className="text-sm text-slate-400 flex items-center gap-2">
                      <Gamepad2 size={14} className="text-violet-400" />
                      {streamer.stream_game || 'eSport'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Ne pas afficher "Suivre" si c'est mon propre stream */}
                  {!isMyOwnStream && (
                    <button
                      onClick={toggleFollow}
                      className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition flex items-center gap-2 ${
                        isFollowing
                          ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/20'
                          : 'bg-violet-600 hover:bg-violet-500'
                      }`}
                    >
                      {isFollowing ? <FaUserMinus size={14} /> : <FaUserPlus size={14} />}
                      {isFollowing ? 'Suivi' : 'Suivre'}
                    </button>
                  )}

                  <button className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition border border-white/5">
                    <Share2 size={18} />
                  </button>
                  <button className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition border border-white/5">
                    <Bell size={18} />
                  </button>
                </div>
              </div>

              {/* Statistiques */}
              <div className="flex flex-wrap items-center gap-6 text-sm text-slate-400 bg-[#08111f] border border-white/5 rounded-2xl p-5">
                <span className="flex items-center gap-2">
                  <Eye size={16} className="text-red-400" />
                  <span className="text-white font-bold">{streamer.viewer_count || 0}</span> spectateurs
                </span>
                <span className="flex items-center gap-2">
                  <Radio size={16} className="text-violet-400" />
                  {streamer.is_online ? 'En direct' : 'Hors ligne'}
                </span>
                <span className="flex items-center gap-2">
                  <Calendar size={16} className="text-cyan-400" />
                  Dernière vérification : {streamer.last_checked ? new Date(streamer.last_checked).toLocaleDateString() : 'N/A'}
                </span>
              </div>

            </div>

            {/* =================================================
                SIDEBAR : AUTRES STREAMS (1/3)
            ================================================= */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Flame size={19} className="text-orange-400" />
                    Autres streams
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">Les autres streamers de la communauté</p>
                </div>
              </div>

              {otherStreamers.length > 0 ? (
                <div className="space-y-3">
                  {otherStreamers.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        navigate(`streaming/${s.id}`);
                        window.location.reload();
                      }}
                      className="w-full flex items-center gap-3 p-4 rounded-xl bg-[#08111f] border border-white/5 hover:border-violet-500/30 transition text-left"
                    >
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-purple-900 flex items-center justify-center shrink-0">
                        <User size={17} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{s.username}</p>
                        <p className="text-[10px] text-slate-600 truncate mt-1">
                          {s.stream_game || 'Streaming'}
                        </p>
                      </div>
                      <div className="text-right">
                        {s.is_online ? (
                          <span className="flex items-center gap-1 text-[10px] text-red-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                            LIVE
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-600">Hors ligne</span>
                        )}
                        <p className="text-xs text-white mt-1">{formatViewers(s.viewer_count || 0)}</p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl bg-[#08111f] border border-white/5 p-8 text-center">
                  <FaTwitch size={32} className="mx-auto text-slate-700 mb-3" />
                  <p className="text-sm text-slate-500">Aucun autre stream en direct</p>
                </div>
              )}

              <button
                onClick={() => navigate('streaming')}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition text-sm font-medium border border-white/5"
              >
                Voir tous les streams
                <ChevronRight size={16} />
              </button>
            </div>

          </div>
        </div>

        {/* ===== FOOTER ===== */}
        <div className="max-w-[1450px] mx-auto px-5 md:px-8 pb-6 pt-4 border-t border-white/5 text-center text-[10px] text-slate-600 tracking-[0.2em] font-light">
          <p>eSportsConnect • Streaming • © 2026</p>
        </div>

      </main>
    </div>
  );
};

// =====================================================
// UTILITAIRE
// =====================================================
const formatViewers = (viewers) => {
  if (viewers >= 1000) return `${(viewers / 1000).toFixed(1)}K`;
  return viewers.toString();
};

export default StreamDetail;