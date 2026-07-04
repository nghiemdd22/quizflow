import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, ShieldAlert, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { apiFetch } from '../utils/api'
import { Navbar } from '../components/Navbar'
import type { NotificationDTO } from '../types'
import { useAuthStore } from '../store/authStore'

interface CheatingLog {
  studentName: string
  count: number
  details: string[]
}

export const ProctoringPage: React.FC = () => {
  const { id, sessionId } = useParams<{ id: string; sessionId: string }>()
  const navigate = useNavigate()
  
  const [logs, setLogs] = useState<Record<string, CheatingLog>>({})
  const [isConnected, setIsConnected] = useState(false)
  const [sessionInfo, setSessionInfo] = useState<any>(null)
  
  useEffect(() => {
    fetchSessionDetails()
    const cleanup = connectWebSocket()
    return () => {
      if (cleanup) cleanup()
    }
  }, [sessionId])

  const fetchSessionDetails = async () => {
    try {
      // Gọi API lấy danh sách phiên thi của lớp (đã sửa URL cho đúng với controller)
      const sessionsRes = await apiFetch(`/api/v1/classes/${id}/sessions`)
      if (sessionsRes.ok) {
        const sessions = await sessionsRes.json()
        const currentSession = sessions.find((s: any) => s.id === Number(sessionId))
        setSessionInfo(currentSession)
      }

      // Gọi API lấy lịch sử vi phạm gian lận đã lưu trong Database
      const cheatLogsRes = await apiFetch(`/api/v1/exams/sessions/${sessionId}/cheat-logs`)
      if (cheatLogsRes.ok) {
        const historyLogs: any[] = await cheatLogsRes.json()
        const initialLogs: Record<string, CheatingLog> = {}
        
        historyLogs.forEach(log => {
          if (!initialLogs[log.studentName]) {
            initialLogs[log.studentName] = { studentName: log.studentName, count: 0, details: [] }
          }
          initialLogs[log.studentName].count += 1
          initialLogs[log.studentName].details.push(log.detail)
        })
        setLogs(initialLogs)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const connectWebSocket = () => {
    const token = useAuthStore.getState().accessToken
    if (!token) return

    const client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws/exam'),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
    })

    client.onConnect = () => {
      setIsConnected(true)
      // Giáo viên lắng nghe kênh notification cá nhân, nếu type = CHEAT_DETECTED thì update log
      client.subscribe('/user/queue/notifications', (message) => {
        const notification: NotificationDTO = JSON.parse(message.body)
        
        if (notification.type === 'CHEAT_DETECTED' && notification.relatedId === Number(sessionId)) {
          // Message format: "Học sinh [Tên] có hành vi đáng ngờ: [Details] trong ca thi [Title]"
          const match = notification.message.match(/Học sinh (.*?) có hành vi đáng ngờ: (.*?) trong ca thi/)
          if (match) {
            const studentName = match[1]
            const detail = match[2]
            
            setLogs(prev => {
              const studentLog = prev[studentName] || { studentName, count: 0, details: [] }
              return {
                ...prev,
                [studentName]: {
                  studentName,
                  count: studentLog.count + 1,
                  details: [detail, ...studentLog.details]
                }
              }
            })

            // Đánh dấu đã đọc trên server luôn vì đang ở trang giám sát
            apiFetch(`/api/v1/notifications/${notification.id}/read`, { method: 'PUT' }).catch(() => {})
          }
        }
      })
    }

    client.onWebSocketClose = () => setIsConnected(false)
    client.activate()
    return () => client.deactivate()
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans">
      
      <div className="pt-28 pb-12 px-4 max-w-7xl mx-auto">
        <button 
          onClick={() => navigate(`/classes/${id}`)}
          className="flex items-center gap-2 text-slate-600 font-bold hover:text-slate-900 transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" /> Trở về lớp học
        </button>

        <div className="bg-white border-2 border-slate-900 rounded-2xl shadow-[4px_4px_0px_#0f172a] p-6 mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
              <ShieldAlert className="w-8 h-8 text-red-500" strokeWidth={2.5} />
              Màn hình Giám sát Ca thi
            </h1>
            <p className="text-slate-500 font-bold mt-2">
              Ca thi: {sessionInfo?.title || 'Đang tải...'}
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-xl font-bold border-2 border-slate-200">
            {isConnected ? (
              <><span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span> Đang kết nối trực tiếp</>
            ) : (
              <><RefreshCw className="w-4 h-4 text-slate-500 animate-spin" /> Đang kết nối...</>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.keys(logs).length === 0 ? (
            <div className="col-span-full py-16 flex flex-col items-center justify-center bg-white border-2 border-slate-200 border-dashed rounded-2xl">
              <CheckCircle className="w-16 h-16 text-green-500 mb-4" strokeWidth={2} />
              <p className="text-xl font-black text-slate-700">Chưa phát hiện gian lận</p>
              <p className="text-slate-500 font-bold mt-2">Hệ thống đang tự động theo dõi hành vi của học sinh.</p>
            </div>
          ) : (
            Object.values(logs).sort((a, b) => b.count - a.count).map((log, index) => (
              <div key={index} className="bg-red-50 border-2 border-red-500 rounded-2xl p-5 shadow-[4px_4px_0px_#ef4444] animate-pop-in">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-black text-xl text-slate-900">{log.studentName}</h3>
                    <p className="text-red-600 font-bold flex items-center gap-1 mt-1">
                      <AlertTriangle className="w-4 h-4" /> Vi phạm: {log.count} lần
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center border-2 border-red-500">
                    <span className="font-black text-red-600 text-lg">{log.count}</span>
                  </div>
                </div>
                
                <div className="bg-white border-2 border-red-200 rounded-xl p-3 h-32 overflow-y-auto">
                  <p className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Chi tiết vi phạm</p>
                  <ul className="space-y-2">
                    {log.details.map((detail, idx) => (
                      <li key={idx} className="text-sm font-bold text-slate-700 flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1.5 flex-shrink-0"></span>
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
