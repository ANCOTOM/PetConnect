import { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Heart, MessageCircle, UserPlus, Share2 } from 'lucide-react';
import { db, auth } from '../firebase/firebase';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';

export function NotificationsView({ user, onNotificationClick }) {

  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const userId = auth.currentUser?.uid;

 useEffect(() => {
  if (!user) return; // Esperamos a que user exista
  const userId = user.uid;

  const q = query(
    collection(db, 'notifications'),
    where('toUserId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const notifs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setNotifications(notifs);
    setIsLoading(false);
  }, (error) => {
    console.error('Error loading notifications:', error);
    setIsLoading(false);
  });

  return () => unsubscribe();
}, [user]);


  const markAsRead = async (notificationId) => {
    try {
      const notifRef = doc(db, 'notifications', notificationId);
      await updateDoc(notifRef, { read: true });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      await markAsRead(notification.id);

      setNotifications(prev =>
        prev.map(n =>
          n.id === notification.id ? { ...n, read: true } : n
        )
      );
    }

    onNotificationClick?.(notification);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'like':
        return <Heart className="h-5 w-5 text-red-500 fill-current" />;
      case 'comment':
        return <MessageCircle className="h-5 w-5 text-blue-500" />;
      case 'follow':
        return <UserPlus className="h-5 w-5 text-green-500" />;
      case 'share':
        return <Share2 className="h-5 w-5 text-purple-500" />;
      default:
        return null;
    }
  };

  const getNotificationText = (notification) => {
    const name = notification.fromUserName || 'Alguien';

    switch (notification.type) {
      case 'like':
        return `${name} le dio me gusta a tu publicación`;
      case 'comment':
        return `${name} comentó en tu publicación`;
      case 'follow':
        return `${name} comenzó a seguirte`;
      case 'share':
        return `${name} compartió tu publicación`;
      default:
        return 'Nueva notificación';
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    const d = date.toDate ? date.toDate() : new Date(date);
    const now = new Date();
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `Hace ${diffMins}m`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays}d`;
    return d.toLocaleDateString();
  };

  if (isLoading) {
    return <div className="text-center py-8">Cargando notificaciones...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-2">
      <h2 className="text-orange-700 mb-4">Notificaciones</h2>

      {notifications.length === 0 ? (
        <Card className="border-2 border-orange-200">
          <CardContent className="py-8 text-center text-muted-foreground">
            No tienes notificaciones
          </CardContent>
        </Card>
      ) : (
        notifications.map((notification) => (
          <Card
            key={notification.id}
            className={`cursor-pointer transition-colors border-2 ${
              notification.read
                ? 'border-gray-200 bg-white'
                : 'border-orange-200 bg-orange-50'
            } hover:border-orange-300`}
            onClick={() => handleNotificationClick(notification)}
          >
            <CardContent className="flex items-center gap-3 py-4">
              <Avatar className="h-10 w-10 border-2 border-orange-300">
                <AvatarFallback className="bg-gradient-to-br from-orange-400 to-amber-400 text-white">
                  {notification.fromUserName?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <p className="text-sm">{getNotificationText(notification)}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(notification.createdAt)}
                </p>
              </div>

              <div>{getNotificationIcon(notification.type)}</div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
