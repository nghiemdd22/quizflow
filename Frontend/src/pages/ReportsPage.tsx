import React, { useState } from 'react'
import { 
  BarChart3, 
  ArrowLeft, 
  Download, 
  ShieldAlert, 
  Users, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle,
  FileSpreadsheet
} from 'lucide-react'

// MOCK DATA
const mockClosedSessions = [
  { id: 1, name: 'Kiểm tra Giữa kỳ Toán 10', date: '28/06/2026', participants: 42, avgScore: 8.5, cheatAttempts: 3 },
  { id: 2, name: '15 phút Vật Lý 11', date: '27/06/2026', participants: 35, avgScore: 6.8, cheatAttempts: 0 },
  { id: 3, name: 'Thi thử Hóa 12 lần 1', date: '20/06/2026', participants: 120, avgScore: 7.2, cheatAttempts: 15 },
  { id: 4, name: 'Khảo sát chất lượng Anh văn', date: '15/06/2026', participants: 200, avgScore: 5.5, cheatAttempts: 45 }
]

const mockScoreboard = [
  { rank: 1, name: 'Nguyễn Văn A', score: 10, timeTaken: '20:15', cheatFlag: 'NONE' },
  { rank: 2, name: 'Trần Thị B', score: 9.5, timeTaken: '22:30', cheatFlag: 'NONE' },
  { rank: 3, name: 'Lê Hoàng C', score: 9.0, timeTaken: '18:45', cheatFlag: 'WARNING' },
  { rank: 4, name: 'Phạm Quỳnh D', score: 8.5, timeTaken: '24:10', cheatFlag: 'NONE' },
  { rank: 5, name: 'Vũ Đức E', score: 4.0, timeTaken: '15:00', cheatFlag: 'CRITICAL' },
]

const mockCheatLogs = [
  { student: 'Lê Hoàng C', time: '14:25:30', event: 'Chuyển tab 1 lần', severity: 'WARNING' },
  { student: 'Vũ Đức E', time: '14:30:15', event: 'Thoát toàn màn hình quá 10 giây', severity: 'CRITICAL' },
  { student: 'Vũ Đức E', time: '14:35:00', event: 'Mở tab mới (Tìm kiếm Google)', severity: 'CRITICAL' }
]

const scoreDistribution = [
  { range: '0-4', count: 1 },
  { range: '4-6', count: 5 },
  { range: '6-8', count: 15 },
  { range: '8-10', count: 21 },
]

export const ReportsPage: React.FC = () => {
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null)
  
  const selectedSession = mockClosedSessions.find(s => s.id === selectedSessionId)

  const handleExportExcel = () => {
    alert("Tính năng Xuất bảng điểm Excel đang được phát triển (Coming Soon)!")
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 md:py-12 animate-page-enter">
      {!selectedSession ? (
        // VIEW 1: LIST OF CLOSED SESSIONS
        <>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b-4 border-slate-900 pb-6">
            <div>
              <h1 className="text-4xl font-black text-slate-900 flex items-center gap-3">
                <BarChart3 className="w-10 h-10 text-neo-purple" strokeWidth={2.5} />
                Báo cáo & Lịch sử
              </h1>
              <p className="text-slate-500 font-bold mt-2">Xem lại bảng điểm và nhật ký giám sát của các ca thi đã kết thúc.</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockClosedSessions.map(session => (
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
                  onClick={() => setSelectedSessionId(session.id)}
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
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 border-b-4 border-slate-900 pb-6 gap-4">
            <div>
              <button 
                onClick={() => setSelectedSessionId(null)}
                className="flex items-center text-slate-500 font-bold hover:text-neo-purple transition-colors mb-2"
              >
                <ArrowLeft className="w-4 h-4 mr-1" /> Quay lại danh sách báo cáo
              </button>
              <h2 className="text-3xl font-black flex items-center gap-2">
                <span className="text-neo-purple">{selectedSession.name}</span>
              </h2>
              <p className="text-slate-500 font-bold mt-1 text-sm">Ngày thi: {selectedSession.date}</p>
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
                    <span className="font-bold text-slate-500">Sĩ số tham gia</span>
                    <span className="font-black text-xl">{selectedSession.participants} hs</span>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b-2 border-slate-100">
                    <span className="font-bold text-slate-500">Điểm trung bình</span>
                    <span className="font-black text-xl text-neo-blue">{selectedSession.avgScore}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-500">Cảnh báo gian lận</span>
                    <span className={`font-black text-xl ${selectedSession.cheatAttempts > 0 ? 'text-red-500' : 'text-neo-green'}`}>
                      {selectedSession.cheatAttempts} lượt
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white neo-card p-6">
                <h3 className="text-xl font-black mb-6">Phổ Điểm</h3>
                <div className="flex items-end justify-between h-48 gap-2 pt-8 border-b-2 border-slate-900 pb-2">
                  {scoreDistribution.map((col, idx) => {
                    const maxCount = Math.max(...scoreDistribution.map(d => d.count))
                    const heightPercent = (col.count / maxCount) * 100
                    return (
                      <div key={idx} className="w-full flex flex-col items-center gap-2 group relative">
                        {/* Tooltip */}
                        <div className="absolute -top-8 bg-slate-900 text-white text-xs font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                          {col.count} hs
                        </div>
                        {/* Bar */}
                        <div 
                          className="w-full bg-neo-purple border-2 border-slate-900 rounded-t-lg transition-all group-hover:bg-purple-600"
                          style={{ height: `${heightPercent}%` }}
                        ></div>
                        <span className="text-xs font-black text-slate-500 mt-2">{col.range}</span>
                      </div>
                    )
                  })}
                </div>
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
                        <th className="py-3 px-4 font-black text-slate-500">Thời gian làm</th>
                        <th className="py-3 px-4 font-black text-slate-500">Trạng thái</th>
                        <th className="py-3 px-4 font-black text-slate-500 text-right">Điểm</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockScoreboard.map((row, idx) => (
                        <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="py-3 px-2 font-black text-slate-400 text-center">{row.rank}</td>
                          <td className="py-3 px-4 font-extrabold text-slate-900">{row.name}</td>
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
                    {mockCheatLogs.length} sự kiện
                  </span>
                </div>
                <div className="p-4 space-y-3">
                  {mockCheatLogs.map((log, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center bg-slate-800 p-3 rounded-lg border border-slate-700">
                      <div className="text-xs font-bold text-slate-400 w-20 shrink-0">{log.time}</div>
                      <div className="font-extrabold text-neo-yellow w-32 shrink-0">{log.student}</div>
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
                  {mockCheatLogs.length === 0 && (
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
