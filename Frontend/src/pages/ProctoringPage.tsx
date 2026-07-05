import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, ShieldAlert, AlertTriangle, CheckCircle, Search, ChevronDown, ChevronUp } from 'lucide-react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { apiFetch } from '../utils/api'
import type { NotificationDTO, ProctoringStudentDTO, CheatEventDTO } from '../types'
import { useAuthStore } from '../store/authStore'

export const ProctoringPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>()
  const navigate = useNavigate()
  
  const [students, setStudents] = useState<ProctoringStudentDTO[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [sessionInfo, setSessionInfo] = useState<any>(null)
  
  // UI State
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({})
  
  const ITEMS_PER_PAGE = 20

  useEffect(() => {
    fetchSessionDetails()
    const cleanup = connectWebSocket()
    return () => {
      if (cleanup) cleanup()
    }
  }, [sessionId])

  // Reset to page 1 when search query changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

  const fetchSessionDetails = async () => {
    try {
      // Gọi API lấy lịch sử vi phạm gian lận đã lưu trong Database
      const res = await apiFetch(`/api/v1/exams/sessions/${sessionId}/proctoring-data`)
      if (res.ok) {
        const data: import('../types').ProctoringDashboardDTO = await res.json()
        setStudents(data.students || [])
        setSessionInfo(data)
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
      client.subscribe('/user/queue/notifications', (message) => {
        const notification: NotificationDTO = JSON.parse(message.body)
        
        if (notification.type === 'CHEAT_DETECTED' && notification.relatedId === Number(sessionId)) {
          const match = notification.message.match(/Học sinh (.*?) có hành vi đáng ngờ: (.*?) trong ca thi/)
          if (match) {
            const studentName = match[1]
            const detail = match[2]
            
            setStudents(prev => prev.map(s => {
              if (s.studentName === studentName) {
                return {
                  ...s,
                  cheatCount: s.cheatCount + 1,
                  cheatEvents: [{ detail, timestamp: notification.createdAt || new Date().toISOString() }, ...s.cheatEvents]
                }
              }
              return s
            }))

            apiFetch(`/api/v1/notifications/${notification.id}/read`, { method: 'PUT' }).catch(() => {})
          }
        }
      })
    }
    client.onDisconnect = () => setIsConnected(false)
    client.activate()
    return () => client.deactivate()
  }

  const calculateRiskScore = (events: CheatEventDTO[]) => {
    let score = 0
    events.forEach(e => {
      if (e.detail.includes('Chuyển tab') || e.detail.includes('Ẩn trình duyệt')) score += 15
      else if (e.detail.includes('Mất focus') || e.detail.includes('Bấm ra ngoài')) score += 10
      else score += 10
    })
    return Math.min(100, score)
  }

  const aggregateReasons = (events: CheatEventDTO[]) => {
    if (events.length === 0) return '-'
    const counts: Record<string, number> = {}
    events.forEach(e => {
      counts[e.detail] = (counts[e.detail] || 0) + 1
    })
    return Object.entries(counts).map(([detail, count]) => `${detail} (${count} lần)`).join(', ')
  }

  const toggleRow = (username: string) => {
    setExpandedRows(prev => ({ ...prev, [username]: !prev[username] }))
  }

  // Lọc và Phân trang
  const filteredStudents = students.filter(s => s.studentName.toLowerCase().includes(searchQuery.toLowerCase()))
  const sortedStudents = [...filteredStudents].sort((a, b) => calculateRiskScore(b.cheatEvents) - calculateRiskScore(a.cheatEvents))
  
  const totalPages = Math.max(1, Math.ceil(sortedStudents.length / ITEMS_PER_PAGE))
  const paginatedStudents = sortedStudents.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  const formatTime = (isoString: string) => {
    const date = new Date(isoString)
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }

  return (
    <div className="min-h-screen bg-neo-bg">
      <div className="pt-28 max-w-7xl mx-auto px-4 py-8 animate-page-enter">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate(-1)} className="w-12 h-12 rounded-xl border-2 border-slate-900 bg-white hover:bg-slate-100 flex items-center justify-center shadow-[3px_3px_0px_#0f172a] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-[1px_1px_0px_#0f172a] transition-all">
            <ArrowLeft className="w-6 h-6 text-slate-900" />
          </button>
          <div className="flex-1">
            <h1 className="text-4xl font-black text-slate-900 flex items-center gap-3">
              <ShieldAlert className="w-10 h-10 text-neo-red" strokeWidth={2.5} />
              Giám sát {sessionInfo ? `- ${sessionInfo.examTitle}` : 'Phòng thi'}
            </h1>
            {sessionInfo && (
              <div className="flex items-center gap-4 mt-2 text-sm font-bold text-slate-600">
                <span>Bắt đầu: {new Date(sessionInfo.startTime).toLocaleString('vi-VN')}</span>
                <span>Kết thúc: {new Date(sessionInfo.endTime).toLocaleString('vi-VN')}</span>
                <span className="px-2 py-1 bg-neo-yellow text-slate-900 rounded-lg border-2 border-slate-900">{sessionInfo.durationMinutes} phút</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-slate-900 rounded-xl shadow-[3px_3px_0px_#0f172a]">
            {isConnected ? (
              <><CheckCircle className="w-4 h-4 text-neo-green" /><span className="text-sm font-bold text-slate-700">Trực tiếp</span></>
            ) : (
              <><AlertTriangle className="w-4 h-4 text-neo-red animate-pulse" /><span className="text-sm font-bold text-slate-700">Đang kết nối...</span></>
            )}
          </div>
        </div>

        {sessionInfo && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white border-4 border-slate-900 rounded-xl p-4 shadow-[4px_4px_0px_#0f172a]">
              <div className="text-xs font-black text-slate-500 uppercase">Sĩ số lớp</div>
              <div className="text-3xl font-black text-slate-900 mt-1">{sessionInfo.totalStudentsInClass}</div>
            </div>
            <div className="bg-white border-4 border-slate-900 rounded-xl p-4 shadow-[4px_4px_0px_#0f172a]">
              <div className="text-xs font-black text-neo-blue uppercase">Đang làm bài</div>
              <div className="text-3xl font-black text-neo-blue mt-1">{sessionInfo.studentsInProgress}</div>
            </div>
            <div className="bg-white border-4 border-slate-900 rounded-xl p-4 shadow-[4px_4px_0px_#0f172a]">
              <div className="text-xs font-black text-neo-green uppercase">Đã nộp</div>
              <div className="text-3xl font-black text-neo-green mt-1">{sessionInfo.studentsSubmitted}</div>
            </div>
            <div className="bg-white border-4 border-slate-900 rounded-xl p-4 shadow-[4px_4px_0px_#0f172a]">
              <div className="text-xs font-black text-neo-red uppercase">Chưa vào thi</div>
              <div className="text-3xl font-black text-neo-red mt-1">{sessionInfo.studentsNotStarted}</div>
            </div>
          </div>
        )}

        <div className="bg-white border-4 border-slate-900 rounded-2xl shadow-[8px_8px_0px_#0f172a] overflow-hidden">
          {/* Thanh Toolbar */}
          <div className="p-4 border-b-4 border-slate-900 bg-neo-yellow flex flex-col md:flex-row justify-between items-center gap-4">
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              Danh sách Học sinh ({students.length})
            </h2>
            <div className="relative w-full md:w-96">
              <input 
                type="text" 
                placeholder="Tìm kiếm học sinh..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border-2 border-slate-900 rounded-xl font-bold shadow-[2px_2px_0px_#0f172a] outline-none focus:translate-y-[1px] focus:translate-x-[1px] focus:shadow-[1px_1px_0px_#0f172a] transition-all"
              />
              <Search className="absolute left-3 top-2.5 w-5 h-5 text-slate-500" />
            </div>
          </div>

          {/* Bảng dữ liệu */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b-4 border-slate-900">
                  <th className="p-4 font-black text-slate-900 border-r-2 border-slate-900 w-1/4">Học sinh</th>
                  <th className="p-4 font-black text-slate-900 border-r-2 border-slate-900 w-1/6 text-center">Risk Score</th>
                  <th className="p-4 font-black text-slate-900 border-r-2 border-slate-900 w-1/2">Lý do chính</th>
                </tr>
              </thead>
              <tbody>
                {paginatedStudents.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="p-8 text-center text-slate-500 font-bold">Không tìm thấy học sinh nào.</td>
                  </tr>
                ) : (
                  paginatedStudents.map((student, idx) => {
                    const score = calculateRiskScore(student.cheatEvents)
                    const isExpanded = expandedRows[student.username]
                    
                    let scoreColor = 'text-neo-green'
                    if (score > 20) scoreColor = 'text-neo-yellow'
                    if (score > 50) scoreColor = 'text-neo-coral'
                    if (score > 80) scoreColor = 'text-neo-red'

                    return (
                      <React.Fragment key={student.username}>
                        <tr 
                          onClick={() => toggleRow(student.username)}
                          className={`border-b-2 border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}
                        >
                          <td className="p-4 font-bold text-slate-900 border-r-2 border-slate-200">
                            {student.studentName}
                          </td>
                          <td className="p-4 font-black text-center border-r-2 border-slate-200">
                            <span className={`${scoreColor} text-lg`}>{score}</span>
                            <span className="text-slate-400 text-sm">/100</span>
                          </td>
                          <td className="p-4 font-bold text-slate-600 border-r-2 border-slate-200 flex justify-between items-center">
                            <span>{aggregateReasons(student.cheatEvents)}</span>
                            {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr className="bg-slate-800 border-b-4 border-slate-900">
                            <td colSpan={3} className="p-0">
                              <div className="p-6 text-white text-sm font-mono space-y-3">
                                <div className="flex items-center gap-3 text-neo-green font-bold">
                                  <span>{formatTime(student.startedAt)}</span>
                                  <span>-</span>
                                  <span>Bắt đầu thi</span>
                                </div>
                                {/* Hiển thị ngược từ cũ đến mới để giống timeline */}
                                {[...student.cheatEvents].reverse().map((event, i) => (
                                  <div key={i} className="flex items-center gap-3 text-neo-yellow">
                                    <span>{formatTime(event.timestamp)}</span>
                                    <span>-</span>
                                    <span>{event.detail}</span>
                                  </div>
                                ))}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Phân trang */}
          {totalPages > 1 && (
            <div className="p-4 border-t-4 border-slate-900 bg-white flex justify-between items-center">
              <span className="font-bold text-slate-600">Trang {currentPage} / {totalPages}</span>
              <div className="flex gap-2">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border-2 border-slate-900 rounded-xl font-black bg-slate-100 hover:bg-slate-200 disabled:opacity-50 disabled:shadow-none shadow-[2px_2px_0px_#0f172a] active:translate-y-[2px] active:translate-x-[2px] active:shadow-none transition-all"
                >
                  Trang trước
                </button>
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border-2 border-slate-900 rounded-xl font-black bg-slate-100 hover:bg-slate-200 disabled:opacity-50 disabled:shadow-none shadow-[2px_2px_0px_#0f172a] active:translate-y-[2px] active:translate-x-[2px] active:shadow-none transition-all"
                >
                  Trang sau
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
