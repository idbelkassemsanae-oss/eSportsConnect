import React, { useState, useEffect } from 'react';
import { useNavigate } from '../context/RouterContext';
import { useAuth } from '../context/AuthContext';
import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import {
  Brain,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Target,
  Trophy,
  Gamepad2,
  Zap,
  ShieldCheck,
  MessageSquare,
  ChevronRight,
  BarChart3,
  Activity,
  Award,
  Lightbulb,
  RefreshCw,
  Bot,
  Star,
  Flame,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import API from '../services/api';

// ============================================================
// CHART.JS CONFIGURATION
// ============================================================
ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

// ============================================================
// COMPOSANT STAT CARD
// ============================================================
const StatCard = ({ icon: Icon, label, value, trend, positive }) => {
  return (
    <div className="rounded-2xl border border-white/5 bg-[#07101d] p-5 transition hover:-translate-y-0.5 hover:border-purple-500/20">
      <div className="flex items-start justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-500/10">
          <Icon className="h-5 w-5 text-purple-400" />
        </div>
        {trend && (
          <span
            className={`flex items-center gap-1 text-xs font-bold ${
              positive ? 'text-emerald-400' : 'text-red-400'
            }`}
          >
            {positive ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
            {trend}
          </span>
        )}
      </div>
      <div className="mt-5">
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <p className="mt-1 text-2xl font-black">{value}</p>
      </div>
    </div>
  );
};

// ============================================================
// COMPOSANT SECTION HEADER
// ============================================================
const SectionHeader = ({ icon: Icon, title, subtitle }) => {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/10">
        <Icon className="h-5 w-5 text-purple-400" />
      </div>
      <div>
        <h2 className="font-bold">{title}</h2>
        <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
      </div>
    </div>
  );
};

// ============================================================
// COMPOSANT RECOMMANDATION CARD
// ============================================================
const RecommendationCard = ({ item }) => {
  const colorClasses = {
    purple: 'border-purple-500/20 bg-purple-500/5 text-purple-300',
    blue: 'border-blue-500/20 bg-blue-500/5 text-blue-300',
    green: 'border-emerald-500/20 bg-emerald-500/5 text-emerald-300',
    orange: 'border-orange-500/20 bg-orange-500/5 text-orange-300',
  };

  return (
    <div className={`rounded-xl border p-4 ${colorClasses[item.color] || colorClasses.purple}`}>
      <div className="flex gap-3">
        <div className="mt-0.5">
          <Lightbulb className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-bold text-white">{item.title}</h3>
            <span className="rounded-md bg-white/5 px-2 py-1 text-[10px] font-semibold text-slate-400">
              {item.type}
            </span>
          </div>
          <p className="mt-2 text-xs leading-5 text-slate-400">{item.description}</p>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// COMPOSANT BADGE ITEM
// ============================================================
const BadgeItem = ({ icon: Icon, label }) => {
  return (
    <div className="group rounded-xl border border-white/5 bg-[#0a1422] p-3 text-center transition hover:border-purple-500/20">
      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-purple-600/20 to-blue-600/20">
        <Icon className="h-5 w-5 text-purple-400" />
      </div>
      <p className="mt-2 text-[11px] font-semibold text-slate-400">{label}</p>
    </div>
  );
};

// ============================================================
// COMPOSANT FEATURE CARD
// ============================================================
const FeatureCard = ({ icon: Icon, title, description }) => {
  return (
    <div className="rounded-2xl border border-white/5 bg-[#07101d] p-5 transition hover:border-purple-500/20 hover:bg-[#091322]">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-500/10">
        <Icon className="h-5 w-5 text-purple-400" />
      </div>
      <h3 className="mt-4 font-bold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
    </div>
  );
};

// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================
const DashboardIA = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // ============================================================
  // CHARGEMENT DES STATISTIQUES
  // ============================================================
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await API.get('/ai/stats/');
        setStats(res.data);
        setLoading(false);
      } catch (err) {
        console.error('Erreur chargement stats:', err);
        setError('Impossible de charger vos statistiques.');
        setLoading(false);
      }
    };
    if (user) fetchStats();
  }, [user]);

  // ============================================================
  // RAFRAÎCHIR L'ANALYSE
  // ============================================================
  const refreshAnalysis = async () => {
    setRefreshing(true);
    try {
      const res = await API.get('/ai/stats/');
      setStats(res.data);
    } catch (err) {
      console.error('Erreur rafraîchissement:', err);
    } finally {
      setRefreshing(false);
    }
  };

  // ============================================================
  // OUVRIR LE CHATBOT (appelle la fonction globale)
  // ============================================================
  const openChatbot = () => {
    if (window.openChatbot) {
      window.openChatbot();
    } else {
      // Fallback: naviguer vers une page de chat si elle existe
      navigate('inbox');
    }
  };

  // ============================================================
  // RENDU DE CHARGEMENT
  // ============================================================
  if (loading) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center bg-[#020617] text-white">
        <div className="text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-purple-500/30 bg-purple-500/10">
            <Brain className="h-8 w-8 animate-pulse text-purple-400" />
          </div>
          <h2 className="text-xl font-bold">Analyse IA en cours...</h2>
          <p className="mt-2 text-sm text-slate-400">Nous analysons tes performances.</p>
        </div>
      </div>
    );
  }

  // ============================================================
  // RENDU D'ERREUR
  // ============================================================
  if (error || !stats) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center bg-[#020617] text-white">
        <div className="text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-400" />
          <p className="text-xl font-bold text-red-400">{error || 'Aucune donnée disponible'}</p>
          <p className="mt-2 text-sm text-slate-400">Jouez des matchs pour générer des statistiques.</p>
          <button
            onClick={refreshAnalysis}
            className="mt-4 rounded-xl bg-purple-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-purple-500 transition"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  // ============================================================
  // PRÉPARATION DES DONNÉES
  // ============================================================
  const totalMatches = stats.total_matches || 0;
  const wins = stats.wins || 0;
  const losses = stats.losses || 0;
  const winRate = stats.win_rate || 0;

  // Niveau
  const getLevel = (rate) => {
    if (rate >= 70) return { label: 'Expert', color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/30', icon: <Flame className="h-5 w-5" /> };
    if (rate >= 50) return { label: 'Avancé', color: 'text-purple-400', bg: 'bg-purple-500/20', border: 'border-purple-500/30', icon: <Zap className="h-5 w-5" /> };
    if (rate >= 30) return { label: 'Intermédiaire', color: 'text-blue-400', bg: 'bg-blue-500/20', border: 'border-blue-500/30', icon: <ShieldCheck className="h-5 w-5" /> };
    return { label: 'Débutant', color: 'text-green-400', bg: 'bg-green-500/20', border: 'border-green-500/30', icon: <Target className="h-5 w-5" /> };
  };
  const level = getLevel(winRate);

  // Compétences radar
  const skillData = stats.stats || {
    agilite: 50,
    endurance: 50,
    precision: 50,
    strategie: 50,
    travail_equipe: 50,
  };
  const radarData = {
    labels: ['Agilité', 'Endurance', 'Précision', 'Stratégie', "Travail d'équipe"],
    datasets: [
      {
        label: 'Mes compétences',
        data: [
          skillData.agilite || 50,
          skillData.endurance || 50,
          skillData.precision || 50,
          skillData.strategie || 50,
          skillData.travail_equipe || 50,
        ],
        backgroundColor: 'rgba(0, 255, 255, 0.2)',
        borderColor: '#22d3ee',
        borderWidth: 3,
        pointBackgroundColor: '#22d3ee',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#22d3ee',
      },
    ],
  };
  const radarOptions = {
    scales: {
      r: {
        min: 0,
        max: 100,
        ticks: { stepSize: 20, color: '#6b7280', font: { size: 10 } },
        grid: { color: 'rgba(255,255,255,0.05)' },
        angleLines: { color: 'rgba(255,255,255,0.05)' },
        pointLabels: { color: '#9ca3af', font: { size: 12, weight: 'bold' } },
      },
    },
    plugins: {
      legend: { labels: { color: '#d1d5db', font: { size: 14 } } },
      tooltip: {
        backgroundColor: '#1a1a2e',
        titleColor: '#fff',
        bodyColor: '#9ca3af',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
      },
    },
  };

  // Forces et faiblesses dérivées des compétences
  const skillEntries = [
    { name: 'Agilité', value: skillData.agilite || 50 },
    { name: 'Endurance', value: skillData.endurance || 50 },
    { name: 'Précision', value: skillData.precision || 50 },
    { name: 'Stratégie', value: skillData.strategie || 50 },
    { name: "Travail d'équipe", value: skillData.travail_equipe || 50 },
  ];
  const strengths = skillEntries.filter(s => s.value >= 65).sort((a, b) => b.value - a.value);
  const weaknesses = skillEntries.filter(s => s.value < 50).sort((a, b) => a.value - b.value);

  // Recommandations personnalisées
  const recommendations = [];
  if (weaknesses.length > 0) {
    recommendations.push({
      title: `Améliore ton ${weaknesses[0].name}`,
      description: `L'IA détecte que ton ${weaknesses[0].name.toLowerCase()} peut être amélioré. Consulte les cours disponibles.`,
      type: 'Entraînement',
      color: 'orange',
    });
  }
  if (winRate < 50) {
    recommendations.push({
      title: 'Travaille ta stratégie',
      description: 'Un taux de victoire inférieur à 50% indique des lacunes stratégiques. Suis des cours avancés.',
      type: 'Conseil',
      color: 'blue',
    });
  }
  if (winRate >= 50 && strengths.length > 0) {
    recommendations.push({
      title: "Continue sur ta lancée",
      description: `Tes performances en ${strengths[0].name.toLowerCase()} sont excellentes. Mainteins ce niveau.`,
      type: 'Progression',
      color: 'green',
    });
  }
  if (recommendations.length === 0) {
    recommendations.push({
      title: 'Garde le rythme',
      description: 'Tes performances sont équilibrées. Continue à t’entraîner pour progresser.',
      type: 'Général',
      color: 'purple',
    });
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <main className="ml-0 md:ml-[250px] min-h-screen">
        <div className="max-w-[1500px] mx-auto px-5 md:px-8 py-6">

          {/* ===== HEADER ===== */}
          <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 shadow-lg shadow-purple-900/30">
                  <Brain className="h-5 w-5" />
                </div>
                <span className="rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-300">
                  MODULE IA
                </span>
              </div>
              <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                Dashboard{' '}
                <span className="bg-gradient-to-r from-purple-400 via-violet-400 to-blue-400 bg-clip-text text-transparent">
                  IA
                </span>
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-400 sm:text-base">
                Analyse tes performances, découvre tes points forts et améliore ton niveau grâce à l'intelligence artificielle.
              </p>
            </div>

            <button
              onClick={refreshAnalysis}
              disabled={refreshing}
              className="flex w-fit items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold transition hover:border-purple-500/30 hover:bg-purple-500/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Analyse en cours...' : "Actualiser l'analyse"}
            </button>
          </div>

          {/* ===== AI HERO ===== */}
          <section className="relative mb-8 overflow-hidden rounded-3xl border border-purple-500/20 bg-gradient-to-br from-[#11102a] via-[#0b1225] to-[#06101f] p-6 shadow-2xl shadow-purple-950/20 sm:p-8">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-purple-600/20 blur-3xl" />
            <div className="absolute -bottom-20 left-1/3 h-56 w-56 rounded-full bg-blue-600/10 blur-3xl" />

            <div className="relative grid gap-8 lg:grid-cols-[1fr_320px]">
              <div>
                <div className="mb-4 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-400" />
                  <span className="text-sm font-semibold text-purple-300">Analyse personnalisée</span>
                </div>
                <h2 className="max-w-3xl text-2xl font-black leading-tight sm:text-3xl">
                  Salut <span className="text-purple-400">{user?.username || 'Joueur'}</span>, voici ton analyse du moment. 🎮
                </h2>
                <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-400">
                  Tes performances sont en progression. Ton taux de victoire et ta précision sont tes principaux points forts.
                  L'IA te recommande de continuer à travailler tes compétences.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    onClick={() => navigate('courses')}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 px-5 py-3 text-sm font-bold shadow-lg shadow-purple-900/30 transition hover:scale-[1.02]"
                  >
                    Voir mes recommandations
                    <ChevronRight className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => navigate('game-profile')}
                    className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold transition hover:bg-white/10"
                  >
                    Mon profil de jeu
                  </button>
                </div>
              </div>

              {/* ===== SCORE GLOBAL ===== */}
              <div className="flex items-center justify-center">
                <div className="relative flex h-56 w-56 items-center justify-center rounded-full border border-purple-500/20 bg-[#080d1c]/80 shadow-2xl">
                  <div className="absolute inset-3 rounded-full border border-purple-500/10" />
                  <div className="text-center">
                    <div className="text-6xl font-black text-white">{Math.round(winRate)}</div>
                    <div className="mt-1 text-sm font-semibold text-slate-400">Score IA</div>
                    <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400">
                      <TrendingUp className="h-3.5 w-3.5" />
                      {totalMatches > 0 ? `${Math.round((wins / totalMatches) * 100)}%` : '0%'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ===== STATISTIQUES ===== */}
          <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard icon={Trophy} label="Taux de victoire" value={`${winRate}%`} trend="Global" positive={winRate >= 50} />
            <StatCard icon={BarChart3} label="Matchs joués" value={totalMatches} trend="Total" positive />
            <StatCard icon={Gamepad2} label="Victoires" value={wins} trend={`${Math.round((wins / (totalMatches || 1)) * 100)}%`} positive />
            <StatCard icon={Activity} label="Défaites" value={losses} trend={`${Math.round((losses / (totalMatches || 1)) * 100)}%`} positive={false} />
          </section>

          {/* ===== MAIN GRID ===== */}
          <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">

            {/* ===== COLONNE GAUCHE ===== */}
            <div className="space-y-6">

              {/* Radar Chart */}
              <section className="rounded-2xl border border-white/5 bg-[#07101d] p-5 sm:p-6">
                <SectionHeader icon={TrendingUp} title="Compétences" subtitle="Analyse de tes performances par compétence" />
                <div className="mt-6 w-full max-w-md mx-auto">
                  <Radar data={radarData} options={radarOptions} />
                </div>
              </section>

              {/* Forces */}
              {strengths.length > 0 && (
                <section className="rounded-2xl border border-white/5 bg-[#07101d] p-5 sm:p-6">
                  <SectionHeader icon={TrendingUp} title="Tes points forts" subtitle="Les compétences où tu performes le mieux" />
                  <div className="mt-6 space-y-5">
                    {strengths.map((item, index) => (
                      <div key={index}>
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-sm font-semibold">{item.name}</span>
                          <span className="text-sm font-bold text-emerald-400">{item.value}%</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                          <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-400" style={{ width: `${item.value}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Faiblesses */}
              {weaknesses.length > 0 && (
                <section className="rounded-2xl border border-white/5 bg-[#07101d] p-5 sm:p-6">
                  <SectionHeader icon={Target} title="Points à améliorer" subtitle="Les compétences identifiées par l'IA" />
                  <div className="mt-6 space-y-5">
                    {weaknesses.map((item, index) => (
                      <div key={index}>
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-sm font-semibold text-slate-300">{item.name}</span>
                          <span className="text-sm font-bold text-orange-400">{item.value}%</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                          <div className="h-full rounded-full bg-gradient-to-r from-orange-500 to-yellow-400" style={{ width: `${item.value}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* ===== COLONNE DROITE ===== */}
            <div className="space-y-6">

              {/* Niveau */}
              <section className="rounded-2xl border border-white/5 bg-[#07101d] p-6">
                <div className="flex items-center gap-4">
                  <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${level.bg} border-2 ${level.border}`}>
                    <div className={`text-3xl font-black ${level.color}`}>{level.label.charAt(0)}</div>
                  </div>
                  <div>
                    <h3 className="font-bold">Niveau {level.label}</h3>
                    <p className="text-sm text-slate-400">Basé sur ton taux de victoire</p>
                  </div>
                </div>
                <div className="mt-6 flex items-center gap-3">
                  <div className={`flex items-center gap-2 ${level.color}`}>
                    {level.icon}
                    <span className="font-bold">{level.label}</span>
                  </div>
                  <span className="text-xs text-slate-500">•</span>
                  <span className="text-xs text-slate-400">{winRate}% de victoires</span>
                </div>
              </section>

              {/* Recommandations */}
              <section className="rounded-2xl border border-white/5 bg-[#07101d] p-6">
                <SectionHeader icon={Sparkles} title="Recommandations IA" subtitle="Conseils personnalisés" />
                <div className="mt-5 space-y-3">
                  {recommendations.map((item, index) => (
                    <RecommendationCard key={index} item={item} />
                  ))}
                </div>
                <button
                  onClick={() => navigate('courses')}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-purple-500/20 bg-purple-500/5 py-3 text-sm font-semibold text-purple-300 transition hover:bg-purple-500/10"
                >
                  Voir toutes les recommandations
                  <ChevronRight className="h-4 w-4" />
                </button>
              </section>

              {/* ✅ Assistant IA - OUVRE LE CHATBOT */}
              <section className="overflow-hidden rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-950/40 to-purple-950/30 p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-950/30">
                    <Bot className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold">Assistant IA</h3>
                    <p className="text-xs text-slate-400">Ton coach intelligent</p>
                  </div>
                </div>
                <p className="mt-5 text-sm leading-6 text-slate-400">
                  Besoin d'un conseil sur ton entraînement, tes performances ou les tournois ?
                </p>
                <button
                  onClick={openChatbot}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 py-3 text-sm font-bold transition hover:opacity-90"
                >
                  <MessageSquare className="h-4 w-4" />
                  Parler avec l'IA
                </button>
              </section>

              {/* Badges IA */}
              <section className="rounded-2xl border border-white/5 bg-[#07101d] p-6">
                <SectionHeader icon={Award} title="Badges IA" subtitle="Récompenses débloquées" />
                <div className="mt-5 grid grid-cols-3 gap-3">
                  <BadgeItem icon={Flame} label="Hot Streak" />
                  <BadgeItem icon={Target} label="Précis" />
                  <BadgeItem icon={Star} label="Rising" />
                </div>
              </section>
            </div>
          </div>

          {/* ===== FEATURES ===== */}
          <section className="mt-6 grid gap-4 md:grid-cols-3">
            <FeatureCard
              icon={Brain}
              title="Analyse des performances"
              description="L'IA analyse tes résultats pour identifier tes forces et tes faiblesses."
            />
            <FeatureCard
              icon={Sparkles}
              title="Recommandations personnalisées"
              description="Découvre les cours, tournois et ressources adaptés à ton niveau."
            />
            <FeatureCard
              icon={ShieldCheck}
              title="Modération intelligente"
              description="Le module IA peut détecter automatiquement les comportements toxiques."
            />
          </section>

          {/* ===== FOOTER ===== */}
          <div className="mt-10 pt-6 border-t border-white/5 text-center text-[10px] text-slate-600 tracking-[0.2em] font-light">
            <p>eSportsConnect • Dashboard IA • © 2026</p>
          </div>

        </div>
      </main>
    </div>
  );
};

export default DashboardIA;