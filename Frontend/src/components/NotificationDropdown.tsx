import React, { useState, useEffect, useRef } from 'react'
import { Bell, Check, Info, MessageSquare, AlertTriangle, FileText } from 'lucide-react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { apiFetch } from '../utils/api'
import type { NotificationDTO } from '../types'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export const NotificationDropdown: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationDTO[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetchNotifications()
    const cleanup = connectWebSocket()

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      if (cleanup) cleanup()
    }
  }, [])

  const fetchNotifications = async () => {
    try {
      const res = await apiFetch('/api/v1/notifications')
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data)) {
          setNotifications(data)
          setUnreadCount(data.filter((n: NotificationDTO) => !n.isRead).length)
        } else {
          console.error('Expected array of notifications but got:', data)
          setNotifications([])
        }
      }
    } catch (error) {
      console.error('Failed to fetch notifications', error)
    }
  }

  const connectWebSocket = () => {
    const token = useAuthStore.getState().accessToken
    if (!token) return

    const client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws/exam'),
      connectHeaders: {
        Authorization: `Bearer ${token}`
      },
      debug: (str) => {
        // console.log(str)
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000
    })

    client.onConnect = () => {
      // Lắng nghe kênh thông báo cá nhân
      client.subscribe('/user/queue/notifications', (message) => {
        const notification: NotificationDTO = JSON.parse(message.body)
        
        // Bắn event để ClassroomsPage hứng (cập nhật số chưa đọc)
        if (notification.type === 'CHAT_BADGE_UPDATE') {
          window.dispatchEvent(new CustomEvent('chatBadgeUpdate', { 
            detail: { classId: notification.relatedId, unreadCount: parseInt(notification.message) } 
          }))
          return // KHÔNG thêm vào chuông
        }

        setNotifications((prev) => {
          return [notification, ...prev]
        })
        
        setUnreadCount((prev) => prev + 1)
      })
    }

    client.activate()

    return () => {
      client.deactivate()
    }
  }

  const markAsRead = async (id: number) => {
    try {
      await apiFetch(`/api/v1/notifications/${id}/read`, { method: 'PUT' })
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error(error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await apiFetch(`/api/v1/notifications/read-all`, { method: 'PUT' })
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error(error)
    }
  }

  const handleNotificationClick = (notification: NotificationDTO) => {
    if (!notification.isRead) {
      markAsRead(notification.id)
    }
    setIsOpen(false)
    
    // Điều hướng dựa trên loại thông báo
    if (notification.type === 'EXAM_CREATED' || notification.type === 'DOCUMENT_UPLOADED') {
      navigate(`/classes/${notification.relatedId}`)
    } else if (notification.type === 'CHEAT_DETECTED') {
      navigate(`/teacher/exam-sessions/${notification.relatedId}/proctor`)
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'EXAM_CREATED': return <Info className="w-5 h-5 text-blue-500" />
      case 'DOCUMENT_UPLOADED': return <FileText className="w-5 h-5 text-green-500" />
      case 'CHEAT_DETECTED': return <AlertTriangle className="w-5 h-5 text-red-500" />
      default: return <Bell className="w-5 h-5 text-slate-500" />
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors p-0 cursor-pointer relative"
      >
        <Bell className="w-6 h-6 text-slate-900" strokeWidth={2.5} />
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 flex items-center justify-center min-w-[20px] h-5 px-1 bg-red-500 text-white text-xs font-black border-2 border-slate-900 rounded-full animate-bounce">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 max-h-96 flex flex-col bg-white border-2 border-slate-900 shadow-[4px_4px_0px_#0f172a] rounded-xl z-50 animate-pop-in origin-top-right overflow-hidden">
          <div className="p-3 border-b-2 border-slate-100 flex justify-between items-center bg-slate-50">
            <span className="font-black text-slate-900">Thông báo</span>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
              >
                <Check className="w-3 h-3" strokeWidth={3} /> Đã đọc hết
              </button>
            )}
          </div>
          
          <div className="overflow-y-auto flex-1">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-slate-500 font-bold text-sm">
                Không có thông báo nào.
              </div>
            ) : (
              notifications.map((n) => (
                <div 
                  key={n.id} 
                  onClick={() => handleNotificationClick(n)}
                  className={`p-3 border-b border-slate-100 flex gap-3 cursor-pointer transition-colors ${n.isRead ? 'opacity-60 hover:bg-slate-50' : 'bg-blue-50/50 hover:bg-blue-50'}`}
                >
                  <div className="mt-1 flex-shrink-0">
                    {getIcon(n.type)}
                  </div>
                  <div>
                    <h4 className={`text-sm ${n.isRead ? 'font-bold text-slate-700' : 'font-black text-slate-900'}`}>{n.title}</h4>
                    <p className="text-xs text-slate-600 mt-0.5 leading-snug">{n.message}</p>
                    <span className="text-[10px] font-bold text-slate-400 mt-1 block">
                      {new Date(n.createdAt).toLocaleString('vi-VN')}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
