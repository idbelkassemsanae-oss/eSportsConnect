import React, { useState, useEffect } from 'react';
import { usePage, useNavigate } from '../context/RouterContext';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Gamepad2,
  Loader2,
  Save,
  Sparkles,
  Trash2,
  Video,
  FileText,
  DollarSign
} from 'lucide-react';
import API from '../services/api';

// ============================================================
// COMPOSANTS RÉUTILISABLES
// ============================================================

const SectionTitle = ({ icon, title, subtitle }) => (
  <div className="flex items-start gap-3 mb-6">
    <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center">
      {React.cloneElement(icon, { className: "w-5 h-5" })}
    </div>
    <div>
      <h2 className="font-bold text-lg">{title}</h2>
      <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
    </div>
  </div>
);

const Input = ({ label, name, value, onChange, placeholder, required, type = "text" }) => (
  <div>
    <label className="block text-sm font-medium text-slate-300 mb-2">
      {label}
      {required && <span className="text-violet-400 ml-1">*</span>}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className="w-full rounded-xl bg-[#050b16] border border-white/10 px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-500/60 transition"
    />
  </div>
);

const TextArea = ({ label, name, value, onChange, placeholder, required, rows = 4 }) => (
  <div>
    <label className="block text-sm font-medium text-slate-300 mb-2">
      {label}
      {required && <span className="text-violet-400 ml-1">*</span>}
    </label>
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      rows={rows}
      placeholder={placeholder}
      required={required}
      className="w-full rounded-xl bg-[#050b16] border border-white/10 px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-500/60 transition resize-none"
    />
  </div>
);

const Select = ({ label, name, value, onChange, options, required, placeholder = "Sélectionner" }) => (
  <div>
    <label className="block text-sm font-medium text-slate-300 mb-2">
      {label}
      {required && <span className="text-violet-400 ml-1">*</span>}
    </label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      className="w-full rounded-xl bg-[#050b16] border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:border-violet-500/60 transition"
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option.id || option} value={option.id || option} className="bg-[#080f1d]">
          {option.name || option}
        </option>
      ))}
    </select>
  </div>
);

// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================

