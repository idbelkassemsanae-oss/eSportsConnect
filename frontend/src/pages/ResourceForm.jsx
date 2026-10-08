import React, { useState, useEffect } from 'react';
import { usePage, useNavigate } from '../context/RouterContext';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft,
  BookMarked,
  FileText,
  Gamepad2,
  AlignLeft,
  Tag,
  Upload,
  Save,
  Link as LinkIcon,
  CheckCircle2,
  Trash2,
  Loader2,
  Sparkles,
} from 'lucide-react';
import API from '../services/api';

// ============================================================
// COMPOSANTS D'INPUT RÉUTILISABLES
// ============================================================

const Input = ({ label, icon: Icon, value, onChange, placeholder, type = 'text', required = false, name }) => (
  <div className="space-y-1.5">
    <label className="block text-xs font-medium text-slate-300">
      {label}
      {required && <span className="ml-0.5 text-violet-400">*</span>}
    </label>
    <div className="group relative flex items-center rounded-xl border border-white/10 bg-[#030b16] transition-all duration-300 focus-within:border-violet-500/50 focus-within:shadow-lg focus-within:shadow-violet-500/5 hover:border-white/20">
      {Icon && <Icon size={17} className="absolute left-3 text-slate-500 transition-colors group-focus-within:text-violet-400" />}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-600 transition-colors focus:placeholder:text-slate-500 ${
          Icon ? 'pl-10 pr-4 py-3' : 'px-4 py-3'
        }`}
      />
    </div>
  </div>
);

const Textarea = ({ label, icon: Icon, value, onChange, placeholder, rows = 4, required = false, name }) => (
  <div className="space-y-1.5">
    <label className="block text-xs font-medium text-slate-300">
      {label}
      {required && <span className="ml-0.5 text-violet-400">*</span>}
    </label>
    <div className="group relative rounded-xl border border-white/10 bg-[#030b16] transition-all duration-300 focus-within:border-violet-500/50 focus-within:shadow-lg focus-within:shadow-violet-500/5 hover:border-white/20">
      {Icon && <Icon size={17} className="absolute left-3 top-3 text-slate-500 transition-colors group-focus-within:text-violet-400" />}
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        required={required}
        className={`w-full resize-none bg-transparent text-sm leading-6 text-white outline-none placeholder:text-slate-600 transition-colors focus:placeholder:text-slate-500 ${
          Icon ? 'pl-10 pr-4 py-3' : 'px-4 py-3'
        }`}
      />
    </div>
  </div>
);

const Select = ({ label, icon: Icon, value, onChange, options, required = false, name }) => (
  <div className="space-y-1.5">
    <label className="block text-xs font-medium text-slate-300">
      {label}
      {required && <span className="ml-0.5 text-violet-400">*</span>}
    </label>
    <div className="group relative flex items-center rounded-xl border border-white/10 bg-[#030b16] transition-all duration-300 focus-within:border-violet-500/50 focus-within:shadow-lg focus-within:shadow-violet-500/5 hover:border-white/20">
      {Icon && <Icon size={17} className="absolute left-3 text-slate-500 transition-colors group-focus-within:text-violet-400" />}
      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className={`w-full appearance-none bg-transparent text-sm text-white outline-none ${
          Icon ? 'pl-10 pr-4 py-3' : 'px-4 py-3'
        }`}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-[#030b16] text-white">
            {opt.label}
          </option>
        ))}
      </select>
      <div className="absolute right-3 pointer-events-none text-slate-500">▼</div>
    </div>
  </div>
);

const SectionCard = ({ title, subtitle, icon: Icon, children }) => (
  <section className="rounded-2xl border border-white/5 bg-[#08111f] p-6 md:p-8 transition-all duration-300 hover:border-violet-500/10">
    <div className="mb-6 flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 text-violet-400 shadow-lg shadow-violet-500/5">
        <Icon size={19} />
      </div>
      <div>
        <h2 className="text-base font-semibold text-white">{title}</h2>
        <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>
      </div>
    </div>
    {children}
  </section>
);

// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================

const ResourceForm = () => {
  const page = usePage();
  const navigate = useNavigate();
  const { user } = useAuth();

  const isEdit = page.startsWith('edit-resource/');
  const resourceId = isEdit ? page.split('/')[1] : null;

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    resource_type: 'article',
    category: '',
    url: '',
    tags: '',
    is_published: true,
    game: '',
  });

  // ============================================================
  // CHARGEMENT DES DONNÉES
  // ============================================================
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes] = await Promise.all([API.get('/resources/categories/')]);
        setCategories(catRes.data);

        if (isEdit && resourceId) {
          const res = await API.get(`/resources/resources/${resourceId}/`);
          const data = res.data;
          setFormData({
            title: data.title || '',
            description: data.description || '',
            content: data.content || '',
            resource_type: data.resource_type || 'article',
            category: data.category?.id || data.category || '',
            url: data.url || '',
            tags: data.tags || '',
            is_published: data.is_published !== undefined ? data.is_published : true,
            game: data.game || '',
          });
        }
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchData();
  }, [isEdit, resourceId]);

  // ============================================================
  // HANDLERS
  // ============================================================
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // ============================================================
  // SOUMISSION (CREATE ou UPDATE)
  // ============================================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);

    const payload = {
      ...formData,
      category: formData.category || null,
    };

    try {
      if (isEdit && resourceId) {
        await API.put(`/resources/resources/${resourceId}/`, payload);
      } else {
        await API.post('/resources/resources/', payload);
      }
      setSuccess(true);
      setTimeout(() => {
        navigate('resources');
      }, 1500);
    } catch (err) {
      console.error(err);
      alert('❌ Erreur lors de l\'enregistrement.');
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // SUPPRESSION
  // ============================================================
  const handleDelete = async () => {
    if (!window.confirm('Voulez-vous supprimer cette ressource ?')) return;
    try {
      await API.delete(`/resources/resources/${resourceId}/`);
      alert('🗑️ Ressource supprimée.');
      navigate('resources');
    } catch (err) {
      alert('❌ Erreur lors de la suppression.');
    }
  };

  // ============================================================
  // OPTIONS
  // ============================================================
  const typeOptions = [
    { value: 'guide', label: '📖 Guide de jeu' },
    { value: 'tutoriel', label: '🎓 Tutoriel' },
    { value: 'article', label: '📰 Article' },
    { value: 'video', label: '🎬 Vidéo' },
    { value: 'podcast', label: '🎙️ Podcast' },
  ];

  const getTypeHelp = () => {
    switch (formData.resource_type) {
      case 'video':
        return '💡 Ajoutez une URL YouTube (ex: https://www.youtube.com/watch?v=...) ou Vimeo.';
      case 'podcast':
        return '💡 Ajoutez une URL SoundCloud, Spotify ou un fichier audio.';
      default:
        return '💡 Le contenu ci-dessous sera affiché comme texte.';
    }
  };

  // ============================================================
  // SÉCURITÉ (coach uniquement)
  // ============================================================
  const isAuthorized = user?.role === 'coach' || user?.is_superuser;

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

  if (!isAuthorized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#020817] text-red-400">
        <div className="text-center">
          <p className="text-2xl font-bold">⛔ Accès refusé</p>
          <p className="text-sm mt-2">Seuls les coachs peuvent créer ou modifier des ressources.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020817] text-white">
      <main className="ml-0 md:ml-[250px] min-h-screen">
        <div className="max-w-[1200px] mx-auto px-5 md:px-8 py-6">

          {/* RETOUR */}
          <button
            onClick={() => navigate('resources')}
            className="mb-6 flex items-center gap-2 text-sm text-slate-400 hover:text-violet-400 transition-colors group"
          >
            <ArrowLeft size={17} className="group-hover:-translate-x-1 transition-transform" />
            Retour aux ressources
          </button>

          {/* EN-TÊTE */}
          <div className="mb-8">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10 text-violet-400">
                    <BookMarked size={17} />
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-violet-400">
                    {isEdit ? 'Modification' : 'Nouvelle'} ressource
                  </span>
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
                  {isEdit ? 'Modifier la ressource' : 'Créer une ressource'}
                </h1>
                <p className="mt-2 text-sm text-slate-500">
                  {isEdit
                    ? 'Mets à jour les informations de ta ressource.'
                    : 'Partage une ressource utile avec la communauté eSportsConnect.'}
                </p>
              </div>
            </div>
          </div>

          {/* SUCCÈS */}
          {success && (
            <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-400 animate-fadeIn">
              <CheckCircle2 size={18} className="shrink-0" />
              <span>Ressource enregistrée avec succès !</span>
            </div>
          )}

          {/* FORMULAIRE */}
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* INFORMATIONS GÉNÉRALES */}
            <SectionCard title="Informations générales" subtitle="Présente ta ressource à la communauté." icon={FileText}>
              <div className="grid gap-5 md:grid-cols-2">
                <Input
                  label="Titre"
                  icon={FileText}
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Ex : Guide stratégique Mobile Legends"
                  required
                />
                <Input
                  label="Jeu"
                  icon={Gamepad2}
                  name="game"
                  value={formData.game}
                  onChange={handleChange}
                  placeholder="Ex : Valorant, Mobile Legends, ..."
                />
                <Select
                  label="Type"
                  icon={FileText}
                  name="resource_type"
                  value={formData.resource_type}
                  onChange={handleChange}
                  options={typeOptions}
                  required
                />
                <Select
                  label="Catégorie"
                  icon={Tag}
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  options={[
                    { value: '', label: 'Aucune' },
                    ...categories.map((cat) => ({
                      value: cat.id,
                      label: `${cat.icon || '📁'} ${cat.name}`,
                    })),
                  ]}
                />
              </div>

              {getTypeHelp() && (
                <div className="mt-4 rounded-lg border border-violet-500/10 bg-violet-500/5 px-4 py-2.5 text-xs text-violet-300">
                  {getTypeHelp()}
                </div>
              )}

              <div className="mt-5">
                <Textarea
                  label="Description"
                  icon={AlignLeft}
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Décris brièvement cette ressource..."
                  rows={4}
                  required
                />
              </div>
            </SectionCard>

            {/* CONTENU */}
            <SectionCard title="Contenu" subtitle="Ajoute le contenu principal de la ressource." icon={AlignLeft}>
              <Textarea
                label="Contenu"
                icon={AlignLeft}
                name="content"
                value={formData.content}
                onChange={handleChange}
                placeholder="Écris le contenu de ta ressource ici..."
                rows={14}
              />
              <div className="mt-3 flex items-center justify-between">
                <p className="text-[10px] text-slate-500">
                  Tu peux ajouter des explications, stratégies, conseils ou analyses.
                </p>
                <span className="text-[10px] text-slate-600">{formData.content.length} caractères</span>
              </div>
            </SectionCard>

            {/* URL / FICHIER */}
            <SectionCard title="Fichier et liens" subtitle="Ajoute un lien ou un fichier associé." icon={Upload}>
              <Input
                label="URL externe"
                icon={LinkIcon}
                name="url"
                value={formData.url}
                onChange={handleChange}
                placeholder={
                  formData.resource_type === 'video'
                    ? 'https://www.youtube.com/watch?v=...'
                    : formData.resource_type === 'podcast'
                    ? 'https://soundcloud.com/...'
                    : 'https://...'
                }
              />

              <div className="mt-5">
                <label className="mb-2 block text-xs font-medium text-slate-300">Fichier</label>
                <label className="group flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/10 bg-[#030b16] px-6 py-10 text-center transition-all duration-300 hover:border-violet-500/30 hover:bg-violet-500/5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400 transition-colors group-hover:bg-violet-500/20">
                    <Upload size={21} />
                  </div>
                  <p className="mt-4 text-sm font-medium text-slate-300">Ajouter un fichier</p>
                  <p className="mt-1 text-xs text-slate-500">PDF, image, document ou autre fichier</p>
                  <input type="file" className="hidden" />
                </label>
              </div>
            </SectionCard>

            {/* TAGS */}
            <SectionCard title="Tags" subtitle="Facilite la recherche de ta ressource." icon={Tag}>
              <Input
                label="Tags"
                icon={Tag}
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="stratégie, technique, guide"
              />
              <p className="mt-2 text-[10px] text-slate-500">Sépare les tags avec des virgules.</p>
            </SectionCard>

            {/* PUBLIÉ */}
            <SectionCard title="Publication" subtitle="Gère la visibilité de ta ressource." icon={Sparkles}>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="is_published"
                  id="is_published"
                  checked={formData.is_published}
                  onChange={handleChange}
                  className="h-5 w-5 rounded border-white/20 bg-[#030b16] accent-violet-500 transition-colors focus:ring-2 focus:ring-violet-500/30"
                />
                <label htmlFor="is_published" className="text-sm text-slate-300">
                  Publier immédiatement
                </label>
              </div>
            </SectionCard>

            {/* ACTIONS */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/5 pt-6">
              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-950/30 transition-all duration-300 hover:brightness-110 hover:shadow-xl hover:shadow-violet-950/40 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Save size={17} />
                  {saving ? 'Enregistrement...' : isEdit ? 'Enregistrer' : 'Publier'}
                </button>

                <button
                  type="button"
                  onClick={() => navigate('resources')}
                  className="rounded-xl border border-white/10 px-6 py-3.5 text-sm text-slate-400 transition-all duration-300 hover:bg-white/5 hover:text-white"
                >
                  Annuler
                </button>
              </div>

              {isEdit && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="flex items-center gap-2 rounded-xl bg-red-500/10 px-5 py-3.5 text-sm font-medium text-red-400 transition-all duration-300 hover:bg-red-500/20"
                >
                  <Trash2 size={17} />
                  Supprimer
                </button>
              )}
            </div>
          </form>

          {/* FOOTER */}
          <div className="mt-10 pt-6 border-t border-white/5 text-center text-[10px] text-slate-600 tracking-[0.2em] font-light">
            <p>eSportsConnect • {isEdit ? 'Modification' : 'Nouvelle ressource'} • © 2026</p>
          </div>

        </div>
      </main>

      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
        `}
      </style>
    </div>
  );
};

export default ResourceForm;