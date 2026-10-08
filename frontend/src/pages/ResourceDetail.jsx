import React, { useState, useEffect, useRef } from 'react';
import { usePage, useNavigate } from '../context/RouterContext';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft,
  BookMarked,
  Download,
  Eye,
  Share2,
  Bookmark,
  Gamepad2,
  Clock,
  FileText,
  Video,
  Link as LinkIcon,
  Send,
  Heart,
  Tag,
  Play,
  Headphones,
  Loader2,
  MessageSquare,
  Edit3,
} from 'lucide-react';
import API from '../services/api';

// ============================================================
// CONFIGURATION DES TYPES
// ============================================================
const TYPE_LABELS = {
  guide: 'Guide',
  tutoriel: 'Tutoriel',
  article: 'Article',
  video: 'Vidéo',
  podcast: 'Podcast',
};

// ============================================================
// COMPOSANT TYPE ICON
// ============================================================
function TypeIcon({ type }) {
  if (type === 'video' || type === 'Vidéo') return <Video size={17} />;
  if (type === 'podcast' || type === 'Podcast') return <Headphones size={17} />;
  if (type === 'lien' || type === 'Lien') return <LinkIcon size={17} />;
  return <FileText size={17} />;
}

// ============================================================
// FONCTIONS UTILITAIRES (extractions YouTube / Vimeo)
// ============================================================
const getYouTubeId = (url) => {
  if (!url) return null;
  const regExp = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/;
  const match = url.match(regExp);
  return match ? match[1] : null;
};

const getVimeoId = (url) => {
  if (!url) return null;
  const regExp = /vimeo\.com\/(\d+)/;
  const match = url.match(regExp);
  return match ? match[1] : null;
};

// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================
const ResourceDetail = () => {
  const page = usePage();
  const navigate = useNavigate();
  const { user } = useAuth();
  const resourceId = page.split('/')[1];

  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);

  // ✅ Ref pour empêcher l'incrémentation multiple
  const viewIncremented = useRef(false);

  // ============================================================
  // CHARGEMENT DES DONNÉES
  // ============================================================
  useEffect(() => {
    const fetchData = async () => {
      if (!resourceId) return;
      try {
        setLoading(true);

        // ✅ Incrémenter les vues (POST /view/) une seule fois
        if (!viewIncremented.current) {
          await API.post(`/resources/resources/${resourceId}/view/`).catch(() => {});
          viewIncremented.current = true;
        }

        // Récupérer les données (GET)
        const res = await API.get(`/resources/resources/${resourceId}/`);
        setResource(res.data);
        setComments(res.data.comments || []);
      } catch (err) {
        console.error('Erreur chargement ressource:', err);
        setResource(null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [resourceId]);

  // ============================================================
  // COMMENTAIRES
  // ============================================================
  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    try {
      const res = await API.post(`/resources/resources/${resourceId}/comments/`, {
        content: comment.trim(),
      });
      setComments([...comments, res.data]);
      setComment('');
    } catch (err) {
      alert('Erreur lors de l\'envoi du commentaire.');
    }
  };

  // ============================================================
  // LIKES
  // ============================================================
  const handleLike = async () => {
    if (liked) return;
    try {
      await API.post(`/resources/resources/${resourceId}/like/`);
      setResource({ ...resource, likes: resource.likes + 1 });
      setLiked(true);
    } catch (err) {
      console.error(err);
    }
  };

  // ============================================================
  // LECTEUR MÉDIA (vidéo / podcast)
  // ============================================================
  const renderMediaPlayer = () => {
    if (!resource?.url) return null;

    const youTubeId = getYouTubeId(resource.url);
    const vimeoId = getVimeoId(resource.url);

    // VIDEO
    if (resource.resource_type === 'video') {
      if (youTubeId) {
        return (
          <div className="aspect-video w-full rounded-xl overflow-hidden border border-white/10">
            <iframe
              src={`https://www.youtube.com/embed/${youTubeId}`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        );
      } else if (vimeoId) {
        return (
          <div className="aspect-video w-full rounded-xl overflow-hidden border border-white/10">
            <iframe
              src={`https://player.vimeo.com/video/${vimeoId}`}
              frameBorder="0"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        );
      } else {
        return (
          <a
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-white/5 border border-white/10 rounded-xl p-6 text-center hover:border-cyan-500/30 transition"
          >
            <Play className="text-cyan-400 text-4xl mx-auto mb-2" />
            <span className="text-cyan-400">▶ Lire la vidéo</span>
          </a>
        );
      }
    }

    // PODCAST
    if (resource.resource_type === 'podcast') {
      if (resource.url.includes('soundcloud.com')) {
        const embedUrl = `https://w.soundcloud.com/player/?url=${encodeURIComponent(resource.url)}&color=%2300aaff&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true`;
        return (
          <div className="w-full rounded-xl overflow-hidden border border-white/10 bg-black/30 p-4">
            <iframe
              src={embedUrl}
              frameBorder="0"
              allow="autoplay; encrypted-media"
              className="w-full h-[120px]"
              title="SoundCloud player"
            />
          </div>
        );
      }
      if (resource.url.includes('spotify.com')) {
        return (
          <div className="w-full rounded-xl overflow-hidden border border-white/10 bg-black/30 p-4">
            <iframe
              src={resource.url}
              frameBorder="0"
              allow="autoplay; encrypted-media"
              className="w-full h-[80px]"
              title="Spotify player"
            />
          </div>
        );
      }
      return (
        <a
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block bg-white/5 border border-white/10 rounded-xl p-6 text-center hover:border-purple-500/30 transition"
        >
          <Headphones className="text-purple-400 text-4xl mx-auto mb-2" />
          <span className="text-purple-400">▶ Écouter le podcast</span>
        </a>
      );
    }

    return null;
  };

  // ============================================================
  // RENDU
  // ============================================================
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#020817]">
        <Loader2 className="animate-spin text-violet-500" size={40} />
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#020817] text-red-400">
        <div className="text-center">
          <p className="text-xl">Ressource introuvable</p>
          <button onClick={() => navigate('resources')} className="mt-4 text-violet-400 hover:text-violet-300 transition">
            Retour aux ressources
          </button>
        </div>
      </div>
    );
  }

  const typeLabel = TYPE_LABELS[resource.resource_type] || resource.resource_type || 'Ressource';
  const tags = resource.tags ? resource.tags.split(',').map(t => t.trim()) : [];

  return (
    <div className="min-h-screen bg-[#020817] text-white">
      <main className="ml-0 md:ml-[250px] min-h-screen">
        <div className="max-w-[1450px] mx-auto px-5 md:px-8 py-6">

          {/* ===== BOUTON RETOUR ===== */}
          <button
            onClick={() => navigate('resources')}
            className="mb-6 flex items-center gap-2 text-sm text-slate-500 transition hover:text-white"
          >
            <ArrowLeft size={17} />
            Retour aux ressources
          </button>

          {/* ===== HERO ===== */}
          <section className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#07111e]">
            <div className="relative h-[320px]">
              <img
                src={resource.image || 'https://images.unsplash.com/photo-1603481546238-487240415921?auto=format&fit=crop&w=1400&q=80'}
                alt={resource.title}
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1603481546238-487240415921?auto=format&fit=crop&w=1400&q=80';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#020817] via-[#020817]/85 to-[#020817]/30" />
              <div className="absolute inset-0 flex items-end">
                <div className="max-w-3xl p-8 md:p-10">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-lg bg-violet-600 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider">
                      {resource.category?.name || 'Ressource'}
                    </span>
                    <span className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-black/30 px-3 py-1.5 text-[10px] text-slate-300">
                      <TypeIcon type={resource.resource_type} />
                      {typeLabel}
                    </span>
                  </div>
                  <h1 className="mt-4 text-3xl font-bold md:text-4xl">{resource.title}</h1>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">{resource.description}</p>
                  <div className="mt-5 flex flex-wrap items-center gap-5 text-xs text-slate-400">
                    <span className="flex items-center gap-2">
                      <Gamepad2 size={15} className="text-violet-400" />
                      {resource.game || 'eSport'}
                    </span>
                    <span className="flex items-center gap-2">
                      <Eye size={15} />
                      {resource.views || 0} vues
                    </span>
                    <span className="flex items-center gap-2">
                      <Clock size={15} />
                      {resource.duration || '5 min'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ===== LECTEUR MÉDIA ===== */}
          {renderMediaPlayer()}

          {/* ===== CONTENU GRID ===== */}
          <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_330px]">

            {/* ===== COLONNE GAUCHE ===== */}
            <section>
              <div className="rounded-2xl border border-white/[0.06] bg-[#07111e] p-7 md:p-9">
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-5">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-violet-400">Ressource</p>
                    <h2 className="mt-1 text-xl font-semibold">Contenu</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSaved(!saved)}
                      className={`flex h-9 w-9 items-center justify-center rounded-lg border transition ${
                        saved
                          ? 'border-violet-500/30 bg-violet-500/10 text-violet-400'
                          : 'border-white/[0.06] text-slate-500 hover:text-white'
                      }`}
                    >
                      <Bookmark size={17} />
                    </button>
                    <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.06] text-slate-500 hover:text-white">
                      <Share2 size={17} />
                    </button>
                  </div>
                </div>

                <div className="mt-7 whitespace-pre-line text-[15px] leading-8 text-slate-300">
                  {resource.content || 'Aucun contenu disponible.'}
                </div>

                {resource.url && resource.resource_type !== 'video' && resource.resource_type !== 'podcast' && (
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-4 text-cyan-400 hover:text-cyan-300 transition flex items-center gap-2"
                  >
                    🔗 Voir la ressource originale
                  </a>
                )}

                {/* Tags */}
                {tags.length > 0 && (
                  <div className="mt-6 flex flex-wrap gap-2">
                    {tags.map((tag, i) => (
                      <span key={i} className="text-xs bg-white/5 px-3 py-1 rounded-full border border-white/10 text-gray-400 flex items-center gap-1">
                        <Tag size={12} className="text-cyan-400" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-8 flex flex-wrap gap-3">
                  <button
                    onClick={handleLike}
                    disabled={liked}
                    className={`flex items-center gap-2 rounded-xl border px-5 py-3 text-sm transition ${
                      liked
                        ? 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400'
                        : 'border-white/[0.07] text-slate-400 hover:text-white'
                    }`}
                  >
                    <Heart size={17} className={liked ? 'fill-yellow-400 text-yellow-400' : ''} />
                    {liked ? 'Aimé' : "J'aime"} ({resource.likes || 0})
                  </button>
                </div>
              </div>

              {/* ===== COMMENTAIRES ===== */}
              <div className="mt-6 rounded-2xl border border-white/[0.06] bg-[#07111e] p-7">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <MessageSquare size={20} className="text-violet-400" />
                  Commentaires ({comments.length})
                </h2>

                {user ? (
                  <form onSubmit={handleComment} className="mt-5 flex gap-3">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.username}
                        className="h-9 w-9 rounded-full object-cover border border-white/10"
                      />
                    ) : (
                      <div className="h-9 w-9 rounded-full bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center text-sm font-bold text-white shrink-0">
                        {(user.username || 'U').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex flex-1 items-center rounded-xl border border-white/[0.06] bg-[#030b16] px-3">
                      <input
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Écrire un commentaire..."
                        className="min-w-0 flex-1 bg-transparent px-2 py-3 text-sm text-white outline-none placeholder:text-slate-600"
                      />
                      <button type="submit" className="text-violet-400 hover:text-violet-300">
                        <Send size={18} />
                      </button>
                    </div>
                  </form>
                ) : (
                  <p className="text-sm text-slate-500 mt-4">Connectez-vous pour commenter.</p>
                )}

                <div className="mt-7 space-y-5">
                  {comments.length === 0 ? (
                    <p className="text-center text-sm text-slate-500 py-4">Aucun commentaire.</p>
                  ) : (
                    comments.map((c) => (
                      <div key={c.id} className="flex gap-3">
                        {c.user_avatar ? (
                          <img
                            src={c.user_avatar}
                            alt={c.user_username}
                            className="h-9 w-9 rounded-full object-cover border border-white/10 shrink-0"
                          />
                        ) : (
                          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center text-sm font-bold text-white shrink-0">
                            {(c.user_username || 'U').charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold">{c.user_username}</p>
                            <span className="text-[10px] text-slate-600">
                              {c.created_at ? new Date(c.created_at).toLocaleDateString() : ''}
                            </span>
                          </div>
                          <p className="mt-1 text-sm leading-6 text-slate-400">{c.content}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </section>

            {/* ===== COLONNE DROITE ===== */}
            <aside className="space-y-5">

              {/* Informations */}
              <div className="rounded-2xl border border-white/[0.06] bg-[#07111e] p-5">
                <h3 className="font-semibold">Informations</h3>
                <div className="mt-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Jeu</span>
                    <span className="text-xs text-slate-200">{resource.game || 'eSport'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Type</span>
                    <span className="text-xs text-slate-200">{typeLabel}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Publié le</span>
                    <span className="text-xs text-slate-200">
                      {resource.created_at ? new Date(resource.created_at).toLocaleDateString() : ''}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Téléchargements</span>
                    <span className="text-xs text-slate-200">{resource.downloads || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Vues</span>
                    <span className="text-xs text-slate-200">{resource.views || 0}</span>
                  </div>
                </div>
              </div>

              {/* ✅ BOUTON MODIFIER POUR COACH */}
              {(user?.role === 'coach' || user?.is_superuser) && (
                <button
                  onClick={() => navigate(`edit-resource/${resourceId}`)}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-5 py-3 text-sm font-semibold text-black shadow-lg shadow-cyan-500/20 transition-all duration-300 hover:brightness-110 hover:shadow-xl hover:shadow-cyan-500/30"
                >
                  <Edit3 size={17} />
                  Modifier la ressource
                </button>
              )}

              {/* Continue l'entraînement */}
              <div className="rounded-2xl border border-violet-500/10 bg-gradient-to-br from-violet-900/20 to-[#07111e] p-5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/10 text-violet-400">
                  <BookMarked size={18} />
                </div>
                <h3 className="mt-4 font-semibold">Continue ton entraînement</h3>
                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Découvre les cours disponibles pour améliorer ton niveau.
                </p>
                <button
                  onClick={() => navigate('courses')}
                  className="mt-4 w-full rounded-lg bg-violet-600 py-2.5 text-xs font-semibold hover:bg-violet-500 transition"
                >
                  Découvrir les cours
                </button>
              </div>

            </aside>
          </div>

          {/* ===== FOOTER ===== */}
          <div className="mt-10 pt-6 border-t border-white/5 text-center text-[10px] text-slate-600 tracking-[0.2em] font-light">
            <p>eSportsConnect • Détail de la ressource • © 2026</p>
          </div>

        </div>
      </main>
    </div>
  );
};

export default ResourceDetail;