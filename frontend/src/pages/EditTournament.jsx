import React, { useState, useEffect } from 'react';
import { usePage, useNavigate } from '../context/RouterContext';
import {
  ArrowLeft,
  Trophy,
  Calendar,
  Users,
  Gamepad2,
  Swords,
  MapPin,
  Image as ImageIcon,
  Clock,
  Info,
  Loader2,
  Sparkles,
  Award,
  Shield,
  Target,
  Save,
  CheckCircle2
} from 'lucide-react';
import API from '../services/api';

// ============================================================
// FONCTIONS UTILITAIRES
// ============================================================

const formatDateForDisplay = (dateStr) => {
  if (!dateStr) return '';
  return dateStr.slice(0, 16);
};

// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================

const EditTournament = () => {
  const page = usePage();
  const navigate = useNavigate();
  const tournamentId = page.split('/')[1];

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '',
    game: '',
    category: '',
    description: '',
    rules: '',
    level: 'debutant',
    tournament_format: 'elimination_directe',
    match_format: 'bo1',
    format: '1v1',
    max_participants: 16,
    start_date: '',
    end_date: '',
    registration_deadline: '',
    status: 'upcoming',
    prize_pool: 0,
    image: '',
    lieu: 'En ligne',
    recompense: '',
  });

  // ============================================================
  // CHARGEMENT DES DONNÉES
  // ============================================================
  useEffect(() => {
    if (tournamentId) {
      API.get(`/tournaments/${tournamentId}/`)
        .then(res => {
          const data = res.data;
          setForm({
            ...data,
            start_date: formatDateForDisplay(data.start_date),
            end_date: formatDateForDisplay(data.end_date),
            registration_deadline: formatDateForDisplay(data.registration_deadline),
            image: data.image || '',
            lieu: data.lieu || 'En ligne',
            recompense: data.recompense || '',
          });
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setError('Impossible de charger le tournoi.');
          setLoading(false);
        });
    }
  }, [tournamentId]);

  // ============================================================
  // HANDLERS
  // ============================================================
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setForm({
      ...form,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const payload = {
      name: form.name,
      game: form.game,
      category: form.category,
      description: form.description,
      rules: form.rules,
      level: form.level,
      tournament_format: form.tournament_format,
      match_format: form.match_format,
      format: form.format,
      max_participants: parseInt(form.max_participants, 10) || 16,
      start_date: form.start_date,
      end_date: form.end_date,
      registration_deadline: form.registration_deadline || null,
      status: form.status,
      prize_pool: parseFloat(form.prize_pool) || 0,
      image: form.image || '',
      lieu: form.lieu || 'En ligne',
      recompense: form.recompense || '',
    };

    try {
      await API.put(`/tournaments/${tournamentId}/`, payload);
      alert('✅ Tournoi modifié avec succès !');
      navigate(`tournaments/${tournamentId}`);
    } catch (err) {
      console.error('Erreur détaillée:', err.response?.data);
      const errorMsg = err.response?.data
        ? JSON.stringify(err.response.data)
        : 'Vérifiez les champs du formulaire.';
      setError(errorMsg);
      alert(`❌ Erreur lors de la modification : ${errorMsg}`);
    } finally {
      setSaving(false);
    }
  };

  // Options pour les selects
  const levelOptions = [
    { value: 'debutant', label: 'Débutant' },
    { value: 'intermediaire', label: 'Intermédiaire' },
    { value: 'avance', label: 'Avancé' },
    { value: 'expert', label: 'Expert' }
  ];

  const tournamentFormatOptions = [
    { value: 'elimination_directe', label: 'Élimination directe' },
    { value: 'double_elimination', label: 'Double élimination' },
    { value: 'round_robin', label: 'Round Robin' },
    { value: 'phase_de_groupes', label: 'Phase de groupes' },
    { value: 'systeme_suisse', label: 'Système suisse' },
    { value: 'playoffs', label: 'Playoffs' }
  ];

  const matchFormatOptions = [
    { value: 'bo1', label: 'BO1' },
    { value: 'bo3', label: 'BO3' },
    { value: 'bo5', label: 'BO5' },
    { value: 'aller_retour', label: 'Match aller-retour' }
  ];

  const teamFormatOptions = [
    { value: 'solo', label: 'Solo' },
    { value: '1v1', label: '1 vs 1' },
    { value: '2v2', label: '2 vs 2' },
    { value: '5v5', label: '5 vs 5' }
  ];

  const statusOptions = [
    { value: 'upcoming', label: 'À venir' },
    { value: 'ongoing', label: 'En cours' },
    { value: 'completed', label: 'Terminé' }
  ];

  // ============================================================
  // RENDU
  // ============================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020817] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-violet-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020817] text-white">
      <main className="ml-0 md:ml-[250px] min-h-screen px-4 md:px-8 py-6">

        {/* ===== HEADER ===== */}
        <div className="relative overflow-hidden mb-8 rounded-3xl bg-gradient-to-r from-violet-950/30 via-purple-950/20 to-cyan-950/30 p-8 border border-white/5">
          <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse animation-delay-200" />
          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-violet-400 text-xs font-semibold uppercase tracking-wider mb-2">
                <Sparkles className="w-4 h-4" />
                Organisation
              </div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                Modifier le tournoi
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                Mets à jour les informations de ta compétition.
              </p>
            </div>
            <button
              onClick={() => navigate(`tournaments/${tournamentId}`)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 transition text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour au tournoi
            </button>
          </div>
        </div>

        {/* ===== FORMULAIRE ===== */}
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 lg:grid-cols-[1fr_350px]">

            {/* ===== COLONNE GAUCHE ===== */}
            <div className="space-y-6">

              {/* Informations générales */}
              <section className="rounded-2xl border border-white/5 bg-[#08111f] p-6">
                <div className="mb-6">
                  <h2 className="text-lg font-bold">Informations générales</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Les informations principales du tournoi.
                  </p>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">
                      Nom du tournoi *
                    </label>
                    <input
                      required
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-white/5 bg-[#020817] px-4 py-3 text-sm outline-none placeholder:text-slate-700 focus:border-violet-500/50"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">
                      Jeu *
                    </label>
                    <div className="relative">
                      <Gamepad2 size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-violet-400" />
                      <input
                        required
                        type="text"
                        name="game"
                        value={form.game}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-white/5 bg-[#020817] py-3 pl-11 pr-4 text-sm outline-none placeholder:text-slate-700 focus:border-violet-500/50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">
                      Catégorie
                    </label>
                    <input
                      type="text"
                      name="category"
                      value={form.category}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-white/5 bg-[#020817] px-4 py-3 text-sm outline-none placeholder:text-slate-700 focus:border-violet-500/50"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">
                      Description *
                    </label>
                    <textarea
                      required
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      rows={4}
                      className="w-full resize-none rounded-xl border border-white/5 bg-[#020817] px-4 py-3 text-sm outline-none placeholder:text-slate-700 focus:border-violet-500/50"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">
                      Règles *
                    </label>
                    <textarea
                      required
                      name="rules"
                      value={form.rules}
                      onChange={handleChange}
                      rows={4}
                      className="w-full resize-none rounded-xl border border-white/5 bg-[#020817] px-4 py-3 text-sm outline-none placeholder:text-slate-700 focus:border-violet-500/50"
                    />
                  </div>
                </div>
              </section>

              {/* Planning */}
              <section className="rounded-2xl border border-white/5 bg-[#08111f] p-6">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <h2 className="font-bold">Planning</h2>
                    <p className="text-sm text-slate-500">
                      Définis les dates du tournoi.
                    </p>
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm text-slate-400">
                      Date de début *
                    </label>
                    <input
                      required
                      type="datetime-local"
                      name="start_date"
                      value={form.start_date}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-white/5 bg-[#020817] px-4 py-3 text-sm outline-none focus:border-violet-500/50"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm text-slate-400">
                      Date de fin *
                    </label>
                    <input
                      required
                      type="datetime-local"
                      name="end_date"
                      value={form.end_date}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-white/5 bg-[#020817] px-4 py-3 text-sm outline-none focus:border-violet-500/50"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm text-slate-400">
                      Délai d'inscription
                    </label>
                    <input
                      type="datetime-local"
                      name="registration_deadline"
                      value={form.registration_deadline}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-white/5 bg-[#020817] px-4 py-3 text-sm outline-none focus:border-violet-500/50"
                    />
                  </div>
                </div>
              </section>

              {/* Format de compétition */}
              <section className="rounded-2xl border border-white/5 bg-[#08111f] p-6">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
                    <Swords size={20} />
                  </div>
                  <div>
                    <h2 className="font-bold">Format de compétition</h2>
                    <p className="text-sm text-slate-500">
                      Configure les règles.
                    </p>
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm text-slate-400">
                      Niveau
                    </label>
                    <select
                      name="level"
                      value={form.level}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-white/5 bg-[#020817] px-4 py-3 text-sm outline-none focus:border-violet-500/50"
                    >
                      {levelOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-slate-400">
                      Format du tournoi
                    </label>
                    <select
                      name="tournament_format"
                      value={form.tournament_format}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-white/5 bg-[#020817] px-4 py-3 text-sm outline-none focus:border-violet-500/50"
                    >
                      {tournamentFormatOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-slate-400">
                      Format des matchs
                    </label>
                    <select
                      name="match_format"
                      value={form.match_format}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-white/5 bg-[#020817] px-4 py-3 text-sm outline-none focus:border-violet-500/50"
                    >
                      {matchFormatOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-slate-400">
                      Format des équipes
                    </label>
                    <select
                      name="format"
                      value={form.format}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-white/5 bg-[#020817] px-4 py-3 text-sm outline-none focus:border-violet-500/50"
                    >
                      {teamFormatOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-slate-400">
                      Participants max
                    </label>
                    <div className="relative">
                      <Users size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="number"
                        min="2"
                        name="max_participants"
                        value={form.max_participants}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-white/5 bg-[#020817] py-3 pl-11 pr-4 text-sm outline-none focus:border-violet-500/50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-slate-400">
                      Lieu
                    </label>
                    <div className="relative">
                      <MapPin size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="text"
                        name="lieu"
                        value={form.lieu}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-white/5 bg-[#020817] py-3 pl-11 pr-4 text-sm outline-none focus:border-violet-500/50"
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* Statut et récompense */}
              <section className="rounded-2xl border border-white/5 bg-[#08111f] p-6">
                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">
                      Statut
                    </label>
                    <select
                      name="status"
                      value={form.status}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-white/5 bg-[#020817] px-4 py-3 text-sm outline-none focus:border-violet-500/50"
                    >
                      {statusOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">
                      Prix (DH)
                    </label>
                    <div className="relative">
                      <Award size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-yellow-400" />
                      <input
                        type="number"
                        min="0"
                        name="prize_pool"
                        value={form.prize_pool}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-white/5 bg-[#020817] py-3 pl-11 pr-4 text-sm outline-none focus:border-violet-500/50"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-slate-300">
                      Récompense (description)
                    </label>
                    <input
                      type="text"
                      name="recompense"
                      value={form.recompense}
                      onChange={handleChange}
                      placeholder="Ex : 2500 XP + Badge exclusif"
                      className="w-full rounded-xl border border-white/5 bg-[#020817] px-4 py-3 text-sm outline-none placeholder:text-slate-700 focus:border-violet-500/50"
                    />
                  </div>
                </div>
              </section>
            </div>

            {/* ===== COLONNE DROITE (Sidebar) ===== */}
            <aside className="space-y-6">

              {/* Image de couverture */}
              <div className="overflow-hidden rounded-2xl border border-white/5 bg-[#08111f]">
                <div className="relative h-48">
                  {form.image ? (
                    <img src={form.image} alt="Aperçu" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-violet-950 via-[#111827] to-cyan-950">
                      <ImageIcon size={45} className="text-white/20" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#08111f] to-transparent" />
                </div>

                <div className="p-5">
                  <label className="mb-2 block text-sm text-slate-400">
                    Image du tournoi (URL)
                  </label>
                  <input
                    type="url"
                    name="image"
                    value={form.image}
                    onChange={handleChange}
                    placeholder="https://..."
                    className="w-full rounded-xl border border-white/5 bg-[#020817] px-3 py-3 text-xs outline-none focus:border-violet-500/50"
                  />
                </div>
              </div>

              {/* Aperçu rapide */}
              <div className="rounded-2xl border border-white/5 bg-[#08111f] p-5">
                <div className="mb-4 flex items-center gap-3">
                  <Trophy className="text-yellow-400" size={20} />
                  <h3 className="font-bold">Aperçu</h3>
                </div>

                <div className="space-y-3 text-sm text-slate-400">
                  <div className="flex justify-between">
                    <span>Nom :</span>
                    <span className="text-white font-medium truncate max-w-[150px]">
                      {form.name || 'Non défini'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Jeu :</span>
                    <span className="text-white font-medium">{form.game || 'Non défini'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Format :</span>
                    <span className="text-white font-medium">
                      {tournamentFormatOptions.find(o => o.value === form.tournament_format)?.label || 'Non défini'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Participants :</span>
                    <span className="text-white font-medium">{form.max_participants}</span>
                  </div>
                  {form.prize_pool > 0 && (
                    <div className="flex justify-between">
                      <span>Prix :</span>
                      <span className="text-yellow-400 font-medium">{form.prize_pool} DH</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="rounded-2xl border border-violet-500/10 bg-violet-500/5 p-5">
                <div className="flex gap-3">
                  <Info className="shrink-0 text-violet-400" size={19} />
                  <p className="text-xs leading-5 text-slate-400">
                    Vérifie les informations avant d'enregistrer les modifications.
                    Les participants verront ces informations sur la page du tournoi.
                  </p>
                </div>
              </div>

              {/* Bouton de soumission */}
              <button
                disabled={saving}
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-500 py-3.5 font-bold shadow-lg shadow-violet-950/30 transition hover:brightness-110 disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 size={19} className="animate-spin" />
                ) : (
                  <Save size={19} />
                )}
                {saving ? "Enregistrement..." : "Enregistrer"}
              </button>

            </aside>

          </div>
        </form>

        {/* ===== FOOTER ===== */}
        <div className="mt-12 pt-6 border-t border-white/5 text-center text-[10px] text-slate-600 tracking-[0.2em] font-light">
          <p>eSportsConnect • Modification de tournoi • © 2026</p>
        </div>

      </main>
    </div>
  );
};

export default EditTournament;