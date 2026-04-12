'use client'

import { useState, useEffect, useCallback } from 'react'
import { fetchApi } from '@/lib/api'

export function useNotifications() {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  const fetchNotifications = useCallback(async () => {
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const data = await fetchApi('/api/notifications/')
      setNotifications(data.notifications || [])
      setUnreadCount(data.unread_count || 0)
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    }
  }, [])

  useEffect(() => {
    fetchNotifications()
    // Poll every 10 seconds for real-time feel
    const interval = setInterval(fetchNotifications, 10000)
    return () => clearInterval(interval)
  }, [fetchNotifications])

  const markAsRead = async (id) => {
    try {
      await fetchApi(`/api/notifications/${id}/mark-read/`, { method: 'POST' })
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await fetchApi('/api/notifications/mark-all-read/', { method: 'POST' })
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error)
    }
  }

  const deleteNotification = async (id) => {
    try {
      await fetchApi(`/api/notifications/delete/${id}/`, { method: 'DELETE' })
      setNotifications(prev => prev.filter(n => n.id !== id))
      // If it was unread, decrement count
      const deleted = notifications.find(n => n.id === id)
      if (deleted && !deleted.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error('Failed to delete notification:', error)
    }
  }

  const deleteAllNotifications = async () => {
    try {
      await fetchApi('/api/notifications/delete-all/', { method: 'DELETE' })
      setNotifications([])
      setUnreadCount(0)
    } catch (error) {
      console.error('Failed to delete all notifications:', error)
    }
  }

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
    refresh: fetchNotifications
  }
}
