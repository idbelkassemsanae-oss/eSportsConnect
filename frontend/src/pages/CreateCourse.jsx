import React, { useState } from 'react';
import { useNavigate } from '../context/RouterContext';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  FileText,
  Gamepad2,
  Loader2,
  Play,
  Save,
  Sparkles,
  Upload,
  Video,
  DollarSign
} from 'lucide-react';
import API from '../services/api';

// ============================================================
// COMPOSANTS RÉUTILISABLES (inchangés)
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

const Input = ({ label, name, value, onChange, placeholder, required, type = "text", disabled = false }) => (
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
      disabled={disabled}
      className="w-full rounded-xl bg-[#050b16] border border-white/10 px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-500/60 transition disabled:opacity-50 disabled:cursor-not-allowed"
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

const CreateCourse = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // ✅ Données statiques (en attendant le backend)
  const games = [
    { id: 1, name: 'Valorant' },
    { id: 2, name: 'League of Legends' },
    { id: 3, name: 'CS:GO' },
    { id: 4, name: 'Dota 2' },
    { id: 5, name: 'Fortnite' },
    { id: 6, name: 'Overwatch 2' },
    { id: 7, name: 'PUBG' },
    { id: 8, name: 'Rocket League' },
    { id: 9, name: 'Call of Duty' },
    { id: 10, name: 'FIFA' },
    { id: 11, name: 'Among Us' },
    { id: 12, name: 'Apex Legends' },
  ];

  const categories = [
    { id: 1, name: 'FPS' },
    { id: 2, name: 'MOBA' },
    { id: 3, name: 'Battle Royale' },
    { id: 4, name: 'Jeux de sport' },
    { id: 5, name: 'Jeux de combat' },
    { id: 6, name: 'Stratégie' },
    { id: 7, name: 'Entraînement & Performance' },
    { id: 8, name: 'Compétition eSport' },
  ];

  // ✅ Mapping des niveaux français vers les clés attendues par le backend
  const levelMapping = {
    'Débutant': 'beginner',
    'Intermédiaire': 'intermediate',
    'Avancé': 'advanced',
    'Expert': 'expert',
  };

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    game: '',
    course_type: 'video',
    video_url: '',
    video_file: null,
    content: '',
    duration: '',
    price: '',
    difficulty_level: 'Débutant',  // valeur française affichée
    is_active: true,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === 'checkbox' ? checked : value
    });
    setErrorMessage('');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm({ ...form, video_file: file, video_url: '' });
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setErrorMessage('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setUploadProgress(0);
    setErrorMessage('');

    try {
      // 1. Récupérer l'ID du jeu et de la catégorie
      const gameId = form.game ? parseInt(form.game) : null;
      const categoryId = form.category ? parseInt(form.category) : null;

      // 2. Mapper le niveau vers la clé anglaise
      const difficultyKey = levelMapping[form.difficulty_level] || 'beginner';

      // 3. Construire le payload
      let videoUrl = form.video_url;
      if (form.video_file) {
        // Simulation d'upload (à remplacer par un vrai endpoint)
        await new Promise(resolve => setTimeout(resolve, 1000));
        videoUrl = URL.createObjectURL(form.video_file);
        setUploadProgress(100);
      }

      const payload = {
        title: form.title,
        description: form.description,
        category: categoryId,              // ID de la catégorie (ou null)
        game: gameId,                      // ID du jeu (ou null)
        course_type: form.course_type,
        video_url: form.course_type === 'video' ? videoUrl : null,
        content: form.course_type === 'text' ? form.content : '',
        duration: parseInt(form.duration) || 0,
        price: parseFloat(form.price) || 0,
        difficulty_level: difficultyKey,   // 'beginner', 'intermediate', etc.
        is_active: form.is_active,
      };

      console.log('📦 Payload envoyé :', payload);

      // 4. Envoi vers le backend
      const response = await API.post('/courses/', payload);
      console.log('✅ Réponse :', response.data);
      alert('✅ Cours créé avec succès !');
      navigate('coach-courses');
    } catch (err) {
      console.error('❌ Erreur détaillée :', err);
      if (err.response) {
        // Le serveur a répondu avec une erreur
        console.error('Données de réponse :', err.response.data);
        const errors = err.response.data;
        if (typeof errors === 'object') {
          const messages = Object.entries(errors).map(([field, msgs]) => `${field}: ${msgs.join(', ')}`).join('\n');
          setErrorMessage(`Erreur de validation :\n${messages}`);
          alert(`❌ Erreur de validation :\n${messages}`);
        } else {
          setErrorMessage(err.response.data.detail || 'Erreur lors de la création du cours.');
          alert(`❌ ${err.response.data.detail || 'Erreur lors de la création du cours.'}`);
        }
      } else {
        setErrorMessage('Erreur réseau ou serveur.');
        alert('❌ Erreur réseau ou serveur.');
      }
    } finally {
      setSaving(false);
    }
  };

  const levelOptions = ['Débutant', 'Intermédiaire', 'Avancé', 'Expert'];

  return (
    <div className="min-h-screen bg-[#030712] text-white">
      <main className="ml-0 md:ml-[250px] min-h-screen">

        {/* HEADER (inchangé) */}
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
                  Créer un cours
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                  Partagez vos connaissances avec la communauté eSports
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
                    subtitle="Définissez les informations principales du cours"
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
                      icon={<Play />}
                      title="Contenu vidéo"
                      subtitle="Ajoutez une vidéo YouTube OU importez un fichier"
                    />
                    <div className="space-y-4">
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
                            className="w-full rounded-xl bg-[#050b16] border border-white/10 pl-12 pr-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-500/60 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={!!form.video_file}
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex-1 border-t border-white/10" />
                        <span className="text-xs text-slate-500 uppercase tracking-wider">OU</span>
                        <div className="flex-1 border-t border-white/10" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Importer un fichier vidéo
                        </label>
                        <div className="relative">
                          <input
                            type="file"
                            accept="video/*"
                            onChange={handleFileChange}
                            className="hidden"
                            id="videoFile"
                          />
                          <label
                            htmlFor="videoFile"
                            className="flex items-center justify-center w-full rounded-xl border-2 border-dashed border-slate-700 bg-[#050b16] px-4 py-4 text-slate-400 cursor-pointer hover:border-violet-500 transition"
                          >
                            <Upload className="w-5 h-5 mr-2 text-violet-400" />
                            {form.video_file ? form.video_file.name : 'Choisir un fichier vidéo'}
                          </label>
                          {form.video_file && (
                            <button
                              type="button"
                              onClick={() => {
                                setForm({ ...form, video_file: null, video_url: '' });
                                setPreviewUrl('');
                              }}
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-red-400 hover:text-red-300"
                            >
                              Supprimer
                            </button>
                          )}
                        </div>
                      </div>
                      {previewUrl && (
                        <div className="mt-2">
                          <video controls className="w-full max-h-60 rounded-xl border border-white/10">
                            <source src={previewUrl} />
                          </video>
                        </div>
                      )}
                      {uploadProgress > 0 && uploadProgress < 100 && (
                        <div className="w-full bg-slate-800 rounded-full h-2">
                          <div className="bg-gradient-to-r from-violet-500 to-cyan-400 h-2 rounded-full transition-all" style={{ width: `${uploadProgress}%` }} />
                        </div>
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
                      required={form.course_type === 'text'}
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
                    <span className="text-sm text-slate-300">Publier immédiatement</span>
                  </label>
                </section>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => navigate('coach-courses')}
                    className="px-6 py-3.5 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] transition font-medium"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-7 py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-500 hover:from-violet-500 hover:to-purple-400 transition font-bold flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Création...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        Créer le cours
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* ===== SIDEBAR APERÇU (inchangée) ===== */}
              <aside>
                <div className="sticky top-6">
                  <div className="rounded-2xl border border-white/5 bg-[#080f1d] overflow-hidden">
                    <div className="px-5 py-4 border-b border-white/5">
                      <p className="text-sm font-bold">Aperçu du cours</p>
                    </div>
                    <div className="relative aspect-video overflow-hidden">
                      {form.course_type === 'video' && (previewUrl || form.video_url) ? (
                        <video src={previewUrl || form.video_url} className="w-full h-full object-cover" controls={false} />
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
                      <h3 className="font-bold text-lg">{form.title || "Titre de votre cours"}</h3>
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
                        Vérifiez les informations avant de publier votre cours. Vous pourrez le modifier ultérieurement.
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
          <p>eSportsConnect • Création de cours • © 2026</p>
        </div>

      </main>
    </div>
  );
};

export default CreateCourse;