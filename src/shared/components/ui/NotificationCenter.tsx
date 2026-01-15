'use client';

import React, { useState } from 'react';
import { useNotifications } from '@/shared/Context/notification-context';
import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';
import { Card } from '@/shared/components/ui/Card';
import {
  Bell,
  X,
  CheckCircle,
  Info,
  AlertTriangle,
  AlertCircle,
  Trash2,
  Check,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const iconMap = {
  success: CheckCircle,
  info: Info,
  warning: AlertTriangle,
  error: AlertCircle,
};

const colorMap = {
  success: 'text-green-600 bg-green-100',
  info: 'text-blue-600 bg-blue-100',
  warning: 'text-yellow-600 bg-yellow-100',
  error: 'text-red-600 bg-red-100',
};

export const NotificationCenter: React.FC = () => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    clearNotification,
    clearAllNotifications
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Ahora';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return `${Math.floor(diffInMinutes / 1440)}d`;
  };

  return (
    <div className="relative">
      {/* Bell Icon with Badge */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="outline"
        size="sm"
        className="relative"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center p-0">
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Notification Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute right-0 top-12 w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-96 overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-semibold text-gray-800">
                Notificaciones {unreadCount > 0 && `(${unreadCount})`}
              </h3>
              <div className="flex gap-1">
                {notifications.length > 0 && (
                  <Button
                    onClick={clearAllNotifications}
                    variant="outline"
                    size="sm"
                    className="h-7 px-2"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
                <Button
                  onClick={() => setIsOpen(false)}
                  variant="outline"
                  size="sm"
                  className="h-7 px-2"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Bell className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No hay notificaciones</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((notification) => {
                    const IconComponent = iconMap[notification.type];
                    const colorClass = colorMap[notification.type];

                    return (
                      <motion.div
                        key={notification.id}
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className={`p-3 hover:bg-gray-50 cursor-pointer ${!notification.read ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                          }`}
                        onClick={() => !notification.read && markAsRead(notification.id)}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-1 rounded-full ${colorClass}`}>
                            <IconComponent className="h-4 w-4" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-gray-800 text-sm truncate">
                                {notification.title}
                              </h4>
                              <div className="flex items-center gap-1 ml-2">
                                <span className="text-xs text-gray-500">
                                  {formatTime(notification.timestamp)}
                                </span>
                                <Button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    clearNotification(notification.id);
                                  }}
                                  variant="outline"
                                  size="sm"
                                  className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>

                            <p className="text-sm text-gray-600 mt-1">
                              {notification.message}
                            </p>

                            {notification.orderNumber && (
                              <div className="mt-1">
                                <Badge variant="outline" className="text-xs">
                                  #{notification.orderNumber}
                                </Badge>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};



























