import React, { useState, useEffect } from 'react';
import { usePage, useNavigate } from '../context/RouterContext';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Gamepad2,
  GraduationCap,
  Loader2,
  Play,
  Sparkles,
  Trophy,
  Users,
  Video,
  Lock,
  MessageSquare,
  Paperclip,
  Link2,
  Trash2,
  Plus,
  Send,
  Calendar as CalendarIcon,
  User,
  Eye,
  Star,
  Share2,
  Bookmark,
  Award,
  Target,
  Zap,
  Shield,
  Tv,
  Headphones,
  ThumbsUp
} from 'lucide-react';
import API from '../services/api';

// ============================================================
// FONCTIONS UTILITAIRES
// ============================================================

const getYouTubeEmbedUrl = (url) => {
  if (!url) return null;
  if (url.includes('watch?v=')) {
    return url.replace('watch?v=', 'embed/');
  }
  if (url.includes('youtu.be/')) {
    return url.replace('youtu.be/', 'youtube.com/embed/');
  }
  if (url.includes('embed/')) return url;
  return url;
};

const isYouTubeUrl = (url) => {
  return url && (url.includes('youtube.com') || url.includes('youtu.be'));
};

const getField = (obj, keys, defaultValue = '') => {
  for (const key of keys) {
    if (obj?.[key] !== undefined && obj?.[key] !== null && obj?.[key] !== '') {
      return obj[key];
    }
  }
  return defaultValue;
};

const levelColors = {
  'Débutant': 'bg-green-500/20 text-green-400 border-green-400/30',
  'Intermédiaire': 'bg-yellow-500/20 text-yellow-400 border-yellow-400/30',
  'Avancé': 'bg-red-500/20 text-red-400 border-red-400/30',
  'Expert': 'bg-purple-500/20 text-purple-400 border-purple-400/30'
};

// ============================================================
// FALLBACK
// ============================================================
const getDefaultProgram = (gameName = '') => {
  const gameLower = String(gameName).toLowerCase();
  if (gameLower.includes('valorant')) {
    return [
      { title: 'Introduction', duration: '00:00' },
      { title: 'Règles de Valo', duration: '00:25' },
      { title: 'Présentation des Rôles', duration: '00:50' },
      { title: 'Savoir quel rôle jouer', duration: '01:40' },
      { title: "Comprendre l'aim Valo", duration: '02:13' },
      { title: 'PIRES Erreurs à éviter', duration: '02:59' },
      { title: 'Personnages & Compos', duration: '04:34' },
      { title: 'La communication', duration: '05:43' },
      { title: 'Vocabulaire Valo', duration: '06:55' },
      { title: 'Rota & Over rota', duration: '08:18' },
      { title: 'Lead la game', duration: '08:40' },
      { title: 'Questions ?', duration: '09:08' }
    ];
  }
  if (gameLower.includes('league of legends') || gameLower.includes('lol')) {
    return [
      { title: 'Introduction à la botlane', duration: '00:00' },
      { title: 'Farm et positionnement', duration: '03:00' },
      { title: 'Gestion des vagues', duration: '06:00' },
      { title: 'Trades et all-in', duration: '09:00' },
      { title: 'Vision et roams', duration: '12:00' },
      { title: 'Teamfights et objectifs', duration: '15:00' }
    ];
  }
  return [
    { title: 'Introduction', duration: '00:00' },
    { title: 'Les bases de l\'aim', duration: '02:15' },
    { title: 'Réglages et sensibilité', duration: '04:30' },
    { title: 'Exercices de tracking', duration: '06:30' },
    { title: 'Exercices de flicking', duration: '08:45' },
    { title: 'Routine d\'entraînement', duration: '10:00' },
    { title: 'Analyse de gameplay', duration: '12:30' },
    { title: 'Conclusion', duration: '14:00' }
  ];
};

// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================

