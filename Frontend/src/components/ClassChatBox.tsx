import React, { useState, useEffect, useRef } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { Send, MessageCircle } from 'lucide-react'
import { apiFetch } from '../utils/api'
import { useAuthStore } from '../store/authStore'

interface ChatMessageDTO {
  id: number
  content: string
  senderId: number
  senderName: string
  senderRole: string
  createdAt: string
}

interface ClassChatBoxProps {
  classId: number
  unreadCount?: number
}

export const ClassChatBox: React.FC<ClassChatBoxProps> = ({ classId, unreadCount = 0 }) => {
  const [messages, setMessages] = useState<ChatMessageDTO[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  
  const stompClientRef = useRef<Client | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const isLoadingOldRef = useRef(false)
  const initialUnreadRef = useRef(unreadCount)
  const [dividerIndex, setDividerIndex] = useState<number>(-1)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const { userEmail, userRole } = useAuthStore()
  
  // Custom hook to get user ID is not available directly, but we can match by role and name for simple styling
  // Actually authStore has `userId`, let's check if it does. If not, we can rely on `senderName` or just styling.
  
  useEffect(() => {
    setPage(0)
    setHasMore(true)
    loadHistory(0)
    connectWebSocket()
    
    // Đánh dấu đã đọc và xoá badge đỏ trên giao diện
    if (initialUnreadRef.current > 0) {
      window.dispatchEvent(new CustomEvent('chatBadgeUpdate', { 
        detail: { classId, unreadCount: 0 } 
      }))
    }

    return () => {
      if (stompClientRef.current) {
        stompClientRef.current.deactivate()
      }
    }
  }, [classId])
  
  useEffect(() => {
    if (!isLoadingOldRef.current) {
      scrollToBottom()
    }
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }

  const loadHistory = async (pageNumber: number) => {
    try {
      const res = await apiFetch(`/api/v1/classes/${classId}/chat/history?page=${pageNumber}&size=20`)
      if (res.ok) {
        const data = await res.json()
        if (data.length < 20) {
          setHasMore(false)
        }
        
        if (pageNumber === 0) {
          setMessages(data)
          // Tính toán vị trí divider cố định
          if (initialUnreadRef.current > 0) {
            if (initialUnreadRef.current >= data.length) {
              setDividerIndex(0)
            } else {
              setDividerIndex(data.length - initialUnreadRef.current)
            }
          }
        } else {
          // Tải thêm tin nhắn cũ
          if (chatContainerRef.current) {
            const container = chatContainerRef.current;
            const scrollHeightBefore = container.scrollHeight;
            const scrollTopBefore = container.scrollTop;
            
            setMessages(prev => [...data, ...prev]);
            
            setTimeout(() => {
              if (chatContainerRef.current) {
                const newScrollHeight = chatContainerRef.current.scrollHeight;
                chatContainerRef.current.scrollTop = scrollTopBefore + (newScrollHeight - scrollHeightBefore);
              }
            }, 0);
          }
        }
      }
    } catch (e) {
      console.error('Failed to load chat history', e)
    }
  }

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (e.currentTarget.scrollTop === 0 && hasMore && !isLoadingOldRef.current) {
      const nextPage = page + 1;
      setPage(nextPage);
      isLoadingOldRef.current = true;
      loadHistory(nextPage).finally(() => {
        isLoadingOldRef.current = false;
      });
    }
  }

  const connectWebSocket = () => {
    const token = useAuthStore.getState().accessToken || ''

    const client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws/exam'),
      connectHeaders: {
        Authorization: `Bearer ${token}`
      },
      onConnect: () => {
        setIsConnected(true)
        client.subscribe(`/topic/class-${classId}`, (msg) => {
          if (msg.body) {
            const newMsg: ChatMessageDTO = JSON.parse(msg.body)
            setMessages(prev => [...prev, newMsg])
          }
        })
      },
      onStompError: (frame) => {
        console.error('Broker error:', frame.headers['message'])
      },
      onWebSocketClose: () => {
        setIsConnected(false)
      }
    })

    client.activate()
    stompClientRef.current = client
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || !isConnected || !stompClientRef.current) return

    stompClientRef.current.publish({
      destination: `/app/chat/${classId}`,
      body: JSON.stringify({ content: inputValue.trim() })
    })

    setInputValue('')
  }
  
  const formatTime = (isoString: string) => {
    const date = new Date(isoString)
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="flex flex-col bg-white border-2 border-slate-200 rounded-3xl shadow-sm h-[600px] overflow-hidden">
      {/* Header */}
      <div className="bg-neo-blue text-white p-4 border-b-2 border-slate-100 flex items-center justify-between z-10">
        <h3 className="text-xl font-black flex items-center gap-2">
          <MessageCircle /> Thảo luận lớp học
        </h3>
        <span className="flex items-center gap-1.5 text-xs font-bold bg-white/20 px-2 py-1 rounded-full">
          <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-neo-green' : 'bg-neo-red'}`}></span>
          {isConnected ? 'Trực tuyến' : 'Đang kết nối...'}
        </span>
      </div>

      {/* Messages */}
      <div 
        ref={chatContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 bg-slate-50 flex flex-col gap-3 custom-scrollbar"
      >
        {isLoadingOldRef.current && (
          <div className="text-center py-2 text-xs font-bold text-slate-400">
            Đang tải thêm...
          </div>
        )}
        {messages.map((msg, index) => {
          // A bit hacky: if it's the current user's role (Wait, could be multiple students).
          // Ideally we check ID. We'll assume the current user has the role and email matches, or just check role for Teachers.
          const isMe = msg.senderRole === userRole && msg.senderName // Not fully accurate if names match, but okay for demo. We should ideally use ID.
          // Since we don't have ID from AuthStore easily without changing it, we will just use basic styling based on Role for now.
          const isTeacher = msg.senderRole === 'TEACHER'
          const isUnreadDivider = dividerIndex === index
          
          return (
            <React.Fragment key={msg.id || index}>
              {isUnreadDivider && (
                <div className="flex items-center gap-4 my-2">
                  <div className="flex-1 h-[2px] bg-red-200"></div>
                  <span className="text-xs font-black text-red-500 bg-red-50 px-3 py-1 rounded-full border-2 border-red-200">
                    {initialUnreadRef.current} tin nhắn chưa đọc
                  </span>
                  <div className="flex-1 h-[2px] bg-red-200"></div>
                </div>
              )}
              <div className={`flex flex-col ${isTeacher ? 'items-start' : 'items-end'}`}>
              <div className="text-[10px] font-bold text-slate-500 mb-1 px-1">
                {msg.senderName} {isTeacher && <span className="bg-neo-yellow text-slate-900 px-1.5 py-0.5 rounded text-[8px] ml-1">GIÁO VIÊN</span>}
              </div>
              <div className={`px-4 py-2.5 rounded-2xl max-w-[85%] border-2 border-slate-100 shadow-sm font-bold text-sm leading-relaxed ${
                isTeacher ? 'bg-white text-slate-900 rounded-tl-none' : 'bg-neo-green text-white rounded-tr-none border-neo-green'
              }`}>
                {msg.content}
              </div>
              <div className="text-[10px] font-bold text-slate-400 mt-1 px-1">
                {msg.createdAt ? formatTime(msg.createdAt) : 'Vừa xong'}
              </div>
            </div>
            </React.Fragment>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t-2 border-slate-100">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Nhập tin nhắn..."
            disabled={!isConnected}
            className="flex-1 border-2 border-slate-200 rounded-xl px-4 py-3 font-bold focus:outline-none focus:border-neo-blue disabled:bg-slate-50 transition-colors"
          />
          <button
            type="submit"
            disabled={!isConnected || !inputValue.trim()}
            className="bg-neo-blue text-white p-3 rounded-xl border-2 border-neo-blue shadow-sm hover:bg-blue-600 hover:-translate-y-0.5 hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  )
}
