'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';

interface NotificationBadgeProps {
  onCountChange?: (count: number) => void;
}

export default function NotificationBadge({ onCountChange }: NotificationBadgeProps) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchUnreadCount();
    // Poll for unread notifications every 60 seconds
    const interval = setInterval(fetchUnreadCount, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const response = await api.get('/notifications/unread_count/');
      const count = response.data.unread_count;
      setUnreadCount(count);
      if (onCountChange) {
        onCountChange(count);
      }
    } catch (err) {
      console.error('Failed to fetch unread notification count:', err);
    }
  };

  return (
    <div className="relative">
      <i className="fas fa-bell"></i>
      {unreadCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </div>
  );
}
