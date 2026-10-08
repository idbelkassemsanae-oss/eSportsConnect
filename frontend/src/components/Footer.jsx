import React from 'react';
import { useNavigate } from '../context/RouterContext';
import { 
  FaGamepad, FaTwitter, FaYoutube, FaInstagram, FaDiscord,
  FaEnvelope, FaPhone, FaMapMarkerAlt, FaArrowUp
} from 'react-icons/fa';

const Footer = () => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative ml-0 md:ml-[250px] bg-[#050b18] border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-7 py-12">

        {/* ===== GRILLE DU FOOTER ===== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">

          {/* COLONNE 1 : LOGO + DESCRIPTION */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 shadow-lg shadow-purple-900/30">
                <FaGamepad size={18} className="text-white" />
              </div>
              <span className="text-[20px] font-bold tracking-tight">
                eSports<span className="text-violet-400">Connect</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
              La plateforme ultime pour les joueurs eSport. Compétitions, cours, streaming et communauté.
            </p>
            <div className="flex gap-4 mt-4">
              <a href="#" className="text-slate-500 hover:text-violet-400 transition">
                <FaTwitter size={20} />
              </a>
              <a href="#" className="text-slate-500 hover:text-violet-400 transition">
                <FaYoutube size={20} />
              </a>
              <a href="#" className="text-slate-500 hover:text-violet-400 transition">
                <FaInstagram size={20} />
              </a>
              <a href="#" className="text-slate-500 hover:text-violet-400 transition">
                <FaDiscord size={20} />
              </a>
            </div>
          </div>

          {/* COLONNE 2 : LIENS RAPIDES */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Navigation</h3>
            <ul className="space-y-2.5">
              <li>
                <button onClick={() => navigate('home')} className="text-sm text-slate-400 hover:text-violet-400 transition">
                  Accueil
                </button>
              </li>
              <li>
                <button onClick={() => navigate('courses')} className="text-sm text-slate-400 hover:text-violet-400 transition">
                  Cours
                </button>
              </li>
              <li>
                <button onClick={() => navigate('tournaments')} className="text-sm text-slate-400 hover:text-violet-400 transition">
                  Tournois
                </button>
              </li>
              <li>
                <button onClick={() => navigate('resources')} className="text-sm text-slate-400 hover:text-violet-400 transition">
                  Ressources
                </button>
              </li>
              <li>
                <button onClick={() => navigate('leaderboard')} className="text-sm text-slate-400 hover:text-violet-400 transition">
                  Classement
                </button>
              </li>
            </ul>
          </div>

          {/* COLONNE 3 : CONTACT */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-slate-400">
                <FaEnvelope className="text-violet-400 mt-0.5" />
                <span>contact@esportsconnect.com</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-slate-400">
                <FaPhone className="text-violet-400 mt-0.5" />
                <span>+212 6 04 15 30 85</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-slate-400">
                <FaMapMarkerAlt className="text-violet-400 mt-0.5" />
                <span>Casablanca , Maroc</span>
              </li>
            </ul>
          </div>

          {/* COLONNE 4 : NOUVELLES */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Restez informé</h3>
            <p className="text-sm text-slate-400 mb-3">
              Recevez les dernières actualités eSport.
            </p>
            <form className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                placeholder="Votre email"
                className="flex-1 rounded-lg bg-[#091121] border border-slate-800 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none transition"
              />
              <button
                type="submit"
                className="rounded-lg bg-gradient-to-r from-violet-600 to-purple-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:from-violet-500 hover:to-purple-600"
              >
                S'inscrire
              </button>
            </form>
          </div>
        </div>

        {/* ===== BAS DU FOOTER ===== */}
        <div className="mt-10 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            © {currentYear} eSportsConnect. Tous droits réservés.
          </p>

          <div className="flex items-center gap-6 text-xs text-slate-500">
            <button className="hover:text-violet-400 transition">Mentions légales</button>
            <button className="hover:text-violet-400 transition">Politique de confidentialité</button>
            <button className="hover:text-violet-400 transition">CGU</button>
          </div>

          <button
            onClick={scrollToTop}
            className="flex items-center gap-2 rounded-lg bg-[#091121] border border-slate-800 px-4 py-2 text-xs text-slate-400 transition hover:border-violet-500 hover:text-violet-400"
          >
            <FaArrowUp size={14} />
            Haut de page
          </button>
        </div>

      </div>
    </footer>
  );
};

export default Footer;