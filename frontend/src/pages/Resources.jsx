import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from '../context/RouterContext';
import { useAuth } from '../context/AuthContext';
import {
  Search,
  Filter,
  BookOpen,
  Video,
  FileText,
  Headphones,
  Eye,
  ThumbsUp,
  Plus,
  ArrowRight,
  BookMarked,
  Gamepad2,
  Star,
  Download,
  X,
  TrendingUp,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import API from '../services/api';

// ============================================================
// MAPPING DES TYPES DE RESSOURCES
// ============================================================
const TYPE_CONFIG = {
  guide: { icon: <BookOpen size={16} />, label: 'Guide', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  tutoriel: { icon: <Video size={16} />, label: 'Tutoriel', color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },
  article: { icon: <FileText size={16} />, label: 'Article', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  video: { icon: <Video size={16} />, label: 'Vidéo', color: 'bg-violet-500/20 text-violet-400 border-violet-500/30' },
  podcast: { icon: <Headphones size={16} />, label: 'Podcast', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
};

const TYPE_LABELS = {
  guide: 'Guide',
  tutoriel: 'Tutoriel',
  article: 'Article',
  video: 'Vidéo',
  podcast: 'Podcast',
};

// ============================================================
// COMPOSANT CARTE RESSOURCE
// ============================================================
function ResourceCard({ resource, onClick }) {
  const typeConfig = TYPE_CONFIG[resource.resource_type] || TYPE_CONFIG.guide;
  const typeLabel = TYPE_LABELS[resource.resource_type] || resource.resource_type || 'Ressource';

  const getCategoryInfo = (cat) => {
    if (!cat) return { name: 'Général', icon: '📁' };
    if (typeof cat === 'object') return { name: cat.name || 'Général', icon: cat.icon || '📁' };
    return { name: cat, icon: '📁' };
  };

  const category = getCategoryInfo(resource.category);

  const imageUrl = resource.image || 
    (resource.resource_type === 'video' 
      ? 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1000&q=80'
      : 'https://images.unsplash.com/photo-1603481546238-487240415921?auto=format&fit=crop&w=1000&q=80');

  const tags = resource.tags ? resource.tags.split(',').map(t => t.trim()) : [];
  const downloads = resource.downloads || 0;

  return (
    <article
      onClick={onClick}
      className="group cursor-pointer overflow-hidden rounded-2xl border border-white/[0.06] bg-[#07111e] transition duration-300 hover:-translate-y-1 hover:border-violet-500/30 hover:shadow-2xl hover:shadow-violet-950/20"
    >
      <div className="relative h-[200px] overflow-hidden">
        <img
          src={imageUrl}
          alt={resource.title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#07111e] via-black/20 to-transparent" />
        
        {/* Badge type */}
        <div className={`absolute left-4 top-4 rounded-lg border px-2.5 py-1.5 text-[10px] font-semibold ${typeConfig.color}`}>
          <span className="flex items-center gap-1.5">
            {typeConfig.icon}
            {typeConfig.label}
          </span>
        </div>

        {/* Badge "À la une" */}
        {resource.featured && (
          <div className="absolute right-4 top-4 flex items-center gap-1 rounded-lg bg-amber-500/20 border border-amber-500/30 px-2.5 py-1.5 text-[10px] font-semibold text-amber-400">
            <Star size={12} />
            À la une
          </div>
        )}
      </div>

      <div className="p-5">
        {/* Catégorie et jeu */}
        <div className="mb-2 flex items-center gap-2">
          <span className="text-xs text-slate-500">{category.icon}</span>
          <span className="text-xs text-slate-400">{category.name}</span>
          <span className="w-1 h-1 rounded-full bg-slate-600" />
          <Gamepad2 size={12} className="text-violet-400" />
          <span className="text-xs text-violet-400">{resource.game || 'eSport'}</span>
        </div>

        {/* Titre */}
        <h3 className="line-clamp-1 text-[17px] font-semibold text-white group-hover:text-violet-300 transition">
          {resource.title}
        </h3>

        {/* Description */}
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-400">
          {resource.description}
        </p>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {tags.slice(0, 3).map((tag, idx) => (
              <span key={idx} className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-slate-500">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Métriques */}
        <div className="mt-4 flex items-center justify-between border-t border-white/[0.05] pt-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-purple-600 text-xs font-bold text-white">
              {(resource.author_username || resource.author || '?').charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-300">
                {resource.author_username || resource.author || 'Anonyme'}
              </p>
              <p className="text-[10px] text-slate-600">
                {resource.created_at ? new Date(resource.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-[10px] text-slate-500">
            <span className="flex items-center gap-1">
              <Eye size={12} />
              {resource.views || 0}
            </span>
            <span className="flex items-center gap-1">
              <ThumbsUp size={12} />
              {resource.likes || 0}
            </span>
            {downloads > 0 && (
              <span className="flex items-center gap-1">
                <Download size={12} />
                {downloads}
              </span>
            )}
          </div>
        </div>

        {/* Bouton lire */}
        <div className="mt-3 flex items-center justify-end">
          <span className="text-xs text-violet-400 group-hover:text-violet-300 transition flex items-center gap-1">
            Lire la suite <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
          </span>
        </div>
      </div>
    </article>
  );
}

// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================
const Resources = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [resources, setResources] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    type: '',
    category: '',
  });
  const [sortBy, setSortBy] = useState('date');
  const [showFilters, setShowFilters] = useState(false);

  // ============================================================
  // CHARGEMENT DES DONNÉES
  // ============================================================
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (filters.type) params.append('type', filters.type);
        if (filters.category) params.append('category', filters.category);
        if (searchQuery) params.append('search', searchQuery);
        if (sortBy === 'views') params.append('ordering', '-views');
        else if (sortBy === 'likes') params.append('ordering', '-likes');
        else params.append('ordering', '-created_at');

        const [resourcesRes, categoriesRes] = await Promise.all([
          API.get(`/resources/resources/?${params.toString()}`),
          API.get('/resources/categories/').catch(() => ({ data: [] })),
        ]);

        setResources(resourcesRes.data || []);
        setCategories(categoriesRes.data || []);
      } catch (err) {
        console.error('Erreur chargement ressources:', err);
        setResources([]);
      } finally {
        setLoading(false);
      }
    };

    const timeout = setTimeout(fetchData, 300);
    return () => clearTimeout(timeout);
  }, [filters, searchQuery, sortBy]);

  // ============================================================
  // FILTRES RAPIDES
  // ============================================================
  const quickFilters = [
    { value: '', label: 'Tous', icon: <BookMarked size={16} /> },
    { value: 'guide', label: 'Guides', icon: <BookOpen size={16} /> },
    { value: 'tutoriel', label: 'Tutoriels', icon: <Video size={16} /> },
    { value: 'article', label: 'Articles', icon: <FileText size={16} /> },
    { value: 'video', label: 'Vidéos', icon: <Video size={16} /> },
    { value: 'podcast', label: 'Podcasts', icon: <Headphones size={16} /> },
  ];

  // ============================================================
  // STATISTIQUES
  // ============================================================
  const stats = useMemo(() => {
    const total = resources.length;
    const videos = resources.filter(r => r.resource_type === 'video').length;
    const guides = resources.filter(r => r.resource_type === 'guide').length;
    const totalViews = resources.reduce((sum, r) => sum + (r.views || 0), 0);
    return { total, videos, guides, totalViews };
  }, [resources]);

  // ============================================================
  // RENDU
  // ============================================================
  if (loading) {
    return (
      <div className="min-h-screen bg-[#020817] flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-violet-500/20 rounded-full" />
            <div className="absolute inset-0 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-violet-400 text-lg font-light tracking-[0.3em]">CHARGEMENT</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020817] text-white">
      <main className="ml-0 md:ml-[250px] min-h-screen">

        {/* ===== HEADER ===== */}
        <header className="border-b border-white/5 bg-[#020817]/80 backdrop-blur-xl">
          <div className="max-w-[1450px] mx-auto px-5 md:px-8 py-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-violet-400 text-xs font-semibold uppercase tracking-wider mb-1">
                  <Sparkles className="w-4 h-4" />
                  eSportsConnect Arena
                </div>
                <h1 className="text-2xl md:text-3xl font-black tracking-tight">
                  Ressources
                </h1>
                <p className="text-slate-500 text-sm mt-1">
                  Découvre des guides, vidéos, analyses et ressources pour améliorer tes performances.
                </p>
              </div>
              {user?.role === 'coach' && (
                <button
                  onClick={() => navigate('create-resource')}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-500 hover:from-violet-500 hover:to-purple-400 transition font-bold flex items-center gap-2 shadow-lg shadow-violet-600/20"
                >
                  <Plus className="w-4 h-4" />
                  Ajouter une ressource
                </button>
              )}
            </div>
          </div>
        </header>

        <div className="max-w-[1450px] mx-auto px-5 md:px-8 py-6">

          {/* ===== STATISTIQUES ===== */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-6">
            {[
              { label: 'Ressources', value: stats.total, icon: BookMarked, color: 'violet' },
              { label: 'Vidéos', value: stats.videos, icon: Video, color: 'cyan' },
              { label: 'Guides', value: stats.guides, icon: FileText, color: 'emerald' },
              { label: 'Vues totales', value: stats.totalViews, icon: Eye, color: 'amber' },
            ].map((stat) => {
              const Icon = stat.icon;
              const colors = {
                violet: 'from-violet-500/20 to-purple-500/10 border-violet-500/20 text-violet-400',
                cyan: 'from-cyan-500/20 to-blue-500/10 border-cyan-500/20 text-cyan-400',
                emerald: 'from-emerald-500/20 to-green-500/10 border-emerald-500/20 text-emerald-400',
                amber: 'from-amber-500/20 to-orange-500/10 border-amber-500/20 text-amber-400',
              };
              return (
                <div key={stat.label} className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br ${colors[stat.color]} backdrop-blur-sm p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl group`}>
                  <div className="relative z-10 flex items-start justify-between">
                    <div>
                      <p className="text-3xl md:text-4xl font-black text-white">{stat.value}</p>
                      <p className="text-sm text-slate-400 mt-1.5 font-medium">{stat.label}</p>
                    </div>
                    <div className={`w-12 h-12 rounded-2xl bg-white/5 backdrop-blur-sm flex items-center justify-center ${colors[stat.color].split(' ')[2]} group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ===== FILTRES RAPIDES ===== */}
          <div className="flex flex-wrap gap-2 mb-6">
            {quickFilters.map((qf) => (
              <button
                key={qf.value}
                onClick={() => setFilters({ ...filters, type: qf.value })}
                className={`px-4 py-2 rounded-xl flex items-center gap-2 transition ${
                  filters.type === qf.value
                    ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white font-bold'
                    : 'bg-white/5 hover:bg-white/10 text-slate-400'
                }`}
              >
                {qf.icon}
                <span className="text-sm">{qf.label}</span>
              </button>
            ))}
          </div>

          {/* ===== BARRE DE RECHERCHE + FILTRES ===== */}
          <div className="rounded-2xl border border-white/5 bg-white/5 backdrop-blur-sm p-4 mb-6">
            <div className="flex flex-col lg:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher une ressource..."
                  className="w-full rounded-xl bg-[#050b16] border border-white/10 pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500/60 transition"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                    <X size={14} />
                  </button>
                )}
              </div>

              <div className="flex gap-3">
                <div className="relative min-w-[160px]">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-violet-400" />
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                    className="w-full appearance-none rounded-xl bg-[#050b16] border border-white/10 pl-10 pr-9 py-2.5 text-sm text-slate-300 focus:outline-none focus:border-violet-500/60 transition cursor-pointer"
                  >
                    <option value="">Toutes les catégories</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.slug} className="bg-[#080f1d]">
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 pointer-events-none" />
                </div>

                <div className="relative min-w-[140px]">
                  <TrendingUp className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-violet-400" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full appearance-none rounded-xl bg-[#050b16] border border-white/10 pl-10 pr-9 py-2.5 text-sm text-slate-300 focus:outline-none focus:border-violet-500/60 transition cursor-pointer"
                  >
                    <option value="date">Plus récents</option>
                    <option value="views">Plus vus</option>
                    <option value="likes">Plus aimés</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* ===== LISTE DES RESSOURCES ===== */}
          {resources.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 bg-[#080f1d] py-20 text-center">
              <BookMarked size={48} className="mx-auto text-slate-500 mb-4" />
              <h3 className="text-lg font-bold">Aucune ressource trouvée</h3>
              <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
                {searchQuery || filters.type || filters.category
                  ? 'Aucun résultat ne correspond à vos filtres.'
                  : 'Aucune ressource disponible pour le moment.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {resources.map((resource) => (
                <ResourceCard
                  key={resource.id}
                  resource={resource}
                  onClick={() => navigate(`resource/${resource.id}`)}
                />
              ))}
            </div>
          )}
        </div>

        {/* ===== FOOTER ===== */}
        <div className="max-w-[1450px] mx-auto px-5 md:px-8 pb-6 pt-4 border-t border-white/5 text-center text-[10px] text-slate-600 tracking-[0.2em] font-light">
          <p>eSportsConnect • Ressources • © 2026</p>
        </div>

      </main>
    </div>
  );
};

export default Resources;