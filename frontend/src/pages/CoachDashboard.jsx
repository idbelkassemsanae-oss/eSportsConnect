import React, { useState, useEffect } from 'react';
import { useNavigate } from '../context/RouterContext';
import { useAuth } from '../context/AuthContext';
import {
  BookOpen,
  Users,
  DollarSign,
  Clock,
  TrendingUp,
  PlayCircle,
  ChevronRight,
  Bell,
  Activity,
  MessageSquare,
  PlusCircle,
  Sparkles
} from 'lucide-react';
import API from '../services/api';

// ============================================================
// STAT CARD
// ============================================================
const StatCard = ({ icon: Icon, title, value, subtitle }) => {
  return (
    <div className="group rounded-2xl border border-white/5 bg-[#0a1220] p-5 transition hover:-translate-y-1 hover:border-violet-500/20">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-600/10 text-violet-400">
          <Icon size={21} />
        </div>
        <TrendingUp size={16} className="text-emerald-400" />
      </div>
      <p className="text-sm text-slate-500">{title}</p>
      <h3 className="mt-1 text-2xl font-black text-white">{value}</h3>
      <p className="mt-1 text-xs text-slate-600">{subtitle}</p>
    </div>
  );
};

// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================
const CoachDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await API.get('/coach-stats/');
        setStats(res.data);
        setLoading(false);
      } catch (err) {
        console.error('Erreur chargement stats:', err);
        setError('Impossible de charger les statistiques.');
        setLoading(false);
      }
    };
    if (user) fetchStats();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020817]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-violet-400 mt-4">Chargement...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020817] text-red-400">
        <div className="text-center">
          <p className="text-xl font-bold">❌ {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-violet-500 px-4 py-2 rounded-xl text-white"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const { total_courses, total_students, total_revenue, courses_stats, recent_enrollments } = stats;
  const firstName = user?.username || 'Coach';

  return (
    <div className="min-h-screen bg-[#020817] text-white">
      {/* Le Navbar est géré par App.jsx, on a juste le contenu principal */}
      <main className="ml-0 md:ml-[250px] min-h-screen px-4 md:px-8 py-6">

        {/* ===== BANNER ===== */}
        <section className="relative mb-8 overflow-hidden rounded-3xl border border-violet-500/10 bg-gradient-to-br from-violet-950/50 via-[#0b1324] to-[#07101f] p-7 md:p-10">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-violet-600/10 blur-3xl" />
          <div className="relative max-w-2xl">
            <span className="mb-4 inline-flex rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-300">
              <Sparkles className="w-3 h-3 mr-1.5" />
              COACH DASHBOARD
            </span>
            <h1 className="text-3xl font-black md:text-4xl">
              Bonjour {firstName} 👋
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-400 md:text-base">
              Gérez vos cours, accompagnez vos joueurs et développez votre communauté eSport.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={() => navigate('create-course')}
                className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-bold transition hover:bg-violet-500"
              >
                <PlusCircle size={18} />
                Créer un cours
              </button>
              <button
                onClick={() => navigate('coach-requests')}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-slate-300 hover:bg-white/[0.08] hover:text-white"
              >
                Voir les demandes
                <ChevronRight size={17} />
              </button>
            </div>
          </div>
        </section>

        {/* ===== STATISTIQUES ===== */}
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={BookOpen}
            title="Total des cours"
            value={total_courses || 0}
            subtitle="Cours créés"
          />
          <StatCard
            icon={Users}
            title="Étudiants"
            value={total_students || 0}
            subtitle="Joueurs accompagnés"
          />
          <StatCard
            icon={DollarSign}
            title="Revenu total"
            value={`${total_revenue || 0} DH`}
            subtitle="Gains"
          />
          <StatCard
            icon={Clock}
            title="Dernières inscriptions"
            value={recent_enrollments?.length || 0}
            subtitle="Récemment"
          />
        </section>

        {/* ===== PERFORMANCE PAR COURS ===== */}
        <section className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_330px]">
          <div className="rounded-2xl border border-white/5 bg-[#0a1220] p-5 md:p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-white">Performance par cours</h2>
                <p className="mt-1 text-xs text-slate-500">
                  Vos cours avec le nombre d'étudiants
                </p>
              </div>
              <button
                onClick={() => navigate('coach-courses')}
                className="text-xs font-semibold text-violet-400 hover:text-violet-300"
              >
                Voir tout
              </button>
            </div>

            <div className="space-y-3">
              {courses_stats && courses_stats.length > 0 ? (
                courses_stats.map((course) => (
                  <div
                    key={course.id}
                    className="flex items-center gap-4 rounded-xl border border-white/5 bg-white/[0.02] p-4 transition hover:border-violet-500/20"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600/30 to-indigo-600/20 text-violet-300">
                      <PlayCircle size={21} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-sm font-semibold text-white">
                        {course.title}
                      </h3>
                      <p className="mt-1 text-xs text-slate-500">
                        {course.students_count} étudiants • {course.price} DH
                      </p>
                    </div>
                    <button
                      onClick={() => navigate(`edit-course/${course.id}`)}
                      className="text-xs text-violet-400 hover:text-violet-300"
                    >
                      Modifier
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">Aucun cours créé.</p>
              )}
            </div>
          </div>

          {/* ===== ACTIVITÉ RÉCENTE ===== */}
          <div className="rounded-2xl border border-white/5 bg-[#0a1220] p-5 md:p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
                <Activity size={19} />
              </div>
              <div>
                <h2 className="font-bold">Activité récente</h2>
                <p className="text-xs text-slate-500">
                  Dernières inscriptions
                </p>
              </div>
            </div>

            <div className="space-y-5">
              {recent_enrollments && recent_enrollments.length > 0 ? (
                recent_enrollments.slice(0, 4).map((enr, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="mt-1 h-2 w-2 rounded-full bg-violet-500 shadow-lg shadow-violet-500/50" />
                    <div>
                      <p className="text-sm text-slate-300">{enr.student} s'est inscrit</p>
                      <p className="mt-1 text-xs text-slate-600">
                        {enr.course} • {new Date(enr.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">Aucune activité récente.</p>
              )}
            </div>

            <button
              onClick={() => navigate('coach-requests')}
              className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl border border-white/5 py-3 text-xs font-semibold text-slate-400 hover:bg-white/[0.03] hover:text-white"
            >
              <MessageSquare size={15} />
              Consulter les demandes
            </button>
          </div>
        </section>

        {/* ===== FOOTER ===== */}
        <div className="mt-12 pt-6 border-t border-white/5 text-center text-[10px] text-slate-600 tracking-[0.2em] font-light">
          <p>eSportsConnect • Tableau de bord coach • © 2026</p>
        </div>

      </main>
    </div>
  );
};

export default CoachDashboard;