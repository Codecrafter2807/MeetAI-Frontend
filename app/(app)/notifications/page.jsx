'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Bell,
  CheckSquare,
  FileText,
  Share2,
  Settings,
  Check,
  Trash2,
  Calendar,
  Filter,
} from 'lucide-react'
import { useNotifications } from '@/hooks/use-notifications'
import { cn } from '@/lib/utils'

const notificationIcons = {
  meeting_completed: FileText,
  meeting_reminder: Calendar,
  action_item: CheckSquare,
  share: Share2,
  system: Settings,
}

export default function NotificationsPage() {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification, 
    deleteAllNotifications 
  } = useNotifications()
  const [filter, setFilter] = useState('all')

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'all') return true
    if (filter === 'unread') return !n.is_read
    if (filter === 'meeting_completed') return n.type === 'meeting_completed' || n.type === 'meeting_reminder'
    return n.type === filter
  })

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'unread', label: 'Unread' },
    { id: 'meeting_completed', label: 'Meetings' },
    { id: 'action_item', label: 'Tasks' },
    { id: 'share', label: 'Shared' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            {unreadCount > 0
              ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
              : 'All caught up!'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead} className="gap-2 shrink-0">
              <Check className="h-4 w-4" />
              Mark all as read
            </Button>
          )}
          {notifications.length > 0 && (
            <Button variant="ghost" size="sm" onClick={deleteAllNotifications} className="gap-2 text-rose-500 hover:text-rose-600 hover:bg-rose-50 shrink-0">
              <Trash2 className="h-4 w-4" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <Button
            key={f.id}
            variant={filter === f.id ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setFilter(f.id)}
            className={cn(
              filter === f.id && 'bg-primary/10 text-primary hover:bg-primary/20'
            )}
          >
            {f.label}
            {f.id === 'unread' && unreadCount > 0 && (
              <span className="ml-1.5 rounded-full bg-primary px-1.5 py-0.5 text-[10px] text-primary-foreground">
                {unreadCount}
              </span>
            )}
          </Button>
        ))}
      </div>

      {/* Notifications List */}
      <Card>
        <CardContent className="p-0">
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <Bell className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">No notifications</h3>
              <p className="text-center text-muted-foreground">
                {filter === 'unread'
                  ? "You've read all your notifications"
                  : 'You have no notifications yet'}
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredNotifications.map((notification) => {
                const Icon = notificationIcons[notification.type] || Bell
                return (
                  <div
                    key={notification.id}
                    className={cn(
                      'flex items-start gap-4 p-4 transition-colors hover:bg-muted/50',
                      !notification.is_read && 'bg-primary/5'
                    )}
                  >
                    <div
                      className={cn(
                        'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
                        !notification.is_read
                          ? 'bg-primary/10'
                          : 'bg-muted'
                      )}
                    >
                      <Icon
                        className={cn(
                          'h-5 w-5',
                          !notification.is_read
                            ? 'text-primary'
                            : 'text-muted-foreground'
                        )}
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                        <div>
                          <p
                            className={cn(
                              'font-medium text-sm sm:text-base pr-4 sm:pr-0',
                              !notification.is_read && 'text-primary'
                            )}
                          >
                            {notification.title}
                          </p>
                          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                            {notification.description}
                          </p>
                          <p className="mt-1 text-[10px] sm:text-xs text-muted-foreground/70">
                            {new Date(notification.created_at).toLocaleString()}
                          </p>
                        </div>

                        <div className="flex shrink-0 items-center justify-end gap-1 mt-2 sm:mt-0">
                          {!notification.is_read && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => markAsRead(notification.id)}
                              className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteNotification(notification.id)}
                            className="h-8 w-8 text-muted-foreground hover:text-rose-500 hover:bg-rose-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {!notification.is_read && (
                      <div className="absolute top-6 right-4 sm:relative sm:top-0 sm:right-0 mt-0 sm:mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
