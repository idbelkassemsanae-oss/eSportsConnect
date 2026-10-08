import React, { useState, useEffect } from 'react';
import { FaBell, FaTrophy, FaCheckCircle, FaTimes, FaInfoCircle, FaUsers, FaComment, FaClock } from 'react-icons/fa';
import API from '../services/api';

const timeAgo = (dateString) => {
  const date = new Date(dateString);
  const seconds = Math.floor((new Date() - date) / 1000);
  if (seconds < 60) return "À l'instant";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `Il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Il y a ${hours} h`;
  const days = Math.floor(hours / 24);
  return `Il y a ${days} j`;
};

const getNotificationIcon = (notification) => {
  if (notification.type === 'message') return <FaComment className="text-cyan-400" />;
  if (notification.message?.includes('inscrit')) return <FaUsers className="text-purple-400" />;
  if (notification.message?.includes('match')) return <FaTrophy className="text-yellow-400" />;
  if (notification.message?.includes('Résultat')) return <FaCheckCircle className="text-green-400" />;
  return <FaInfoCircle className="text-blue-400" />;
};

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [show, setShow] = useState(false);

  const fetchNotifications = async () => {
    try {
      const tournRes = await API.get('/tournaments/notifications/');
      const tournNotifs = tournRes.data.map(n => ({ ...n, type: 'tournament' }));

      let msgNotifs = [];
      try {
        const msgRes = await API.get('/communication/unread-messages/');
        msgNotifs = msgRes.data.map(m => ({
          id: `msg_${m.id}`,
          message: `💬 Nouveau message de ${m.sender_username}: ${m.content.substring(0, 40)}${m.content.length > 40 ? '...' : ''}`,
          created_at: m.timestamp,
          type: 'message',
          is_read: false,
          link: `/inbox/${m.conversation_id}`
        }));
      } catch (e) {}

      const all = [...tournNotifs, ...msgNotifs];
      all.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setNotifications(all);
    } catch (err) {
      console.error('Erreur notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const markAsRead = async (id) => {
    if (!id.toString().startsWith('msg_')) {
      try {
        await API.post(`/tournaments/notifications/${id}/read/`);
        setNotifications(notifications.filter(n => n.id !== id));
      } catch (e) {}
    } else {
      const realId = id.toString().replace('msg_', '');
      try {
        await API.post(`/communication/messages/${realId}/read/`);
        setNotifications(notifications.filter(n => n.id !== id));
      } catch (e) {}
    }
  };

  const totalUnread = notifications.filter(n => !n.is_read).length;

  return (
    <div className="relative">
      <button onClick={() => setShow(!show)} className="relative text-gray-300 hover:text-cyan-400 transition-colors p-2">
        <FaBell className="text-2xl" />
        {totalUnread > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full animate-pulse font-bold">
            {totalUnread}
          </span>
        )}
      </button>

      {show && (
        <div className="absolute right-0 mt-3 w-80 md:w-96 bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50">
          <div className="flex items-center justify-between p-4 border-b border-white/10 bg-gradient-to-r from-cyan-900/30 to-purple-900/30">
            <div className="flex items-center gap-2">
              <FaBell className="text-cyan-400" />
              <h4 className="font-bold text-white">Notifications</h4>
              {totalUnread > 0 && (
                <span className="bg-cyan-500/20 text-cyan-300 text-xs px-2 py-1 rounded-full font-bold">
                  {totalUnread} non lues
                </span>
              )}
            </div>
            <button onClick={() => setShow(false)} className="text-gray-400 hover:text-white transition">
              <FaTimes />
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-white/5">
            {notifications.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <FaBell className="text-4xl mx-auto mb-3 opacity-20" />
                <p className="text-sm">Aucune notification.</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div key={n.id} className={`flex items-start gap-3 p-4 hover:bg-white/5 transition group ${!n.is_read ? 'bg-cyan-500/5 border-l-4 border-cyan-400' : ''}`}>
                  <div className="mt-1 text-lg">{getNotificationIcon(n)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-200 leading-relaxed break-words">{n.message}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <FaClock className="text-gray-500 text-xs" />
                      <span className="text-xs text-gray-500">{timeAgo(n.created_at)}</span>
                    </div>
                  </div>
                  {!n.is_read && (
                    <button onClick={() => markAsRead(n.id)} className="text-cyan-400 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity hover:underline">
                      Marquer lu
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;