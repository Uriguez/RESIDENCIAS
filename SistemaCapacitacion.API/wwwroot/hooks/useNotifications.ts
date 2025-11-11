import { useState, useEffect } from 'react';
import { Notification } from '../types';

/**
 * Hook para manejar notificaciones del sistema
 * Incluye notificaciones push, recordatorios de cursos, etc.
 */
export function useNotifications(userId?: string) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Simulamos notificaciones de ejemplo para demo
  useEffect(() => {
    if (!userId) return;

    const mockNotifications: Notification[] = [
      {
        id: '1',
        userId,
        title: 'Nuevo curso asignado',
        message: 'Se te ha asignado el curso "Seguridad Laboral Avanzada"',
        type: 'info',
        read: false,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 horas atrás
        actionUrl: '/courses'
      },
      {
        id: '2',
        userId,
        title: 'Recordatorio de curso',
        message: 'Te faltan 3 días para completar "Procedimientos de Emergencia"',
        type: 'warning',
        read: false,
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 horas atrás
        actionUrl: '/courses/2'
      },
      {
        id: '3',
        userId,
        title: '¡Felicitaciones!',
        message: 'Has completado exitosamente el curso "Seguridad Laboral Básica"',
        type: 'success',
        read: true,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 día atrás
        actionUrl: '/certificates'
      }
    ];

    setNotifications(mockNotifications);
    setUnreadCount(mockNotifications.filter(n => !n.read).length);
  }, [userId]);

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
    setUnreadCount(0);
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'createdAt'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    if (!newNotification.read) {
      setUnreadCount(prev => prev + 1);
    }
  };

  const removeNotification = (notificationId: string) => {
    const notification = notifications.find(n => n.id === notificationId);
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    
    if (notification && !notification.read) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    addNotification,
    removeNotification
  };
}