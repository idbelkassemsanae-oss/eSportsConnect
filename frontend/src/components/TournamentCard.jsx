import React from 'react';
import { useNavigate } from '../context/RouterContext'; // ✅ On utilise notre hook

const TournamentCard = ({ tournament }) => {
  const navigate = useNavigate();
  const isUpcoming = tournament.status === 'upcoming';

  return (
    <div className="glass-card neon-border p-6 rounded-xl hover:scale-105 transition-transform duration-300 group">
      <h3 className="font-esport text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">{tournament.name}</h3>
      <div className="flex justify-between items-center mt-4 text-sm text-gray-400">
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${isUpcoming ? 'bg-cyan-500/20 text-cyan-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
          {tournament.status}
        </span>
      </div>
      <span 
        onClick={() => navigate(`/tournaments/${tournament.id}`)} 
        className="mt-4 block w-full text-center btn-neon py-2 rounded-lg text-sm font-semibold cursor-pointer"
      >
        Voir Détails →
      </span>
    </div>
  );
};
export default TournamentCard;