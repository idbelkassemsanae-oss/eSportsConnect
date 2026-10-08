import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from '../context/RouterContext';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  Gamepad2,
  ArrowRight,
  ShieldCheck,
  Trophy,
  Users,
  Zap,
  AlertCircle,
  Loader2,
} from 'lucide-react';

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ==============================
  // Gestion des champs
  // ==============================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  // ==============================
  // Connexion
  // ==============================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.username.trim() || !form.password) {
      setError('Veuillez remplir tous les champs.');
      return;
    }

    try {
      setLoading(true);
      const result = await login(form.username, form.password);
      if (result.success) {
        // ✅ Redirection vers la page d'accueil (au lieu du dashboard)
        navigate('home');
      } else {
        setError(result.message || 'Identifiants incorrects.');
      }
    } catch (err) {
      console.error('Erreur de connexion :', err);
      setError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  // ==============================
  // Rendu
  // ==============================
  return (
    <div className="min-h-screen bg-[#020617] text-white flex">

      {/* =========================================
          PARTIE GAUCHE
      ========================================= */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">

        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-950/60 via-[#020617] to-cyan-950/40" />

        {/* Cercles décoratifs */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />

        {/* Contenu */}
        <div className="relative z-10 flex flex-col justify-center px-16 xl:px-24 w-full">

          {/* Logo */}
          <div className="flex items-center gap-3 mb-14">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-600 to-purple-800 flex items-center justify-center shadow-lg shadow-violet-900/30">
              <Gamepad2 size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-wide">
                eSports<span className="text-violet-500">Connect</span>
              </h1>
              <p className="text-xs text-slate-500">La communauté eSport</p>
            </div>
          </div>

          {/* Titre */}
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-sm mb-6">
              <Zap size={15} />
              Rejoins la communauté
            </div>
            <h2 className="text-5xl xl:text-6xl font-bold leading-tight">
              Entre dans
              <br />
              <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                l'arène.
              </span>
            </h2>
            <p className="mt-6 text-slate-400 text-lg leading-relaxed max-w-lg">
              Connecte-toi à eSportsConnect et retrouve tes
              cours, tournois, statistiques, classements et
              ta communauté eSport.
            </p>
          </div>

          {/* Avantages */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mt-12 max-w-2xl">
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
              <Trophy size={22} className="text-violet-400 mb-3" />
              <h3 className="font-semibold text-sm">Tournois</h3>
              <p className="text-xs text-slate-500 mt-1">Participe aux compétitions</p>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
              <Users size={22} className="text-cyan-400 mb-3" />
              <h3 className="font-semibold text-sm">Communauté</h3>
              <p className="text-xs text-slate-500 mt-1">Rejoins d'autres joueurs</p>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
              <Zap size={22} className="text-purple-400 mb-3" />
              <h3 className="font-semibold text-sm">Progression</h3>
              <p className="text-xs text-slate-500 mt-1">Analyse tes performances</p>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================
          PARTIE DROITE
      ========================================= */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-10">

        <div className="w-full max-w-md">

          {/* Logo mobile */}
          <div className="lg:hidden flex justify-center mb-10">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-600 to-purple-800 flex items-center justify-center">
                <Gamepad2 size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold">
                  eSports<span className="text-violet-500">Connect</span>
                </h1>
                <p className="text-xs text-slate-500">La communauté eSport</p>
              </div>
            </div>
          </div>

          {/* Carte formulaire */}
          <div className="bg-[#08111f]/80 border border-white/5 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/20">

            {/* Erreur */}
            {error && (
              <div className="mb-6 flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300">
                <AlertCircle size={20} className="shrink-0 mt-0.5" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Pseudo */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-slate-300 mb-2">
                  Pseudo
                </label>
                <div className="relative">
                  <Mail size={19} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    id="username"
                    name="username"
                    type="text"
                    value={form.username}
                    onChange={handleChange}
                    placeholder="Pseudo"
                    autoComplete="username"
                    disabled={loading}
                    className="w-full h-12 pl-12 pr-4 rounded-xl bg-[#020617] border border-slate-800 text-white placeholder:text-slate-600 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Mot de passe */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="password" className="text-sm font-medium text-slate-300">
                    Mot de passe
                  </label>
                  <button
                    type="button"
                    onClick={() => navigate('forgot-password')}
                    className="text-xs text-violet-400 hover:text-violet-300 transition"
                  >
                    Mot de passe oublié ?
                  </button>
                </div>
                <div className="relative">
                  <Lock size={19} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    disabled={loading}
                    className="w-full h-12 pl-12 pr-12 rounded-xl bg-[#020617] border border-slate-800 text-white placeholder:text-slate-600 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition"
                    aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  >
                    {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                  </button>
                </div>
              </div>

              {/* Bouton */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 transition-all duration-200 font-semibold flex items-center justify-center gap-2 shadow-lg shadow-violet-900/20 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 size={19} className="animate-spin" />
                    Connexion...
                  </>
                ) : (
                  <>
                    Se connecter
                    <ArrowRight size={18} />
                  </>
                )}
              </button>

            </form>

            {/* Inscription */}
            <div className="relative my-7">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 bg-[#08111f] text-xs text-slate-600">
                  Nouveau sur eSportsConnect ?
                </span>
              </div>
            </div>

            <button
              onClick={() => navigate('register')}
              className="w-full h-12 rounded-xl border border-slate-700 hover:border-violet-500/50 hover:bg-violet-500/5 transition flex items-center justify-center font-medium text-slate-300 hover:text-white"
            >
              Créer un compte
            </button>

          </div>

          {/* Sécurité */}
          <div className="flex items-center justify-center gap-2 mt-6 text-xs text-slate-600">
            <ShieldCheck size={15} />
            <span>Connexion sécurisée</span>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;