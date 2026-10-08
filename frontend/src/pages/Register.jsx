import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from '../context/RouterContext';
import { 
  FaGamepad, FaChalkboardTeacher, FaUserTie, FaBriefcase, FaMoneyBillWave, 
  FaUser, FaEnvelope, FaLock, FaPhone, FaGlobe, FaCalendarAlt, FaGraduationCap, 
  FaCloudUploadAlt, FaGamepad as FaGamepadAlt, FaBullseye, FaChartLine, FaTrophy 
} from 'react-icons/fa';

const Register = () => {
  const [role, setRole] = useState('player');
  const [form, setForm] = useState({ 
    // Communs
    username: '', email: '', password: '', 
    
    // Joueur
    main_game: '',
    favorite_games: '', 
    skill_level: 'Débutant',
    experience_years: '',
    objectives: '',
    platform: '', 
    player_avatar: null, 
    bio: '',
    
    // Coach
    last_name: '', first_name: '', phone: '', profile_picture: null,
    specialty: '', mastered_games: '', experience_years_coach: '', coach_skill_level: 'intermediaire',
    diploma: null, coach_bio: '', hourly_rate: '', availability: [], portfolio_url: ''
  });

  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("🟢 1. Clic sur S'inscrire détecté !", { ...form, role });
    
    const result = await register({ ...form, role });
    
    if (result.success) {
      alert("✅ Inscription réussie ! Vous allez être redirigé.");
      navigate('login');
    } else {
      alert(`❌ Erreur : ${result.message}`);
      console.log("🔴 Erreur retournée :", result.message);
    }
  };

  const handleCheckbox = (day) => {
    if (form.availability.includes(day)) setForm({...form, availability: form.availability.filter(d => d !== day)});
    else setForm({...form, availability: [...form.availability, day]});
  };

  const isCoach = role === 'coach';
  const btnColorClass = isCoach 
    ? 'bg-purple-500 hover:bg-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.5)]' 
    : 'bg-cyan-500 hover:bg-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.5)]';
  
  const linkColorClass = isCoach 
    ? 'text-purple-400 hover:text-purple-300' 
    : 'text-cyan-400 hover:text-cyan-300';

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-900 via-black to-gray-900">
      {/* CARTE PRINCIPALE - PAS de pointer-events:none ici ! */}
      <div className="glass-card rounded-3xl w-full max-w-3xl p-8 md:p-10 shadow-2xl border border-white/10 backdrop-blur-xl">
        
        {/* TITRE + SÉLECTEUR */}
        <div className="text-center mb-10">
          <h2 className="font-esport text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent mb-6">
            Rejoignez l'aventure
          </h2>
          <div className="inline-flex bg-black/40 border border-white/10 rounded-full p-1 shadow-inner">
            <button
              type="button"
              onClick={() => setRole('player')}
              className={`px-8 py-3 rounded-full font-bold transition-all duration-300 ${
                role === 'player' ? 'bg-cyan-500 text-black shadow-[0_0_20px_rgba(34,211,238,0.5)]' : 'text-gray-400 hover:text-white'
              }`}
            >
              <FaGamepad className="inline mr-2" /> Joueur
            </button>
            <button
              type="button"
              onClick={() => setRole('coach')}
              className={`px-8 py-3 rounded-full font-bold transition-all duration-300 ${
                role === 'coach' ? 'bg-purple-500 text-black shadow-[0_0_20px_rgba(168,85,247,0.5)]' : 'text-gray-400 hover:text-white'
              }`}
            >
              <FaChalkboardTeacher className="inline mr-2" /> Coach
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* CHAMPS DE BASE (Communs) */}
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="relative">
                <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type="text" placeholder="Pseudo" required value={form.username} onChange={(e) => setForm({...form, username: e.target.value})} className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/5 border border-white/10 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/10 text-white outline-none transition-all placeholder-gray-500" />
              </div>
              <div className="relative">
                <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type="email" placeholder="Email" required value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/5 border border-white/10 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/10 text-white outline-none transition-all placeholder-gray-500" />
              </div>
            </div>
            <div className="relative">
              <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
              <input type="password" placeholder="Mot de passe" required value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/5 border border-white/10 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/10 text-white outline-none transition-all placeholder-gray-500" />
            </div>
          </div>

          {/* SI JOUEUR - SECTION ENRICHIE */}
          {role === 'player' && (
            <div className="space-y-8">
              <section className="bg-white/[0.03] border border-cyan-400/20 rounded-2xl overflow-hidden">
                <div className="flex items-center gap-3 bg-cyan-500/10 p-5 border-b border-cyan-400/20">
                  <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                    <FaUserTie className="text-cyan-400 text-xl" />
                  </div>
                  <h3 className="text-lg font-bold text-cyan-300">Profil Joueur</h3>
                </div>
                <div className="p-6 space-y-5">
                  
                  <div className="relative">
                    <FaGamepadAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input type="text" placeholder="Jeu principal (ex: Valorant, FIFA)" value={form.main_game} onChange={(e) => setForm({...form, main_game: e.target.value})} className="w-full pl-12 p-3.5 rounded-lg bg-black/40 border border-white/10 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 text-white outline-none transition-all placeholder-gray-500" />
                  </div>

                  <input type="text" placeholder="Jeux préférés (séparés par des virgules)" value={form.favorite_games} onChange={(e) => setForm({...form, favorite_games: e.target.value})} className="w-full p-3.5 rounded-lg bg-black/40 border border-white/10 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 text-white outline-none transition-all placeholder-gray-500" />

                  <div className="relative">
                    <FaChartLine className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                    <select value={form.skill_level} onChange={(e) => setForm({...form, skill_level: e.target.value})} className="w-full pl-12 p-3.5 rounded-lg bg-black/40 border border-white/10 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 text-white outline-none transition-all [color-scheme:dark]">
                      <option value="Débutant" className="bg-gray-800 text-white">Débutant</option>
                      <option value="Intermédiaire" className="bg-gray-800 text-white">Intermédiaire</option>
                      <option value="Avancé" className="bg-gray-800 text-white">Avancé</option>
                      <option value="Expert" className="bg-gray-800 text-white">Expert</option>
                    </select>
                  </div>

                  <div className="relative">
                    <FaBullseye className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input type="number" placeholder="Années d'expérience en jeu" value={form.experience_years} onChange={(e) => setForm({...form, experience_years: e.target.value})} className="w-full pl-12 p-3.5 rounded-lg bg-black/40 border border-white/10 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 text-white outline-none transition-all placeholder-gray-500" />
                  </div>

                  <div className="relative">
                    <FaTrophy className="absolute left-4 top-4 text-gray-500" />
                    <textarea placeholder="Vos objectifs / ambitions (ex: devenir pro, atteindre le rang Diamant...)" rows="3" value={form.objectives} onChange={(e) => setForm({...form, objectives: e.target.value})} className="w-full pl-12 p-4 rounded-lg bg-black/40 border border-white/10 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 text-white outline-none transition-all resize-none placeholder-gray-500"></textarea>
                  </div>

                  <div className="relative">
                    <FaGamepadAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                    <select value={form.platform} onChange={(e) => setForm({...form, platform: e.target.value})} className="w-full pl-12 p-3.5 rounded-lg bg-black/40 border border-white/10 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 text-white outline-none transition-all [color-scheme:dark]">
                      <option value="" className="bg-gray-800 text-white">Plateforme préférée</option>
                      <option value="PC" className="bg-gray-800 text-white">PC</option>
                      <option value="PlayStation" className="bg-gray-800 text-white">PlayStation</option>
                      <option value="Xbox" className="bg-gray-800 text-white">Xbox</option>
                      <option value="Mobile" className="bg-gray-800 text-white">Mobile</option>
                    </select>
                  </div>

                  <div>
                    <label className="flex items-center justify-center gap-3 w-full p-4 rounded-lg border-2 border-dashed border-white/20 bg-black/40 hover:bg-cyan-500/10 hover:border-cyan-400 cursor-pointer transition-all group">
                      <FaCloudUploadAlt className="text-cyan-400 text-xl group-hover:scale-110 transition-transform" />
                      <span className="text-gray-400 text-sm font-semibold truncate">{form.player_avatar ? form.player_avatar.name : "Avatar de profil"}</span>
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => setForm({...form, player_avatar: e.target.files[0]})} />
                    </label>
                  </div>

                  <textarea placeholder="Bio / Présentation rapide..." rows="3" value={form.bio} onChange={(e) => setForm({...form, bio: e.target.value})} className="w-full p-4 rounded-lg bg-black/40 border border-white/10 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 text-white outline-none transition-all resize-none placeholder-gray-500"></textarea>
                </div>
              </section>
            </div>
          )}

          {/* SI COACH - PROFIL COMPLET RESTAURÉ */}
          {role === 'coach' && (
            <div className="space-y-8">
              
              {/* SECTION 1 : INFOS PERSO */}
              <section className="bg-white/[0.03] border border-purple-400/20 rounded-2xl overflow-hidden">
                <div className="flex items-center gap-3 bg-purple-500/10 p-5 border-b border-purple-400/20">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    <FaUserTie className="text-purple-400 text-xl" />
                  </div>
                  <h3 className="text-lg font-bold text-purple-300">Informations personnelles</h3>
                </div>
                <div className="p-6 space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <input type="text" placeholder="Nom" value={form.last_name} onChange={(e) => setForm({...form, last_name: e.target.value})} className="w-full p-3.5 rounded-lg bg-black/40 border border-white/10 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 text-white outline-none transition-all placeholder-gray-500" />
                    <input type="text" placeholder="Prénom" value={form.first_name} onChange={(e) => setForm({...form, first_name: e.target.value})} className="w-full p-3.5 rounded-lg bg-black/40 border border-white/10 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 text-white outline-none transition-all placeholder-gray-500" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="relative">
                      <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input type="tel" placeholder="Téléphone" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} className="w-full pl-12 p-3.5 rounded-lg bg-black/40 border border-white/10 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 text-white outline-none transition-all placeholder-gray-500" />
                    </div>
                    <div>
                      <label className="flex items-center justify-center gap-3 w-full p-4 rounded-lg border-2 border-dashed border-white/20 bg-black/40 hover:bg-purple-500/10 hover:border-purple-400 cursor-pointer transition-all group">
                        <FaCloudUploadAlt className="text-purple-400 text-xl group-hover:scale-110 transition-transform" />
                        <span className="text-gray-400 text-sm font-semibold truncate">{form.profile_picture ? form.profile_picture.name : "Photo de profil"}</span>
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => setForm({...form, profile_picture: e.target.files[0]})} />
                      </label>
                    </div>
                  </div>
                </div>
              </section>

              {/* SECTION 2 : INFOS PRO */}
              <section className="bg-white/[0.03] border border-purple-400/20 rounded-2xl overflow-hidden">
                <div className="flex items-center gap-3 bg-purple-500/10 p-5 border-b border-purple-400/20">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    <FaBriefcase className="text-purple-400 text-xl" />
                  </div>
                  <h3 className="text-lg font-bold text-purple-300">Informations professionnelles</h3>
                </div>
                <div className="p-6 space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <input type="text" placeholder="Spécialité" required value={form.specialty} onChange={(e) => setForm({...form, specialty: e.target.value})} className="w-full p-3.5 rounded-lg bg-black/40 border border-white/10 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 text-white outline-none transition-all placeholder-gray-500" />
                    <input type="text" placeholder="Jeux maîtrisés" required value={form.mastered_games} onChange={(e) => setForm({...form, mastered_games: e.target.value})} className="w-full p-3.5 rounded-lg bg-black/40 border border-white/10 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 text-white outline-none transition-all placeholder-gray-500" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <input type="number" placeholder="Années d'expérience" required value={form.experience_years_coach} onChange={(e) => setForm({...form, experience_years_coach: e.target.value})} className="w-full p-3.5 rounded-lg bg-black/40 border border-white/10 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 text-white outline-none transition-all placeholder-gray-500" />
                    <select value={form.coach_skill_level} onChange={(e) => setForm({...form, coach_skill_level: e.target.value})} className="w-full p-3.5 rounded-lg bg-black/40 border border-white/10 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 text-white outline-none transition-all [color-scheme:dark]">
                      <option value="debutant" className="bg-gray-800 text-white">Débutant</option>
                      <option value="intermediaire" className="bg-gray-800 text-white">Intermédiaire</option>
                      <option value="avance" className="bg-gray-800 text-white">Avancé</option>
                      <option value="expert" className="bg-gray-800 text-white">Expert</option>
                    </select>
                  </div>
                  <div>
                    {/* Le diplôme n'est plus required pour tester */}
                    <label className="flex items-center justify-center gap-3 w-full p-4 rounded-lg border-2 border-dashed border-white/20 bg-black/40 hover:bg-purple-500/10 hover:border-purple-400 cursor-pointer transition-all group">
                      <FaGraduationCap className="text-purple-400 text-xl group-hover:scale-110 transition-transform" />
                      <span className="text-gray-400 text-sm font-semibold truncate">{form.diploma ? form.diploma.name : "Diplôme (PDF)"}</span>
                      <input type="file" accept=".pdf" className="hidden" onChange={(e) => setForm({...form, diploma: e.target.files[0]})} />
                    </label>
                  </div>
                  <textarea placeholder="Biographie / présentation..." rows="4" required value={form.coach_bio} onChange={(e) => setForm({...form, coach_bio: e.target.value})} className="w-full p-4 rounded-lg bg-black/40 border border-white/10 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 text-white outline-none transition-all resize-none placeholder-gray-500"></textarea>
                </div>
              </section>

              {/* SECTION 3 : TARIF & DISPO */}
              <section className="bg-white/[0.03] border border-purple-400/20 rounded-2xl overflow-hidden">
                <div className="flex items-center gap-3 bg-purple-500/10 p-5 border-b border-purple-400/20">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    <FaMoneyBillWave className="text-purple-400 text-xl" />
                  </div>
                  <h3 className="text-lg font-bold text-purple-300">Tarif & Disponibilités</h3>
                </div>
                <div className="p-6 space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">€</span>
                      <input type="number" placeholder="Tarif / heure" value={form.hourly_rate} onChange={(e) => setForm({...form, hourly_rate: e.target.value})} className="w-full pl-10 p-3.5 rounded-lg bg-black/40 border border-white/10 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 text-white outline-none transition-all placeholder-gray-500" />
                    </div>
                    <div className="relative">
                      <FaGlobe className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input type="url" placeholder="Portfolio / Twitch" value={form.portfolio_url} onChange={(e) => setForm({...form, portfolio_url: e.target.value})} className="w-full pl-12 p-3.5 rounded-lg bg-black/40 border border-white/10 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 text-white outline-none transition-all placeholder-gray-500" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-3 text-gray-400 text-sm font-bold">
                      <FaCalendarAlt className="text-purple-400" /> Jours de disponibilité
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'].map(day => (
                        <button type="button" key={day} onClick={() => handleCheckbox(day)} className={`py-2 px-2 rounded-lg text-sm font-bold border transition-all duration-200 ${form.availability.includes(day) ? 'bg-purple-500 border-purple-500 text-black shadow-[0_0_10px_rgba(168,85,247,0.4)]' : 'border-white/20 text-gray-400 hover:border-purple-400 hover:text-purple-300 hover:bg-purple-500/10'}`}>
                          {day}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

            </div>
          )}

          {/* BOUTON S'INSCRIRE */}
          <button type="submit" className={`w-full py-4 rounded-xl font-bold text-lg transition-all hover:scale-[1.02] cursor-pointer text-black ${btnColorClass}`}>
            S'inscrire
          </button>
        </form>

        {/* LIEN CONNEXION */}
        <div className="text-center mt-6">
          <span onClick={() => navigate('login')} className={`hover:underline cursor-pointer transition-colors ${linkColorClass}`}>
            Déjà un compte ? Connectez-vous
          </span>
        </div>
      </div>
    </div>
  );
};

export default Register;