const CourseDetail = () => {
  const page = usePage();
  const navigate = useNavigate();
  const { user } = useAuth();
  const courseId = page.split('/')[1];

  // États
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [enrollmentStatus, setEnrollmentStatus] = useState(null);
  const [enrollmentProgress, setEnrollmentProgress] = useState(0);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [resources, setResources] = useState([]);
  const [newResource, setNewResource] = useState({ title: '', file: null, link: '' });
  const [showResourceForm, setShowResourceForm] = useState(false);
  const [liveSessions, setLiveSessions] = useState([]);
  const [newSession, setNewSession] = useState({
    title: '',
    description: '',
    scheduled_at: '',
    duration: 60,
    stream_url: ''
  });
  const [showSessionForm, setShowSessionForm] = useState(false);
  const [activeTab, setActiveTab] = useState('about');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [similarCourses, setSimilarCourses] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');

  const isCoach = user?.role === 'coach';
  const isPlayer = user?.role === 'player';
  const canViewContent = isCoach || enrollmentStatus === 'approved';
  const isPending = enrollmentStatus === 'pending';

  // ============================================================
  // CHARGEMENT
  // ============================================================

  useEffect(() => {
    if (courseId) fetchCourseData();
  }, [courseId]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      setError('');

      const courseRes = await API.get(`/courses/${courseId}/`);
      const courseData = courseRes.data;

      let enrollData = { status: null, progress: 0 };
      try {
        const enrollRes = await API.get(`/courses/${courseId}/my-enrollment/`);
        enrollData = enrollRes.data;
      } catch (e) {}

      let commentsData = [];
      try {
        const commentsRes = await API.get(`/courses/${courseId}/comments/`);
        commentsData = commentsRes.data;
      } catch (e) {}

      let resourcesData = [];
      try {
        const resourcesRes = await API.get(`/courses/${courseId}/resources/`);
        resourcesData = resourcesRes.data;
      } catch (e) {}

      let sessionsData = [];
      try {
        const sessionsRes = await API.get(`/courses/${courseId}/live-sessions/`);
        sessionsData = sessionsRes.data;
      } catch (e) {}

      let reviewsData = [];
      try {
        const reviewsRes = await API.get(`/courses/${courseId}/reviews/`);
        reviewsData = reviewsRes.data;
      } catch (e) {}

      let similarData = [];
      try {
        const similarRes = await API.get(`/courses/${courseId}/similar/`);
        similarData = similarRes.data;
      } catch (e) {}

      setCourse(courseData);
      setEnrollmentStatus(enrollData.status || null);
      setEnrollmentProgress(enrollData.progress || 0);
      setComments(Array.isArray(commentsData) ? commentsData : []);
      setResources(Array.isArray(resourcesData) ? resourcesData : []);
      setLiveSessions(Array.isArray(sessionsData) ? sessionsData : []);
      setReviews(Array.isArray(reviewsData) ? reviewsData : []);
      setSimilarCourses(Array.isArray(similarData) ? similarData : []);
    } catch (err) {
      console.error('❌ Erreur chargement:', err);
      setError(err.message || 'Impossible de charger le cours.');
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // ACTIONS
  // ============================================================

  const handleEnroll = async () => {
    try {
      const res = await API.post(`/courses/register/${courseId}/`);
      setEnrollmentStatus(res.data.status);
      alert('✅ Demande envoyée ! En attente du coach.');
    } catch (err) {
      alert('Erreur lors de la demande.');
    }
  };

  const handleMarkComplete = async () => {
    try {
      await API.post(`/courses/${courseId}/complete/`);
      setEnrollmentProgress(100);
      alert('✅ Cours marqué comme terminé !');
    } catch (err) {
      alert('Erreur.');
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      const payload = { content: newComment };
      if (replyTo) payload.parent_id = replyTo;
      const res = await API.post(`/courses/${courseId}/comments/`, payload);
      setComments([res.data, ...comments]);
      setNewComment('');
      setReplyTo(null);
    } catch (err) {
      alert('Erreur envoi commentaire.');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Supprimer ce commentaire ?')) return;
    try {
      await API.delete(`/comments/${commentId}/`);
      setComments(comments.filter(c => c.id !== commentId));
    } catch (err) {
      alert('Erreur suppression.');
    }
  };

  const handleResourceSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', newResource.title);
    if (newResource.file) formData.append('file', newResource.file);
    if (newResource.link) formData.append('link', newResource.link);
    try {
      const res = await API.post(`/courses/${courseId}/resources/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResources([...resources, res.data]);
      setNewResource({ title: '', file: null, link: '' });
      setShowResourceForm(false);
    } catch (err) {
      alert('Erreur ajout ressource.');
    }
  };

  const handleDeleteResource = async (resourceId) => {
    if (!window.confirm('Supprimer cette ressource ?')) return;
    try {
      await API.delete(`/resources/${resourceId}/`);
      setResources(resources.filter(r => r.id !== resourceId));
    } catch (err) {
      alert('Erreur suppression.');
    }
  };

  const handleSessionSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post(`/courses/${courseId}/live-sessions/`, newSession);
      setLiveSessions([...liveSessions, res.data]);
      setNewSession({ title: '', description: '', scheduled_at: '', duration: 60, stream_url: '' });
      setShowSessionForm(false);
    } catch (err) {
      alert('Erreur planification session.');
    }
  };

  const handleDeleteSession = async (sessionId) => {
    if (!window.confirm('Supprimer cette session ?')) return;
    try {
      await API.delete(`/live-sessions/${sessionId}/`);
      setLiveSessions(liveSessions.filter(s => s.id !== sessionId));
    } catch (err) {
      alert('Erreur suppression.');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewError('');

    if (!user) {
      setReviewError('Connectez-vous pour laisser un avis');
      return;
    }

    const trimmedComment = newReview.comment?.trim() || '';
    if (trimmedComment.length === 0) {
      setReviewError('Veuillez écrire un commentaire');
      return;
    }

    try {
      setSubmittingReview(true);
      await API.post(`/courses/${courseId}/reviews/`, newReview);
      setNewReview({ rating: 5, comment: '' });
      setReviewError('');
      const res = await API.get(`/courses/${courseId}/reviews/`);
      setReviews(res.data);
      alert('✅ Votre avis a été ajouté !');
    } catch (err) {
      console.error(err);
      setReviewError(err.response?.data?.error || 'Erreur lors de l\'envoi de l\'avis');
    } finally {
      setSubmittingReview(false);
    }
  };

  // ============================================================
  // RENDU
  // ============================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-violet-500 animate-spin mx-auto" />
          <p className="text-slate-400 mt-4">Chargement du cours...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-red-500/10 flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Cours introuvable</h2>
          <p className="text-slate-400 mb-6">{error || 'Ce cours n\'existe pas ou a été supprimé.'}</p>
          <button
            onClick={() => navigate('courses')}
            className="px-5 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 transition text-white"
          >
            Retour aux cours
          </button>
        </div>
      </div>
    );
  }

  // ============================================================
  // EXTRACTION DES DONNÉES
  // ============================================================

  const title = String(getField(course, ['title', 'titre'], 'Cours sans titre'));
  const description = String(getField(course, ['description', 'desc'], 'Aucune description disponible.'));
  const image = getField(course, ['image', 'thumbnail'], 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1400&q=80');
  const videoUrl = getYouTubeEmbedUrl(getField(course, ['video_url', 'video']));
  const isYouTube = videoUrl && (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be'));

  const coachName = String(getField(course, ['coach_username', 'coach_name', 'coach'], 'Coach'));
  const level = String(getField(course, ['difficulty_level', 'niveau', 'level'], 'Intermédiaire'));
  const gameObj = getField(course, ['game', 'jeu'], '');
  const game = typeof gameObj === 'object' && gameObj !== null
    ? String(gameObj.name || '')
    : String(gameObj || '');
  const duration = String(getField(course, ['duration', 'duree'], '30 min'));
  const students = Number(getField(course, ['students_count', 'nombre_inscrits'], 0));
  const price = Number(getField(course, ['price', 'prix'], 0));
  const views = Number(getField(course, ['views', 'vues'], 0));
  const createdAt = getField(course, ['created_at', 'date_creation'], null);
  const type = String(getField(course, ['type', 'course_type'], 'Formation'));

  // ============================================================
  // PROGRAMME
  // ============================================================
  let program = getField(course, ['program'], null);
  if (typeof program === 'string') {
    try {
      program = JSON.parse(program);
    } catch (e) {
      program = program.split(',').map(item => item.trim()).filter(item => item);
    }
  }
  if (!Array.isArray(program) || program.length === 0) {
    program = getDefaultProgram(game);
  }
  if (Array.isArray(program) && typeof program[0] === 'string') {
    program = program.map((title, index) => ({
      title: title,
      duration: index < 3 ? '02:15' : index < 5 ? '06:30' : '04:50'
    }));
  }

  const questions = comments.filter(c => !c.parent);
  const getReplies = (parentId) => comments.filter(c => c.parent === parentId);

  const averageRating = reviews.length > 0
    ? reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / reviews.length
    : 0;

  const renderStars = (rating) => {
    const stars = [];
    const full = Math.floor(rating);
    const half = rating - full >= 0.5 ? 1 : 0;
    const empty = 5 - full - half;
    for (let i = 0; i < full; i++) stars.push(<Star key={`full-${i}`} className="w-3 h-3 fill-yellow-400 text-yellow-400" />);
    if (half) stars.push(<Star key="half" className="w-3 h-3 fill-yellow-400 text-yellow-400" />);
    for (let i = 0; i < empty; i++) stars.push(<Star key={`empty-${i}`} className="w-3 h-3 text-slate-600" />);
    return stars;
  };

  // Icône pour le niveau
  const levelIcon = {
    'Débutant': <Shield className="w-4 h-4" />,
    'Intermédiaire': <Target className="w-4 h-4" />,
    'Avancé': <Zap className="w-4 h-4" />,
    'Expert': <Award className="w-4 h-4" />
  };

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white">
      <main className="ml-0 md:ml-[236px] min-h-screen">

        {/* ===== HERO BANNER ===== */}
        <div className="relative overflow-hidden bg-gradient-to-br from-violet-950/80 via-indigo-950/60 to-slate-900/80 border-b border-white/5">
          <div className="absolute inset-0">
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover opacity-10"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0a0f1e] via-transparent to-transparent" />
          </div>
          <div className="relative z-10 px-6 md:px-10 py-10 md:py-14 max-w-7xl mx-auto">
            <button
              onClick={() => navigate('courses')}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition group mb-6"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition" />
              <span className="text-sm">Retour aux cours</span>
            </button>
            <div className="flex flex-wrap items-start justify-between gap-6">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <span className="px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-400/20 text-cyan-300 text-xs font-medium flex items-center gap-1.5">
                    <Gamepad2 className="w-3 h-3" />
                    {game}
                  </span>
                  <span className={`px-3 py-1 rounded-full border text-xs font-medium flex items-center gap-1.5 ${levelColors[level] || levelColors['Intermédiaire']}`}>
                    {levelIcon[level] || <Target className="w-3 h-3" />}
                    {level}
                  </span>
                  <span className="flex items-center gap-1 text-sm text-slate-400">
                    <User className="w-4 h-4 text-violet-400" />
                    {coachName}
                  </span>
                </div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
                  {title}
                </h1>
                <p className="text-slate-400 text-sm mt-2 max-w-2xl line-clamp-2">{description}</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setIsBookmarked(!isBookmarked)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition ${
                    isBookmarked
                      ? 'bg-violet-500/20 border-violet-500/30 text-violet-400'
                      : 'border-white/10 hover:border-white/20 text-slate-400 hover:text-white'
                  }`}
                >
                  <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-violet-400' : ''}`} />
                  <span className="text-sm hidden sm:inline">{isBookmarked ? 'Enregistré' : 'Enregistrer'}</span>
                </button>
                <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 hover:border-white/20 text-slate-400 hover:text-white transition">
                  <Share2 className="w-4 h-4" />
                  <span className="text-sm hidden sm:inline">Partager</span>
                </button>
                {isPlayer && enrollmentStatus === null && (
                  <button
                    onClick={handleEnroll}
                    className="px-6 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 transition font-medium shadow-lg shadow-violet-600/25"
                  >
                    S'inscrire
                  </button>
                )}
                {isPending && (
                  <span className="px-6 py-2 rounded-xl bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> En attente
                  </span>
                )}
                {enrollmentStatus === 'approved' && (
                  <span className="px-6 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> Inscrit
                  </span>
                )}
                {isCoach && (
                  <span className="px-6 py-2 rounded-xl bg-violet-500/20 border border-violet-500/30 text-violet-400 flex items-center gap-2">
                    <Trophy className="w-4 h-4" /> Coach
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-5 mt-5 pt-5 border-t border-white/5 text-sm text-slate-400">
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-violet-400" />
                {duration} min
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-violet-400" />
                {students} participants
              </span>
              {views > 0 && (
                <span className="flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-violet-400" />
                  {views} vues
                </span>
              )}
              <span className="flex items-center gap-1.5">
                {renderStars(averageRating || 0)}
                <span className="text-white font-medium ml-1">{averageRating ? averageRating.toFixed(1) : 'N/A'}</span>
                <span className="text-slate-500">({reviews.length || 0} avis)</span>
              </span>
              {price > 0 && (
                <span className="flex items-center gap-1.5 text-yellow-400">
                  <Trophy className="w-4 h-4" />
                  {price} DH
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ===== PROGRESSION ===== */}
        {isPlayer && enrollmentStatus === 'approved' && (
          <div className="px-6 md:px-10 py-4 bg-white/5 border-b border-white/5">
            <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-slate-300">Progression</span>
                <div className="w-48 h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-violet-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(enrollmentProgress, 100)}%` }}
                  />
                </div>
                <span className="text-sm font-bold text-cyan-400">{Math.min(enrollmentProgress, 100)}%</span>
              </div>
              <button
                onClick={handleMarkComplete}
                className="text-xs bg-green-500/10 text-green-400 px-4 py-1.5 rounded-lg hover:bg-green-500/20 transition"
              >
                Marquer terminé
              </button>
            </div>
          </div>
        )}

        {/* ===== CONTENU PRINCIPAL ===== */}
        <div className="px-6 md:px-10 py-8 max-w-7xl mx-auto">

          {/* ===== VIDÉO + SIDEBAR ===== */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 mb-8">

            {/* Vidéo */}
            <div className="rounded-2xl overflow-hidden bg-black/30 border border-white/5">
              {videoUrl ? (
                <div className="aspect-video bg-black relative">
                  <iframe
                    src={videoUrl}
                    title={title}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                  {isYouTube && (
                    <a
                      href={getField(course, ['video_url', 'video'])}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute bottom-4 right-4 bg-black/70 hover:bg-black/90 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition backdrop-blur-sm border border-white/10"
                    >
                      <Play className="w-4 h-4 text-red-400" />
                      Ouvrir sur YouTube
                    </a>
                  )}
                </div>
              ) : (
                <div className="aspect-video flex flex-col items-center justify-center bg-black/30 text-slate-500">
                  <Play className="w-16 h-16 mb-3 opacity-20" />
                  <p>Aucune vidéo disponible</p>
                </div>
              )}
            </div>

            {/* Sidebar stylisée */}
            <aside className="space-y-5">
              {/* Détails du cours */}
              <div className="rounded-2xl bg-white/5 border border-white/5 p-6 backdrop-blur-sm">
                <h3 className="font-bold text-sm uppercase tracking-wider text-slate-400 mb-4 border-b border-white/5 pb-3 flex items-center gap-2">
                  <InfoIcon className="w-4 h-4 text-violet-400" />
                  Détails du cours
                </h3>
                <div className="space-y-3">
                  <SidebarInfo label="Catégorie" value={type} icon={<Tv className="w-4 h-4 text-violet-400" />} />
                  <SidebarInfo label="Jeu" value={game} icon={<Gamepad2 className="w-4 h-4 text-violet-400" />} />
                  <SidebarInfo label="Niveau" value={level} icon={<GraduationCap className="w-4 h-4 text-violet-400" />} />
                  <SidebarInfo label="Durée" value={`${duration} min`} icon={<Clock className="w-4 h-4 text-violet-400" />} />
                  <SidebarInfo label="Coach" value={coachName} icon={<User className="w-4 h-4 text-violet-400" />} />
                  {createdAt && (
                    <SidebarInfo
                      label="Dernière mise à jour"
                      value={new Date(createdAt).toLocaleDateString('fr-FR')}
                      icon={<Calendar className="w-4 h-4 text-violet-400" />}
                    />
                  )}
                </div>
              </div>

              {/* Coach */}
              <div className="rounded-2xl bg-white/5 border border-white/5 p-6 backdrop-blur-sm">
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Headphones className="w-4 h-4 text-violet-400" />
                  Coach
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-500 to-cyan-400 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-violet-600/20">
                    {coachName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{coachName}</h3>
                    <p className="text-xs text-slate-500">Coach eSports</p>
                  </div>
                </div>
              </div>

              {/* Statut d'inscription */}
              {isPlayer && enrollmentStatus === null && (
                <button
                  onClick={handleEnroll}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 transition font-medium shadow-lg shadow-violet-600/25"
                >
                  S'inscrire au cours
                </button>
              )}
              {isPending && (
                <div className="w-full py-3.5 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-center font-medium flex items-center justify-center gap-2 text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" /> En attente d'approbation
                </div>
              )}
              {enrollmentStatus === 'approved' && (
                <div className="w-full py-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-center font-medium text-sm flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Vous êtes inscrit
                </div>
              )}
              {isCoach && (
                <div className="w-full py-3.5 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 text-center font-medium text-sm">
                  👨‍🏫 Vous êtes le coach
                </div>
              )}
            </aside>
          </div>

          {/* ===== ONGLETS ===== */}
          <div className="border-b border-white/5 mb-6">
            <div className="flex gap-6 overflow-x-auto">
              {[
                { id: 'about', label: 'À propos' },
                { id: 'content', label: 'Contenu du cours' },
                { id: 'reviews', label: `Avis (${reviews.length || 0})` },
                { id: 'questions', label: `Questions (${questions.length})` }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`pb-3 text-sm font-medium transition whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'text-white border-b-2 border-violet-500'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* ===== CONTENU DES ONGLETS ===== */}
          <div className="grid grid-cols-1 gap-8">

            {/* TAB: À PROPOS */}
            {activeTab === 'about' && (
              <div>
                {!canViewContent ? (
                  <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/5">
                    <Lock className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                    <p className="text-slate-400 text-sm">Contenu verrouillé. Inscrivez-vous pour y accéder.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="bg-white/5 border border-white/5 rounded-2xl p-6 backdrop-blur-sm">
                      <h3 className="font-bold mb-3 flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-violet-400" />
                        À propos
                      </h3>
                      <p className="text-slate-300 leading-relaxed text-sm whitespace-pre-wrap">
                        {description}
                      </p>
                    </div>
                    <div className="bg-white/5 border border-white/5 rounded-2xl p-6 backdrop-blur-sm">
                      <h3 className="font-bold mb-4 flex items-center gap-2">
                        <Target className="w-5 h-5 text-violet-400" />
                        Ce que tu vas apprendre
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {Array.isArray(program) && program.map((item, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm text-slate-300">
                            <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                            <span>{typeof item === 'object' ? item.title : item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB: CONTENU */}
            {activeTab === 'content' && (
              <div>
                {!canViewContent ? (
                  <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/5">
                    <Lock className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                    <p className="text-slate-400 text-sm">Contenu verrouillé. Inscrivez-vous pour y accéder.</p>
                  </div>
                ) : (
                  <div className="bg-white/5 border border-white/5 rounded-2xl p-6 backdrop-blur-sm">
                    <h3 className="font-bold mb-4 flex items-center gap-2">
                      <Video className="w-5 h-5 text-violet-400" />
                      Contenu du cours
                    </h3>
                    <div className="space-y-2">
                      {Array.isArray(program) && program.map((item, index) => {
                        const title = typeof item === 'object' ? item.title : item;
                        const duration = typeof item === 'object' && item.duration ? item.duration : '00:00';
                        return (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:border-violet-500/20 transition"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-xs text-slate-500 w-6">{index + 1}</span>
                              <span className="text-sm text-slate-300">{title}</span>
                            </div>
                            <span className="text-xs text-slate-500">{duration}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB: AVIS */}
            {activeTab === 'reviews' && (
              <div className="bg-white/5 border border-white/5 rounded-2xl p-6 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold flex items-center gap-2">
                    <ThumbsUp className="w-5 h-5 text-violet-400" />
                    Avis des étudiants
                  </h3>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-0.5">
                      {renderStars(averageRating || 0)}
                    </div>
                    <span className="text-white font-bold">{averageRating ? averageRating.toFixed(1) : 'N/A'}</span>
                    <span className="text-sm text-slate-500">({reviews.length || 0} avis)</span>
                  </div>
                </div>

                {user && (
                  <form onSubmit={handleReviewSubmit} className="mb-6 bg-black/20 border border-white/5 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-sm font-medium text-slate-300">Votre note :</span>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewReview({ ...newReview, rating: star })}
                          className="text-2xl transition hover:scale-110 focus:outline-none"
                        >
                          {star <= newReview.rating ? '⭐' : '☆'}
                        </button>
                      ))}
                    </div>
                    <textarea
                      rows="3"
                      placeholder="Partagez votre expérience avec ce cours..."
                      value={newReview.comment}
                      onChange={(e) => {
                        setNewReview({ ...newReview, comment: e.target.value });
                        setReviewError('');
                      }}
                      className={`w-full p-2.5 bg-black/30 border rounded-lg text-white text-sm resize-none ${
                        reviewError ? 'border-red-500' : 'border-white/10'
                      }`}
                    />
                    {reviewError && (
                      <p className="text-red-400 text-xs mt-1">{reviewError}</p>
                    )}
                    <button
                      type="submit"
                      disabled={submittingReview || !newReview.comment.trim()}
                      className={`mt-3 px-5 py-2 rounded-lg font-medium transition ${
                        submittingReview || !newReview.comment.trim()
                          ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                          : 'bg-violet-600 hover:bg-violet-500 text-white'
                      }`}
                    >
                      {submittingReview ? 'Envoi...' : 'Envoyer l\'avis'}
                    </button>
                  </form>
                )}

                {reviews.length === 0 ? (
                  <p className="text-slate-400 text-sm text-center py-6">Aucun avis pour le moment. Soyez le premier à donner votre avis !</p>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((r) => (
                      <div key={r.id} className="border-b border-white/5 pb-4 last:border-0 last:pb-0">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center text-sm font-bold text-white">
                            {(r.author_username || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{r.author_username || 'Utilisateur'}</p>
                            <div className="flex items-center gap-1">
                              {renderStars(r.rating || 0)}
                              <span className="text-xs text-slate-500 ml-2">
                                {r.created_at ? new Date(r.created_at).toLocaleDateString('fr-FR') : 'Récemment'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <p className="text-slate-300 text-sm">{r.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB: QUESTIONS */}
            {activeTab === 'questions' && (
              <div className="bg-white/5 border border-white/5 rounded-2xl p-6 backdrop-blur-sm">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-violet-400" />
                  Questions & commentaires
                </h3>

                {user && (
                  <form onSubmit={handleCommentSubmit} className="mb-6">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder={replyTo ? 'Écrire une réponse...' : 'Poser une question...'}
                        value={newComment}
                        onChange={e => setNewComment(e.target.value)}
                        className="flex-1 p-2.5 bg-black/30 border border-white/10 rounded-lg text-white text-sm"
                      />
                      <button type="submit" className="bg-violet-500 text-white px-4 py-2 rounded-lg hover:bg-violet-400 transition">
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                    {replyTo && (
                      <button onClick={() => setReplyTo(null)} className="text-xs text-slate-400 mt-1 hover:underline">
                        Annuler la réponse
                      </button>
                    )}
                  </form>
                )}

                {questions.length === 0 ? (
                  <p className="text-slate-400 text-sm text-center py-6">Aucune question pour le moment.</p>
                ) : (
                  <div className="space-y-4">
                    {questions.map(q => (
                      <div key={q.id} className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                        <div className="flex justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-sm text-white">{q.author_username}</p>
                            <p className="text-slate-300 text-sm mt-0.5">{q.content}</p>
                            <p className="text-xs text-slate-500 mt-1">{new Date(q.created_at).toLocaleString()}</p>
                          </div>
                          {(isCoach || q.author === user?.id) && (
                            <button onClick={() => handleDeleteComment(q.id)} className="text-red-400 text-sm">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        {getReplies(q.id).map(r => (
                          <div key={r.id} className="ml-6 mt-3 border-l-2 border-violet-500/30 pl-4">
                            <div className="flex justify-between">
                              <div>
                                <p className="font-medium text-sm text-cyan-300">{r.author_username}</p>
                                <p className="text-slate-300 text-sm">{r.content}</p>
                                <p className="text-xs text-slate-500 mt-1">{new Date(r.created_at).toLocaleString()}</p>
                              </div>
                              {(isCoach || r.author === user?.id) && (
                                <button onClick={() => handleDeleteComment(r.id)} className="text-red-400 text-sm">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                        {user && (isCoach || enrollmentStatus === 'approved') && (
                          <button onClick={() => setReplyTo(q.id)} className="text-xs text-cyan-400 mt-2 hover:underline">
                            Répondre
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ===== COURS SIMILAIRES ===== */}
          <div className="mt-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-violet-400" />
                Cours similaires
              </h3>
              <button
                onClick={() => navigate('courses')}
                className="text-sm text-cyan-400 hover:text-cyan-300 transition"
              >
                Voir tout →
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {similarCourses.length > 0 ? (
                similarCourses.map((similar) => (
                  <div
                    key={similar.id}
                    onClick={() => navigate(`course-detail/${similar.id}`)}
                    className="bg-white/5 border border-white/10 rounded-2xl p-4 hover:border-cyan-500/30 transition cursor-pointer group"
                  >
                    <h4 className="font-bold group-hover:text-cyan-300 transition mb-1">
                      {similar.title}
                    </h4>
                    <div className="flex items-center gap-3 text-sm text-slate-400">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3 text-violet-400" />
                        {similar.coach?.username || similar.coach_username || 'Coach'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-cyan-400" />
                        {similar.duration || similar.duree || '30'} min
                      </span>
                      <span className="flex items-center gap-1">
                        {renderStars(similar.rating || 0)}
                        <span className="text-white text-xs ml-0.5">{similar.rating || 0}</span>
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-slate-400 text-sm col-span-2 text-center py-6">
                  Aucun cours similaire trouvé.
                </p>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-12 pt-6 border-t border-white/5 text-center text-[10px] text-slate-600 tracking-[0.2em] font-light">
            <p>eSportsConnect • Détail du cours • © 2026</p>
          </div>

        </div>
      </main>
    </div>
  );
};

// ============================================================
// COMPOSANTS RÉUTILISABLES
// ============================================================

const SidebarInfo = ({ label, value, icon }) => (
  <div className="flex items-start gap-3">
    <div className="w-6 h-6 flex items-center justify-center">{icon}</div>
    <div>
      <p className="text-[10px] text-slate-500 uppercase tracking-wider">{label}</p>
      <p className="text-sm text-white font-medium">{value}</p>
    </div>
  </div>
);

const InfoIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-4m0-4h.01" />
  </svg>
);

export default CourseDetail;