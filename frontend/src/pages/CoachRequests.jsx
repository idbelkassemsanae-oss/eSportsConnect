import React, { useState, useEffect } from 'react';
import { usePage, useNavigate } from '../context/RouterContext';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Users,
  XCircle,
  Loader2,
  Search,
  Gamepad2,
  Eye,
  Check,
  X,
  Bell,
  UserPlus,
  Sparkles,
  FileText,
  Calendar
} from 'lucide-react';
import API from '../services/api';

// ============================================================
// STAT CARD (comme dans MyCourses)
// ============================================================
const StatCard = ({ icon: Icon, label, value, color = 'violet' }) => {
  const colors = {
    violet: 'from-violet-500/20 to-purple-500/10 border-violet-500/20',
    emerald: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/20',
    amber: 'from-amber-500/20 to-yellow-500/10 border-amber-500/20',
    rose: 'from-rose-500/20 to-pink-500/10 border-rose-500/20'
  };

  const iconColors = {
    violet: 'text-violet-400',
    emerald: 'text-emerald-400',
    amber: 'text-amber-400',
    rose: 'text-rose-400'
  };

  return (
    <div className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br ${colors[color]} backdrop-blur-sm p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl group`}>
      <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl -translate-y-10 translate-x-10" />
      <div className="relative z-10 flex items-start justify-between">
        <div>
          <p className="text-3xl md:text-4xl font-black text-white">{value}</p>
          <p className="text-sm text-slate-400 mt-1.5 font-medium">{label}</p>
        </div>
        <div className={`w-12 h-12 rounded-2xl bg-white/5 backdrop-blur-sm flex items-center justify-center ${iconColors[color]} group-hover:scale-110 transition-transform`}>
          {React.cloneElement(Icon, { className: 'w-6 h-6' })}
        </div>
      </div>
    </div>
  );
};

const CoachRequests = () => {
  const page = usePage();
  const navigate = useNavigate();
  const { user } = useAuth();

  const courseId = page.startsWith('coach-requests/') ? page.split('/')[1] : null;

  const [loading, setLoading] = useState(true);
  const [enrollments, setEnrollments] = useState([]);
  const [courseName, setCourseName] = useState('');
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchData();
  }, [courseId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      let data = [];
      if (courseId) {
        const res = await API.get(`/courses/${courseId}/enrollments/`);
        data = res.data || [];
        const courseRes = await API.get(`/courses/${courseId}/`);
        setCourseName(courseRes.data.title || 'Cours');
      } else {
        const coursesRes = await API.get('/courses/mine/');
        const courses = coursesRes.data || [];
        const allEnrollments = [];
        for (const course of courses) {
          try {
            const enrollRes = await API.get(`/courses/${course.id}/enrollments/`);
            const enrolls = (enrollRes.data || []).map(e => ({ ...e, course_title: course.title }));
            allEnrollments.push(...enrolls);
          } catch (e) {}
        }
        data = allEnrollments;
        setCourseName('Tous vos cours');
      }
      setEnrollments(data);
    } catch (err) {
      console.error(err);
      setError('Impossible de charger les demandes.');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (enrollmentId, action) => {
    if (!courseId) {
      alert('Impossible d\'agir sur une demande sans sélectionner un cours.');
      return;
    }
    const endpoint = action === 'approve' 
      ? `/courses/${courseId}/enrollments/${enrollmentId}/approve/`
      : `/courses/${courseId}/enrollments/${enrollmentId}/reject/`;
    try {
      await API.post(endpoint);
      fetchData();
    } catch (err) {
      alert('Erreur lors de l\'action.');
    }
  };

  const filteredEnrollments = enrollments.filter(enr =>
    enr.student_username?.toLowerCase().includes(search.toLowerCase()) ||
    enr.course_title?.toLowerCase().includes(search.toLowerCase())
  );

  const pendingCount = enrollments.filter(e => e.status === 'pending').length;
  const approvedCount = enrollments.filter(e => e.status === 'approved').length;
  const rejectedCount = enrollments.filter(e => e.status === 'rejected').length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020817]">
        <Loader2 className="w-10 h-10 text-violet-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-400">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020817] text-white">
      <main className="ml-0 md:ml-[250px] min-h-screen">

        {/* ===== HEADER AVEC BANDE DÉGRADÉE (comme MyCourses) ===== */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-900/30 via-purple-900/20 to-cyan-900/20" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse animation-delay-200" />
          
          <div className="relative z-10 max-w-[1450px] mx-auto px-5 md:px-8 py-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 text-violet-400 text-xs font-semibold uppercase tracking-wider mb-2">
                  <Sparkles className="w-4 h-4" />
                  Gestion des inscriptions
                </div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                  Demandes d'inscription
                </h1>
                <p className="text-slate-400 mt-2 text-lg font-light">
                  {courseName} — {pendingCount} en attente
                </p>
              </div>
              <button
                onClick={() => navigate('coach-dashboard')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 transition text-sm font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                Retour
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-[1450px] mx-auto px-5 md:px-8 py-8">

          {/* ===== STATISTIQUES ===== */}
          <div className="grid grid-cols-3 gap-5 mb-8">
            <StatCard icon={<Clock />} label="En attente" value={pendingCount} color="amber" />
            <StatCard icon={<CheckCircle2 />} label="Approuvées" value={approvedCount} color="emerald" />
            <StatCard icon={<XCircle />} label="Refusées" value={rejectedCount} color="rose" />
          </div>

          {/* ===== TOOLBAR ===== */}
          <div className="rounded-2xl border border-white/5 bg-white/5 backdrop-blur-sm p-4 mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="text"
                placeholder="Rechercher un joueur ou un cours..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl bg-[#050b16] border border-white/10 pl-12 pr-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-500/60 transition"
              />
            </div>
          </div>

          {/* ===== LISTE DES DEMANDES ===== */}
          {filteredEnrollments.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 bg-[#080f1d] py-20 text-center">
              <Users className="w-16 h-16 text-slate-500 mx-auto mb-4" />
              <h3 className="text-lg font-bold">Aucune demande</h3>
              <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
                {search ? 'Aucune demande ne correspond à votre recherche.' : 'Aucune demande d\'inscription pour le moment.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredEnrollments.map((enr) => {
                const isPending = enr.status === 'pending';
                const isApproved = enr.status === 'approved';
                const isRejected = enr.status === 'rejected';

                return (
                  <div
                    key={enr.id}
                    className={`rounded-2xl border transition-all duration-300 p-5 md:p-6 ${
                      isPending
                        ? 'border-amber-500/20 bg-amber-500/5 hover:border-amber-500/40'
                        : isApproved
                        ? 'border-emerald-500/20 bg-emerald-500/5 hover:border-emerald-500/40'
                        : 'border-red-500/20 bg-red-500/5 hover:border-red-500/40'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      {/* Avatar + Infos */}
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-xl font-black text-white">
                          {enr.student_username?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-bold text-white">
                              {enr.student_username || 'Joueur'}
                            </h3>
                            <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border ${
                              isPending
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                : isApproved
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : 'bg-red-500/10 text-red-400 border-red-500/20'
                            }`}>
                              {isPending ? 'En attente' : isApproved ? 'Approuvé' : 'Refusé'}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-500">
                            {!courseId && enr.course_title && (
                              <span className="flex items-center gap-1">
                                <Gamepad2 className="w-3.5 h-3.5 text-violet-400" />
                                {enr.course_title}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-slate-500" />
                              {new Date(enr.enrolled_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        {isPending && courseId && (
                          <>
                            <button
                              onClick={() => handleAction(enr.id, 'reject')}
                              className="flex items-center gap-1.5 rounded-xl bg-red-500/10 px-4 py-2.5 text-xs font-bold text-red-400 hover:bg-red-500/20 transition"
                            >
                              <X size={15} />
                              Refuser
                            </button>
                            <button
                              onClick={() => handleAction(enr.id, 'approve')}
                              className="flex items-center gap-1.5 rounded-xl bg-emerald-500/10 px-4 py-2.5 text-xs font-bold text-emerald-400 hover:bg-emerald-500/20 transition"
                            >
                              <Check size={15} />
                              Accepter
                            </button>
                          </>
                        )}
                        {isPending && !courseId && (
                          <span className="text-xs text-slate-500 italic">
                            (sélectionnez un cours pour agir)
                          </span>
                        )}
                        {!isPending && (
                          <span className="text-sm text-slate-500 flex items-center gap-1.5">
                            {isApproved ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <XCircle className="w-5 h-5 text-red-400" />}
                            {isApproved ? 'Accepté' : 'Refusé'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ===== FOOTER ===== */}
          <div className="mt-12 pt-6 border-t border-white/5 text-center text-[10px] text-slate-600 tracking-[0.2em] font-light">
            <p>eSportsConnect • Demandes d'inscription • © 2026</p>
          </div>

        </div>
      </main>
    </div>
  );
};

export default CoachRequests;