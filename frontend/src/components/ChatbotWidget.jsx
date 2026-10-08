import React, { useState, useEffect, useRef } from 'react';
import { FaRobot, FaTimes, FaPaperPlane, FaSpinner, FaBrain } from 'react-icons/fa';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';

const ChatbotWidget = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const messagesEndRef = useRef(null);

  const openChatbot = () => setIsOpen(true);

  useEffect(() => {
    window.openChatbot = openChatbot;
    return () => delete window.openChatbot;
  }, []);

  // Charger les suggestions
  useEffect(() => {
    API.get('/ai/chatbot/suggestions/')
      .then(res => setSuggestions(res.data.suggestions || []))
      .catch(() => {
        setSuggestions([
          "Comment m'inscrire à un tournoi ?",
          "Qu'est-ce qu'un BO3 ?",
          "Comment voir mes statistiques ?",
          "Comment créer un tournoi ?",
          "Comment devenir coach ?"
        ]);
      });
  }, []);

  // Scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addMessage = (sender, text, isTyping = false) => {
    setMessages(prev => [...prev, { sender, text, isTyping, id: Date.now() + Math.random() }]);
  };

  const sendMessage = async (question) => {
    if (!question.trim() || loading) return;

    addMessage('user', question);
    setInput('');
    setLoading(true);

    const typingId = Date.now() + Math.random();
    setMessages(prev => [...prev, { sender: 'bot', text: '...', isTyping: true, id: typingId }]);

    try {
      const res = await API.get('/chatbot/', {
        params: { message: question }
      });

      const answer = res.data.answer || res.data.response || 'Je n\'ai pas compris votre question.';
      
      // Remplacer le message "typing..." par la réponse
      setMessages(prev => prev.filter(msg => msg.id !== typingId));
      addMessage('bot', answer);

      // Nouveautés (si présentes)
      if (res.data.nouveautes) {
        addMessage('bot', `🔔 ${res.data.nouveautes}`);
      }

    } catch (err) {
      console.error('Erreur chatbot:', err);
      setMessages(prev => prev.filter(msg => msg.id !== typingId));
      addMessage('bot', '❌ Une erreur est survenue. Veuillez réessayer.');
    }
    setLoading(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleSuggestionClick = (suggestion) => {
    sendMessage(suggestion);
  };

  // Formater le message avec les sauts de ligne
  const formatMessage = (text) => {
    return text.split('\n').map((line, i) => (
      <React.Fragment key={i}>
        {line}
        {i < text.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  };

  return (
    <>
      {/* Bouton flottant */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-cyan-500 to-purple-500 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-all duration-300"
        aria-label="Ouvrir le chatbot"
      >
        {isOpen ? <FaTimes size={24} /> : <FaRobot size={24} />}
      </button>

      {/* Fenêtre du chat */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-96 h-[500px] bg-[#1a1a2e] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden backdrop-blur-xl animate-fadeInUp">
          
          {/* En-tête */}
          <div className="bg-gradient-to-r from-cyan-900/30 to-purple-900/30 p-4 border-b border-white/10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-white text-lg">
              <FaRobot />
            </div>
            <div>
              <h3 className="font-bold text-white">Assistant eSports</h3>
              <p className="text-[10px] text-gray-400">💡 Alimenté par IA</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="ml-auto text-gray-400 hover:text-white transition"
            >
              <FaTimes size={16} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 text-sm py-8">
                <FaRobot className="text-4xl mx-auto mb-3 opacity-30" />
                <p>Bonjour ! Je suis votre assistant eSports.</p>
                <p className="text-xs mt-1">Posez-moi une question ou choisissez un sujet ci-dessous.</p>
                
                {/* Suggestions */}
                <div className="mt-4 space-y-2">
                  {suggestions.slice(0, 5).map((s, i) => (
                    <button
                      key={i}
                      onClick={() => handleSuggestionClick(s)}
                      className="block w-full text-left text-xs text-cyan-400 hover:text-cyan-300 bg-white/5 hover:bg-white/10 px-3 py-2 rounded-xl transition"
                    >
                      💬 {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] px-4 py-2.5 rounded-2xl ${
                      msg.sender === 'user'
                        ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-black'
                        : 'bg-white/10 text-white'
                    } ${msg.isTyping ? 'animate-pulse' : ''}`}
                  >
                    {msg.isTyping ? (
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 bg-white rounded-full animate-bounce"></span>
                        <span className="w-2 h-2 bg-white rounded-full animate-bounce animation-delay-200"></span>
                        <span className="w-2 h-2 bg-white rounded-full animate-bounce animation-delay-400"></span>
                      </span>
                    ) : (
                      <>
                        <p className="text-sm">{formatMessage(msg.text)}</p>
                        {/* Badge IA pour toutes les réponses du bot */}
                        {msg.sender === 'bot' && (
                          <div className="mt-1 flex items-center gap-1 text-[8px] text-purple-300/70">
                            <FaBrain size={10} />
                            <span>IA</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="p-4 border-t border-white/10 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Écrivez votre message..."
              className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:border-cyan-400/50 focus:outline-none transition"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="bg-gradient-to-r from-cyan-500 to-purple-500 text-black px-4 py-2.5 rounded-xl font-bold hover:scale-105 transition disabled:opacity-50 flex items-center justify-center min-w-[44px]"
            >
              {loading ? <FaSpinner className="animate-spin" /> : <FaPaperPlane />}
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default ChatbotWidget;