const EditCourse = () => {
  const page = usePage();
  const navigate = useNavigate();
  const { user } = useAuth();
  const courseId = page.split('/')[1];

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [games, setGames] = useState([]);
  const [categories, setCategories] = useState([]);
  const [originalVideoUrl, setOriginalVideoUrl] = useState('');

  // ✅ Mapping des niveaux (français → anglais)
  const levelMapping = {
    'Débutant': 'beginner',
    'Intermédiaire': 'intermediate',
    'Avancé': 'advanced',
    'Expert': 'expert',
  };

  // ✅ Mapping inverse (anglais → français) pour l'affichage
  const levelMappingReverse = {
    'beginner': 'Débutant',
    'intermediate': 'Intermédiaire',
    'advanced': 'Avancé',
    'expert': 'Expert',
  };

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    game: '',
    course_type: 'video',
    video_url: '',
    content: '',
    duration: '',
    price: '',
    difficulty_level: 'Débutant',
    is_active: true,
  });

  // ============================================================
  // CHARGEMENT DES DONNÉES
  // ============================================================

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Charger le cours
        const courseRes = await API.get(`/courses/${courseId}/`);
        const course = courseRes.data;

        // 2. Charger les jeux et catégories
        let gamesData = [];
        let categoriesData = [];

        try {
          const gamesRes = await API.get('/games/');
          gamesData = gamesRes.data || [];
        } catch (e) {
          try {
            const gamesRes = await API.get('/coaching/games/');
            gamesData = gamesRes.data || [];
          } catch (e2) {}
        }

        try {
          const categoriesRes = await API.get('/categories/');
          categoriesData = categoriesRes.data || [];
        } catch (e) {
          try {
            const categoriesRes = await API.get('/coaching/categories/');
            categoriesData = categoriesRes.data || [];
          } catch (e2) {}
        }

        setGames(gamesData);
        setCategories(categoriesData);

        // 3. Remplir le formulaire
        const difficultyDisplay = levelMappingReverse[course.difficulty_level] || course.difficulty_level || 'Débutant';

        setForm({
          title: course.title || '',
          description: course.description || '',
          category: course.category || '',
          game: course.game || '',
          course_type: course.course_type || 'video',
          video_url: course.video_url || '',
          content: course.content || '',
          duration: course.duration || '',
          price: course.price || '',
          difficulty_level: difficultyDisplay,
          is_active: course.is_active !== undefined ? course.is_active : true,
        });
        setOriginalVideoUrl(course.video_url || '');

        setLoading(false);
      } catch (err) {
        console.error('❌ Erreur chargement:', err);
        alert('Impossible de charger les données.');
        setLoading(false);
      }
    };
    if (courseId) fetchData();
  }, [courseId]);

  // ============================================================
  // HANDLERS
  // ============================================================

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const difficultyKey = levelMapping[form.difficulty_level] || 'beginner';

      const payload = {
        title: form.title,
        description: form.description,
        category: form.category ? parseInt(form.category, 10) : null,
        game: form.game ? parseInt(form.game, 10) : null,
        course_type: form.course_type,
        video_url: form.course_type === 'video' ? form.video_url : null,
        content: form.course_type === 'text' ? form.content : '',
        duration: parseInt(form.duration, 10) || 0,
        price: parseFloat(form.price) || 0,
        difficulty_level: difficultyKey,
        is_active: form.is_active,
      };

      console.log('📦 Payload envoyé:', payload);

      await API.put(`/courses/${courseId}/`, payload);
      alert('✅ Cours modifié avec succès !');
      navigate('coach-courses');
    } catch (err) {
      console.error('❌ Erreur modification:', err);
      if (err.response) {
        console.error('📦 Détails:', err.response.data);
        alert(`❌ Erreur : ${JSON.stringify(err.response.data)}`);
      } else {
        alert('❌ Erreur lors de la modification.');
      }
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!window.confirm('Voulez-vous vraiment supprimer ce cours ? Cette action est irréversible.')) return;
    try {
      setDeleting(true);
      await API.delete(`/courses/${courseId}/`);
      alert('🗑️ Cours supprimé.');
      navigate('coach-courses');
    } catch (err) {
      console.error(err);
      alert('❌ Erreur lors de la suppression.');
    } finally {
      setDeleting(false);
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
          <p className="text-slate-400 mt-4">Chargement...</p>
        </div>
      </div>
    );
  }

  const levelOptions = ['Débutant', 'Intermédiaire', 'Avancé', 'Expert'];

  return (
    <div className="min-h-screen bg-[#030712] text-white">
      <main className="ml-0 md:ml-[250px] min-h-screen">

        {/* HEADER */}
        <header className="border-b border-white/5 bg-[#030712]/80 backdrop-blur-xl">
          <div className="max-w-[1400px] mx-auto px-5 md:px-8 py-5">
            <button
              onClick={() => navigate('coach-courses')}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition mb-5"
            >
              <ArrowLeft className="w-5 h-5" />
              Retour à mes cours
            </button>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-violet-600/15 border border-violet-500/20 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-violet-400" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-black">
                  Modifier le cours
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                  Mettez à jour les informations de votre formation
                </p>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-[1400px] mx-auto px-5 md:px-8 py-8">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_350px] gap-7">

              {/* ===== COLONNE GAUCHE ===== */}
              <div className="space-y-6">

                {/* Informations générales */}
                <section className="rounded-2xl border border-white/5 bg-[#080f1d] p-6">
                  <SectionTitle
                    icon={<BookOpen />}
                    title="Informations générales"
                    subtitle="Modifiez les informations principales du cours"
                  />

                  <div className="space-y-5">
                    <Input
                      label="Titre du cours"
                      name="title"
                      value={form.title}
                      onChange={handleChange}
                      placeholder="Ex : Maîtriser les stratégies Valorant"
                      required
                    />

                    <TextArea
                      label="Description"
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      placeholder="Décrivez le contenu et les objectifs du cours..."
                      required
                      rows="6"
                    />
                  </div>
                </section>

                {/* Catégorisation */}
                <section className="rounded-2xl border border-white/5 bg-[#080f1d] p-6">
                  <SectionTitle
                    icon={<Gamepad2 />}
                    title="Catégorisation"
                    subtitle="Aidez les joueurs à trouver votre cours"
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Select
                      label="Catégorie"
                      name="category"
                      value={form.category}
                      onChange={handleChange}
                      options={categories}
                      required
                    />

                    <Select
                      label="Jeu"
                      name="game"
                      value={form.game}
                      onChange={handleChange}
                      options={games}
                      required
                    />

                    <Select
                      label="Niveau de difficulté"
                      name="difficulty_level"
                      value={form.difficulty_level}
                      onChange={handleChange}
                      options={levelOptions}
                      required
                    />

                    <Input
                      label="Durée (minutes)"
                      name="duration"
                      value={form.duration}
                      onChange={handleChange}
                      placeholder="45"
                      type="number"
                      required
                    />
                  </div>
                </section>

                {/* Type de cours */}
                <section className="rounded-2xl border border-white/5 bg-[#080f1d] p-6">
                  <SectionTitle
                    icon={<Video />}
                    title="Type de cours"
                    subtitle="Choisissez le format de votre cours"
                  />

                  <div className="flex gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="course_type"
                        value="video"
                        checked={form.course_type === 'video'}
                        onChange={handleChange}
                        className="accent-violet-500 w-4 h-4"
                      />
                      <Video className="w-4 h-4 text-cyan-400" />
                      Vidéo
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="course_type"
                        value="text"
                        checked={form.course_type === 'text'}
                        onChange={handleChange}
                        className="accent-violet-500 w-4 h-4"
                      />
                      <FileText className="w-4 h-4 text-purple-400" />
                      Texte
                    </label>
                  </div>
                </section>

                {/* Vidéo ou Texte */}
                {form.course_type === 'video' && (
                  <section className="rounded-2xl border border-white/5 bg-[#080f1d] p-6">
                    <SectionTitle
                      icon={<Video />}
                      title="Contenu vidéo"
                      subtitle="Lien vers votre vidéo de formation"
                    />

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        URL de la vidéo
                      </label>
                      <div className="relative">
                        <Video className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
                        <input
                          type="url"
                          name="video_url"
                          value={form.video_url}
                          onChange={handleChange}
                          placeholder="https://www.youtube.com/watch?v=..."
                          className="w-full rounded-xl bg-[#050b16] border border-white/10 pl-12 pr-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-500/60"
                        />
                      </div>
                      {originalVideoUrl && (
                        <p className="text-xs text-slate-500 mt-2">
                          Vidéo actuelle : <span className="text-cyan-400 truncate block">{originalVideoUrl}</span>
                        </p>
                      )}
                    </div>
                  </section>
                )}

                {form.course_type === 'text' && (
                  <section className="rounded-2xl border border-white/5 bg-[#080f1d] p-6">
                    <SectionTitle
                      icon={<FileText />}
                      title="Contenu texte"
                      subtitle="Rédigez le contenu de votre cours"
                    />
                    <TextArea
                      label="Contenu du cours"
                      name="content"
                      value={form.content}
                      onChange={handleChange}
                      placeholder="Écrivez le contenu de votre cours ici..."
                      rows="10"
                    />
                  </section>
                )}

                {/* Prix */}
                <section className="rounded-2xl border border-white/5 bg-[#080f1d] p-6">
                  <SectionTitle
                    icon={<DollarSign />}
                    title="Prix"
                    subtitle="Définissez le prix de votre cours"
                  />

                  <Input
                    label="Prix (DH)"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    placeholder="0.00"
                    type="number"
                    step="0.01"
                    min="0"
                  />
                </section>

                {/* Actif */}
                <section className="rounded-2xl border border-white/5 bg-[#080f1d] p-6">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={form.is_active}
                      onChange={handleChange}
                      className="w-5 h-5 accent-violet-500"
                    />
                    <span className="text-sm text-slate-300">Cours actif (visible par les joueurs)</span>
                  </label>
                </section>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row justify-between gap-3">
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={deleting}
                    className="px-5 py-3 rounded-xl border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-400 transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {deleting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Trash2 className="w-5 h-5" />
                    )}
                    Supprimer
                  </button>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => navigate('coach-courses')}
                      className="px-5 py-3 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] transition"
                    >
                      Annuler
                    </button>

                    <button
                      type="submit"
                      disabled={saving}
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-purple-500 hover:from-violet-500 hover:to-purple-400 transition font-bold flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Enregistrement...
                        </>
                      ) : (
                        <>
                          <Save className="w-5 h-5" />
                          Enregistrer
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* ===== SIDEBAR : APERÇU ===== */}
              <aside>
                <div className="sticky top-6">
                  <div className="rounded-2xl border border-white/5 bg-[#080f1d] overflow-hidden">
                    <div className="px-5 py-4 border-b border-white/5">
                      <p className="text-sm font-bold">Aperçu du cours</p>
                    </div>

                    <div className="relative aspect-video overflow-hidden">
                      {form.course_type === 'video' && form.video_url ? (
                        <video
                          src={form.video_url}
                          className="w-full h-full object-cover"
                          controls={false}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-violet-900/40 via-[#0b1324] to-cyan-900/20 flex items-center justify-center">
                          {form.course_type === 'text' ? (
                            <FileText className="w-14 h-14 text-violet-500/40" />
                          ) : (
                            <Gamepad2 className="w-14 h-14 text-violet-500/40" />
                          )}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#080f1d] to-transparent" />
                      <div className="absolute bottom-4 left-4">
                        <span className="px-2.5 py-1 rounded-lg bg-violet-600/80 text-xs font-bold">
                          {form.difficulty_level || 'Débutant'}
                        </span>
                      </div>
                    </div>

                    <div className="p-5">
                      <h3 className="font-bold text-lg">
                        {form.title || "Titre de votre cours"}
                      </h3>
                      <p className="text-sm text-slate-500 mt-2 line-clamp-3">
                        {form.description || "La description de votre cours apparaîtra ici."}
                      </p>
                      <div className="flex items-center gap-3 mt-5 text-xs text-slate-500">
                        <span>{games.find(g => g.id === parseInt(form.game))?.name || form.game || 'Jeu'}</span>
                        <span>•</span>
                        <span>{form.difficulty_level}</span>
                        <span>•</span>
                        <span>{form.duration || '0'} min</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 p-4 rounded-xl bg-violet-500/5 border border-violet-500/10">
                    <div className="flex gap-3">
                      <CheckCircle2 className="w-5 h-5 text-violet-400 flex-shrink-0" />
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Vérifiez les informations avant de publier votre cours.
                        Vous pourrez le modifier ultérieurement.
                      </p>
                    </div>
                  </div>
                </div>
              </aside>

            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="max-w-[1400px] mx-auto px-5 md:px-8 pb-6 pt-4 border-t border-white/5 text-center text-[10px] text-slate-600 tracking-[0.2em] font-light">
          <p>eSportsConnect • Modification de cours • © 2026</p>
        </div>

      </main>
    </div>
  );
};

export default EditCourse;