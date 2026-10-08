import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from '../context/RouterContext';
import { useAuth } from '../context/AuthContext';
import {
  Search,
  Plus,
  Send,
  Paperclip,
  Smile,
  CheckCheck,
  UserRound,
  X,
  ArrowLeft,
  Loader2,
  MessageSquare,
  ChevronLeft,
  Star,
  File,
  Image,
  Video,
  Music,
} from 'lucide-react';
import API from '../services/api';

// ============================================================
// COMPOSANT AVATAR AVEC LETTRE
// ============================================================
function AvatarWithLetter({ username, avatar, size = 'h-12 w-12', online = false }) {
  const getInitials = (name) => {
    if (!name) return '?';
    return name.charAt(0).toUpperCase();
  };

  const getColor = (name) => {
    const colors = [
      'bg-violet-500', 'bg-cyan-500', 'bg-emerald-500', 'bg-amber-500',
      'bg-pink-500', 'bg-indigo-500', 'bg-teal-500', 'bg-rose-500',
      'bg-blue-500', 'bg-purple-500', 'bg-orange-500', 'bg-red-500'
    ];
    let hash = 0;
    const str = name || '?';
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  if (avatar) {
    return (
      <div className="relative shrink-0">
        <img src={avatar} alt={username} className={`${size} rounded-full border-2 border-white/10 object-cover`} />
        {online && (
          <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-[#06101c] bg-emerald-400 ring-2 ring-emerald-400/30" />
        )}
      </div>
    );
  }

  return (
    <div className="relative shrink-0">
      <div className={`${size} rounded-full flex items-center justify-center text-white font-bold text-lg ${getColor(username)}`}>
        {getInitials(username)}
      </div>
      {online && (
        <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-[#06101c] bg-emerald-400 ring-2 ring-emerald-400/30" />
      )}
    </div>
  );
}

// ============================================================
// COMPOSANT CONVERSATION ITEM
// ============================================================
function ConversationItem({ conversation, selected, onClick, currentUserId }) {
  const getOtherUser = (conv) => {
    let lastSender = null;
    if (conv.last_message) {
      lastSender = conv.last_message.sender_username || 
                   conv.last_message.sender || 
                   conv.last_message.from_user || 
                   conv.last_message.from || null;
    }

    if (lastSender && lastSender !== currentUserId && lastSender !== conv.current_user_username) {
      return { username: lastSender, avatar: null, is_online: false };
    }

    if (lastSender && (lastSender === currentUserId || lastSender === conv.current_user_username)) {
      if (conv.participants && Array.isArray(conv.participants)) {
        const other = conv.participants.find(p => p.id !== currentUserId);
        if (other) return other;
      }
      if (conv.other_user) {
        if (typeof conv.other_user === 'object') return conv.other_user;
        return { username: conv.other_user, avatar: null, is_online: false };
      }
      if (conv.user) {
        if (typeof conv.user === 'object') return conv.user;
        return { username: conv.user, avatar: null, is_online: false };
      }
    }

    if (conv.participants && Array.isArray(conv.participants)) {
      const other = conv.participants.find(p => p.id !== currentUserId);
      if (other) return other;
      if (conv.participants.length > 0) return conv.participants[0];
    }

    if (conv.other_user) {
      if (typeof conv.other_user === 'object') return conv.other_user;
      return { username: conv.other_user, avatar: null, is_online: false };
    }
    if (conv.user) {
      if (typeof conv.user === 'object') return conv.user;
      return { username: conv.user, avatar: null, is_online: false };
    }

    if (conv.username && conv.username !== currentUserId) {
      return { username: conv.username, avatar: null, is_online: false };
    }

    return { username: 'Utilisateur', avatar: null, is_online: false };
  };

  const other = getOtherUser(conversation);
  const username = other.username || 'Inconnu';
  const avatar = other.avatar || null;
  const online = other.is_online || false;

  const lastMessage = conversation.last_message?.content || conversation.lastMessage || 'Aucun message';
  const time = conversation.last_message?.timestamp || conversation.updated_at || conversation.time || '';
  const unread = conversation.unread_count || conversation.unread || 0;
  const sender = conversation.last_message?.sender_username || 
                 conversation.last_message?.sender || 
                 conversation.last_message?.from_user || null;

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    if (diff < 24 * 60 * 60 * 1000) {
      return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
  };

  return (
    <button
      onClick={onClick}
      className={`w-full rounded-xl p-3 text-left transition-all duration-300 ${
        selected
          ? 'bg-gradient-to-r from-violet-600/20 to-purple-600/10 border border-violet-500/30 shadow-lg shadow-violet-900/10'
          : 'hover:bg-white/[0.05] border border-transparent'
      }`}
    >
      <div className="flex items-center gap-3">
        <AvatarWithLetter username={username} avatar={avatar} size="h-12 w-12" online={online} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-sm font-semibold text-white">{username}</p>
            <span className="shrink-0 text-[10px] text-slate-500">{formatTime(time)}</span>
          </div>
          <div className="mt-1 flex items-center justify-between gap-2">
            <p className="truncate text-xs text-slate-400">
              {sender && sender !== username && `${sender}: `}
              {lastMessage}
            </p>
            {unread > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-gradient-to-r from-violet-500 to-purple-500 px-1.5 text-[10px] font-bold text-white shadow-lg shadow-violet-500/30">
                {unread}
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}

// ============================================================
// COMPOSANT MESSAGE BUBBLE
// ============================================================
function MessageBubble({ message, isMe, avatar, username }) {
  const time = message.timestamp || message.created_at || message.time || '';
  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  const isFile = message.file_url || message.file_name || (typeof message.content === 'string' && message.content.startsWith('📎 Fichier:'));

  return (
    <div className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'} animate-fadeInUp`}>
      <div className={`flex max-w-[80%] items-end gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
        {!isMe && (
          <AvatarWithLetter username={username} avatar={avatar} size="h-8 w-8" />
        )}
        <div className="relative">
          {!isMe && (
            <div className="absolute -left-1 top-0 h-3 w-3 rotate-45 bg-[#0b1725] border-l border-t border-white/[0.06]" />
          )}
          <div
            className={`rounded-2xl px-4 py-3 ${
              isMe
                ? 'rounded-br-md bg-gradient-to-br from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-500/20'
                : 'rounded-bl-md bg-[#0b1725] border border-white/[0.06] text-slate-200'
            }`}
          >
            {!isMe && (
              <p className="text-xs font-semibold text-violet-400 mb-1">{username}</p>
            )}
            {isFile ? (
              <div className="flex items-center gap-2">
                {message.file_type === 'image' && <Image size={16} className="text-cyan-400" />}
                {message.file_type === 'video' && <Video size={16} className="text-cyan-400" />}
                {message.file_type === 'audio' && <Music size={16} className="text-cyan-400" />}
                {!['image','video','audio'].includes(message.file_type) && <File size={16} className="text-cyan-400" />}
                {message.file_url ? (
                  <a href={message.file_url} target="_blank" rel="noopener noreferrer" className="text-sm underline text-cyan-300 hover:text-cyan-200">
                    {message.file_name || 'Fichier joint'}
                  </a>
                ) : (
                  <span className="text-sm">{message.content}</span>
                )}
              </div>
            ) : (
              <p className="text-sm leading-6 whitespace-pre-wrap break-words">{message.content}</p>
            )}
            <div className={`mt-1.5 flex items-center justify-end gap-1.5 ${isMe ? 'text-violet-300' : 'text-slate-500'}`}>
              <span className="text-[10px]">{formatTime(time)}</span>
              {isMe && <CheckCheck size={14} className="text-violet-300" />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// COMPOSANT ÉMOJI PICKER
// ============================================================
const EMOJIS = ['😊', '😂', '❤️', '🔥', '💪', '👋', '🙌', '🎉', '👍', '😎', '💯', '✨', '🏆', '🤝', '👀', '💬', '🫡', '🥇', '🥈', '🥉'];

function EmojiPicker({ onSelect, onClose }) {
  return (
    <div className="absolute bottom-14 right-0 w-64 bg-[#1a1a2e] border border-white/10 rounded-xl p-3 shadow-2xl shadow-black/50 z-50">
      <div className="flex flex-wrap gap-2">
        {EMOJIS.map((emoji) => (
          <button
            key={emoji}
            onClick={() => { onSelect(emoji); onClose(); }}
            className="text-2xl hover:bg-white/10 rounded-lg p-1 transition"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// COMPOSANT PAGE HEADER
// ============================================================
function PageHeader({ title, subtitle, icon: Icon, badge }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-violet-500/20 bg-[#080f1d] p-6 mb-6">
      <div className="absolute inset-0 bg-gradient-to-r from-violet-900/10 via-purple-900/10 to-cyan-900/10" />
      <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl" />
      <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-900/30">
            <Icon size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-white">{title}</h1>
            <p className="text-sm text-slate-400">{subtitle}</p>
          </div>
        </div>
        {badge && (
          <div className="flex items-center gap-2 bg-black/30 border border-white/10 rounded-xl px-4 py-2">
            <Star size={16} className="text-amber-400" />
            <span className="text-sm font-bold text-white">{badge}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// COMPOSANT PRINCIPAL INBOX (sans Profil)
// ============================================================
const Inbox = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [mobileList, setMobileList] = useState(true);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // ============================================================
  // CHARGER LES CONVERSATIONS
  // ============================================================
  const loadConversations = useCallback(() => {
    API.get('/communication/conversations/')
      .then(res => {
        const data = res.data.map(conv => ({
          ...conv,
          current_user_username: user?.username
        }));
        setConversations(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Erreur chargement conversations:', err);
        setLoading(false);
        setConversations([
          { 
            id: 1, 
            participants: [{ id: 2, username: 'Coach Alex', is_online: true }], 
            last_message: { content: "N'oublie pas la session de coaching demain !", timestamp: new Date().toISOString(), sender_username: 'Coach Alex' }, 
            unread_count: 2,
            current_user_username: user?.username
          },
        ]);
      });
  }, [user]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // ============================================================
  // CHARGER LES MESSAGES
  // ============================================================
  const loadMessages = useCallback((conversationId) => {
    setLoadingMessages(true);
    API.get(`/communication/conversations/${conversationId}/messages/`)
      .then(res => {
        setMessages(res.data);
        const unreadMessages = res.data.filter(m => !m.is_read && !m.is_sender);
        unreadMessages.forEach(m => {
          API.post(`/communication/messages/${m.id}/read/`).catch(() => {});
        });
        setLoadingMessages(false);
      })
      .catch(err => {
        console.error('Erreur chargement messages:', err);
        setLoadingMessages(false);
        setMessages([
          { id: 1, sender: 2, sender_username: 'Coach Alex', content: 'Salut 👋, tu vas participer au prochain tournoi ?', timestamp: new Date().toISOString(), is_read: true },
          { id: 2, sender: user?.id, sender_username: user?.username, content: 'Oui, je pense m\'inscrire.', timestamp: new Date().toISOString(), is_read: true },
          { id: 3, sender: 2, sender_username: 'Coach Alex', content: 'Super ! N\'oublie pas de t\'entraîner 💪', timestamp: new Date().toISOString(), is_read: true },
        ]);
      });
  }, [user]);

  // ============================================================
  // SÉLECTIONNER UNE CONVERSATION
  // ============================================================
  const selectConversation = (conversation) => {
    setSelectedConversation(conversation);
    loadMessages(conversation.id);
    setConversations(prev => prev.map(c => 
      c.id === conversation.id ? { ...c, unread_count: 0 } : c
    ));
    setMobileList(false);
    setShowEmojiPicker(false);
  };

  // ============================================================
  // ENVOYER UN MESSAGE
  // ============================================================
  const handleSendMessage = async (e, content = null) => {
    e?.preventDefault();
    const text = content || newMessage.trim();
    if (!text || !selectedConversation || sending) return;

    const tempMessage = {
      id: Date.now(),
      sender: user?.id,
      sender_username: user?.username,
      content: text,
      timestamp: new Date().toISOString(),
      is_optimistic: true,
    };
    setMessages(prev => [...prev, tempMessage]);
    setNewMessage('');

    try {
      setSending(true);
      const res = await API.post(`/communication/conversations/${selectedConversation.id}/messages/`, { content: text });
      setMessages(prev => prev.map(m => m.id === tempMessage.id ? res.data : m));
      setConversations(prev => prev.map(c => 
        c.id === selectedConversation.id 
          ? { ...c, last_message: { content: text, timestamp: new Date().toISOString(), sender_username: user?.username } }
          : c
      ));
      loadConversations();
    } catch (err) {
      console.error('Erreur envoi message:', err);
      setMessages(prev => prev.filter(m => m.id !== tempMessage.id));
    } finally {
      setSending(false);
    }
  };

  // ============================================================
  // ENVOYER UN FICHIER
  // ============================================================
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file || !selectedConversation) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target.result;
      const fileName = file.name;
      
      const fileMessage = `📎 Fichier: ${fileName}`;
      await handleSendMessage(null, fileMessage);
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  // ============================================================
  // RECHERCHER DES UTILISATEURS
  // ============================================================
  const searchUsers = async (query) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    try {
      const res = await API.get(`/communication/search-users/?q=${query}`);
      setSearchResults(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // ============================================================
  // CRÉER UNE CONVERSATION
  // ============================================================
  const createConversation = async (otherUser) => {
    try {
      const res = await API.post('/communication/conversations/create/', {
        participants_ids: [user.id, otherUser.id]
      });
      setConversations(prev => [res.data, ...prev]);
      setShowNewConversation(false);
      setSearchQuery('');
      setSearchResults([]);
      selectConversation(res.data);
    } catch (err) {
      console.error('Erreur création conversation:', err);
      alert('❌ ' + (err.response?.data?.error || err.response?.data?.detail || 'Erreur lors de la création.'));
    }
  };

  // ============================================================
  // INSÉRER UN ÉMOJI
  // ============================================================
  const insertEmoji = (emoji) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  // ============================================================
  // POLLING EN TEMPS RÉEL
  // ============================================================
  useEffect(() => {
    if (!selectedConversation) return;
    const interval = setInterval(() => {
      API.get(`/communication/conversations/${selectedConversation.id}/messages/`)
        .then(res => {
          setMessages(prev => {
            const existingIds = new Set(prev.map(m => m.id));
            const newMessages = res.data.filter(m => !existingIds.has(m.id));
            if (newMessages.length > 0) {
              return [...prev, ...newMessages];
            }
            return prev;
          });
        })
        .catch(() => {});
    }, 5000);
    return () => clearInterval(interval);
  }, [selectedConversation]);

  // ============================================================
  // SCROLL AUTOMATIQUE
  // ============================================================
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ============================================================
  // RÉCUPÉRER L'AUTRE PARTICIPANT
  // ============================================================
  const getOtherParticipant = (conv) => {
    if (!conv) return null;

    let lastSender = null;
    if (conv.last_message) {
      lastSender = conv.last_message.sender_username || 
                   conv.last_message.sender || 
                   conv.last_message.from_user || 
                   conv.last_message.from || null;
    }

    if (lastSender && lastSender !== user?.username && lastSender !== user?.id) {
      return { username: lastSender, avatar: null, is_online: false };
    }

    if (lastSender && (lastSender === user?.username || lastSender === user?.id)) {
      if (conv.participants && Array.isArray(conv.participants)) {
        const other = conv.participants.find(p => p.id !== user?.id);
        if (other) return other;
      }
      if (conv.other_user) {
        if (typeof conv.other_user === 'object') return conv.other_user;
        return { username: conv.other_user, avatar: null, is_online: false };
      }
      if (conv.user) {
        if (typeof conv.user === 'object') return conv.user;
        return { username: conv.user, avatar: null, is_online: false };
      }
    }

    if (conv.participants && Array.isArray(conv.participants)) {
      const other = conv.participants.find(p => p.id !== user?.id);
      if (other) return other;
      if (conv.participants.length > 0) return conv.participants[0];
    }

    if (conv.other_user) {
      if (typeof conv.other_user === 'object') return conv.other_user;
      return { username: conv.other_user, avatar: null, is_online: false };
    }
    if (conv.user) {
      if (typeof conv.user === 'object') return conv.user;
      return { username: conv.user, avatar: null, is_online: false };
    }
    if (conv.username && conv.username !== user?.username) {
      return { username: conv.username, avatar: null, is_online: false };
    }
    return { username: 'Utilisateur', avatar: null, is_online: false };
  };

  // ============================================================
  // FILTRAGE DES CONVERSATIONS PAR RECHERCHE
  // ============================================================
  const filteredConversations = conversations.filter(conv => {
    if (!searchQuery.trim()) return true;
    const other = getOtherParticipant(conv);
    const username = other?.username || '';
    return username.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // ============================================================
  // RENDU
  // ============================================================
  if (loading) {
    return (
      <div className="min-h-screen bg-[#020817] flex items-center justify-center">
        <Loader2 className="animate-spin text-violet-500" size={40} />
      </div>
    );
  }

  const currentOtherUser = selectedConversation ? getOtherParticipant(selectedConversation) : null;
  const unreadCount = conversations.reduce((acc, c) => acc + (c.unread_count || 0), 0);

  return (
    <div className="min-h-screen bg-[#020817] text-white">
      <main className="ml-0 md:ml-[250px] min-h-screen">
        <div className="max-w-[1450px] mx-auto px-5 md:px-8 py-6">

          <PageHeader 
            title="Messages" 
            subtitle="Tes conversations avec la communauté"
            icon={MessageSquare}
            badge={`${unreadCount} non lus`}
          />

          <div className="flex h-[calc(100vh-260px)] min-h-[500px] gap-5">

            {/* ===== COLONNE GAUCHE : LISTE ===== */}
            <aside className={`w-[340px] shrink-0 rounded-2xl border border-white/5 bg-[#06101c] overflow-hidden flex flex-col ${mobileList ? 'flex' : 'hidden lg:flex'}`}>
              <div className="border-b border-white/5 p-4">
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-violet-400 transition-colors">
                    <Search size={18} />
                  </div>
                  <input 
                    placeholder="Rechercher une conversation..." 
                    className="w-full rounded-xl border border-white/10 bg-[#020817] pl-10 pr-4 py-2.5 text-sm text-white outline-none transition-all duration-300 focus:border-violet-500/50 focus:bg-black/40 focus:shadow-lg focus:shadow-violet-500/5 placeholder:text-slate-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition"
                      aria-label="Effacer la recherche"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>

              <div className="p-3">
                <button 
                  onClick={() => setShowNewConversation(true)}
                  className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-purple-500 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 hover:brightness-110 transition flex items-center justify-center gap-2"
                >
                  <Plus size={18} />
                  Nouvelle conversation
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-3 pb-4">
                {filteredConversations.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="mx-auto text-slate-600" size={48} />
                    <p className="mt-4 text-slate-400">
                      {searchQuery ? 'Aucun résultat pour cette recherche' : 'Aucune conversation'}
                    </p>
                    <p className="text-sm text-slate-500">
                      {searchQuery ? 'Essayez un autre nom' : 'Créez-en une nouvelle'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {filteredConversations.map((conv) => (
                      <ConversationItem
                        key={conv.id}
                        conversation={conv}
                        selected={selectedConversation?.id === conv.id}
                        onClick={() => selectConversation(conv)}
                        currentUserId={user?.id}
                      />
                    ))}
                  </div>
                )}
              </div>
            </aside>

            {/* ===== COLONNE DROITE : CHAT ===== */}
            <section className={`flex-1 rounded-2xl border border-white/5 bg-[#06101c] overflow-hidden flex flex-col ${mobileList ? 'hidden lg:flex' : 'flex'}`}>
              {selectedConversation && currentOtherUser ? (
                <>
                  <div className="flex h-[72px] shrink-0 items-center justify-between border-b border-white/5 px-5 bg-[#020817]">
                    <div className="flex min-w-0 items-center gap-3">
                      <button onClick={() => setMobileList(true)} className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-white/5 hover:text-white lg:hidden">
                        <ChevronLeft size={20} />
                      </button>
                      <AvatarWithLetter 
                        username={currentOtherUser.username} 
                        avatar={currentOtherUser.avatar} 
                        size="h-10 w-10" 
                        online={currentOtherUser.is_online} 
                      />
                      <div className="min-w-0">
                        <h2 className="text-sm font-semibold text-white">{currentOtherUser.username}</h2>
                        <div className="flex items-center gap-2">
                          <span className={`h-2 w-2 rounded-full ${currentOtherUser.is_online ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
                          <span className="text-[10px] text-slate-500">{currentOtherUser.is_online ? 'En ligne' : 'Hors ligne'}</span>
                        </div>
                      </div>
                    </div>
                    {/* ❌ Bouton profil SUPPRIMÉ */}
                  </div>

                  <div className="flex-1 overflow-y-auto px-5 py-6">
                    {loadingMessages ? (
                      <div className="flex h-full items-center justify-center">
                        <Loader2 className="animate-spin text-violet-500" size={32} />
                      </div>
                    ) : (
                      <div className="mx-auto max-w-3xl space-y-4">
                        {messages.length === 0 ? (
                          <div className="text-center py-12">
                            <MessageSquare className="mx-auto text-slate-600" size={48} />
                            <p className="mt-4 text-slate-400">Aucun message</p>
                            <p className="text-sm text-slate-500">Commencez la conversation !</p>
                          </div>
                        ) : (
                          messages.map((msg, index) => {
                            const isMe = msg.sender === user?.id || msg.sender === 'me' || msg.sender_username === user?.username;
                            const senderName = msg.sender_username || currentOtherUser.username;
                            return (
                              <MessageBubble
                                key={msg.id || index}
                                message={msg}
                                isMe={isMe}
                                avatar={currentOtherUser.avatar}
                                username={senderName}
                              />
                            );
                          })
                        )}
                        <div ref={messagesEndRef} />
                      </div>
                    )}
                  </div>

                  <div className="shrink-0 border-t border-white/5 bg-[#020817] px-5 py-4">
                    <form onSubmit={handleSendMessage} className="mx-auto max-w-3xl">
                      <div className="flex items-end gap-2 rounded-xl border border-white/10 bg-[#07111e] p-2 transition focus-within:border-violet-500/30 relative">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-white/5 hover:text-slate-300 transition"
                          aria-label="Joindre un fichier"
                        >
                          <Paperclip size={18} />
                        </button>
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileUpload}
                          className="hidden"
                          multiple={false}
                        />

                        <textarea
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage(e);
                            }
                          }}
                          rows={1}
                          placeholder="Écrire un message..."
                          className="max-h-28 min-h-[36px] flex-1 resize-none bg-transparent px-2 py-2 text-sm text-white outline-none placeholder:text-slate-500"
                        />

                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-white/5 hover:text-slate-300 transition"
                            aria-label="Choisir un émoji"
                          >
                            <Smile size={18} />
                          </button>
                          {showEmojiPicker && (
                            <EmojiPicker 
                              onSelect={insertEmoji} 
                              onClose={() => setShowEmojiPicker(false)} 
                            />
                          )}
                        </div>

                        <button
                          type="submit"
                          disabled={!newMessage.trim() || sending}
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-r from-violet-600 to-purple-500 text-white shadow-lg shadow-violet-500/30 transition hover:brightness-110 disabled:opacity-40"
                          aria-label="Envoyer le message"
                        >
                          {sending ? <Loader2 size={17} className="animate-spin" /> : <Send size={17} />}
                        </button>
                      </div>
                    </form>
                  </div>
                </>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <div className="text-center max-w-sm px-4">
                    <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/20 flex items-center justify-center">
                      <MessageSquare size={36} className="text-violet-400" />
                    </div>
                    <h3 className="mt-6 text-xl font-bold text-white">Aucune conversation sélectionnée</h3>
                    <p className="mt-2 text-sm text-slate-400">Choisissez une conversation dans la liste ou créez-en une nouvelle.</p>
                    <button 
                      onClick={() => setShowNewConversation(true)}
                      className="mt-4 rounded-xl bg-gradient-to-r from-violet-600 to-purple-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 hover:brightness-110 transition"
                    >
                      <Plus size={16} className="inline mr-2" />
                      Nouvelle conversation
                    </button>
                  </div>
                </div>
              )}
            </section>

            {/* ❌ PROFIL PANEL SUPPRIMÉ (desktop et mobile) */}

          </div>
        </div>
      </main>

      {/* ===== MODAL NOUVELLE CONVERSATION ===== */}
      {showNewConversation && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a2e] border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl shadow-black/50">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Nouvelle conversation</h3>
              <button onClick={() => { setShowNewConversation(false); setSearchQuery(''); setSearchResults([]); }} className="text-slate-400 hover:text-white transition">
                <X size={20} />
              </button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input
                type="text"
                placeholder="Rechercher un utilisateur..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  searchUsers(e.target.value);
                }}
                className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:border-violet-400/50 focus:outline-none transition"
              />
            </div>
            {searchResults.length > 0 && (
              <div className="mt-4 space-y-2 max-h-60 overflow-y-auto">
                {searchResults.map((u) => (
                  <div key={u.id} onClick={() => createConversation(u)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 cursor-pointer transition border border-transparent hover:border-violet-500/20">
                    <AvatarWithLetter username={u.username} avatar={u.avatar} size="h-10 w-10" />
                    <div>
                      <p className="font-medium text-white">{u.username}</p>
                      <p className="text-xs text-slate-500">Cliquez pour démarrer</p>
                    </div>
                    <ArrowLeft size={16} className="ml-auto text-violet-400 rotate-180" />
                  </div>
                ))}
              </div>
            )}
            {searchQuery.length >= 2 && searchResults.length === 0 && (
              <p className="text-slate-500 text-sm mt-4 text-center">Aucun utilisateur trouvé</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Inbox;
