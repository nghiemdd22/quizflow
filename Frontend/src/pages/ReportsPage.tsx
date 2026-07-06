import React, { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { apiFetch } from '../utils/api'
import { useAuthStore } from '../store/authStore'
import { 
  BarChart3, 
  ArrowLeft, 
  Download, 
  ShieldAlert, 
  Users, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle,
  FileSpreadsheet,
  ChevronDown
} from 'lucide-react'

export const ReportsPage: React.FC = () => {
  const userId = useAuthStore(state => state.userId)
  const { sessionId } = useParams()
  const navigate = useNavigate()
  
  const [sessions, setSessions] = useState<any[]>([])
  const [sessionDetail, setSessionDetail] = useState<any>(null)
  const [expandedStudents, setExpandedStudents] = useState<string[]>([])

  const groupedLogs = useMemo(() => {
    if (!sessionDetail?.cheatLogs) return []
    const map = new Map<string, any[]>()
    sessionDetail.cheatLogs.forEach((log: any) => {
      if (!map.has(log.student)) map.set(log.student, [])
      map.get(log.student)!.push(log)
    })
    return Array.from(map.entries()).map(([student, logs]) => ({ student, logs }))
  }, [sessionDetail?.cheatLogs])

  const toggleStudent = (student: string) => {
    setExpandedStudents(prev => prev.includes(student) ? prev.filter(s => s !== student) : [...prev, student])
  }

  useEffect(() => {
    if (!userId) return
    const fetchSessions = async () => {
      try {
        const res = await apiFetch(`/api/v1/reports/teacher/${userId}/sessions`)
        if (res.ok) {
          const data = await res.json()
          setSessions(data)
        }
      } catch (err) {
        console.error(err)
      }
    }
    fetchSessions()
  }, [userId])

  useEffect(() => {
    if (sessionId) {
      const fetchDetail = async () => {
        try {
          const res = await apiFetch(`/api/v1/reports/sessions/${sessionId}`)
          if (res.ok) {
            const data = await res.json()
            setSessionDetail(data)
          }
        } catch (err) {
          console.error(err)
        }
      }
      fetchDetail()
    } else {
      setSessionDetail(null)
    }
  }, [sessionId])

  const handleExportExcel = async () => {
    if (!sessionId) return
    try {
      const res = await apiFetch(`/api/v1/reports/sessions/${sessionId}/export`)
      if (res.ok) {
        const blob = await res.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `bang_diem_${sessionId}.xlsx`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      } else {
        const errorText = await res.text()
        alert("Lỗi xuất Excel: " + errorText)
      }
    } catch (err) {
      console.error(err)
      alert("Có lỗi xảy ra khi xuất file!")
    }
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 md:py-12 animate-page-enter">
      {!sessionDetail ? (
        // VIEW 1: LIST OF CLOSED SESSIONS
        <>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-4xl font-black text-slate-900 flex items-center gap-3">
                <BarChart3 className="w-10 h-10 text-neo-purple" strokeWidth={2.5} />
                Báo cáo & Lịch sử
              </h1>
              <p className="text-slate-500 font-bold mt-2">Xem lại bảng điểm và nhật ký giám sát của các ca thi đã kết thúc.</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sessions.map(session => (
              <div key={session.id} className="bg-white neo-card p-6 flex flex-col justify-between hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_#0f172a] transition-all">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-extrabold line-clamp-2 pr-2">{session.name}</h3>
                    <span className="shrink-0 text-xs font-black px-2 py-1 border-2 border-slate-900 rounded-lg shadow-[2px_2px_0px_#0f172a] bg-slate-200 text-slate-700">
                      ĐÃ ĐÓNG
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-blue-50 p-3 rounded-xl border-2 border-neo-blue flex flex-col items-center justify-center">
                      <span className="text-xs font-black text-slate-500 mb-1">TRUNG BÌNH</span>
                      <span className="text-2xl font-black text-neo-blue">{session.avgScore}</span>
                    </div>
                    <div className="bg-green-50 p-3 rounded-xl border-2 border-neo-green flex flex-col items-center justify-center">
                      <span className="text-xs font-black text-slate-500 mb-1">SĨ SỐ</span>
                      <span className="text-2xl font-black text-neo-green">{session.participants}</span>
                    </div>
                  </div>

                  {session.cheatAttempts > 0 && (
                    <div className="mb-6 flex items-center gap-2 text-sm font-bold text-red-600 bg-red-50 p-2 rounded-lg border-2 border-red-200">
                      <ShieldAlert className="w-4 h-4 shrink-0" />
                      Phát hiện {session.cheatAttempts} lượt cảnh báo vi phạm
                    </div>
                  )}
                </div>
                
                <button
                  onClick={() => navigate(`/teacher/reports/${session.id}`)}
                  className="w-full py-3 bg-neo-purple hover:bg-purple-600 text-white font-black rounded-xl border-2 border-slate-900 shadow-[3px_3px_0px_#0f172a] transition-all flex justify-center items-center gap-2"
                >
                  <BarChart3 className="w-5 h-5" />
                  Xem Báo Cáo
                </button>
              </div>
            ))}
          </div>
        </>
      ) : (
        // VIEW 2: REPORT DETAILS
        <>
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 pb-6 gap-4">
            <div>
              <button 
                onClick={() => navigate('/teacher/reports')}
                className="flex items-center text-slate-500 font-bold hover:text-neo-purple transition-colors mb-2"
              >
                <ArrowLeft className="w-4 h-4 mr-1" /> Quay lại danh sách báo cáo
              </button>
              <h2 className="text-3xl font-black flex items-center gap-2">
                <span className="text-neo-purple">{sessionDetail.name}</span>
              </h2>
              <p className="text-slate-500 font-bold mt-1 text-sm">Ngày thi: {sessionDetail.date}</p>
            </div>
            
            <button
              onClick={handleExportExcel}
              className="px-6 py-3 bg-neo-green hover:bg-neo-green-hover text-white neo-btn text-lg flex items-center justify-center group"
            >
              <Download className="w-5 h-5 mr-2 group-hover:translate-y-1 transition-transform" />
              Xuất Bảng Điểm (Excel)
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* LEFT COLUMN: OVERVIEW & SCORE DISTRIBUTION */}
            <div className="lg:col-span-1 space-y-8">
              
              <div className="bg-white neo-card p-6">
                <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                  <Users className="text-neo-blue" /> Tổng Quan
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-4 border-b-2 border-slate-100">
                    <span className="font-bold text-slate-500">Giáo viên phụ trách</span>
                    <span className="font-black text-xl text-right">{sessionDetail.teacherName}</span>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b-2 border-slate-100">
                    <span className="font-bold text-slate-500">Lớp học</span>
                    <span className="font-black text-xl">{sessionDetail.className}</span>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b-2 border-slate-100">
                    <span className="font-bold text-slate-500">Sĩ số lớp</span>
                    <span className="font-black text-xl">{sessionDetail.classSize} hs</span>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b-2 border-slate-100">
                    <span className="font-bold text-slate-500">Số lượng nộp bài</span>
                    <span className="font-black text-xl">{sessionDetail.participants} hs</span>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b-2 border-slate-100">
                    <span className="font-bold text-slate-500">Điểm trung bình</span>
                    <span className="font-black text-xl text-neo-blue">{sessionDetail.avgScore}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-500">Cảnh báo gian lận</span>
                    <span className={`font-black text-xl ${sessionDetail.cheatAttempts > 0 ? 'text-red-500' : 'text-neo-green'}`}>
                      {sessionDetail.cheatAttempts} lượt
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white neo-card p-6">
                <h3 className="text-xl font-black mb-6">Phổ Điểm</h3>
                {(() => {
                  const maxCount = Math.max(...(sessionDetail.scoreDistribution?.map((d: any) => d.count) || [0]), 1)
                  return (
                    <div className="flex h-56 mt-4">
                      {/* Y-axis */}
                      <div className="flex flex-col justify-between items-end pr-3 border-r-2 border-slate-900 text-xs font-bold text-slate-500 pb-7">
                        <span>{maxCount}</span>
                        <span>{Math.ceil(maxCount / 2)}</span>
                        <span>0</span>
                      </div>
                      
                      {/* Bars Container */}
                      <div className="flex-1 flex items-end justify-between gap-2 pl-3 border-b-2 border-slate-900 pb-2">
                        {sessionDetail.scoreDistribution?.map((col: any, idx: number) => {
                          const heightPercent = (col.count / maxCount) * 100
                          return (
                            <div key={idx} className="w-full h-full flex flex-col items-center group relative">
                              {/* Tooltip */}
                              <div className="absolute top-0 bg-slate-900 text-white text-xs font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                                {col.count} hs
                              </div>
                              {/* Space for the bar to grow in */}
                              <div className="flex-1 w-full flex items-end">
                                <div 
                                  className="w-full bg-neo-purple border-2 border-slate-900 rounded-t-lg transition-all group-hover:bg-purple-600"
                                  style={{ height: `${heightPercent}%` }}
                                ></div>
                              </div>
                              <span className="text-xs font-black text-slate-500 mt-2 h-5 shrink-0">{col.range}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })()}
              </div>

            </div>

            {/* RIGHT COLUMN: SCOREBOARD & ANTI-CHEAT LOGS */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Scoreboard Table */}
              <div className="bg-white neo-card overflow-hidden">
                <div className="bg-neo-blue px-6 py-4 border-b-4 border-slate-900">
                  <h3 className="text-xl font-black text-white flex items-center gap-2">
                    <FileSpreadsheet className="w-6 h-6" /> Bảng Điểm Chi Tiết
                  </h3>
                </div>
                <div className="overflow-x-auto p-4">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b-2 border-slate-300">
                        <th className="py-3 px-2 font-black text-slate-500 w-12 text-center">#</th>
                        <th className="py-3 px-4 font-black text-slate-500">Họ và tên</th>
                        <th className="py-3 px-4 font-black text-slate-500">Bắt đầu</th>
                        <th className="py-3 px-4 font-black text-slate-500">Nộp bài</th>
                        <th className="py-3 px-4 font-black text-slate-500">Thời gian làm</th>
                        <th className="py-3 px-4 font-black text-slate-500">Trạng thái</th>
                        <th className="py-3 px-4 font-black text-slate-500 text-right">Điểm</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sessionDetail.scoreboard?.map((row: any, idx: number) => (
                        <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="py-3 px-2 font-black text-slate-400 text-center">{row.rank}</td>
                          <td className="py-3 px-4 font-extrabold text-slate-900">{row.name}</td>
                          <td className="py-3 px-4 font-bold text-slate-600">{row.startedAt}</td>
                          <td className="py-3 px-4 font-bold text-slate-600">{row.submittedAt}</td>
                          <td className="py-3 px-4 font-bold text-slate-600">{row.timeTaken}</td>
                          <td className="py-3 px-4">
                            {row.cheatFlag === 'NONE' && <span className="flex items-center gap-1 text-xs font-black text-neo-green"><CheckCircle2 className="w-4 h-4" /> Hợp lệ</span>}
                            {row.cheatFlag === 'WARNING' && <span className="flex items-center gap-1 text-xs font-black text-yellow-600 bg-yellow-100 px-2 py-1 rounded border border-yellow-300 w-fit"><AlertTriangle className="w-4 h-4" /> Có vi phạm</span>}
                            {row.cheatFlag === 'CRITICAL' && <span className="flex items-center gap-1 text-xs font-black text-red-600 bg-red-100 px-2 py-1 rounded border border-red-300 w-fit"><XCircle className="w-4 h-4" /> Vi phạm nặng</span>}
                          </td>
                          <td className="py-3 px-4 font-black text-xl text-neo-blue text-right">{row.score}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="mt-4 text-center">
                    <button className="text-sm font-bold text-slate-500 hover:text-neo-blue underline">
                      Xem danh sách đầy đủ (Coming Soon)
                    </button>
                  </div>
                </div>
              </div>

              {/* Anti-Cheat Logs */}
              <div className="bg-slate-900 neo-card overflow-hidden text-white">
                <div className="px-6 py-4 border-b-2 border-slate-700 flex justify-between items-center">
                  <h3 className="text-xl font-black flex items-center gap-2">
                    <ShieldAlert className="w-6 h-6 text-neo-coral" /> Nhật Ký Anti-Cheat
                  </h3>
                  <span className="bg-red-500 text-white font-black text-xs px-2 py-1 rounded border border-red-900">
                    {sessionDetail.cheatLogs?.length || 0} sự kiện
                  </span>
                </div>
                <div className="p-4 space-y-3">
                  {groupedLogs.map((group, idx) => (
                    <div key={idx} className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
                      <div 
                        className="flex justify-between items-center p-3 cursor-pointer hover:bg-slate-700 transition-colors"
                        onClick={() => toggleStudent(group.student)}
                      >
                        <div className="font-extrabold text-neo-yellow">{group.student}</div>
                        <div className="flex items-center gap-4">
                          <span className="text-xs font-bold text-slate-400">{group.logs.length} sự kiện</span>
                          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${expandedStudents.includes(group.student) ? 'rotate-180' : ''}`} />
                        </div>
                      </div>
                      {expandedStudents.includes(group.student) && (
                        <div className="px-3 pb-3 space-y-2 border-t border-slate-700 pt-2 bg-slate-800/50">
                          {group.logs.map((log: any, logIdx: number) => (
                            <div key={logIdx} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center p-2 rounded hover:bg-slate-800">
                              <div className="text-xs font-bold text-slate-400 w-20 shrink-0">{log.time}</div>
                              <div className="flex-1 font-bold text-slate-200">{log.event}</div>
                              <div className="shrink-0">
                                {log.severity === 'WARNING' ? (
                                  <span className="text-[10px] font-black bg-yellow-500/20 text-yellow-400 px-2 py-1 border border-yellow-500/50 rounded">
                                    CẢNH BÁO
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-black bg-red-500/20 text-red-400 px-2 py-1 border border-red-500/50 rounded">
                                    NGHIÊM TRỌNG
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  {(!sessionDetail.cheatLogs || sessionDetail.cheatLogs.length === 0) && (
                    <div className="text-center py-10">
                      <CheckCircle2 className="w-12 h-12 text-neo-green mx-auto mb-2 opacity-50" />
                      <p className="font-bold text-slate-400">Không có vi phạm nào được ghi nhận.</p>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </>
      )}
    </div>
  )
}
