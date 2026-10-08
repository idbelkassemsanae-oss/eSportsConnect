import React, { useState, useEffect } from 'react';
import { usePage, useNavigate } from '../context/RouterContext';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft,
  Trophy,
  Users,
  Settings,
  Edit3,
  Trash2,
  Play,
  CheckCircle2,
  Clock,
  Swords,
  Crown,
  Loader2,
  MoreVertical,
  UserPlus,
  Bolt,
  Plus,
  Check,
  X,
  UserRound,
  Calendar,
  Gamepad2,
  Medal,
  Info, // ✅ AJOUTÉ
} from 'lucide-react';
import API from '../services/api';

// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================
const ManageTournament = () => {
  const page = usePage();
  const navigate = useNavigate();
  const { user } = useAuth();
  const tournamentId = page.split('/')[1];

  const [tournament, setTournament] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [teams, setTeams] = useState([]);
  const [matches, setMatches] = useState([]);
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [teamName, setTeamName] = useState('');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const isCoach = user?.role === 'coach';

  // ============================================================
  // CHARGEMENT DES DONNÉES
  // ============================================================
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [tournRes, teamsRes, matchesRes] = await Promise.all([
          API.get(`/tournaments/${tournamentId}/`),
          API.get(`/tournaments/${tournamentId}/teams/`).catch(() => ({ data: [] })),
          API.get(`/tournaments/${tournamentId}/matches/`).catch(() => ({ data: [] })),
        ]);

        setTournament(tournRes.data);
        setParticipants(tournRes.data.participants || []);
        setTeams(teamsRes.data || []);
        setMatches(matchesRes.data || []);
      } catch (err) {
        console.error('Erreur chargement:', err);
        alert('Impossible de charger les données du tournoi.');
      } finally {
        setLoading(false);
      }
    };

    if (tournamentId) fetchData();
  }, [tournamentId]);

  // ============================================================
  // CRÉATION D'ÉQUIPE
  // ============================================================
  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (selectedPlayers.length < 2) {
      return alert('Choisissez au moins 2 joueurs pour former une équipe.');
    }
    if (!teamName.trim()) {
      return alert('Donnez un nom à votre équipe.');
    }

    try {
      await API.post(`/tournaments/${tournamentId}/teams/`, {
        name: teamName,
        member_ids: selectedPlayers,
      });
      alert('✅ Équipe créée avec succès !');
      setSelectedPlayers([]);
      setTeamName('');
      const res = await API.get(`/tournaments/${tournamentId}/teams/`);
      setTeams(res.data || []);
    } catch (err) {
      console.error(err);
      alert('❌ Erreur lors de la création de l\'équipe.');
    }
  };

  // ============================================================
  // GÉNÉRATION DES MATCHS
  // ============================================================
  const handleGenerateMatches = async () => {
    const isSolo = tournament?.format === 'solo';
    if (isSolo && participants.length < 2) {
      return alert('Il faut au moins 2 joueurs inscrits pour générer des matchs.');
    }
    if (!isSolo && teams.length < 2) {
      return alert('Il faut au moins 2 équipes pour générer des matchs.');
    }

    try {
      setGenerating(true);
      await API.post(`/tournaments/${tournamentId}/matches/`);
      alert('✅ Matchs générés avec succès !');
      const res = await API.get(`/tournaments/${tournamentId}/matches/`);
      setMatches(res.data || []);
    } catch (err) {
      console.error(err);
      alert('❌ Erreur lors de la génération des matchs.');
    } finally {
      setGenerating(false);
    }
  };

  // ============================================================
  // SOUMISSION DES SCORES
  // ============================================================
  const handleSubmitScore = async (matchId, tempScores) => {
    try {
      await API.post(`/tournaments/${tournamentId}/matches/${matchId}/score/`, {
        scores: tempScores,
      });
      alert('✅ Scores enregistrés avec succès !');
      const res = await API.get(`/tournaments/${tournamentId}/matches/`);
      setMatches(res.data || []);
    } catch (err) {
      console.error(err);
      alert('❌ Erreur lors de l\'enregistrement des scores.');
    }
  };

  // ============================================================
  // ACTIONS COACH (démarrer, supprimer, modifier)
  // ============================================================
  const startTournament = async () => {
    try {
      await API.post(`/tournaments/${tournamentId}/start/`);
      alert('✅ Tournoi démarré !');
      const res = await API.get(`/tournaments/${tournamentId}/`);
      setTournament(res.data);
    } catch (err) {
      console.error(err);
      alert('❌ Impossible de démarrer le tournoi.');
    }
  };

  const deleteTournament = async () => {
    if (!window.confirm('Voulez-vous vraiment supprimer ce tournoi ?')) return;
    try {
      await API.delete(`/tournaments/${tournamentId}/`);
      navigate('tournaments');
    } catch (err) {
      console.error(err);
      alert('❌ Erreur lors de la suppression.');
    }
  };

  // ============================================================
  // FORMATAGE
  // ============================================================
  const formatDate = (dateStr) => {
    if (!dateStr) return 'Non défini';
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getRequiredWins = (format) => {
    if (format === 'bo5') return 3;
    if (format === 'bo3') return 2;
    return 1;
  };

  const statusMap = {
    upcoming: { label: 'À venir', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    ongoing: { label: 'En cours', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    completed: { label: 'Terminé', color: 'bg-gray-500/10 text-gray-400 border-gray-500/20' },
  };
  const statusInfo = statusMap[tournament?.status] || statusMap.upcoming;

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

  if (!tournament) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#020817] text-red-400">
        <p>Tournoi introuvable</p>
      </div>
    );
  }

  const isSolo = tournament.format === 'solo';
  const requiredWins = getRequiredWins(tournament.match_format);

  return (
    <div className="min-h-screen bg-[#020817] text-white">
      <main className="ml-0 md:ml-[250px] min-h-screen">

        {/* ===== HEADER ===== */}
        <header className="border-b border-white/5 bg-[#020817]/80 backdrop-blur-xl">
          <div className="max-w-[1450px] mx-auto px-5 md:px-8 py-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-violet-400 text-xs font-semibold uppercase tracking-wider mb-1">
                  <Settings className="w-4 h-4" />
                  Administration du tournoi
                </div>
                <h1 className="text-2xl md:text-3xl font-black tracking-tight">
                  {tournament.name}
                </h1>
                <p className="text-slate-500 text-sm mt-1">
                  {tournament.game} · {tournament.match_format} · {tournament.format}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => navigate(`edit-tournament/${tournamentId}`)}
                  className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold hover:bg-white/10 transition"
                >
                  <Edit3 size={17} />
                  Modifier
                </button>
                <button
                  onClick={deleteTournament}
                  className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-400 hover:bg-red-500/20 transition"
                >
                  <Trash2 size={17} />
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-[1450px] mx-auto px-5 md:px-8 py-6">

          {/* ===== STATISTIQUES ===== */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="rounded-2xl border border-white/5 bg-[#08111f] p-5">
              <Trophy className="mb-3 text-violet-400" size={22} />
              <p className="text-2xl font-black">{participants.length}</p>
              <p className="text-xs text-slate-500">Participants</p>
            </div>
            <div className="rounded-2xl border border-white/5 bg-[#08111f] p-5">
              <Users className="mb-3 text-cyan-400" size={22} />
              <p className="text-2xl font-black">{tournament.max_participants}</p>
              <p className="text-xs text-slate-500">Places disponibles</p>
            </div>
            <div className="rounded-2xl border border-white/5 bg-[#08111f] p-5">
              <Clock className="mb-3 text-orange-400" size={22} />
              <p className={`text-lg font-bold ${statusInfo.color.split(' ')[0]}`}>
                {statusInfo.label}
              </p>
              <p className="text-xs text-slate-500">Statut</p>
            </div>
            <div className="rounded-2xl border border-white/5 bg-[#08111f] p-5">
              <Swords className="mb-3 text-emerald-400" size={22} />
              <p className="text-lg font-black uppercase">{tournament.match_format}</p>
              <p className="text-xs text-slate-500">Format des matchs</p>
            </div>
          </section>

          {/* ===== BOUTON DÉMARRER ===== */}
          {tournament.status === 'upcoming' && isCoach && (
            <button
              onClick={startTournament}
              className="mb-8 flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-green-500 px-6 py-3 font-bold shadow-lg shadow-emerald-950/20 hover:brightness-110 transition"
            >
              <Play size={18} />
              Démarrer le tournoi
            </button>
          )}

          {/* ===== GRILLE PRINCIPALE ===== */}
          <div className="grid gap-6 lg:grid-cols-[1fr_380px]">

            {/* ===== COLONNE GAUCHE ===== */}
            <div className="space-y-6">

              {/* PARTICIPANTS */}
              <section className="rounded-2xl border border-white/5 bg-[#08111f] p-6">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-black flex items-center gap-2">
                      <Users size={20} className="text-violet-400" />
                      Participants
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      {participants.length} joueurs inscrits
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {participants.length === 0 ? (
                    <p className="text-center text-sm text-slate-400 py-4">Aucun participant pour le moment.</p>
                  ) : (
                    participants.map((p, idx) => (
                      <div
                        key={p.id || idx}
                        className="flex items-center gap-4 rounded-xl border border-white/5 bg-[#020817] p-4"
                      >
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/10 text-sm font-black text-violet-400">
                          #{idx + 1}
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-cyan-400 font-black text-white text-sm">
                          {(p.username || p.player_username || '?').charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <p className="font-bold">{p.username || p.player_username}</p>
                          <p className="text-xs text-slate-500">Niveau {p.level || '?'}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>

              {/* CRÉATION D'ÉQUIPES (si pas solo) */}
              {!isSolo && (
                <section className="rounded-2xl border border-white/5 bg-[#08111f] p-6">
                  <h2 className="text-xl font-black flex items-center gap-2 mb-4">
                    <UserPlus size={20} className="text-cyan-400" />
                    Créer des équipes
                  </h2>
                  <form onSubmit={handleCreateTeam} className="space-y-4">
                    <input
                      type="text"
                      placeholder="Nom de l'équipe"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      className="w-full rounded-xl border border-white/5 bg-[#020817] px-4 py-3 text-sm outline-none placeholder:text-slate-700 focus:border-violet-500/50"
                    />
                    <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                      {participants.map((p) => (
                        <label
                          key={p.id}
                          className={`flex items-center gap-2 rounded-lg border p-2 cursor-pointer transition ${
                            selectedPlayers.includes(p.id)
                              ? 'border-violet-500/50 bg-violet-500/10'
                              : 'border-white/5 hover:bg-white/5'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedPlayers.includes(p.id)}
                            onChange={() =>
                              setSelectedPlayers((prev) =>
                                prev.includes(p.id)
                                  ? prev.filter((id) => id !== p.id)
                                  : [...prev, p.id]
                              )
                            }
                            className="accent-violet-500"
                          />
                          <span className="text-sm truncate">{p.username || p.player_username}</span>
                        </label>
                      ))}
                    </div>
                    <button
                      type="submit"
                      className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-purple-500 py-3 font-bold text-white hover:brightness-110 transition flex items-center justify-center gap-2"
                    >
                      <Plus size={18} />
                      Créer l'équipe
                    </button>
                  </form>

                  {/* Liste des équipes existantes */}
                  {teams.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <p className="text-sm font-semibold text-slate-400">Équipes créées :</p>
                      {teams.map((team) => (
                        <div key={team.id} className="flex items-center gap-3 rounded-lg bg-[#020817] p-3 border border-white/5">
                          <Users size={16} className="text-cyan-400" />
                          <span className="font-medium">{team.name}</span>
                          <span className="text-xs text-slate-500 ml-auto">
                            {team.members?.length || 0} membres
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              )}

              {/* GÉNÉRATION DES MATCHS */}
              <section className="rounded-2xl border border-white/5 bg-[#08111f] p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-black flex items-center gap-2">
                      <Bolt size={20} className="text-amber-400" />
                      Générer les matchs
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      {isSolo
                        ? `${participants.length} joueurs inscrits`
                        : `${teams.length} équipes créées`}
                    </p>
                  </div>
                  <button
                    onClick={handleGenerateMatches}
                    disabled={generating}
                    className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-2.5 font-bold text-black hover:brightness-110 transition disabled:opacity-50 flex items-center gap-2"
                  >
                    {generating ? <Loader2 size={18} className="animate-spin" /> : <Bolt size={18} />}
                    {generating ? 'Génération...' : 'Générer'}
                  </button>
                </div>
              </section>

              {/* MATCHS ET SCORES */}
              <section className="rounded-2xl border border-white/5 bg-[#08111f] p-6">
                <h2 className="text-xl font-black flex items-center gap-2 mb-4">
                  <Swords size={20} className="text-purple-400" />
                  Matchs et scores
                </h2>

                {matches.length === 0 ? (
                  <p className="text-center text-sm text-slate-400 py-6">Aucun match généré.</p>
                ) : (
                  <div className="space-y-6">
                    {matches.map((match) => {
                      // Initialiser les scores temporaires
                      if (!match.tempScores) {
                        if (match.scores && match.scores.length > 0) {
                          match.tempScores = JSON.parse(JSON.stringify(match.scores));
                        } else {
                          match.tempScores = [];
                          for (let i = 0; i < requiredWins; i++) {
                            match.tempScores.push({ team1: 0, team2: 0 });
                          }
                        }
                      }

                      const updateTempScore = (index, field, value) => {
                        const newScores = [...match.tempScores];
                        if (!newScores[index]) newScores[index] = { team1: 0, team2: 0 };
                        newScores[index][field] = parseInt(value) || 0;
                        match.tempScores = newScores;
                        setMatches([...matches]);
                      };

                      const addSet = () => {
                        match.tempScores.push({ team1: 0, team2: 0 });
                        setMatches([...matches]);
                      };

                      const removeLastSet = () => {
                        if (match.tempScores.length > 1) {
                          match.tempScores.pop();
                          setMatches([...matches]);
                        }
                      };

                      const player1 = match.player1_username || match.team1?.name || 'À déterminer';
                      const player2 = match.player2_username || match.team2?.name || 'À déterminer';
                      const isComplete = match.is_complete;

                      return (
                        <div key={match.id} className="rounded-xl border border-white/5 bg-[#020817] p-4">
                          <div className="flex flex-wrap items-center justify-between mb-3">
                            <p className="font-bold text-cyan-300">{match.round_name || 'Match'}</p>
                            <span className="text-xs text-yellow-400 bg-yellow-500/10 px-3 py-1 rounded-full">
                              {tournament.match_format} ({requiredWins} victoires)
                            </span>
                          </div>

                          <div className="flex justify-between text-sm text-slate-300 mb-4">
                            <span className="font-bold">{player1}</span>
                            <span className="text-slate-500">VS</span>
                            <span className="font-bold">{player2}</span>
                          </div>

                          <div className="space-y-2 mb-3">
                            {match.tempScores.map((score, setIndex) => (
                              <div key={setIndex} className="flex items-center gap-3 bg-white/5 rounded-xl p-2">
                                <span className="text-slate-400 text-xs w-16 text-center">Manche {setIndex + 1}</span>
                                <input
                                  type="number"
                                  min="0"
                                  max="99"
                                  className="w-16 rounded-lg bg-black/60 border border-white/10 px-2 py-1.5 text-center text-white text-sm focus:border-violet-500/50 outline-none"
                                  value={score.team1}
                                  onChange={(e) => updateTempScore(setIndex, 'team1', e.target.value)}
                                />
                                <span className="text-slate-500 font-bold">:</span>
                                <input
                                  type="number"
                                  min="0"
                                  max="99"
                                  className="w-16 rounded-lg bg-black/60 border border-white/10 px-2 py-1.5 text-center text-white text-sm focus:border-violet-500/50 outline-none"
                                  value={score.team2}
                                  onChange={(e) => updateTempScore(setIndex, 'team2', e.target.value)}
                                />
                              </div>
                            ))}
                          </div>

                          <div className="flex flex-wrap gap-2 mb-3">
                            <button
                              onClick={addSet}
                              className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1 rounded-lg transition"
                            >
                              + Ajouter une manche
                            </button>
                            <button
                              onClick={removeLastSet}
                              className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1 rounded-lg transition"
                            >
                              - Retirer
                            </button>
                          </div>

                          {isComplete && (
                            <div className="text-center text-emerald-400 text-sm mb-3 py-2 border border-emerald-500/30 rounded-lg bg-emerald-500/10">
                              ✅ Match terminé - Vainqueur : {match.winner || player1}
                            </div>
                          )}

                          <button
                            onClick={() => handleSubmitScore(match.id, match.tempScores)}
                            className="w-full rounded-lg bg-gradient-to-r from-emerald-500 to-green-500 py-2.5 font-bold text-black hover:brightness-110 transition flex items-center justify-center gap-2"
                          >
                            <Check size={18} />
                            Enregistrer les scores
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            </div>

            {/* ===== COLONNE DROITE ===== */}
            <aside className="space-y-6">

              {/* Informations rapides */}
              <div className="rounded-2xl border border-white/5 bg-[#08111f] p-6">
                <h2 className="text-lg font-black mb-4 flex items-center gap-2">
                  <Info size={18} className="text-violet-400" />
                  Informations
                </h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-slate-400">Jeu</span>
                    <span className="font-medium">{tournament.game}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-slate-400">Format</span>
                    <span className="font-medium uppercase">{tournament.tournament_format?.replace('_', ' ')}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-slate-400">Matchs</span>
                    <span className="font-medium uppercase">{tournament.match_format}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-slate-400">Équipes</span>
                    <span className="font-medium">{tournament.format}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Début</span>
                    <span className="font-medium">{formatDate(tournament.start_date)}</span>
                  </div>
                </div>
              </div>

              {/* Bracket mini */}
              <div className="rounded-2xl border border-white/5 bg-[#08111f] p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Swords className="text-violet-400" size={20} />
                  <div>
                    <h2 className="font-black">Bracket</h2>
                    <p className="text-xs text-slate-500">Aperçu des matchs</p>
                  </div>
                </div>

                {matches.length === 0 ? (
                  <p className="text-center text-sm text-slate-400 py-4">Aucun match généré.</p>
                ) : (
                  <div className="space-y-3">
                    {/* Demi-finales */}
                    <div>
                      <p className="text-xs uppercase tracking-wider text-slate-600 mb-2">Demi-finales</p>
                      {matches.filter(m => m.round_name?.includes('Demi')).map((m, idx) => (
                        <div key={idx} className="rounded-lg border border-white/5 bg-[#020817] p-3 mb-2">
                          <div className="flex justify-between text-sm">
                            <span>{m.player1_username || m.team1?.name || 'N/A'}</span>
                            <span className="text-slate-500">-</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>{m.player2_username || m.team2?.name || 'N/A'}</span>
                            <span className="text-slate-500">-</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Finale */}
                    <div>
                      <p className="text-xs uppercase tracking-wider text-slate-600 mb-2">Finale</p>
                      {matches.filter(m => m.round_name === 'Finale').map((m, idx) => (
                        <div key={idx} className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
                          <div className="flex justify-between text-sm">
                            <span>{m.player1_username || m.team1?.name || 'N/A'}</span>
                            <span className="text-slate-500">-</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>{m.player2_username || m.team2?.name || 'N/A'}</span>
                            <span className="text-slate-500">-</span>
                          </div>
                          {m.winner && (
                            <div className="mt-2 text-center text-xs text-amber-400 font-bold">
                              🏆 {m.winner}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

            </aside>
          </div>
        </div>

        {/* ===== FOOTER ===== */}
        <div className="max-w-[1450px] mx-auto px-5 md:px-8 pb-6 pt-4 border-t border-white/5 text-center text-[10px] text-slate-600 tracking-[0.2em] font-light">
          <p>eSportsConnect • Gestion du tournoi • © 2026</p>
        </div>

      </main>
    </div>
  );
};

export default ManageTournament;